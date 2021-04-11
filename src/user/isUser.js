export default maybeUser => {
  // bool

  if (maybeUser == null) return false;

  const maybeUuid = maybeUser?._uuid;
  if (maybeUuid == null) return false;
  if (!isUUID(maybeUuid)) return false;

  const maybeName = maybeUser?._name;
  if (maybeName == null) return false;
  if (isEmpty(maybeName)) return false;

  const maybeEmail = maybeUser?._email;
  if (maybeEmail == null) return false;
  if (!isEmail(maybeEmail)) return false;

  const maybeHash = maybeUser?._hash;
  if (maybeHash == null) return false;
  if (!isHash(maybeHash, 'sha256')) return false;

  const maybeIsActivate = maybeUser?._isActivate?.toString();
  if (!isBoolean(maybeIsActivate)) return false;

  return true;
};


const uuid = {
  3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
};

function isUUID (str, version = 'all') {
  const pattern = uuid[version];
  return pattern && pattern.test(str);
}

function isEmpty(str, options) {
  options = {ignore_whitespace: false};

  return (options.ignore_whitespace ? str.trim().length : str.length) === 0;
}

function isEmail(email) { 
  return /^.+@.+\..+$/.test(email); 
}

const lengths = {
  md5: 32,
  md4: 32,
  sha1: 40,
  sha256: 64,
  sha384: 96,
  sha512: 128,
  ripemd128: 32,
  ripemd160: 40,
  tiger128: 32,
  tiger160: 40,
  tiger192: 48,
  crc32: 8,
  crc32b: 8,
};

function isHash(str, algorithm) {
  const hash = new RegExp(`^[a-fA-F0-9]{${lengths[algorithm]}}$`);
  return hash.test(str);
}

function isBoolean(str) {
  return (['true', 'false', '1', '0'].indexOf(str) >= 0);
}