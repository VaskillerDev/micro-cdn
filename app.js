'use strict';
// --es-module-specifier-resolution=node

import express from 'express';
import config from './config.js';
import VfsManager from './src/vfs/VfsManager';
import UserManager from './src/user/UserManager';
import { v4 as uuidv4 } from 'uuid';
import genHash from './src/util/genHash';
import User from './src/user/User';
import * as fs from "fs";

const PORT = 3000;
config.printAll();
console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.INIT_VECTOR === undefined) {
  console.error("[Error]: Environment variable 'INIT_VECTOR' not set");
  process.exit(1);
}
if (!fs.existsSync(config.VFS_ROOT_PATH)) fs.mkdirSync(config.VFS_ROOT_PATH)

const expressApp = express();
const userManager = new UserManager(expressApp, config);
const vfsManager = new VfsManager(expressApp, config);

const verifyMiddleware = userManager.getVerifyMiddleware();
vfsManager.setVerifyMiddleware(verifyMiddleware);

userManager.listen();
vfsManager.listen();

expressApp.listen(PORT);
console.log(`Listen on ${PORT}`);
