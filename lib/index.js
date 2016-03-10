var apom = require('apom'); 
var _ = require('underscore'); 

function makeGetMatchedRulesFn(options, getVariablesFn) {
  getVariablesFn = getVariablesFn ? getVariablesFn : 
    function(cb) {return cb(null, {}); };

  options = options && Object.keys(options).length > 0 ? 
      options : getPropsOptionsFromRules(); 

  // the rules are the pattern objects because they contain the regular expressions
  var getMatchedRules = apom.makeFilterPatternObjectsFn(
      options, {getVariables: getVariablesFn}); 

  return function(req, getRules, callback) {
    getRules(function(err, rules) {
      return getMatchedRules(rules, req, callback); 
    });
  };

}

function getPropsOptionsFromRules(rules, options) {

  var optionsDefault = {
    'default': {   //default options for properties not included in optionsDefault
      matchIfPObjPropMissing: true, 
      regExpMatch: true,
      regExpIgnoreCase: true,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      variablesAllowed: true,
      variablesStartStr: '|',
      variablesEndStr: '|'
    },
    'method':{
      matchIfPObjPropMissing: true, 
      regExpMatch: false,
      variablesAllowed: false},
    'pathname':{
      matchIfPObjPropMissing: true, 
      regExpMatch: true,
      regExpIgnoreCase: true,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      variablesAllowed: true,
      variablesStartStr: '|',
      variablesEndStr: '|'
      },
    'query':{
      matchIfPObjPropMissing: true, 
      regExpMatch: true,
      regExpIgnoreCase: false,
      regExpAnchorStart: true,
      regExpAnchorEnd: true,
      variablesAllowed: true,
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
    var ps = apom.getObjectProperties(rule); 
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
  getPropsOptionsFromRules: getPropsOptionsFromRules

};
