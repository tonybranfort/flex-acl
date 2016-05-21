# flex-acl

Authorize http requests with a json based authorization control list.  

Features: 
* Simple to implement 
* Json based acl rules 
* Any property/ies in the request at any depth can be used for authorization
* Variables can be used for repeated acl rule patterns 
* Wide flexibility in establishing user groups and/or roles for authorizations

flex-acl does _not_ authenticate users.  Users should be authenticated before authorizing requests.   

####Simple Example
```javascript
var getAclRules = function(callback) {
  var rules = [
    {'id': 'ClientGet',
     'method': 'GET',
     'baseUrl': '/api',
     'path':'/clients/[A-Fa-f0-9]{24}'},   //reg exp for the client id
    {'id': 'ClientCrt',
     'method': 'POST',
     'baseUrl': '/api',
     'path':'/clients'},
    {'id': 'ClientUpd',
     'method': 'PUT',
     'baseUrl': '/api',
     'path':'/clients'},
    {'id': 'ClientLstOpen',
     'method': 'GET',
     'baseUrl': '/api',
     'path':'/clients',
     'query':{'status': 'open'}},
    {'id': 'UsersCrt',
     'method': 'POST',
     'baseUrl': '/api',
     'path':'/users'},
    ];
  return callback(null, rules); 
}; 

var getAuthzdAclIds = function(req, callback) {
  // returns the access ids for the user making the http request
  var authzdAclIds = {
	admin: ['.*'],         // Access to all rules
	paul:  ['Client.*'], // Access to all "Client" rules
    jane:  ['ClientGet'],  // Access to just viewing a client 
    dot:  ['ClientCrt','ClientGet','ClientPut'],  // Access to create,get,update clients
  };

  if(req && req.user && req.user.id && authzdAclIds.hasOwnProperty(req.user.id)) {
    return callback(null, authzdAclIds[req.user.id]);
  } else { 
    return callback('Error: User access id does not exist'); 
  }
};

var isAuthorized = flexAcl.makeIsAuthorized(
    getAclRules,        // function with callback to get acl rules
    getAuthzdAclIds,    // function with callback to get authorized acl ids (usually for a user)
    ['method','baseUrl','path','query.status']);  // which properties to test  

req = {           // just including relevant request properties for this example
  method: 'GET', 
  baseUrl: '/api', 
  path:'/clients/573de77bcaa00c068a92b1b4', 
  user: {id:'jane'}};

isAuthorized(req, function (err, passes) {
  //err => null
  //passes => true
});

req = {
  method: 'GET', 
  baseUrl: '/api', 
  path:'/clients',
  query: {status:'open'},
  user: {id:'paul'}};
isAuthorized(req, function (err, passes) {
  //err => null
  //passes => true
});

req = {method: 'POST', baseUrl: '/api', path:'/users', user: {id:'admin'}};
isAuthorized(req, function (err, passes) {
  //err => null
  //passes => true
});

req = {method: 'POST', baseUrl: '/api', path:'/clients', user: {id:'jane'}};
isAuthorized(req, function (err, passes) {
  /* err: { [Error: Not authorized: at least one acl rule does not have authorization]
	        authznIds: [ 'ClientGet' ],
	        aclRulesMatchingReq:
	          [ { id: 'ClientCrt',
	              method: 'POST',
	              baseUrl: '/api',
	              path: '/clients' } ] }
  /*
  //passes => undefined
});


```


##Documentation

