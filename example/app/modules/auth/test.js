var should = require('should'); 

var auth = require('./index.js'); 
var roles = require('./roles.js'); 

var acs = {
  ADM: {},
  OFF: {},
  BOS: {},
  ANON: {acs:[]}
}; 

describe('auth',function(){

  describe('acl validation', function() {

    it('should get roles', function(done) {
      roles.getRoleAsync('ADM', function(err, roleObj) {
        acs.ADM.acs = roleObj.acs;
        should.not.exist(err); 
      }) ;

      roles.getRoleAsync('OFF', function(err, roleObj) {
        acs.OFF.acs = roleObj.acs;
        should.not.exist(err); 
      }) ;

      roles.getRoleAsync('BOS', function(err, roleObj) {
        acs.BOS.acs = roleObj.acs;
        should.not.exist(err); 
        done();
      }) ;

    }); 

    var req = {
      method: 'POST',
      user: {},
      baseUrl: '/api',
      path: '/authenticate',
      query: {}};

    testRole('/authenticate', req, 'ADM', true);
    testRole('/authenticate', req, 'OFF', true);
    testRole('/authenticate', req, 'BOS', true);
    testRole('/authenticate', req, 'ANON', false);


    testName = '/clients/:id';

    req = { method: 'GET',
      baseUrl: '/api',
      path: '/clients/572489da9edc830eeceebb1d',
      query: {} }; 

    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    
    testName = 'GET /api/clients filteredsearch'; 

    req = {method: 'GET',
      baseUrl: '/api',
      path: '/clients',
      query: 
       { fieldset: 'filteredsearch',
         filter: 'par',
         filterfields: [ 'name', 'derivatives' ] } };

    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'PUT /api/clients'; 
    req = { method: 'PUT', baseUrl: '/api', path: '/clients', query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/calendars/events?clientId'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/calendars/events',
      query: { clientId: '572489da9edc830eeceebbb8' } };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/tasks?lients,status'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/tasks',
      query: { clients: '572489da9edc830eeceebbb8', status: 'pending' } };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/tasks?countOnly, status, unread'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/tasks',
      query: { countOnly: 'true', status: 'pending', unread: 'true' } };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/notes/:noteId?limit'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/notes/572489da9edc830eeceebbb8',
      query: { limit: '3' } };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/meta/client/assigned'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/meta/client/assigned',
      query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/messages/user/:id?unreadOnly'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/messages/user/TONY',
      query: { unreadOnly: 'true' } };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/google/me'; 
    req = { method: 'GET', baseUrl: '/api', path: '/google/me', query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);


    testName = 'GET /api/calendars/events?timeMax,timeMin'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/calendars/events',
      query: 
       { timeMax: '2016-05-09T04:59:59.000Z',
         timeMin: '2016-05-08T05:00:00.000Z' } };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', true);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);


    testName = 'PUT /api/users'; 
    req = { method: 'PUT', baseUrl: '/api', path: '/users', query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', false);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/users/:user'; 
    req = { method: 'GET', baseUrl: '/api', path: '/users/TONY', query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', false);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/txtn-totals'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/txtn-totals',
      query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', false);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/txtn-totals/:year/:month/ALL'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/txtn-totals/2013/8/ALL',
      query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', false);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /api/txtns/:date'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/txtns/Fri%20Aug%2030%202013%2000:00:00%20GMT-0500%20(Central%20Standard%20Time)',
      query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', false);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

    testName = 'GET /txtn-totals'; 
    req = { method: 'GET',
      baseUrl: '/api',
      path: '/txtn-totals',
      query: {} };
    testRole(testName, req, 'ADM', true);
    testRole(testName, req, 'OFF', false);
    testRole(testName, req, 'BOS', true);
    testRole(testName, req, 'ANON', false);

  }); 

});


function testRole(testName, req, role, shouldPass) {

    var isAuthorized = auth.isAuthorized; 

    it('should check ' + testName + ': ' + role + ' ' + shouldPass, 
      function(done) {

      req.user = {}; 
      req.user.role = role; 
      req.originalUrl = req.baseUrl + req.path; 

      isAuthorized(req, function(err, passes) {
        if(shouldPass) {
          should.not.exist(err); 
        } else {
          should.exist(err); 
        }
        done();
      });
    }); 

}
