var hra = require('../lib/index.js');
var expect = require('expect.js'); 

var getCodes = function(rules) {
  // assist function for testing - takes an array (rules) and 
  //   returns an array of just the 'code' property values
  return rules.map(function(el) {
    return el.code; 
  }); 
};

describe('http-req-auth',function(){
  describe('getMatchedRules with default options', function() {
    // Cr: Create
    // Vw: view
    // Ag: Aggregate : Totals  
    // Sl: Slice : list by certain parameter
    // Li: List 
    // Up: Update

    it('should match on method',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           pathname:'/api/clients'},
          {code: 'ClientCr',
           method: 'POST',
           pathname:'/api/clients'},
          ];
        return callback(null, rules); 
      }; 
      var req = {method: 'POST', pathname: '/api/clients'};

      var getMatchedRules = hra.makeGetMatchedRulesFn(); 

      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientCr');
        done();
      });
    }); 

    it('should match on method with case sensitive',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           pathname:'/api/clients'},
          {code: 'ClientCr',
           method: 'POST',
           pathname:'/api/clients'},
          {code: 'ClientCr2',
           method: 'POS',
           pathname:'/api/clients'},
          {code: 'ClientCr3',
           method: 'PoST',
           pathname:'/api/clients'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = hra.makeGetMatchedRulesFn(); 

      var req = {method: 'POST', pathname: '/api/clients'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientCr');
      });
      
      req = {method: 'post', pathname: '/api/clients'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(0); 
      });
      
      req = {method: 'PO', pathname: '/api/clients'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 

    it('should match on pathname',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           pathname:'/api/clients'},
          {code: 'ClientLi',
           method: 'GET',
           pathname:'/api/clients'},
          {code: 'ClientCr',
           method: 'POST',
           pathname:'/api/clients'},
          ];
        return callback(null, rules); 
      }; 
      var req = {method: 'POST', pathname: '/api/clients'};

      var getMatchedRules = hra.makeGetMatchedRulesFn(); 

      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
        expect(getCodes(matchedRules)).to.contain('ClientCr');
        done();
      });
    }); 

    it('should match on pathname case INsensitive',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           pathname:'/api/clients'},
          {code: 'ClientCr',
           method: 'POST',
           pathname:'/api/clients'},
          {code: 'ClientCr2',
           method: 'POST',
           pathname:'/api/client'},
          {code: 'ClientCr3',
           method: 'POST',
           pathname:'/api/clIENts'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = hra.makeGetMatchedRulesFn(); 

      var req = {method: 'POST', pathname: '/api/clients'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientCr');
        expect(getCodes(matchedRules)).to.contain('ClientCr3');
      });
      
      req = {method: 'POST', pathname: '/API/CLIENTS'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientCr');
        expect(getCodes(matchedRules)).to.contain('ClientCr3'); 
      });
      
      req = {method: 'POST', pathname: '/api/clien'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 


    it('should match on pathname with regular expressions',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           pathname:'/api/clients.*'},
          {code: 'ClientLi',
           method: 'GET',
           pathname:'/api/clients'},
          {code: 'ClientCr1',
           method: 'POST',
           pathname:'/api/clients/2[a-z][0-9]'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = hra.makeGetMatchedRulesFn(); 

      var req = {method: 'POST', pathname: '/api/clients'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', pathname: '/api/clients/2'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', pathname: '/api/clients/2b7'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
        expect(getCodes(matchedRules)).to.contain('ClientCr1');
      });

      req = {method: 'POST', pathname: 'api/clients/2b7'}; // missing initial '/'
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 

    it('should match on pathname allowing variables',function(done){
      var getVariables = function(callback) {
        var vars = {all: '.*', clientNbr: '2[a-z][0-9]'};
        return callback(null, vars);
      };

      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           pathname:'/api/clients|all|'},
          {code: 'ClientLi',
           method: 'GET',
           pathname:'/api/clients'},
          {code: 'ClientCr1',
           method: 'POST',
           pathname:'/api/clients/|clientNbr|'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = hra.makeGetMatchedRulesFn({}, getVariables); 

      var req = {method: 'POST', pathname: '/api/clients'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', pathname: '/api/clients/2'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', pathname: '/api/clients/2b7'};
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
        expect(getCodes(matchedRules)).to.contain('ClientCr1');
      });

      req = {method: 'POST', pathname: 'api/clients/2b7'}; // missing initial '/'
      getMatchedRules(req, getRules, function (matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 

    it('should match on query parameters',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           pathname:'/api/clients'},
          {code: 'ClientLi1',
           method: 'GET',
           pathname:'/api/clients',
           query: {filter: 'abc123'}},
          {code: 'ClientLi2',
           method: 'GET',
           pathname:'/api/clients',
           query: {filter: 'abc12'}},
          {code: 'ClientLi3',
           method: 'GET',
           pathname:'/api/clients',
           query: {sort: 'asc'}},
          ];
        return callback(null, rules); 
      }; 

      getRules(function(err, rules) {

        var options = hra.getPropsOptionsFromRules(rules);
        var req = {method: 'GET', pathname: '/api/clients'};

        var getMatchedRules = hra.makeGetMatchedRulesFn(options); 

        getMatchedRules(req, getRules, function (matchedRules) {
          expect(matchedRules).to.have.length(1); 
          expect(getCodes(matchedRules)).to.contain('ClientAll');
          done();
        });
      });

    }); 



  });
});


