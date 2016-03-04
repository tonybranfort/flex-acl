var apom = require('apom'); 

function makeGetMatchedRulesFn(options, getVariablesFn) {
  getVariablesFn = getVariablesFn ? getVariablesFn : 
    function(cb) {return cb(null, {}); };

  // the rules are the pattern objects because they contain the regular expressions
  var optionsDefault = {
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
      getVariables: getVariablesFn,
      variablesStartStr: '|',
      variablesEndStr: '|'
      }
  };

  options = options && Object.keys(options) > 0 ? options : optionsDefault;

  var getMatchedRules = apom.makeFilterPatternObjectsFn(options); 

  return function(req, getRules, callback) {
    getRules(function(err, rules) {
      return getMatchedRules(rules, req, callback); 
    });
  };

}


module.exports = {
  makeGetMatchedRulesFn: makeGetMatchedRulesFn

};
