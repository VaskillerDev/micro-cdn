'use strict';

import isUser from './isUser';
import getCipher from "../util/getCipher";

class User {
  _uuid; // string as UUID
  _name; // string
  _email; // string as Email
  _hash; // string as Hash (sha256) by _name + _email, for example 
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

  getName() {
    return this._name;
  }
  
  getUuid() {
    return this._uuid;
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
  
  toJwt() { // => Promise(string? as JWT)
    return new Promise(resolve => {

      if (!isUser(this)) resolve(null); // guard

      const header = {alg: 'aes-256-cbc', typ: "JWT"};
      const payload = {
        name: this._name,
        email: this._email,
        uuid: this._uuid,
        exp: 10 * 60 // as sec, must be >= 5 min
      }

      const headerEncode = Buffer.from(JSON.stringify(header)).toString('base64');
      const payloadEncode = Buffer.from(JSON.stringify(payload)).toString('base64');
      const rawToken = headerEncode + "." + payloadEncode;

      const cipher = getCipher(this._hash);
      const secretEncode = cipher.update(rawToken, 'base64', 'base64');

      resolve(rawToken + "." + secretEncode);
    });
  }
  
  static createFromJwt(jwt) { // (string as JWT) => Promise(User?)
    return new Promise( resolve => {

      const [headerEncode, payloadEncode, secretEncode] = jwt.split('.');

      if (!!headerEncode && !!payloadEncode && !!secretEncode === false) resolve(null);

      // const header = User.#Base64ToObject(headerEncode);
      const payload = User.#Base64ToObject(payloadEncode);
      // const secret = secretEncode;

      const name = payload["name"];
      const email = payload["email"];
      const uuid = payload["uuid"];
      
      const user = new User(uuid, name , email, null, false);

      if (!!uuid && !!name && !!email === false) resolve(null);
      
      resolve(user);
    });
  }
  
  static #Base64ToObject(str) {
    const text = Buffer.from(str, 'base64').toString('utf-8');
    return JSON.parse(text);
  }
}

export default User;
