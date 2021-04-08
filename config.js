'use strict';

import ConfigDev from './config/config.dev.js';
import ConfigBase from './config/config.base.js';
// import ConfigProd from "./config/config.prod";

const env = process.env.NODE_ENV || 'dev';

let config;
switch (
  env // "dev" || "prod" || "base"
) {
  case 'dev': {
    config = new ConfigDev();
    break;
  }
  /*case 'prod': {
    config = new ConfigProd();
    break;
  }*/
  default: {
    config = new ConfigBase();
    break;
  }
}

export default Object.freeze(config); // as readonly