[Rules for authorizing a request](#howAuthorized)

API 
* [__makeIsAuthorized__](#makeIsAuthorized) returns [isAuthorized](#isAuthorized)
  * [propsToTest](#propsToTest)
  * [options](#options)

Helper Functions
* [getPropsFromRules](#getPropsFromRules)
* [makeGetMatchedRulesFn](#makeGetMatchedRulesFn)
* [setOptionsOnProps](#setOptionsOnProps)

### <a name="howAuthorized" />Rules for authorizing a request 

The http request is authorized based on these two rules :

1. __The http request has at least one matching acl rule.__  See [matching rule examples](#matchingRuleExamples) below. 

  By default, (see [options](#options)), a rule is matched if every property being tested conforms to the following : 
    * Rule is matched if property exists in both the acl rule and the request and the property value matches
    * Rule is _not_ matched if the property does not exist in the request but exists in the acl rule
    * Rule is not excluded if the property exists in the request and does not exist in the acl rule
    * Rule is not excluded if the property does not exist in both the request and acl rule 

  And these are the basic defaults (see options) for properties and how they're tested.  Which properties are tested and how each property is tested, as well as global defaults, can be modified with options. 
    * `method`, `baseUrl` and `path` are the default properties to be tested.   
    * All properties included match by regular expression from the acl rule to the request property except `method` which is a string comparison.  ACL rules that are strings are converted to regular expression objects.  
    * All regular expression tests are case insensitive by default except `query` properties which are case sensitive by default.   

2. __Every acl rule matched from # 1 has at least one matching authorized acl id.__  These are the acl ids returned from the getAuthzdAclIds function passed into makeIsAuthorized. See [examples](#matchingAclIds) below. 
  
  A regular expression test determines if an acl id retrieved from getAuthzdAclIds matches an acl id from a matched acl rule.  If an acl id retrieved from getAuthzdAclIds is a string, then it is converted to a regular expression with '^' and '$' appended to beginning and end of string respectively to anchor the start and end of regular expression, before performing the regular expression test. If that behaviour is not desired, simply include a regular expression object instead of a string. 


<a name="matchingRuleExamples" />Examples on matching acl rules 

Example using default [options](#options) except `query.filter` added to 'method', 'baseUrl'and 'path' as property to be tested. 

| example http request  | ACL Rule          | Matches  |
| ------------- |-------------|:-----:|
| {__method__: 'POST', path: '/api/clients'}| {path: '/api/clients'} | `true` |
| {method: __'POST'__, path: '/api/clients'}| {method: __'GET'__, path: '/api/clients'} | `false` |
| {method: 'POST', path: '/api/clients/__BORG123__'}| {path: '/api/clients/__borg.*__'} | `true` |
| {method: 'POST', path: '/api/clients', __query__: {__filter__: 'dog', __sort__: 'asc'}}| {path: '/api/clients'} | `true` |
| {method: 'POST', path: '/api/clients', query: {__filter: 'dog'__, sort: 'asc'}}| {path: '/api/clients', query: {__filter: '.*__'}} | `true` |
| {method: 'POST', path: '/api/clients', query: {filter: 'dog', sort: 'asc'}}| {path: '/api/clients', query: {__topic__: '.*'}} | `false` |
| {method: 'POST', path: '/api/clients'}| {path: '/api/clients', query: {__filter__: '.*'}} | `false` |
| {method: 'POST', path: '/api/clients', query: {filter: '__dog__', sort: 'asc'}}| {path: '/api/clients', query: {filter: '__DOG__'}} | `false` |


<a name="matchingAclIds" />Examples on matching authorized ACL ids with acl rules 

| authorized acl ids | ACL Rule (id only) | Is Authorized  | Comment |
| ------------- |-------------------|:-----:|-----------------|
| ['.*'] | {id: 'canbewhatever'} | `true` | String converted to reg exp |
| ['ClientPOST'] | {id: 'ClientPost'} | `false` | Is case sensitive |
| ['Post'] | {id: 'ClientPost'} | `false` | Strings will be prepended with ^ before reg exp test|
| [/^Post$/] | {id: 'ClientPost'} | `false` | Can be reg exp object; equivalent of above |
| [/Post/] | {id: 'ClientPost'} | `true` | Here isn't prepended with ^ |
| ['Client.*'] | {id: 'Client'} | `true` |  |
| [/Client..../] | {id: 'ClientPost'} | `true` |  |
| ['Client.*','AdminNone'] | {id: 'ClientList'} | `true` | Multple authorized acl ids but only one needs to match to be authorized |


## API

<a name="makeIsAuthorized"></a>
### makeIsAuthorized(getAclRules, getAuthzdAclIds, propsToTest, defaultOptions)
Returns an [`isAuthorized`](#isAuthorized) function.  

__Arguments__
* `getAclRules(callback)` - Function which returns the acl rules.  The function is passed a `callback(err, aclRules)` which returns either an `err` or the acl rules which is an array of objects with each object having a property 'id' to uniquely identify it.  
* `getAuthzdAclIds(request, callback)` - Function which returns the authorized ACL ids.  The function is passed the `request` object and a `callback(err, authzdIds)` which returns either an `err` or the acl ids which are authorized for this given request (likely for a given user or role which has already been authenticated in the request).  
* [`propsToTest`](#propsToTest) - Optional collection of properties (and optional options per property) to be tested.  
* `defaultOptions` - Optional object of options that should globally apply to all properties being tested if those options are set in `propsToTest`. See [options](#options).


<a name="isAuthorized"></a>
### isAuthorized(req, callback)
Function that is returned by calling [makeIsAuthorized](#makeIsAuthorized) and determines if an http request is authorized based on the ACL rules collection and the authorized ACL ids.   See [Rules for authorizing a request](#howAuthorized).  

__Arguments__
* `req` - The http request object. 
* `callback(err, passes)` - The callback will return an `err` if it is not authorized. If it is authorized, `err` will be null and `passes` will be `true`.  


<a name="propsToTest"></a>
### propsToTest
The collection of properties to be tested in [isAuthorized](#isAuthorized). Every property included in this collection is tested for a match between the http request and the acl rules.  See [Rules for authorizing a request](#howAuthorized).

Optional collection passed into makeIsAuthorized.  Default is ['path', 'baseUrl', 'method'].  (See helper function [getPropsFromRules](#getPropsFromRules) to get all unique properties from an acl rules collection.) 

['options'](#options) values can be set for any specific property by using format allowed by [filter-objects propsToTest](https://github.com/tonybranfort/filter-objects#propsToTest).

Option values for a given property are set based on the following heirarchy (first found): 
  1. Value that is set on this `propsToTest` collection
  2. The following default values for 'method' and 'query' properties and all sub-properties of `query`:  
```javascript
	{'method': {
	   'regExpMatch': false,
	   'regExpIgnoreCase': false,
	   'variablesInTObj': false},
	 'query': {
	   'regExpMatch': true,
	   'regExpIgnoreCase': false,
	   'variablesInTObj': false},
	}; 
```
  3. `defaultOptions` parameter passed into [`makeIsAuthorized`](#makeIsAuthorized)
  4. globalDefaultOptions - see [`options`](options)

Example
```javascript
// if passing these propsToTest and defaultOptions into makeIsAuthorized
propsToTest = ['method','baseUrl','query.sort',{'query.filter':{regExpMatch: false}]
defaultOptions = {variablesInTObj: true}  

// then the options values by property would be: 
//   (only including those values of interest for this example, not all options values)
method = {
	regExpMatch: false            // default option for method
	regExpIgnoreCase: false       // default option for method
	variablesInTObj: false        // default option for method
}

baseUrl = {
	regExpMatch: true             // globalDefaulOptions
	regExpIgnoreCase: true        // globalDefaulOptions
	variablesInTObj: true         // defaultOptions 
}

query.sort = {
	regExpMatch: true             // default option for query
	regExpIgnoreCase: false       // default option for query
	variablesInTObj: false        // default option for query
}

query.sort = {
	regExpMatch: false            // propsToTest
	regExpIgnoreCase: false       // default option for query
	variablesInTObj: false        // default option for query
}

```

<a name="options"></a>
### options

Options apply to how an http request is matched to acl rules based on how properties are tested for matches between the two. 

The `options` object : 
* determines the `flex-acl` global defaults (see below). 
* can be passed into [`makeIsAuthorized`](#makeIsAuthorized) to over-ride global defaults.  Only those values included in the object passed into `makeIsAuthorized` will over-ride the global defaults (ie, can select which properties to over-ride).  
* determines `method` and `query` property specific defaults for `flex-acl`.  See [`propsToTest`](#propsToTest).
* can be applied for each specific property.  See [`propsToTest`](#propsToTest).

See [`propsToTest`](#propsToTest) for which properties are tested, setting option values specific to properties and the order of heirarchy for setting options values.  

Acl rules are matched from an http request using [filter-objects](https://github.com/tonybranfort/filter-objects) `makeFilterFn` / `filter`.  As such it uses the same options object which is shown below.  The default values are specific to `flex-acl`. 

In the options object, TObj is the acl rule and PObj is the http request object. 

```javascript
var globalDefaultOptions = {
  matchIfTObjPropMissing: true,   // match if acl rule property is missing 
  matchIfPObjPropMissing: false,  // don't match if the request property is missing
  matchIfBothPropMissing: true,   // match if property is missing from both acl rule and request
  regExpMatch: true,			  // perform reg exp match from acl rule to request by default
  regExpReverse: true,            // this indicates that the TObj (acl rule) is the reg exp
  regExpIgnoreCase: true,         // if it is a regular expression test then case insensitive
  regExpAnchorStart: true,        // if it is a regular expression test then prepend with '^' if a string
  regExpAnchorEnd: true,          // if it is a regular expression test then append with '$' if a string
  variables: {},                  // variables collection if using variables
  variablesInTObj: false,
  variablesStartStr: '~',
  variablesEndStr: '#', 
};
```

See [Rules for authorizing a request](#howAuthorized) for general discussion and examples. 


<a name="makeGetMatchedRulesFn"></a>
### makeGetMatchedRulesFn
Returns a function which will return the matched rules given a request.  This is the function used by `makeIsAuthorized`.  Is exposed here for testing which acl rules are actually matched for a request. 

__Arguments__
* [`propsToTest`](#propsToTest) - Optional collection of properties (and optional options per property) to be tested.  
* `defaultOptions` - Optional object of options that should globally apply to all properties being tested if those options are set in `propsToTest`. See [options](#options).

Function that is called with these arguments: 
* `req` - The http request object. 
* `getAclRules(callback)` - Function which returns the acl rules.  The function is passed a `callback(err, aclRules)` which returns either an `err` or the acl rules which is an array of objects with each object having a property 'id' to uniquely identify it.  
* `callback(err, matchedRules)` - If no `err` callback function is called with the acl rules that matched the request.  

Example
```javascript
var getRules = function(callback) {
  var rules = [
    {id: 'ClientLi',
     method: 'GET',
     baseUrl: '/api',
     path:'/clients'},
    {id: 'ClientCr',
     method: 'POST',
     baseUrl: '/api',
     path:'/clients'},
    ];
  return callback(null, rules); 
}; 

var req = {method: 'POST', baseUrl: '/api', path:'/clients'};

var getMatchedRules = flexAcl.makeGetMatchedRulesFn(); 

getMatchedRules(req, getRules, function (err, matchedRules) {
  console.log(matchedRules);
});

/*
[ { id: 'ClientCr',
    method: 'POST',
    baseUrl: '/api',
    path: '/clients' } ]
*/
```

<a name="setOptionsOnProps"></a>
### setOptionsOnProps
Sets every option value for each property based on the [`propsToTest`](#propsToTest) and default [`options`](#options) rules.  `setOptionsOnProps` is called by [`makeIsAuthorized`](#makeIsAuthorized) so does not need to be called.  Is exposed as a helper function to see every property option that is set. 

__Arguments__
* [propsToTest](#propsToTest) 
* `defaultOptions` - Optional object of options that should globally apply to all properties being tested if those options are set in `propsToTest`. See [options](#options).

```javascript
var propsToTest = ['method','baseUrl','query.sort',{'query.filter':{regExpMatch: false}}];
var myDefaultOptions = {variablesInTObj: true};

var propsWithOptions = flexAcl.setOptionsOnProps(propsToTest, myDefaultOptions);

console.log(propsWithOptions); 
/* 
[ { name: 'method',
    variablesInTObj: false,
    regExpIgnoreCase: false,
    regExpMatch: false,
    doNotCheckInherited: false,
    variablesInPObj: false,
    propMatchFn: null,
    variablesEndStr: '#',
    variablesStartStr: '~',
    variables: {},
    regExpAnchorEnd: true,
    regExpAnchorStart: true,
    regExpReverse: true,
    matchIfBothPropMissing: true,
    matchIfPObjPropMissing: false,
    matchIfTObjPropMissing: true },
  { name: 'baseUrl',
    doNotCheckInherited: false,
    variablesInPObj: false,
    propMatchFn: null,
    variablesEndStr: '#',
    variablesStartStr: '~',
    variables: {},
    regExpAnchorEnd: true,
    regExpAnchorStart: true,
    regExpIgnoreCase: true,
    regExpReverse: true,
    regExpMatch: true,
    matchIfBothPropMissing: true,
    matchIfPObjPropMissing: false,
    matchIfTObjPropMissing: true,
    variablesInTObj: true },
  { name: 'query.sort',
    variablesInTObj: false,
    regExpIgnoreCase: false,
    regExpMatch: true,
    doNotCheckInherited: false,
    variablesInPObj: false,
    propMatchFn: null,
    variablesEndStr: '#',
    variablesStartStr: '~',
    variables: {},
    regExpAnchorEnd: true,
    regExpAnchorStart: true,
    regExpReverse: true,
    matchIfBothPropMissing: true,
    matchIfPObjPropMissing: false,
    matchIfTObjPropMissing: true },
  { regExpMatch: false,
    name: 'query.filter',
    variablesInTObj: false,
    regExpIgnoreCase: false,
    doNotCheckInherited: false,
    variablesInPObj: false,
    propMatchFn: null,
    variablesEndStr: '#',
    variablesStartStr: '~',
    variables: {},
    regExpAnchorEnd: true,
    regExpAnchorStart: true,
    regExpReverse: true,
    matchIfBothPropMissing: true,
    matchIfPObjPropMissing: false,
    matchIfTObjPropMissing: true } ]
 */
```

<a name="getPropsFromRules"></a>
### getPropsFromRules
Returns an array of strings in dot notation form that are the keys of objects in a rules collection. Intended as a helper function to get the properties needed for [propsToTest](#propsToTest). 


__Arguments__
* `rules` - Acl rules collection (any array of objects). 
* `keysToIgnore` - Optional array of strings which will not be returned from `getPropsFromRules` even if it is a key in a rules object. Default: ['id'].  

Example
```javascript
var rules = [
  {id: 'ClientAll',
   baseUrl:'/api',
   path: '/clients'},
  {id: 'ClientLi1',
   method: 'GET',
   baseUrl:'/api',
   path: '/clients',
   query: {filter: 'abc123'}},
  {id: 'ClientLi2',
   method: 'GET',
   baseUrl:'/api',
   path: '/clients',
   note: 'href is for a note only...like this note',
   href: '/api/clients?filter=abc12'},
  ];

var props = flexAcl.getPropsFromRules(rules,['href','note']); 

console.log(props); 
// [ 'baseUrl', 'path', 'method', 'query.filter' ]

```






