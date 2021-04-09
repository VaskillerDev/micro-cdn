import fs from 'fs';

class VfsMetaFile {
  _fileName;
  _fileSize;
  _fileUuid;
  _mimeType;
  _encode;
  _ownerUuid;
  _cipherCode;

  constructor(
    fileName,
    fileSize,
    fileUuid,
    mimeType,
    encode,
    cipherCode,
    ownerUuid = null
  ) {
    this._fileName = fileName;
    this._fileSize = fileSize;
    this._fileUuid = fileUuid;
    this._mimeType = mimeType;
    this._encode = encode;
    this._ownerUuid = ownerUuid;
    this._cipherCode = cipherCode;
  }

  getCipherCode() {
    return this._cipherCode;
  }

  getFileName() {
    return this._fileName;
  }

  writeTo(pathToFile) {
    const meta = {
      fileName: this._fileName,
      fileSize: this._fileSize,
      fileUuid: this._fileUuid,
      mimeType: this._mimeType,
      encode: this._encode,
      ownerUuid: this._ownerUuid,
      cipherCode: this._cipherCode,
    };
    const metaString = JSON.stringify(meta);

    fs.writeFile(pathToFile, metaString, err => console.log(err));
  }
}

export default VfsMetaFile;
