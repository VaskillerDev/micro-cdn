'use strict';

import isUser from './isUser';

class User {
  _uuid; // string as UUID
  _name; // string
  _email; // string as Email
  _hash; // string as Hash by password (sha256) _name + _email
  //_jwt; // string as JWT
  _isActivate; // bool

  constructor(uuid, name, email, hash, isActivate) {
    this._uuid = uuid;
    this._name = name;
    this._email = email;
    this._hash = hash;
    // this._jwt = jwt;
    this._isActivate = isActivate;
  }

  getEmail() {
    return this._email;
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
}

export default User;
