import express from 'express';
import path from 'path';
import fs from 'fs';
import Busboy from 'busboy';
import bodyParser from 'body-parser';
import zlib from 'zlib';

import ConfigBase from '../../config/config.base';
import sendMail from '../util/sendMail';
import { v4 as uuidv4 } from 'uuid';
import VfsFile from './VfsFile';
import VfsMetaFile from './VfsMetaFile';
import trimExt from '../util/trimExt';
import getCipher from '../util/getCipher';
import getDecipher from '../util/getDecipher';

/**
 * @property {e.Express} this._expressApp
 * @property {ConfigBase} this._config
 */
class VfsManager {
  _expressApp; // core.Express
  _config; // BaseConfig

  constructor(expressApp = express(), config = new ConfigBase()) {
    this._expressApp = expressApp;
    this._config = config;

    this.#setSettings();
    this.#setListeners();
  }

  #setSettings = () => {
    this._expressApp.use(bodyParser.urlencoded({ extended: false }));
    this._expressApp.use(bodyParser.json());
  };

  #setListeners = () => {
    let uploadMap = new Map(); // storage <uuidFile : string as UUID, vfsFile: VfsFile>

    this._expressApp.use('/main', express.static(this._config.ROOT_STATIC_FILES)); // static file
    this._expressApp.use('/', express.static(this._config.ROOT_STATIC_FILES)); // static file

    /*
    Content-Type:  multipart/form-data
    uploadedFile: file,
    uploadedCipher: text
     */
    this._expressApp.post('/upload', (req, res) => {
      // uploading
      const busboy = new Busboy({ headers: req.headers });
      let cipherCode = null;
      let currentFileSize = 0;
      let totalFileSize = +req.headers['content-length'];

      const fileUploading = (fieldName, file, fileName, encode, mimeType) => {
        if (fileName === '') return; // guard

        const gzipFileName = trimExt(fileName) + '.gz';
        const pathToUploadFile = this._config.VFS_ROOT_PATH + '/' + gzipFileName;
        const wStream = fs.createWriteStream(pathToUploadFile);
        const fileUuid = uuidv4();

        file.on('data', chunk => {
          currentFileSize += chunk.length;
          //let per = (currentFileSize / totalFileSize) * 100;
          // console.log("progress: " + per + "/ 100");
        });

        //const cipher = getCipher(cipherCode);
        const gzip = zlib.createGzip();
        file.pipe(gzip).pipe(wStream);

        busboy.on('finish', () => {
          res.status(200).send(fileUuid); // response uuid-file-code

          const metaFile = new VfsMetaFile(
            fileName,
            totalFileSize,
            fileUuid,
            mimeType,
            encode,
            cipherCode,
            null // todo: hardcode
          );
          const metaFileName = trimExt(fileName) + '.meta.json';
          const pathToMetaFile = this._config.VFS_ROOT_PATH + path.sep + metaFileName;
          metaFile.writeTo(pathToMetaFile);

          // ciphering
          const cipher = getCipher(cipherCode);
          const pathToUploadFileGzEnc = pathToUploadFile + '.enc';
          const rStream = fs.createReadStream(pathToUploadFile);
          const wStream = fs.createWriteStream(pathToUploadFileGzEnc);

          rStream.pipe(cipher).pipe(wStream);
          wStream.on('finish', () => fs.unlink(pathToUploadFile, this.logError));

          const vfsFile = new VfsFile(null, pathToUploadFile, metaFile); // todo: hardcode
          uploadMap.set(fileUuid, vfsFile);
        });
      };

      const getCipherCode = (field, val) =>
        (cipherCode = field === 'uploadedCipher' ? val : null);

      busboy.on('file', fileUploading);
      busboy.on('field', getCipherCode);
      req.pipe(busboy);
    });

    /* {
      "userData": {
      "name": "MyName",
      "email": "myemail@mail.com"
        }
      "fileData": {
      "name": "my_video.mp4"
      "size": 154675
      "type": "video/mp4"
        }
    } */
    this._expressApp.post('/sendNotification', (req, res) => {
      const userData = req.body.userData;
      const fileData = req.body.fileData;
      const fileName = fileData.name;

      sendMail(this._config, userData.email, fileName, `Your file: ${fileName} has been upload`);
    });
    
    /*
    https://mysite/download/3fbb1a78-b569-40af-8acc-1d8ab8b8aa34/789012
    */
    this._expressApp.get('/download/:key/:code', (req, res) => {
      const key = req.params['key'];
      const code = req.params['code'];

      if (key == null) return; // guard
      if (code == null) return;

      const maybeVfsFile = this.getVfsFile(uploadMap, key, code);
      if (maybeVfsFile == null) return;
      const vfsFile = maybeVfsFile;

      const pathToFileGz = vfsFile.getPath();
      const fileName = vfsFile.getVfsMetaFile().getFileName();

      res.status(200);
      res.set('Content-Type', 'application/octet-stream');
      res.set('Content-Disposition', 'attachment; filename=' + fileName);

      const pathToFileGzEnc = pathToFileGz + '.enc';
      const rStream = fs.createReadStream(pathToFileGzEnc);
      const gunzip = zlib.createGunzip();
      const decipher = getDecipher(code);

      rStream.pipe(decipher).pipe(gunzip).pipe(res);
    });

    this._expressApp.delete('/delete/:key/:code', (req, res) => {
      const key = req.params['key'];
      const code = req.params['code'];

      const maybeVfsFile = this.getVfsFile(uploadMap, key, code);
      if (maybeVfsFile == null) return;

      const vfsFile = maybeVfsFile;
      const pathToFileGz = vfsFile.getPath();
      const pathToMetaFile = vfsFile.getPathToMetaFile();

      fs.unlink(pathToFileGz, this.logError);
      fs.unlink(pathToMetaFile, this.logError);

      res.status(200).send();
    });
  };

  getVfsFile(storage, key, code) {
    // (Map, string, string) => VfsFile?
    const vfsFile = storage.get(key);
    const vfsMetaFile = vfsFile.getVfsMetaFile();
    const cipherCode = vfsMetaFile.getCipherCode();

    if (code !== cipherCode) return null;

    return vfsFile;
  }

  logError(err) {
    console.log(err);
  }
}

export default VfsManager;
