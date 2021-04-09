import express from 'express';
import ConfigBase from '../../config/config.base';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import genHash from '../util/genHash';
import mongodb from 'mongodb';
import User from './User';
import isUser from './isUser';

const USER_ALREADY_SIGNUP = { userData: null, message: 'user already sign up' };
const USER_SIGNIN_FAILED = { userData: null, message: 'sign in is failed' };

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
    this.#setListeners();
  }

  #setSettings = () => {
    this._expressApp.use(bodyParser.urlencoded({ extended: false }));
    this._expressApp.use(bodyParser.json());
    this._mongoClient = new mongodb.MongoClient(this._config.MONGO_URL);
  };

  #setListeners = () => {
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

      this.tryPushToStorage(user).then(result =>
        result
          ? res.status(200).send({ userData: user, message: 'sign up is done' })
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

      const user = new User(null, name, email, null, false);

      this.tryFetchFromStorage(user, this.#searchUser).then(user =>
        user
          ? res.status(200).send({ userData: user, message: 'sign in is done' })
          : res.status(422).send(USER_SIGNIN_FAILED)
      );
    });
  };

  // trying push data if cell in collection is free
  tryPushToStorage(user) {
    // (User) => void
    return new Promise(resolve =>
      this.tryFetchFromStorage(user, this.#searchUser).then(maybeUser =>
        maybeUser ? resolve(null) : this.pushToStorage(user, result => resolve(result))
      )
    );
  }

  pushToStorage(user, cb = null) {
    // (User) => Object
    if (user === null) return;
    this._mongoClient = new mongodb.MongoClient(this._config.MONGO_URL);
    this._mongoClient.connect(err => {
      const db = this._mongoClient.db(this._config.MONGO_DB_NAME);
      const usersCollection = db.collection('users');

      usersCollection.insertOne(user, (err, res) => {
        if (err != null) console.log(err);
        const user = res.ops[0];
        if (cb != null) cb(user);
      });
      this._mongoClient.close();
    });
  }

  tryFetchFromStorage(user, searchFunction) {
    // (User) => Promise(User?)
    this._mongoClient = new mongodb.MongoClient(this._config.MONGO_URL);
    return new Promise(resolve =>{
          this._mongoClient.connect(
              searchFunction.bind(this, user, maybeUser => resolve(maybeUser))
          )
      this._mongoClient.close();
    }
      
    );
  }

  static #getUserFromCollection(userCollection, name, email) {
    // (Object) => User
    return userCollection.findOne({ _email: email, _name: name });
  }

  #searchUser(user, cb) {
    const db = this._mongoClient.db(this._config.MONGO_DB_NAME);
    const userCollection = db.collection('users');

    const email = user.getEmail();
    const name = user.getName();
    const maybeUser = UserManager.#getUserFromCollection(userCollection, name, email);

    cb(maybeUser);
  }
}

export default UserManager;
