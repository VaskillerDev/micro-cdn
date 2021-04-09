'use strict';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigBase {
  // vfs
  VFS_ROOT_PATH = process.env.VFS_ROOT_PATH || './upload';
  ROOT_STATIC_FILES =
    process.env.ROOT_STATIC_FILES || __dirname + path.sep + '..' + path.sep + 'public';

  //mongo
  MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
  MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'micro-cdn';

  // mail
  SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  USE_MAIL = process.env.USE_MAIL || false;
  SENDER_EMAIL = process.env.SENDER_EMAIL;

  printAll() {
    console.log('VFS_ROOT_PATH: ' + this.VFS_ROOT_PATH);
    console.log('ROOT_STATIC_FILES: ' + this.ROOT_STATIC_FILES);
    console.log('SENDGRID_API_KEY: ' + this.SENDGRID_API_KEY);
    console.log('USE_MAIL: ' + this.USE_MAIL);
    console.log('SENDER_EMAIL: ' + this.SENDER_EMAIL);
  }
}

export default ConfigBase;
