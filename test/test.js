var flexAcl = require('../lib/index.js');
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
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          ];
        return callback(null, rules); 
      }; 
      var req = {method: 'POST', baseUrl: '/api', path:'/clients'};

      var getMatchedRules = flexAcl.makeGetMatchedRulesFn(); 

      getMatchedRules(req, getRules, function (err, matchedRules) {
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
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr2',
           method: 'POS',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr3',
           method: 'PoST',
           baseUrl: '/api',
           path:'/clients'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = flexAcl.makeGetMatchedRulesFn(); 

      var req = {method: 'POST', baseUrl: '/api', path:'/clients'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientCr');
      });
      
      req = {method: 'post', baseUrl: '/api', path:'/clients'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(0); 
      });
      
      req = {method: 'PO', baseUrl: '/api', path:'/clients'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 

    it('should match on path',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          ];
        return callback(null, rules); 
      }; 
      var req = {method: 'POST', baseUrl: '/api', path:'/clients'};

      var getMatchedRules = flexAcl.makeGetMatchedRulesFn(); 

      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
        expect(getCodes(matchedRules)).to.contain('ClientCr');
        done();
      });
    }); 

    it('should match on path case INsensitive',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr2',
           method: 'POST',
           baseUrl: '/api',
           path:'/client'},
          {code: 'ClientCr3',
           method: 'POST',
           baseUrl: '/api',
           path:'/clIEnts'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = flexAcl.makeGetMatchedRulesFn(); 

      var req = {method: 'POST', baseUrl: '/api', path:'/clients'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientCr');
        expect(getCodes(matchedRules)).to.contain('ClientCr3');
      });
      
      req = {method: 'POST', baseUrl: '/api', path:'/clients'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientCr');
        expect(getCodes(matchedRules)).to.contain('ClientCr3'); 
      });
      
      req = {method: 'POST', path: '/api/clien'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 

    it('should match on path with regular expressions',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           baseUrl: '/api',
           path: '/clients.*'},
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr1',
           method: 'POST',
           baseUrl: '/api',
           path: '/clients/2[a-z][0-9]'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = flexAcl.makeGetMatchedRulesFn(); 

      var req = {method: 'POST', baseUrl: '/api', path:'/clients'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients/2' };
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients/2b7'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
        expect(getCodes(matchedRules)).to.contain('ClientCr1');
      });

      req = {method: 'POST', baseUrl: '/api', path:'clients2b7'}; // missing initial '/'
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 

    it('should match on path allowing variables',function(done){
      var variables = {all: '.*', clientNbr: '2[a-z][0-9]'};

      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           baseUrl: '/api',
           path:'/client~all#'},
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr1',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients/~clientNbr#'},
          ];
        return callback(null, rules); 
      }; 

      var getMatchedRules = flexAcl.makeGetMatchedRulesFn({}, 
          {variablesInTObj:true, 'variables': variables}); 

      var req = {method: 'POST', baseUrl: '/api', path:'/clients'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients/2'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(1); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients/2b7'};
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(2); 
        expect(getCodes(matchedRules)).to.contain('ClientAll');
        expect(getCodes(matchedRules)).to.contain('ClientCr1');
      });

      req = {method: 'POST', baseUrl: '/api', path:'clients2b7'}; // missing initial '/'
      getMatchedRules(req, getRules, function (err, matchedRules) {
        expect(matchedRules).to.have.length(0); 
        done();
      });

    }); 

    it('should match on query parameters',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientAll',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientLi1',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients',
           query: {filter: 'abc123'}},
          {code: 'ClientLi2',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients',
           query: {filter: 'abc12'}},
          {code: 'ClientLi3',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients',
           query: {sort: 'asc'}},
          ];
        return callback(null, rules); 
      }; 

      getRules(function(err, rules) {

        var propsToTest = flexAcl.getPropsFromRules(rules);
        var getMatchedRules = flexAcl.makeGetMatchedRulesFn(propsToTest); 

        var req = {method: 'GET', baseUrl: '/api', path:'/clients'};
        getMatchedRules(req, getRules, function (err, matchedRules) {
          expect(matchedRules).to.have.length(1); 
          expect(getCodes(matchedRules)).to.contain('ClientAll');
        });
        req = {method: 'GET', baseUrl: '/api', path:'/clients',query:{filter:'abc123'}};
        getMatchedRules(req, getRules, function (err, matchedRules) {
          expect(matchedRules).to.have.length(2); 
          expect(getCodes(matchedRules)).to.contain('ClientAll');
          expect(getCodes(matchedRules)).to.contain('ClientLi1');
        });
        req = {method: 'GET', baseUrl: '/api', path:'/clients',query:{filter:'bogus'}};
        getMatchedRules(req, getRules, function (err, matchedRules) {
          expect(matchedRules).to.have.length(1); 
          expect(getCodes(matchedRules)).to.contain('ClientAll');
          done();
        });
      });

    }); // end of it should match on query parameters 

    it('should not include rules w properties missing from req',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientSort',
           baseUrl: '/api',
           path:'/clients',
           'query':{'sort':'.*'}},
          {code: 'ClientFilter',
           baseUrl: '/api',
           path:'/clients',
           'query':{'filter':'.*'}},
          {code: 'ClientAll',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          ];
        return callback(null, rules); 
      }; 

      getRules(function(err, rules) {

        var propsToTest = flexAcl.getPropsFromRules(rules);
        var getMatchedRules = flexAcl.makeGetMatchedRulesFn(propsToTest); 

        var req = {method: 'GET', baseUrl: '/api', path:'/clients'};
        getMatchedRules(req, getRules, function (err, matchedRules) {
          expect(matchedRules).to.have.length(1); 
          expect(getCodes(matchedRules)).to.contain('ClientAll');
          // done();
        });
        req = {method: 'GET', baseUrl: '/api', path:'/clients',query:{filter:'abc123'}};
        getMatchedRules(req, getRules, function (err, matchedRules) {
          expect(matchedRules).to.have.length(2); 
          expect(getCodes(matchedRules)).to.contain('ClientAll');
          expect(getCodes(matchedRules)).to.contain('ClientFilter');
        });
        req = {method: 'GET', baseUrl: '/api', path:'/clients',query:{sort:'bogus'}};
        getMatchedRules(req, getRules, function (err, matchedRules) {
          expect(matchedRules).to.have.length(2); 
          expect(getCodes(matchedRules)).to.contain('ClientAll');
          expect(getCodes(matchedRules)).to.contain('ClientSort');
          done();
        });

      });
    });  

  }); // end of describe

  describe('makeIsAuthorized', function() {
    
    it('should authorize various rules correctly',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          ];
        return callback(null, rules); 
      }; 

      var getCodes = function(req, callback) {
        // returns the access codes for the user making the http request
        var userCodes = {
          admin: [".*"],           // Access to all rules
          paul:  ["Client.."],         // Access to all "Clientxx" rules
          frank: ["Lada","ClientCr"],
          jane:  ["ClientLi"],   // Access to just ClientLi rules
          dot:  ["Client"],   // Access to just Client rules (none)
          lola: ["aClientCr"],
          baris: ["clientcr"],
          borka: ["ClientCra"],
          bolla: ["Client..."]
        };

        if(req && req.user && req.user.id && userCodes.hasOwnProperty(req.user.id)) {
          return callback(null, userCodes[req.user.id]);
        } else { 
          return callback('Error: User access code does not exist'); 
        }
      };

      var isAuthorized = flexAcl.makeIsAuthorized(getRules, getCodes); 

      var req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'paul'}};
      isAuthorized(req, function (err, passes) {
        expect(err).to.be(null); 
        expect(passes).to.be(true); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'admin'}};
      isAuthorized(req, function (err, passes) {
        expect(err).to.be(null); 
        expect(passes).to.be(true); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'jane'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'dot'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'frank'}};
      isAuthorized(req, function (err, passes) {
        expect(err).to.be(null); 
        expect(passes).to.be(true); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'lola'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'boris'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'borka'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
      });

      req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'bolla'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
        done();
      });

    }); 


    it('should not pass if no rules match',function(done){
      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          ];
        return callback(null, rules); 
      }; 

      var getCodes = function(req, callback) {
        // returns the access codes for the user making the http request
        var userCodes = {
          admin: [".*"]           // Access to all rules
        };

        if(req && req.user && req.user.id && userCodes.hasOwnProperty(req.user.id)) {
          return callback(null, userCodes[req.user.id]);
        } else { 
          return callback('Error: User access code does not exist'); 
        }
      };

      var isAuthorized = flexAcl.makeIsAuthorized(getRules, getCodes); 

      var req = {method: 'POST', path: '/api/client', user: {id:'admin'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
        done();
      });

    });

    it('should allow slow responses on getRules and getCodes ' + 
       'and execute in parallel', function(done) {
      this.timeout(5000); 

      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          ];
        setTimeout(function() {
          return callback(null, rules);
        },4000); 
      }; 

      var getCodes = function(req, callback) {
        // returns the access codes for the user making the http request
        var userCodes = {
          admin: [".*"],           // Access to all rules
          paul:  ["Client.."],         // Access to all "Clientxx" rules
          frank: ["Lada","ClientCr"],
          jane:  ["ClientLi"],   // Access to just ClientLi rules
          dot:  ["Client"],   // Access to just Client rules (none)
          lola: ["aClientCr"],
          baris: ["clientcr"],
          borka: ["ClientCra"],
          bolla: ["Client..."]
        };

        setTimeout(
          function() {
            return callback(null, userCodes[req.user.id]);
          }, 3000); 
      };

      var isAuthorized = flexAcl.makeIsAuthorized(getRules, getCodes); 

      var req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'paul'}};
      isAuthorized(req, function (err, passes) {
        expect(err).to.be(null); 
        expect(passes).to.be(true); 
        done();
      });

    });  

    it('should allow slow responses on getRules and getCodes ' + 
       'with not authorized', function(done) {
      this.timeout(3000); 

      var getRules = function(callback) {
        var rules = [
          {code: 'ClientLi',
           method: 'GET',
           baseUrl: '/api',
           path:'/clients'},
          {code: 'ClientCr',
           method: 'POST',
           baseUrl: '/api',
           path:'/clients'},
          ];
        setTimeout(function() {
          return callback(null, rules);
        },2000); 
      }; 

      var getCodes = function(req, callback) {
        // returns the access codes for the user making the http request
        var userCodes = {
          admin: [".*"],           // Access to all rules
          paul:  ["Client.."],         // Access to all "Clientxx" rules
          frank: ["Lada","ClientCr"],
          jane:  ["ClientLi"],   // Access to just ClientLi rules
          dot:  ["Client"],   // Access to just Client rules (none)
          lola: ["aClientCr"],
          baris: ["clientcr"],
          borka: ["ClientCra"],
          bolla: ["Client..."]
        };

        setTimeout(
          function() {
            return callback(null, userCodes[req.user.id]);
          }, 2000); 
      };

      var isAuthorized = flexAcl.makeIsAuthorized(getRules, getCodes); 

      var req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'nada'}};
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
        done();
      });

    });  


  }); // end of describe makeIsAuthorized

  describe('options', function() {

    var getRules = function(callback) {
      var rules = [
        {code: 'ClientAll',
         baseUrl:'/api',
         path: '/clients'},
        {code: 'ClientLi1',
         method: 'GET',
         baseUrl:'/api',
         path: '/clients',
         query: {filter: 'abc123'}},
        {code: 'ClientLi2',
         method: 'GET',
         baseUrl:'/api',
         path: '/clients',
         href: '/api/clients?filter=abc12'},
        {code: 'ClientLi3',
         method: 'POST',
         baseUrl:'/api',
         path: '/clients'},
        ];
      return callback(null, rules); 
    }; 

    var getCodes = function(req, callback) {
      // returns the access codes for the user making the http request
      var userCodes = {
        admin: [".*"],           // Access to all rules
        bob1: ["ClientLi1"],
        bob2: ["ClientLi2"]
      };

      if(req && req.user && req.user.id && userCodes.hasOwnProperty(req.user.id)) {
        return callback(null, userCodes[req.user.id]);
      } else { 
        return callback('Error: User access code does not exist'); 
      }
    };

    it('should default to method and path w/o propsToTest', 
      function(done) {

      var req = {
        method: 'GET', 
        baseUrl: '/api',
        path: '/clients',
        user: {id:'bob1'},
      };

      var isAuthorized = flexAcl.makeIsAuthorized(getRules, getCodes); 
      isAuthorized(req, function (err, passes) {
        expect(err).not.to.be(null); 
        expect(passes).to.be(undefined); 
        done();
      });
    });  

    it('should use the rules properties if rules are passed in', 
      function(done) {

      getRules(function(err, rules) {
        var propsToTest = flexAcl.getPropsFromRules(rules);
        expect(propsToTest.length).to.be(5) ;
        expect(propsToTest).to.contain('method');
        expect(propsToTest).to.contain('path');
        expect(propsToTest).to.contain('baseUrl');
        expect(propsToTest).to.contain('href');
        expect(propsToTest).to.contain('query.filter');

        var req = {
          method: 'GET', 
          baseUrl: '/api',
          path: '/clients',
          user: {id:'bob1'},
        };

        var isAuthorized = flexAcl.makeIsAuthorized(getRules, getCodes); 
        isAuthorized(req, function (err, passes) {
          expect(err).not.to.be(null); 
          expect(passes).to.be(undefined); 
          done();
        });
      });  

    }); 

    it('should set options for a property', 
      function(done) {

      getRules(function(err, rules) {
        // var propsToTest = flexAcl.getPropsFromRules(rules);
        var propsToTest = 
          [
           'query.filter',
           'query.sort', 
           'method',
           {'name':'path', regExpMatch:false}
          ];

        var isAuthorized = 
          flexAcl.makeIsAuthorized(getRules, getCodes, propsToTest); 
        var req = {
          method: 'GET', 
          baseUrl: '/api',
          path: '/CLIENTS',
          user: {id:'admin'},
        };
        isAuthorized(req, function (err, passes) {
          expect(err).not.to.be(null); 
          expect(passes).to.be(undefined); 
        });

        var rq = {
          method: 'GET', 
          baseUrl: '/api',
          path: '/clients',
          user: {id:'admin'},
        };
        isAuthorized(rq, function (err, passes) {
          expect(err).to.be(null); 
          expect(passes).to.be(true); 
          done();
        });

      });  

    }); // end of it


    it('should set default options', 
      function(done) {

      getRules(function(err, rules) {
        var propsToTest = flexAcl.getPropsFromRules(rules);

        var defaultOptions = {regExpMatch: false};

        var isAuthorized = 
          flexAcl.makeIsAuthorized(getRules, getCodes, propsToTest, defaultOptions); 
        var req = {
          method: 'GET', 
          baseUrl: '/api',
          path: '/CLIENTS',
          user: {id:'admin'},
        };
        isAuthorized(req, function (err, passes) {
          expect(err).not.to.be(null); 
          expect(passes).to.be(undefined); 
        });

        var rq = {
          method: 'GET', 
          baseUrl: '/api',
          path: '/clients',
          user: {id:'admin'},
        };
        isAuthorized(rq, function (err, passes) {
          expect(err).to.be(null); 
          expect(passes).to.be(true); 
          done();
        });

      });  

    }); // end of it 

  }); // end of describe 'options'



});


