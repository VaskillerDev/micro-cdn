import { v4 as uuidv4 } from 'uuid';
import genHash from '../src/util/genHash';
import User from '../src/user/User';
import assert from 'assert';
import isUser from '../src/user/isUser';

{
  const uuid = uuidv4();
  const name = 'MyAwesomeUser';
  const email = 'myawesomeUser@email.com';
  const hash = genHash(name + email);
  const isActivate = false;

  const user = new User(uuid, name, email, hash, isActivate);

  assert.strictEqual(isUser(user), true);

  (async () => {
    try {
      const jwt = await user.toJwt();
      const userFromJwt = await User.createFromJwt(jwt);

      assert.strictEqual(userFromJwt.getName() === name, true);
      assert.strictEqual(userFromJwt.getEmail() === email, true);
      assert.strictEqual(userFromJwt.getUuid() === uuid, true);
      assert.strictEqual(isUser(userFromJwt), false); // it is not complete User instance - missing fields
    } catch (e) {
      console.error(e);
    }
  })();
}
