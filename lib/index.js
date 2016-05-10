var fos = require('filter-objects'); 
var _ = require('underscore'); 

function makeIsAuthorized(getRules, getCodes, propsToTest, defaultOptions) {

  getMatchedRules = makeGetMatchedRulesFn(propsToTest, defaultOptions); 
  var ia = isAuthorized(getMatchedRules, getRules, getCodes); 
  return ia;
}

function makeGetMatchedRulesFn(propsToTest, myOptions) {

  var defaultPropsToTest = 
    ['pathname',
     {'name':'method',
       'matchIfTObjPropMissing': true, 
       'regExpMatch': false,
       'variablesInTObj': false}
    ]; 

  var defaultOptions = {
      matchIfTObjPropMissing: true, 
      regExpMatch: true,
      regExpReverse: true, 
      regExpIgnoreCase: true,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      getVariables: function(cb) {return cb(null, {}); },
      variablesInTObj: false,
      variablesStartStr: '|',
      variablesEndStr: '|', 
    };

  propsToTest = propsToTest && Object.keys(propsToTest).length > 0 ? 
    propsToTest : defaultPropsToTest; 

  //set options to myOptions where properties are set to defaultOptions
  //   property value if that property doesn't exist on myOptions
  var options = setOptionsDefault(myOptions, defaultOptions); 

  var getMatchedRules = fos.makeFilterFn(propsToTest, options); 

  return function(req, getRules, callback) {
    getRules(function(err, rules) {
      var matchedRules = getMatchedRules(req, rules); 
      return callback(err, matchedRules); 
    });
  };

}

function isAuthorized(getMatchedRules, getRules, getCodes) {

  return function(req, callback) {
    var codes; 
    var matchedRules; 

    var checkCodesWithRules = function(err) {
      // allows getMatchedRules and getCodes to be called in parallel
      // getMatchedRules and getCodes each call this function in their cb
      //    but the overall callback is only executed after both are complete
      if(err) return callback(err); 
      if(codes !== undefined && matchedRules !== undefined) {
        // have both codes & rules so can now process results
        var isAuthorized = 
          matchedRules && _.isArray(matchedRules) && matchedRules.length > 0 &&
          codes && _.isArray(codes) && codes.length > 0 && 
          matchedRules.every(function(rule) {
            return codes.some(function(code) {
              var re = new RegExp('^'+code+'$'); 
              var codeMatchesRule = re.test(rule.code);
              return codeMatchesRule;  
            });
        });
        if(isAuthorized) {
          return callback(null, true);
        } else {
          return callback(new Error('Not authorized'));
        }
      }
    };

    getMatchedRules(req, getRules, getMatchedRulesCb); 
    getCodes(req, getCodesCb); 

    function getMatchedRulesCb(err, returnedRules) {
      matchedRules = returnedRules || null;
      checkCodesWithRules(err);  
    }

    function getCodesCb(err, returnedCodes) {
      codes = returnedCodes || null;
      checkCodesWithRules(err);  
    }
  };
}

function setOptionsDefault(options, optionsDefault) {
  //if a property doesn't exist on options object, that property is set to 
  //  the value of that property on optionsDefault  
  //Allows an options object to be passed in with only those properties that
  //  are wanted to over-ride the default option properties
  if (options) {
    var optionsDefaultKeys = Object.keys(optionsDefault); 
    // set each property on options to default for those that aren't set; eg, 
    //  options.checkMethod = options.checkMethod || optionsDefault.checkMethod
    for (var i = optionsDefaultKeys.length - 1; i >= 0; i--) {
      options[optionsDefaultKeys[i]] = 
        options.hasOwnProperty(optionsDefaultKeys[i]) ? 
          options[optionsDefaultKeys[i]] :  
          optionsDefault[optionsDefaultKeys[i]]; 
    }
  } else {
    options = optionsDefault; 
  }

  return options; 
}

function getPropsFromRules(rules) {
  // return an array of strings that are the keys of rules objects
  // in dot notation form
  // eg; rules = [{method:'POST', query:{sort:'ASC'}},'pathname':'/api/blah']
  //   would return ['method', 'query.sort', 'pathname']
  var props = getKeysFromArrayOfObjs(rules, ['code']); 
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

  // remove any keys that should be ignored
  keys.forEach(function(key, idx) {
    keysToIgnore.forEach(function(keyToIgnore) {
      if(key === keyToIgnore) {
        keys.splice(idx,1); 
      }
    }); 
  }); 

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
  getPropsFromRules: getPropsFromRules
};
