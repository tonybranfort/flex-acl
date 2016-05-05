var fos = require('filter-objects'); 
var _ = require('underscore'); 

function makeIsAuthorized(getRules, getUserCodes, options, getVariablesFn) {
  // *** makeIsAuthorized must be called again whenever the rules object changes. 

  // getVariablesFn is passed in as seperate parameter from options 
  //   because options object is at rules property level
  var getMatchedRules; 
  return getRules(function(err, rules) {
    if(err) {
      return err; 
    } else {
      var propOptions = getPropsOptionsFromRules(rules, options); 
      getMatchedRules = makeGetMatchedRulesFn(propOptions, getVariablesFn); 
      var ia = isAuthorized(getMatchedRules, getRules, getUserCodes); 
      return ia;
    }
  });
}

function isAuthorized(getMatchedRules, getRules, getUserCodes) {
  return function(req, callback) {
    getMatchedRules(req, getRules, function(matchedRules) {
      if(matchedRules && _.isArray(matchedRules) && matchedRules.length > 0) {
        getUserCodes(req, function(err, codes){
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
            return callback(new Error('No codes returned from getUserCodes()'));
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
      options : getPropsOptionsFromRules(); 

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

function getPropsOptionsFromRules(rules, options) {
  // assign filter options for each property that exists in rules 
  // 'options' object parameter values are used if 'options' parameter is passed in
  // if 'options' doesn't exists or a given property does not exist in 'options'
  //   then the optionsDefault values below are used.  
  //     => optionsDefault.default if property name isn't in optionsDefault 
  //        (eg; 'customProp')
  //     => optionsDefault[propname] if rule property name exists in optionsDefault 
  //        (eg; 'method')

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
  getPropsOptionsFromRules: getPropsOptionsFromRules,
  makeIsAuthorized: makeIsAuthorized

};
