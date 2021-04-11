﻿import genHash from '../src/util/genHash';
import isUser from '../src/user/isUser';
import User from '../src/user/User';
import { v4 as uuidv4 } from 'uuid';
import * as assert from 'assert';

{
  const uuid = uuidv4();
  const name = 'MyAwesomeUser';
  const email = 'myawesomeUser@email.com';
  const hash = genHash(name + email);
  const isActivate = false;

  const user = new User(uuid, name, email, hash, isActivate);

  assert.strictEqual(isUser(user), true);
}

{
}
