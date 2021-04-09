import isEmpty from 'validator/es/lib/isEmpty.js';
import isEmail from 'validator/es/lib/isEmail.js';
import isHash from 'validator/es/lib/isHash.js';
import isJWT from 'validator/es/lib/isJWT.js';
import isBoolean from 'validator/es/lib/isBoolean.js';
import isUUID from 'validator/es/lib/isUUID.js';

export default maybeUser => {
  // bool

  if (maybeUser == null) return false;

  const maybeUuid = maybeUser?._uuid;
  if (!isUUID(maybeUuid)) return false;

  const maybeName = maybeUser?._name;
  if (isEmpty(maybeName)) return false;

  const maybeEmail = maybeUser?._email;
  if (!isEmail(maybeEmail)) return false;

  const maybeHash = maybeUser?._hash;
  if (!isHash(maybeHash, 'sha256')) return false;

  /*const maybeJwt = maybeUser["_jwt"];
    if (!isJWT(maybeJwt)) return false;*/

  const maybeIsActivate = maybeUser?._isActivate?.toString();
  if (!isBoolean(maybeIsActivate)) return false;

  return true;
};
