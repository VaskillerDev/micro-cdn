﻿import trimExt from '../util/trimExt';

class VfsFile {
  #_pathToFile; // File
  #_ownerUuid; // string? as UUID
  #_vfsMetaFile; // VfsMetaFile

  constructor(ownerUuid, pathToFile, vfsMetaFile) {
    this.#_pathToFile = pathToFile;
    this.#_ownerUuid = ownerUuid;
    this.#_vfsMetaFile = vfsMetaFile;
  }

  getPath() {
    return this.#_pathToFile;
  }

  getPathToMetaFile() {
    return trimExt(this.#_pathToFile) + '.meta.json';
  }

  getVfsMetaFile() {
    return this.#_vfsMetaFile;
  }
}

export default VfsFile;
