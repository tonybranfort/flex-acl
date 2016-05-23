
// somewhat abbreviated example of using flex-acl with express
//   you'll need to modify this app.js file for your own needs but you can see
//   how flex-acl works especially the acl implementation in app/modules/auth
// BE SURE that at least the portion of the http requests that you are using to retrieve
//   the authorized acl ids (user, role, etc) are trusted and verifiable secure 
//   tsl, web tokens, etc 

var server; 

var express        = require('express');
var app            =  express();

if(config.isHttps(envVars)) {
  var https           = require('https'); 
  var fs         = require('fs');
  var options = {
    key: fs.readFileSync('/whereis/my/privatekey.pem'),
    cert: fs.readFileSync('/whereis/my/ssl/server.crt')
  };
} else {
  var http         = require('http');
}

var auth           = require('./app/modules/auth');

var clientapi 	   = require('./app/modules/client-api');
var txtnapi 	     = require('./app/modules/txtn-api');
var txtnsummaryapi = require('./app/modules/txtn-summary-api');

var userapi        = require('./app/modules/user-api');
var googleapi		   = require('./app/modules/google-api');
var metaapi		     = require('./app/modules/meta-api');
var noteapi        = require('./app/modules/note-api');
var taskapi		     = require('./app/modules/task-api');
var messageapi     = require('./app/modules/message-api');
var sysapi         = require('./app/modules/sys-api');
var uscisapi	     = require('./app/modules/uscis-api');

var expressJwt 	   = require('express-jwt');

var port = process.env.PORT || envVars.port; 

app.use('/api', expressJwt({secret: "Lajld87kj3!#$jkjbogusldljkla97FKJF**&$"}));

//this executes this function on every request to /api before allowing next app.use(api) es
app.use('/api', function (req, res, next) {
	auth.isAuthorized(req, function(err) {
		if(err) {
      handleErrorAndRespond(err,req, res, 401); 
    } else  {
      next();
    }
	});
});

app.use(userapi);
app.use(googleapi);
app.use(metaapi);
app.use(noteapi); 
app.use(taskapi); 
app.use(messageapi); 
app.use(uscisapi); 
app.use(sysapi); 

app.use(clientapi);
app.use(txtnapi);
app.use(txtnsummaryapi);

app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html'); 
});


if(config.isHttps(envVars)) {
  server = https.createServer(options, app).listen(port); 
} else {
  server = http.createServer(app).listen(port); 
}

console.log('Connecting as ' + appArg + ' app, with ' + envArg + ' config.'); 
console.log('Magic happens on port ' + port); 			// shoutout to the user

function handleErrorAndRespond(error, req, res, resStatusCode) {
  var resStatuscode = resStatusCode || "500"; 
  console.log(error);
  console.log("resStatusCode: " + resStatuscode); 
  res.status(resStatuscode).send(
    {err: error, 
     recordedError: recordedError,
    }
  );
} 
