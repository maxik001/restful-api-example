## RESTful API Example

### About
This is a small project an example of RESTful API server.

This API contains functions that allow to proccess some preregistration workflow. 

### Workflow description
When a new user wants to register on the site are commonly used two-factor register.

#### For example such a procedure:
1. The user leaves his email on the site.
2. On the email is sent direct link (which has a unique identifier hash) to the registration page.
3. The user clicks on this link and completes the registration.

#### Presented api allows you to:
1. Get a new identity hash.
2. Check the existing identifier hash.
3. Remove the identifier hash.

### API documentation

#### 1. Get new hash
Request:
```
curl -i -X POST -H "Content-Type: application/json" -d '{ "data": {"email":"test@gmail.com"}}' "http://127.0.0.1:8080/hash/"
```
Response:
HTTP/1.1 201 Created
```
{"data":{"message":"Use this hash to validate registration","hash":"993a7b571ea38c220cd12b0fbe3fc85b"}}
```

#### 2. Validate hash
Request:
```
curl -i -X GET -H "Content-Type: application/json" "http://127.0.0.1:8080/hash/993a7b571ea38c220cd12b0fbe3fc85b"
``` 

Response:
HTTP/1.1 200 OK
```
{"data":{"success":true,"email":"test@gmail.com","message":"This is valid hash"}}
```

#### 3. Delete hash
Request:
```
curl -i -X DELETE -H "Content-Type: application/json" -d '{ "data": {"email":"maxgusev@gmail.com", "hash":"993a7b571ea38c220cd12b0fbe3fc85b"}}' "http://127.0.0.1:8080/hash/"

```

Response: 
HTTP/1.1 200 OK



### How to start server
```
# babel-node ./app.js
```
### Tags
[Node.js](https://nodejs.org/)
[Express](http://expressjs.com/)
[Redis](http://redis.io/)