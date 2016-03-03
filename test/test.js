var hra = require('../lib/index.js');
var expect = require('expect.js'); 

describe('http-req-auth',function(){
  describe('default options', function() {
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
      var req = {code: 'CDC', method: 'POST', pathname: '/api/clients'};
      hra.getMatchedRules(getRules, req, function (err, res) {
        expect(getCodes(res)).to.be(['ClientCr']);
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
      var req = {method: 'POST', pathname: '/api/clients'};
      hra.getMatchedRules(getRules, req, function (err, res) {
        expect(getCodes(res)).to.be(['ClientCr']);
        done();
      });
      
      req = {method: 'post', pathname: '/api/clients'};
      hra.getMatchedRules(getRules, req, function (err, res) {
        expect(getCodes(res)).to.be([]);
        done();
      });
      
      req = {method: 'PO', pathname: '/api/clients'};
      hra.getMatchedRules(getRules, req, function (err, res) {
        expect(getCodes(res)).to.be([]);
        done();
      });

    }); 

  });
});


