// important to guarantee valid input data as User
import isUser from './isUser';
import User from './User';

let upload = (user, vfsManager, file) => {
  // (User, VfsFile) => void

  let maybeUser = User.createFromObject(user);
  if (maybeUser == null)
    throw new TypeError('maybeUser object is not User class instance');
};

export default upload;
