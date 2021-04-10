'use strict';

import express from 'express';
import ConfigBase from '../../config/config.base';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import genHash from '../util/genHash';
import mongodb from 'mongodb';
import User from './User';
import isUser from './isUser';
import Base64ToObject from '../util/Base64ToObject';
import Utf8ToBase64Url from '../util/Utf8ToBase64Url';
import getHmac from '../util/getHmac';

const USER_ALREADY_SIGNUP = { token: null, message: 'user already sign up' };
const USER_SIGNIN_FAILED = { token: null, message: 'sign in is failed' };
const USER_UNAUTHORIZED = { message: 'unauthorized' };
const INVALID_TOKEN = { message: 'invalid token' };
const TARGET_COLLECTION = 'users';

/**
 * @property {e.Express} this._expressApp
 * @property {ConfigBase} this._config
 */
class UserManager {
  _expressApp; // core.Express
  _config; // BaseConfig
  _mongoClient; // MongoClient

  constructor(expressApp = express(), config = new ConfigBase()) {
    this._expressApp = expressApp;
    this._config = config;

    this.#setSettings();
  }

  #setSettings = () => {
    this._expressApp.use(bodyParser.urlencoded({ extended: false }));
    this._expressApp.use(bodyParser.json());
  };

  listen = () => {
    /* {
      "userData": {
      "name": "MyName",
      "email": "myemail@mail.com"
        }
    } */
    this._expressApp.post('/signUp', (req, res) => {
      const userData = req.body.userData;

      const uuid = uuidv4();
      const name = userData.name;
      const email = userData.email;
      const hash = genHash(name + email);
      const isActivate = false;

      const user = new User(uuid, name, email, hash, isActivate);

      if (!isUser(user)) res.status(422).send({});

      this.tryPushToStorage(user).then(maybeUser =>
        maybeUser
          ? res
              .status(200)
              .send({ token: maybeUser.toJwtSync(), message: 'sign up is done' })
          : res.status(422).send(USER_ALREADY_SIGNUP)
      );
    });

    /* {
      "userData": {
      "name": "MyName",
      "email": "myemail@mail.com"
        }
    } */
    this._expressApp.post('/signIn', (req, res) => {
      const userData = req.body.userData;
      const name = userData.name;
      const email = userData.email;
      const filter = { _name: name, _email: email };

      this.tryFetchFromStorage(filter, this.#searchUser)
        .then(maybeUser => User.createFromObject(maybeUser)?.toJwtSync())
        .then(maybeToken =>
          maybeToken
            ? res.status(200).send({ token: maybeToken, message: 'sign in is done' })
            : res.status(422).send(USER_SIGNIN_FAILED)
        );
    });
  };
  /* {
    "jwt": "eyJhbGci.VzZXIiLCJlbWFpbCI6ImV4YW1wbGVNYWlsQG1.7B/c+a/6eVp4WHUMEr"
   } */
  getVerifyMiddleware() {
    return (req, res, next) => {
      const jwt = req.headers['authorization'];
      // const authHeader = req.headers['Authorization']: Bearer <token>;

      if (jwt === null || jwt === undefined) {
        res.status(422).send(INVALID_TOKEN);
        return;
      }

      const [headerEncode, payloadEncode, secretEncode] = jwt.split('.');
      const isValidEncodeFields = !!headerEncode && !!payloadEncode && !!secretEncode;
      if (!isValidEncodeFields) {
        res.status(422).send(INVALID_TOKEN);
        return;
      }

      const header = Base64ToObject(headerEncode);
      const payload = Base64ToObject(payloadEncode);
      const secret = secretEncode;

      const name = payload?.name;
      const email = payload?.email;
      const uuid = payload?.uuid;
      const isValidDecodeFieldsInPayload = !!uuid && !!name && !!email;

      if (!isValidDecodeFieldsInPayload) {
        res.status(422).send(INVALID_TOKEN);
        return;
      }

      const filter = { _name: name, _email: email, _uuid: uuid };

      this.tryFetchFromStorage(filter, this.#searchUser)
        .then(User.createFromObject)
        .then(user => {
          if (user?.getUuid() === uuid) {
            // is user

            const headerEncode = Utf8ToBase64Url(JSON.stringify(header));
            const payloadEncode = Utf8ToBase64Url(JSON.stringify(payload));
            const rawToken = headerEncode + '.' + payloadEncode;

            const hmac = getHmac(user._hash);
            let secretEncode = hmac.update(rawToken).digest('hex');
            secretEncode = Utf8ToBase64Url(secretEncode);

            if (secretEncode !== secret) {
              res.status(422).send(INVALID_TOKEN);
              return;
            }

            next();
          } else res.status(401).send(USER_UNAUTHORIZED);
        })
        .catch(err => console.log(err));
    };
  }

  // trying push data if cell in collection is free
  tryPushToStorage(user) {
    // (User) => void
    const email = user.getEmail();
    const filter = { _email: email };

    return new Promise(resolve =>
      this.tryFetchFromStorage(filter, this.#searchUser).then(maybeUser =>
        maybeUser ? resolve(null) : this.pushToStorage(user, result => resolve(result))
      )
    );
  }

  #searchUser(filter, cb) {
    const db = this._mongoClient.db(this._config.MONGO_DB_NAME);
    const userCollection = db.collection(TARGET_COLLECTION);

    let maybeUser = UserManager.#getUserFromCollection(userCollection, filter);
    cb(maybeUser);
  }

  static #getUserFromCollection(userCollection, filter) {
    // (Object) => User
    return userCollection.findOne(filter);
  }

  pushToStorage(user, cb = null) {
    // (User) => Object
    if (user === null) return;
    this._mongoClient = new mongodb.MongoClient(this._config.MONGO_URL);
    this._mongoClient.connect(err => {
      if (err != null) console.log(err);
      const db = this._mongoClient.db(this._config.MONGO_DB_NAME);
      const usersCollection = db.collection(TARGET_COLLECTION);

      usersCollection.insertOne(user, (err, res) => {
        if (err != null) console.log(err);
        const user = res.ops[0];
        if (cb != null) cb(user);
      });
      this._mongoClient.close();
    });
  }

  tryFetchFromStorage(filter, searchFunction) {
    // (User) => Promise(User?)
    this._mongoClient = new mongodb.MongoClient(this._config.MONGO_URL);
    return new Promise(resolve => {
      this._mongoClient.connect(
        searchFunction.bind(this, filter, maybeUser => resolve(maybeUser))
      );
      this._mongoClient.close();
    });
  }
}

export default UserManager;
