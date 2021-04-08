'use strict';
// --es-module-specifier-resolution=node

import express from 'express';
import config from './config.js';
import VfsManager from './src/vfs/VfsManager';
import UserManager from './src/user/UserManager';
import { v4 as uuidv4 } from 'uuid';
import genHash from './src/util/genHash';
import User from './src/user/User';

config.printAll();
console.log(process.env.NODE_ENV);

const expressApp = express();
const userManager = new UserManager(expressApp, config);
// const vfsManager = new VfsManager(expressApp, config);

const uuid = uuidv4();
const name = 'MyAwesomeUser';
const email = 'myawesomeUser@email.com';
const hash = genHash(name + email);
const isActivate = false;

//const user = new User(uuid, name, email, hash, isActivate);
//userManager.pushToStorage(user);
//userManager.tryFetchFromStorage(user).then((res) => console.log(res));
//userManager.tryPushToStorage(user).then((o) => console.log(o));

expressApp.listen(3000);
