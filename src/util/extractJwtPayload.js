import Base64ToObject from './Base64ToObject';

export default jwt => {
  if (jwt === null || jwt === undefined) return null;

  const [_, payloadEncode] = jwt.split('.');
  if (payloadEncode === null || payloadEncode === undefined) return null;

  return Base64ToObject(payloadEncode);
};
