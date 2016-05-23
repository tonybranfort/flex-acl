var fos = require('filter-objects'); 
var _ = require('lodash'); 

function makeIsAuthorized(getAclRules, getAuthzdAclIds, propsToTest, defaultOptions) {

  getMatchedRules = makeGetMatchedRulesFn(propsToTest, defaultOptions); 
  var ia = isAuthorized(getMatchedRules, getAclRules, getAuthzdAclIds); 
  return ia;
}

function setOptionsOnProps(propsToTest, myDefaultOptions) {
  /* Sets all options on propsToTest
     Option value will be determined for *each option value* if that option value
     exists in (in order; ie, first found sets the value) : 
      1. propsToTest by propsToTest property (eg; 'method', 'path')
      2. defaultPropOptions by propsToTest property (eg; 'method', 'path')
          (cascaded to all nested props; eq query.filter will be set to query option)
      3. myDefaultOptions parameter
      4. globalDefaultOptions

      Example: 
      propsToTest = ['method','baseUrl','query.sort',{'query.filter':{regExpMatch: false}]
      myDefaultOptions = {variablesInTObj: true}

      method = {
        regExpMatch: false            // defaultPropOptions
        regExpIgnoreCase: false       // defaultPropOptions
        variablesInTObj: false        // defaultPropOptions 
      }

      baseUrl = {
        regExpMatch: true             // globalDefaulOptions
        regExpIgnoreCase: true        // globalDefaulOptions
        variablesInTObj: true         // myDefaultOptions 
      }

      query.sort = {
        regExpMatch: true             // defaultPropOptions
        regExpIgnoreCase: false       // defaultPropOptions
        variablesInTObj: false        // defaultPropOptions   
      }

      query.sort = {
        regExpMatch: false            // propsToTest
        regExpIgnoreCase: false       // defaultPropOptions
        variablesInTObj: false        // defaultPropOptions   
      }

  */ 

  var defaultPropOptions = 
    {'method': {
       'regExpMatch': false,
       'regExpIgnoreCase': false,
       'variablesInTObj': false},
     'query': {
       'regExpMatch': true,
       'regExpIgnoreCase': false,
       'variablesInTObj': false},
    }; 

  // set each property option and their nested property options (eg; query.filter)
  //   to defaultPropOptions if it isn't set in propsToTest
  fos.setNestedPropOptions(propsToTest, defaultPropOptions);

  // options when no options are stipulated for a given property
  var globalDefaultOptions = {
      matchIfTObjPropMissing: true, 
      matchIfPObjPropMissing: false,
      matchIfBothPropMissing: true,
      regExpMatch: true,
      regExpReverse: true, 
      regExpIgnoreCase: true,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      variables: {},
      variablesInTObj: false,
      variablesStartStr: '~',
      variablesEndStr: '#', 
    };

  //set options to myDefaultOptions where properties are set to globalDefaultOptions
  //   property value if that property doesn't exist on myDefaultOptions
  options = {};
  _.defaultsDeep(options,myDefaultOptions, globalDefaultOptions); 

  fos.setOptionsOnProps(propsToTest, options); 

  return propsToTest; 

}

function makeGetMatchedRulesFn(propsToTest, myDefaultOptions) {

  var defaultPropsToTest = ['path', 'baseUrl', 'method']; 

  propsToTest = propsToTest && Object.keys(propsToTest).length > 0 ? 
    propsToTest : defaultPropsToTest; 

  setOptionsOnProps(propsToTest,myDefaultOptions); 

  var filterRules = fos.makeFilterFn(propsToTest, options); 

  return function(req, getAclRules, callback) {
    getAclRules(function(err, rules) {
      var matchedRules = filterRules(req, rules); 
      // var matchedRules = filterRules(req, rules); 
      return callback(err, matchedRules); 
    });
  };

}

