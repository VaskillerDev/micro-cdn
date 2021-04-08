import crypto from 'crypto';
import genHash from './genHash';

const algorithm = 'aes-256-cbc';
const vec = '6sQHveRFexVpmRQG';

export default (code) => {
  const key = genHash(code).substr(0, 32);
  const decipher = crypto.createDecipheriv(algorithm, key, vec);

  return decipher;
};
