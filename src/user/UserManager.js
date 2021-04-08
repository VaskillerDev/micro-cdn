import express from 'express';
import ConfigBase from '../../config/config.base';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import genHash from '../util/genHash';
import mongodb from 'mongodb';

const MONGO_URL = 'mongodb://localhost:27017'; // todo: hardcode
const MONGO_DB_NAME = 'micro-cdn';

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
    this._mongoClient = new mongodb.MongoClient(MONGO_URL);
  };

  #setListeners = () => {
    /*this._expressApp.post('/signUp', (req, res) => {
      const userData = req.body.userData;

      const uuid = uuidv4();
      const name = userData.name;
      const email = userData.email;
      const hash = genHash(name + email);
      const isActive = false;
    });*/

    // out signal intercept
    process.on('exit', (_) => this._mongoClient.close());
    process.on('SIGINT', (_) => this._mongoClient.close());
    process.on('SIGUSR1', (_) => this._mongoClient.close());
    process.on('SIGUSR2', (_) => this._mongoClient.close());
    process.on('uncaughtException', (_) => this._mongoClient.close());
  };

  isAlreadySignUp(email) {
    // bool
  }

  tryPushToStorage(user) {
    // (User) => void
    return new Promise((resolve, reject) => {
      this.tryFetchFromStorage(user).then((maybeUser) =>
        maybeUser
          ? resolve(null)
          : this.pushToStorage(user, (result) => resolve(result))
      );
    });
  }

  pushToStorage(user, cb = null) {
    // (User) => Object
    if (user === null) return;

    this._mongoClient.connect((err) => {
      const db = this._mongoClient.db(MONGO_DB_NAME);
      const usersCollection = db.collection('users');

      usersCollection.insertMany([user], (err, res) => {
        if (err != null) console.log(err);
        const user = res.ops[0];
        if (cb != null) cb(user);
      });
    });
  }

  tryFetchFromStorage(user) {
    // (User) => Promise(User?)
    return new Promise((resolve) =>
      this._mongoClient.connect(
        this.#searchUser.bind(this, user, (maybeUser) => resolve(maybeUser))
      )
    );
  }

  static #getUserFromCollection(userCollection, email) {
    // (Object) => User
    return userCollection.findOne({ _email: email });
  }

  #searchUser(user, cb) {
    const db = this._mongoClient.db(MONGO_DB_NAME);
    const userCollection = db.collection('users');

    const email = user.getEmail();
    const maybeUser = UserManager.#getUserFromCollection(userCollection, email);

    cb(maybeUser);
  }
}

export default UserManager;
