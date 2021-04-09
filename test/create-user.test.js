import genHash from '../src/util/genHash';
import isUser from '../src/user/isUser';
import User from '../src/user/User';
import { v4 as uuidv4 } from 'uuid';
import * as assert from 'assert';
import express from 'express';
import UserManager from '../src/user/UserManager';
import config from '../config';
import VfsManager from "../src/vfs/VfsManager";

{
  const uuid = uuidv4();
  const name = 'MyAwesomeUser';
  const email = 'myawesomeUser@email.com';
  const hash = genHash(name + email);
  const isActivate = false;

  const user = new User(uuid, name, email, hash, isActivate);

  assert.strictEqual(isUser(user), true);

  config.printAll();
  console.log('NODE_ENV:', process.env.NODE_ENV);

  const expressApp = express();
  const vfsManager = new VfsManager(expressApp, config);
  const userManager = new UserManager(expressApp, config);

  expressApp.listen(3000);
}

{
}
