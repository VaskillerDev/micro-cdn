# MicroCDN
Small cdn for demonstration.

## Usage:
```sh
npm start
```
or
```sh
INIT_VECTOR='6sQHveRFexVpmRQG' NODE_ENV='dev' node --experimental-modules --es-module-specifier-resolution=node app.js
```
using sendgrid email:
```sh
INIT_VECTOR='6sQHveRFexVpmRQG' NODE_ENV='dev' USE_MAIL=true SENDGRID_API_KEY="key" SENDER_EMAIL="youremail" node --experimental-modules --es-module-specifier-resolution=node app.js
```
## Vars:
```sh
NODE_ENV - "prod" || "dev" || "base"
INIT_VECTOR - (required) initialization vector for encryption data

// vfs
VFS_ROOT_PATH - root for cdn uploading

// static
ROOT_STATIC_FILES - direcory for serve static files

// mail
USE_MAIL - use mail notification
SENDGRID_API_KEY - sendgrid api key
SENDER_EMAIL - email sender


```