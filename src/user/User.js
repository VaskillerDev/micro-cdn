'use strict';

import isUser from './isUser';
import Base64ToObject from '../util/Base64ToObject';
import getHmac from '../util/getHmac';
import Utf8ToBase64Url from '../util/Utf8ToBase64Url';

class User {
  _uuid; // string as UUID
  _name; // string
  _email; // string as Email
  _hash; // string as Hash (sha256) by _name + _email, for example
  _isActivate; // bool

  constructor(uuid, name, email, hash, isActivate) {
    this._uuid = uuid;
    this._name = name;
    this._email = email;
    this._hash = hash;
    this._isActivate = isActivate;
  }

  getEmail() {
    return this._email;
  }

  getName() {
    return this._name;
  }

  getUuid() {
    return this._uuid;
  }

  getHash() {
    return this._hash;
  }

  static createFromObject(object) {
    // User?
    if (!isUser(object)) return null;

    const uuid = object['_uuid'];
    const name = object['_name'];
    const email = object['_email'];
    const hash = object['_hash'];
    const isActive = object['_isActivate'];

    return new User(uuid, name, email, hash, isActive);
  }

  toJwt() {
    // => Promise(string? as JWT)
    return new Promise(resolve => {
      if (!isUser(this)) resolve(null); // guard
      resolve(this.makeJwt());
    });
  }

  toJwtSync() {
    // => Promise(string? as JWT)
    if (!isUser(this)) return null; // guard
    return this.makeJwt();
  }

  makeJwt() {
    const header = { alg: 'sha256', typ: 'JWT' };
    const payload = {
      name: this._name,
      email: this._email,
      uuid: this._uuid,
      exp: 10 * 60, // as sec, must be >= 5 min
    };

    const headerEncode = Utf8ToBase64Url(JSON.stringify(header));
    const payloadEncode = Utf8ToBase64Url(JSON.stringify(payload));
    const rawToken = headerEncode + '.' + payloadEncode;

    const hmac = getHmac(this._hash);
    let secretEncode = hmac.update(rawToken).digest('hex');
    secretEncode = Utf8ToBase64Url(secretEncode);

    return rawToken + '.' + secretEncode;
  }

  static createFromJwt(jwt) {
    // (string as JWT) => Promise(User?)
    return new Promise(resolve => {
      const [headerEncode, payloadEncode, secretEncode] = jwt.split('.');

      if (!!headerEncode && !!payloadEncode && !!secretEncode === false) resolve(null);
      const payload = Base64ToObject(payloadEncode);

      const name = payload['name'];
      const email = payload['email'];
      const uuid = payload['uuid'];

      const user = new User(uuid, name, email, null, false);

      if (!!uuid && !!name && !!email === false) resolve(null);

      resolve(user);
    });
  }

  static createFromJwtSync(jwt) {
    // (string as JWT) => Promise(User?)
    const [headerEncode, payloadEncode, secretEncode] = jwt.split('.');

    if (!!headerEncode && !!payloadEncode && !!secretEncode === false) return null;
    const payload = Base64ToObject(payloadEncode);

    const name = payload['name'];
    const email = payload['email'];
    const uuid = payload['uuid'];

    const user = new User(uuid, name, email, null, false);

    if (!!uuid && !!name && !!email === false) return null;

    return user;
  }
}

export default User;
