export default (fileName) => {
  // string
  return fileName.split('.').slice(0, -1).join('.');
};
