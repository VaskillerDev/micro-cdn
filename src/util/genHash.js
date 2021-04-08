'use strict';

import crypto from 'crypto';

export default (input) => {
  // string
  return crypto.createHash('sha256').update(input).digest('hex');
};
