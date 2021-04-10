export default str => {
  let text = Buffer.from(str, 'base64').toString('utf-8');
  try {
    return JSON.parse(text);
  } catch (_) {
    console.log('Unexpected end of JSON input in Base64ToObject');
    return null;
  }
};
