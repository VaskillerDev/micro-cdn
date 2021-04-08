'use strict';
// --es-module-specifier-resolution=node

import express from 'express';
import config from './config.js';
import VfsManager from './src/vfs/VfsManager';
import UserManager from './src/user/UserManager';

config.printAll();
console.log(process.env.NODE_ENV);

const expressApp = express();
const userManager = new UserManager(expressApp);
const vfsManager = new VfsManager(expressApp);

expressApp.listen(3000);