function isAuthorized(getMatchedRules, getAclRules, getAuthzdAclIds) {

  return function(req, callback) {
    var ids; 
    var matchedRules; 

    var checkAuthzdIdsWithRules = function(err) {
      // allows getMatchedRules and getAuthzdAclIds to be called in parallel
      // getMatchedRules and getAuthzdAclIds each call this function in their cb
      //    but the overall callback is only executed after both are complete
      if(err) return callback(err); 
      var errMessage = "Not authorized"; 
      if(ids !== undefined && matchedRules !== undefined) {
        // have both ids & rules so can now process results
        // console.log(matchedRules); 
        var hasAtLeastOnMatchedRule = matchedRules && 
          _.isArray(matchedRules) && 
          matchedRules.length > 0; 
        if(!hasAtLeastOnMatchedRule) { 
          return callback(
            new Error(errMessage + ": no acl rules match the request")); 
        }

        var hasAtLeastOneAuthId = ids && _.isArray(ids) && ids.length > 0; 
        if(!hasAtLeastOneAuthId) { 
          return callback(
            new Error(errMessage + ": no authorization ids from getAuthzdAclIds")); 
        }

        var everyMatchedRuleIsAuthzd = 
          matchedRules.every(function(rule) {
            return ids.some(function(inCode) {
              var re = _.isRegExp(inCode) ? inCode : new RegExp('^'+inCode+'$'); 
              var idMatchesRule = re.test(rule.id);
              return idMatchesRule;  
            });
        });

        if(everyMatchedRuleIsAuthzd) {
          return callback(null, true);
        } else {
          var e = new Error(errMessage + 'at least one acl rule does not' + 
            'have authorization'); 
          e.authznIds = ids; 
          e.matchedRules = matchedRules; 
          return callback(e);
        }
      }
    };

    getMatchedRules(req, getAclRules, getMatchedRulesCb); 
    getAuthzdAclIds(req, getAuthzdAclIdsCb); 

    function getMatchedRulesCb(err, returnedRules) {
      matchedRules = returnedRules || null;
      checkAuthzdIdsWithRules(err);  
    }

    function getAuthzdAclIdsCb(err, returnedIds) {
      ids = returnedIds || null;
      checkAuthzdIdsWithRules(err);  
    }
  };
}

function getPropsFromRules(rules, keysToIgnore) {
  // return an array of strings that are the keys of rules objects
  // in dot notation form.  Do not return any strings that are in keysToIgnore
  // keysToIgnore = array of strings. 
  // eg; rules = [{method:'POST', query:{sort:'ASC'}},'pathname':'/api/blah']
  //   would return ['method', 'query.sort', 'pathname']
  keysToIgnore = keysToIgnore && _.isArray(keysToIgnore) ? keysToIgnore : []; 
  // always ignore 'id' property which is reserved property name
  keysToIgnore.push('id'); 
  var props = getKeysFromArrayOfObjs(rules, keysToIgnore); 
  return props; 
}

function getKeysFromArrayOfObjs(arrayOfObjs, keysToIgnore) {
  // returns an array of strings that is a unique list of object keys
  //   in dot notation across all objects in an array
  // keysToIgnore is an optional.  Is an array of strings.  
  //   Any key in arrayOfObjs will not be included in return array
  //   if that string is in keysToIgnore 
  arrayOfObjs = arrayOfObjs ? arrayOfObjs : []; 
  arrayOfObjs = _.isArray(arrayOfObjs) ? arrayOfObjs : [arrayOfObjs]; 

  var keys = [];
  // get all props being tested in rules and de-dupe
  arrayOfObjs.forEach(function(obj){
    // var ps = fos.getObjectProperties(rule); 
    var objKeys = fos.getObjectProperties(obj); 
    keys = keys.concat(objKeys);
  });

  keys = uniq(keys); 

  keys = _.difference(keys,keysToIgnore); 

  return keys; 

  function uniq(a) {
      var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

      return a.filter(function(item) {
          var type = typeof item;
          if(type in prims)
              return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
          else
              return objs.indexOf(item) >= 0 ? false : objs.push(item);
      });
  }

} // end of getKeysFromArrayOfObjs

module.exports = {
  makeGetMatchedRulesFn: makeGetMatchedRulesFn,
  makeIsAuthorized: makeIsAuthorized,
  getPropsFromRules: getPropsFromRules,
  setOptionsOnProps: setOptionsOnProps
};
