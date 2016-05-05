var fos = require('filter-objects'); 
var _ = require('underscore'); 

function makeIsAuthorized(getRules, getCodes, options, getVariablesFn) {
    options = options ? options : getOptions();  // will get default options 
    getMatchedRules = makeGetMatchedRulesFn(options, getVariablesFn); 
    var ia = isAuthorized(getMatchedRules, getRules, getCodes); 
    return ia;
}

function isAuthorized(getMatchedRules, getRules, getCodes) {
  return function(req, callback) {
    getMatchedRules(req, getRules, function(matchedRules) {
      if(matchedRules && _.isArray(matchedRules) && matchedRules.length > 0) {
        getCodes(req, function(err, codes){
          if(err) {
            return callback(err); 
          } else if(codes && _.isArray(codes) && codes.length > 0 ) {
            var allMatchedRulesHaveCode = matchedRules.every(function(rule) {
              return codes.some(function(code) {
                var re = new RegExp('^'+code+'$'); 
                var codeMatchesRule = re.test(rule.code);
                return codeMatchesRule;  
              });
            });
            if(allMatchedRulesHaveCode) {
              return callback(null, true);
            } else {
              return callback(new Error('Matched Rules do not all have access codes'));
            }
          } else {
            return callback(new Error('No codes returned from getCodes()'));
          }
        });
      } else {
        return callback(new Error('No rules match request')); 
      }
    });
  };
}

function makeGetMatchedRulesFn(options, getVariablesFn) {
  getVariablesFn = getVariablesFn ? getVariablesFn : 
    function(cb) {return cb(null, {}); };

  options = options && Object.keys(options).length > 0 ? 
      options : getOptions(); 

  // the rules are the pattern objects because they contain the regular expressions
  var getMatchedRules = fos.makeFilterFn(
      options, {getVariables: getVariablesFn}); 

  return function(req, getRules, callback) {
    getRules(function(err, rules) {
      var matchedRules = getMatchedRules(req, rules); 
      return callback(matchedRules); 
    });
  };

}

function getOptions(rules, options) {
/*  returns an options object based on 'rules' and 'myOptions' object parameters
     * rules: optional.  Array of objects. 
     * options: optional.  Object. 
 
    The options object that will be returned has: 
    1. Properties (keys) for each object key on all objects in the rules array 
       and every object key in `options` passed in except any key named 'default'
    2. Values are assigned to each property on the options object by checking  
       if that propertyName key exists on these objects in order: 
         A. myOptions.propertyName 
         A. myOptions.default.propertyName 
         B. optionsDefault.propertyName
         C. optionsDefault.default.propertyName
      Otherwise defaults to filter-objects options default 

*/

  var optionsDefault = {
    'default': {   //default options for properties not included in optionsDefault
      matchIfTObjPropMissing: true, 
      regExpMatch: true,
      regExpReverse: true, 
      regExpIgnoreCase: true,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      variablesInTObj: true,
      variablesStartStr: '|',
      variablesEndStr: '|'
    },
    'method':{
      matchIfTObjPropMissing: true, 
      regExpMatch: false,
      variablesInTObj: false},
    'pathname':{
      matchIfTObjPropMissing: true, 
      regExpReverse: true, 
      regExpMatch: true,
      regExpIgnoreCase: true,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      variablesInTObj: true,
      variablesStartStr: '|',
      variablesEndStr: '|'
      },
    'query':{
      matchIfTObjPropMissing: true, 
      regExpReverse: true, 
      regExpMatch: true,
      regExpIgnoreCase: false,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      variablesInTObj: true,
      variablesStartStr: '|',
      variablesEndStr: '|'
      }
  };

  var propsWithOptions = {}; 


  // default to just method and pathname if rules not passed in 
  rules = rules && rules.length > 0 ? 
      rules : 
      [{method: '', pathname: ''}];

  options = options && Object.keys(options) > 0 ? options : optionsDefault;

  var props = [];
  // get all props being tested in rules and de-dupe
  rules.forEach(function(rule){
    var ps = fos.getObjectProperties(rule); 
    props = props.concat(ps);
  });

  props = uniq(props); 

var y = 0;
  props.forEach(function(propName) {
    y = y+ 1; 
    if(propName !== 'code') { // code is reserved property name for rules
      if((options && options.hasOwnProperty(propName)) ||
         options.hasOwnProperty(propName.split(',')[0])) {
        propsWithOptions[propName] = _.clone(options[propName]);
      } else {
        propsWithOptions[propName] = _.clone(optionsDefault.default); 
      }
    }
  });

  return propsWithOptions; 

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

}

module.exports = {
  makeGetMatchedRulesFn: makeGetMatchedRulesFn,
  getOptions: getOptions,
  makeIsAuthorized: makeIsAuthorized

};
