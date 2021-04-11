# MicroCDN
Small cdn for demonstration.

## Exec:
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
for test:
```
npm run test
```
or
```
node --experimental-modules --es-module-specifier-resolution=node tests.js
```
## Vars:
```sh
NODE_ENV - "prod" || "dev" || "base"
INIT_VECTOR - (required) initialization vector for encryption data

// vfs
VFS_ROOT_PATH - root for cdn uploading
ROOT_STATIC_FILES - directory for serve static files

//mongo
MONGO_URL - adress to mongod instance server
MONGO_DB_NAME - name of mongo database

// mail
USE_MAIL - use mail notification
SENDGRID_API_KEY - sendgrid api key
SENDER_EMAIL - email sender
```

## Usage
```
# Sign Up
curl --location --request POST 'localhost:3000/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userData": {
        "name": "ExampleUser",
        "email": "exampleMail@mail.com"
    }
}'

# Sign In
curl --location --request POST 'localhost:3000/signin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userData": {
        "name": "ExampleUser",
        "email": "exampleMail@mail.com"
    }
}'

# Upload File
curl --location --request POST 'localhost:3000/upload' \
--header 'Authorization: YourJwtToken' \
--form 'uploadedFile=@"/path/to/file"' \
--form 'uploadedCipher="YourCode"'

# Download file
curl --location --request GET 'localhost:3000/download/file-uuid/code' \
--header 'Authorization: YourJwtToken'

# Delete file
curl --location --request DELETE 'http://localhost:3000/delete/file-uuid/code' \
--header 'Authorization: YourJwtToken'
```