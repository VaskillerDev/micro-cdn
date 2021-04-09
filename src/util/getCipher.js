import crypto from 'crypto';
import genHash from './genHash';

const algorithm = 'aes-256-cbc';
const vec = process.env.INIT_VECTOR; //'6sQHveRFexVpmRQG';

export default code => {
  const key = genHash(code).substr(0, 32);
  const cipher = crypto.createCipheriv(algorithm, key, vec);

  return cipher;
};
