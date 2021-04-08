import genHash from '../src/util/genHash';
import isUser from '../src/user/isUser';
import User from '../src/user/User';
import { v4 as uuidv4 } from 'uuid';
import * as assert from 'assert';
import VfsFile from '../src/vfs/VfsFile';
import express from 'express';
import VfsManager from '../src/vfs/VfsManager';
import UserManager from '../src/user/UserManager';

{
  const uuid = uuidv4();
  const name = 'MyAwesomeUser';
  const email = 'myawesomeUser@email.com';
  const hash = genHash(name + email);
  const isActivate = false;

  const user = new User(uuid, name, email, hash, isActivate);

  assert.strictEqual(isUser(user), true);

  let file = new VfsFile();

  /* file._isDirectory = false;
    file._ownerUuid = uuid;
    file._nativeFile = fs.readFileSync("./myAwesomeTestFile.txt");*/
  //let _ = file._nativeFile;

  const expressApp = express();

  let vfsManager = new VfsManager(expressApp);
  let userManager = new UserManager(expressApp);

  userManager.tryPushToStorage(user).then((r) => console.log(r));

  //expressApp.set('port', 3000);
  expressApp.listen(3000);

  //upload(expressApp(), user, file);
}

{
}
