# MicroCDN
Small cdn for demonstration.

## Usage:
```sh
npm start
```
or
```sh
node --experimental-modules --es-module-specifier-resolution=node app.js
```
using sendgrid email:
```sh
USE_MAIL=true SENDGRID_API_KEY="key" SENDER_EMAIL="youremail" node --experimental-modules --es-module-specifier-resolution=node app.js
```
## Vars:
```sh
// vfs
VFS_ROOT_PATH - root for cdn uploading

// static
ROOT_STATIC_FILES

// mail
USE_MAIL - use mail notification
SENDGRID_API_KEY - sendgrid api key
SENDER_EMAIL - email sender


```