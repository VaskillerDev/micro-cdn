import crypto from 'crypto';

const algorithm = 'sha256';

export default code => {
  let sub = code.substr(0, 32);
  return crypto.createHmac(algorithm, sub);
};
