# http-req-auth

Determines if an http request is authorized based on a rules object that you establish and corresponding rules access code(s) that are provided at the time of the request - most likely that are assigned to the user submitting the http request.

http-req-auth does _not_ authenticate users.  Users should be authenticated before authorizing requests.   

####Simple Example
Establish the get rules and get access codes functions:  
```javascript
var getRules = function(callback) {
  var rules = [
    {code: 'CSL',
     method: 'GET',
     pathname:'/api/clients'},
    {code: 'CDV',
     method: 'GET',
     pathname:'/api/clients/[A-Fa-f0-9]{24}'},  //reg exp for a mongo id}},
    {code: 'CDC',
     method: 'POST',
     pathname:'/api/clients'},
  	{code: 'CPL',
     method: 'GET',
     pathname: '/api/clients',
     query: {status: '^active$'}},
    {code: 'TDI',
     method: 'GET',
     pathname:'/api/txtns/20[0,1,2][0-9]'}   //years 2000 to 2029
    ];
  
  return callback(null, rules); 

}; 

var getReqUserAccessCodes = function(req, callback) {
  // returns the access codes for the user making the http request
  var userCodes = {
    admin: ["*"],           // Access to all rules
    paul:  ["C.."],         // Access to all "Cxx" rules
    jane:  ["CDV", "TDI"]   // Access to just CDV & TDI rules
  };

  if(req && req.user && req.user_id && userCodes.hasOwnProperty(req.user._id)) {
    return callback(null, userCodes[req.user._id]);
  } else { 
    return callback('Error: User access code does not exist'); 
  }
};
```
If using express, include isAuthorized: 
```javascript
var express = require('express');
var app = express();
var http = require('http');
var clientapi = require('./app/modules/client-api');
var txtnapi = require('./app/modules/txtn-api');
var hra = require('http-req-auth'); 

var isAuthorized = hra.makeIsAuthorized(getRules, getUserAccessCodes); 

app.use('/api', function (req, res, next) {
  isAuthorized(req, function(err) {
    if(err) {
      res.status(401).send("Error in Authorization. " + err );
    } else  {
      next();
    }
  });
});

app.use(clientapi);
app.use(txtnapi);

var server = http.createServer(app).listen(80);

```

Names here follow the same definitions used by [npm url](https://www.npmjs.com/package/url).

##An http request is authorized if : 
####1. The http request has at least one matching rule. 
To match (using default options) : 
  * The http request `method` value (PUT, POST, DELETE, GET, etc.) equals the rule `method` value if the rule has a `method` property.  This is a case sensitive match [HTTP/1.1 Request method](http://tools.ietf.org/html/rfc7230#section-3.1.1). 
  * The http request `pathname` value ('_The path section of the URL, that comes after the host and before the query, including the initial slash if present_') string matches the  rule `pathname` as a regular expression if the rule has a `pathname` property.  This match is case **in**sensitive.  [Variable substitution]() is allowed in the rule `pathname` string. 
  * The http request `query` parameter values match the rule `query` parameter values as a regular expression if the rule has those `query` name/values. These are case *sensitive* matches. 

####2. Every rule matched above has at least one matching access code that's provided at the time of the request.  
The match between the user's assigned code and the rule access code uses a regular expression test.   

####Examples####
| http request  | Rule          | Matches  |
| ------------- |-------------|:-----:|
| {method: 'POST', pathname: '/api/clients'}| {pathname: '/api/clients'} | `true` |
| {method: 'POST', pathname: '/api/clients'}| {method: 'GET', pathname: '/api/clients'} | `false` |
| {method: 'POST', pathname: '/api/clients/BORG123'}| {pathname: '/api/clients/borg.*'} | `true` |
| {method: 'POST', pathname: '/api/clients', query: {filter: 'dog', sort: 'asc'}}| {pathname: '/api/clients'} | `true` |
| {method: 'POST', pathname: '/api/clients', query: {filter: 'dog', sort: 'asc'}}| {pathname: '/api/clients', query: {filter: '.*'}} | `true` |
| {method: 'POST', pathname: '/api/clients', query: {filter: 'dog', sort: 'asc'}}| {pathname: '/api/clients', query: {filter: 'DOG'}} | `false` |
| {method: 'POST', pathname: '/api/clients', query: {filter: 'dog', sort: 'asc'}}| {pathname: '/api/clients', query: {topic: '.*'}} | `false` |



