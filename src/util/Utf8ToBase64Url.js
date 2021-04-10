export default str => {
  const strAsBase64 = Buffer.from(str, 'utf-8').toString('base64');
  return strAsBase64.replace(/\+/g, '-').replace(/\\/g, '_').replace(/=/g, '');
};
