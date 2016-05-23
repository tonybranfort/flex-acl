/*jslint node: true */
'use strict'; 

var aclRules = require('./acl.js');
// var flexAcl  = require('flex-acl');
var flexAcl  = require('../../../../lib/index.js');
var roles = require('./roles.js'); 

var isAuthorized; 

makeIsAuthorized(); 

module.exports = {
    isAuthorized: isAuthorized,
    getReqUserId: getReqUserId,
    getUserAccessCodes: getUserAccessCodes
};

function makeIsAuthorized() {

  var optionsAllowVars = {
    variables: aclRules.getVariables(),
    variablesInTObj: true
  };

  var keysToIgnore = ['domain','name','desc']; 

  // see flexAcl for default options by property and global
  aclRules.getRules(function(err, rules){
    var propsToTest = flexAcl.getPropsFromRules(rules, keysToIgnore); 

    propsToTest.path = optionsAllowVars; 

    isAuthorized = flexAcl.makeIsAuthorized(
      aclRules.getRules, 
      getUserAccessCodes,
      propsToTest); 

  });
  
}

function getReqUserId(req) {
	return req && req.hasOwnProperty("user") && req.user.hasOwnProperty("_id") ?
    req.user._id : null;  
}

function getUserAccessCodes(req, cb) {
  if(req && req.user && req.user.role) {
    // console.log(req.user.acs); 
    roles.getRoleAsync(req.user.role, function(err, roleObj) {
      return cb(err, roleObj && roleObj.acs ? roleObj.acs : []); 
    })
  } else {
    return cb(new Error('No user access codes')); 
  }
}
