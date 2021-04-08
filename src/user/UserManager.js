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
  _mongoClient; // MongoCleint

  constructor(expressApp = express(), config = new ConfigBase()) {
    this._expressApp = expressApp;
    this._config = config;

    this.#setSettings();
  }

  #setSettings = () => {
    this._expressApp.use(bodyParser.urlencoded({ extended: false }));
    this._expressApp.use(bodyParser.json());
    this._mongoClient = new mongodb.MongoClient(MONGO_URL);
  };

  #setListeners = () => {
    this._expressApp.post('/signUp', (req, res) => {
      const userData = req.body.userData;

      const uuid = uuidv4();
      const name = userData.name;
      const email = userData.email;
      const hash = genHash(name + email);
      const isActive = false;
    });
  };

  isAlreadySignUp(email) {
    // bool
  }

  async tryPushToStorage(user) {
    // (User) => void
    return this.tryFetchFromStorage(user);
  }

  pushToStorage(user) {
    // (User) => Object
    if (user === null) return;

    this._mongoClient.connect((err) => {
      console.log(err);

      const db = this._mongoClient.db(MONGO_DB_NAME);
      const usersCollection = db.collection('users');
      usersCollection.insertMany([user], (err, res) => {
        if (err != null) console.log(err);
        console.log(res);
      });

      this._mongoClient.close();
    });
  }

  async tryFetchFromStorage(user) {
    // (User) => User?
    let rres = null;
    rres = await this._mongoClient.connect((err) => {
      console.log(err);

      const db = this._mongoClient.db(MONGO_DB_NAME);
      const usersCollection = db.collection('users');

      usersCollection.find({ _email: user.getEmail() }).toArray((err, res) => {
        rres = res;
        /*if (res.length === 0 ) return null;
          return res;*/
      });
      this._mongoClient.close();
    });

    return rres;
  }
}

export default UserManager;
