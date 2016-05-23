/*jslint node: true */
'use strict'; 

module.exports = {
  getRules: getRules, 
  getVariables: getVariables
}; 

function getRules(cb) {
  // you will likely want to put your rules in a data store
  return cb(null, aclRules); 
}

function getVariables(cb) {
  return aclVariables; 
}

 // ACCESS CODES: 
 //   First Chars:          Second Char:               THIRD CHAR
 //      (A)uthentication                                 C: Create
 //      (Cal)endar                                       D: Delete
 //      (Cli)ent            Addt'l detail for            V: view
 //      (Goo)gle 
 //      tas(K)                                           A: Aggregate : Totals  
 //      (N)ote                                           I: Slice : list by certain parameter
 //      (S)ys                                            L: List 
 //      (T)ransaction          first Char                S: Save
 //      (U)ser                                           E: Edit includes VIEW, SAVE and CREATE
 //      Uscis(Usc)                                       P: Poke - Attempt to post for some other response; eg; login


var aclVariables = {
  mongoId: "[A-Fa-f0-9]{24}",
  all: '.*',
  yyyy:   "([0-9]{4})|(ALL)",
  mm:     "([0-9]{2})|(ALL)",
  dd:     "([0-9]{2})|(ALL)",
  userId: "[A-Za-z0-9]{3,20}"
};

var aclRules = [
  {
    'domain': "authentication",
    'id': "LIP",
    'name': "Log In Poke",
    'method': "POST",
    'desc': "Attempt to log into application",
    'path': '/authenticate',
    'baseUrl': '/api',
  },
  {
    'id': "CliSL",
    'domain': "client",
    'name': "Clients Search List",
    'method': "GET",
    'desc': "List of clients only with values to allow for client search" +
      "(name, alien reg nbr, etc) ",
    'baseUrl': '/api',
    'path': '/clients',
    'query':{'fieldset': '^search$'}
  },
  {
    'id': "CliFL",
    'domain': "client",
    'name': "Clients Search Filtered List",
    'method': "GET",
    'desc': "List of clients only with values to allow for client search" +
      "(name, alien reg nbr, etc) and filtered by them ",
    'baseUrl': '/api',
    'path': '/clients',
    'query': {
      'fieldset': '^filteredsearch$',
      'filter': '.*',
      'filterfields': '.*'},
  },
  {
    'id': "CliKL",
    'domain': "client",
    'name': "Clients -txtn-totals List",
    'method': "GET",
    'desc': "List of clients with txtn totals & balances",
    'baseUrl': '/api',
    'path': '/clients',
    'query':{'fieldset':'^txtntotals$'}
  },
  {
    'id': "CliPL",
    'domain': "client",
    'name': "Clients Last Payment List",
    'method': "GET",
    'desc': "List of clients with balance and last payment, sorted by oldest payemnts",
    'baseUrl': '/api',
    'path': '/clients',
    'query':{'fieldset':'^lastpayment$'}
  },
  {
    'id': "CliAL",
    'domain': "client",
    'name': "Clients All List",
    'method': "GET",
    'desc': "List of clients intended for default Clients List view",
    'baseUrl': '/api',
    'path': '/clients',
    'query':{'fieldset':'^all$'}
  },
  {
    'id': "CliCL",
    'domain': "client",
    'name': "Clients Closed List",
    'method': "GET",
    'desc': "List of clients that are Closed",
    'baseUrl': '/api',
    'path': '/clients',
    'query':{'fieldset':'^closed$'}
  },
  {
    'id': "CliDV",
    'domain': "client",
    'name': "Client Detail View",
    'method': "GET",
    'desc': "View full detail for one client including txtns",
    'baseUrl': '/api',
    'path': "/clients/~mongoId#",    
  },
  {
    'id': "CliDS",
    'domain': "client",
    'name': "Client Detail Save",
    'method': "PUT",
    'desc': "Save detail for one client including txtns",
    'baseUrl': '/api',
    'path': '/clients'
  },
  {
    'id': "CliDC",
    'domain': "client",
    'name': "Client Detail Create",
    'method': "POST",
    'desc': "Create a new client",
    'baseUrl': '/api',
    'path': '/clients'
  },
  {
    'id': "CliIV",
    'domain': "client",
    'name': "Client Invoice View",
    'method': "GET",
    'desc': "View invoice for one client",
    'baseUrl':'/api',
    'path':"/invoice/~mongoId#",
  },
  {
    'id': "TFV",
    'domain': "transaction",
    'name': "Transaction Financial VIew",
    'method': "GET",
    'desc': "View Finacial details of Transactions including TRUST and BUSINESS RECORDS & ATTRIBUTES",
    'baseUrl': '/api',
    'path': '/txtns/BOGUS/foggetaboutit/forfrontendonly'
  },
  {
    'id': "TDI",
    'domain': "transaction",
    'name': "Txtns Date Slice",
    'method': "GET",
    'desc': "View Txtns for One Specific Date",
    'baseUrl':'/api',
    'path':"/txtns/~all#"
  },
  {
    'id': "TAL",
    'domain': "transaction",
    'name': "Txtns All List",
    'method': "GET",
    'desc': "List of all Transactions",
    'baseUrl':'/api',
    'path':"/txtns"
  },
  {
    'id': "TTA",
    'domain': "transaction",
    'name': "Txtn Totals Aggregation",
    'method': "GET",
    'desc': "View Txtn Totals - total totals",
    'baseUrl':'/api',
    'path':"/txtn-totals"
  },
  {
    'id': "TDA",
    'domain': "transaction",
    'name': "Txtn Date Aggregation",
    'method': "GET",
    'desc': "View Txtn Totals by year, month, day",
    'baseUrl':'/api',
    'path':"/txtn-totals/~yyyy#/~mm#/~dd#"
  },
  {
    'id': "UsrAV",
    'domain': "user",
    'name': "User Admin Get",
    'method': "GET",
    'desc': "Get a user with their ID",
    'baseUrl':'/api',
    'path':"/users/~userId#"
  },
  {
    'id': "UsrAS",
    'domain': "user",
    'name': "User Admin Save",
    'method': "PUT",
    'desc': "Save a user",
    'baseUrl':'/api',
    'path':"/users"
  },
  {
    'id': "UsrAD",
    'domain': "user",
    'name': "User Admin Delete",
    'method': "DELETE",
    'desc': "Delete a user with their ID",
    'baseUrl':'/api',
    'path':"/users/~userId#"
  },
  {
    'id': "UsrDL",
    'domain': "user",
    'name': "User Display List",
    'method': "GET",
    'desc': "Get the list of users for display (no admin)",
    'baseUrl':'/api',
    'path':"/users"
  },
   {
    'id': "MAL",
    'domain': "meta",
    'name': "Meta All List",
    'method': "GET",
    'desc': "Get full list of any meta list",
    'baseUrl':'/api',
    'path':"/meta/~all#"
  },
  {
    'id': "NDV",
    'domain': "note",
    'name': "Note Detail View",
    'method': "GET",
    'desc': "View full detail of one note",
    'baseUrl':'/api',
    'path':"/note/~mongoId#"
  },
  {
    'id': "NDS",
    'domain': "note",
    'name': "Note Detail Save",
    'method': "PUT",
    'desc': "Save detail of one note",
    'baseUrl':'/api',
    'path':"/note"
  },
  {
    'id': "NDC",
    'domain': "note",
    'name': "Note Detail Create",
    'method': "POST",
    'desc': "Create a note",
    'baseUrl':'/api',
    'path':"/note"
  },
  {
    'id': "NCI",
    'domain': "note",
    'name': "Note Client Slice",
    'method': "GET",
    'desc': "List of notes for one client",
    'baseUrl':'/api',
    'path':"/notes/~mongoId#",
  },
  {
    'id': "GDC",
    'domain': "note",
    'name': "Message Detail Create",
    'method': "POST",
    'desc': "Create a message",
    'baseUrl':'/api',
    'path':"/messages"
  },
  {
    'id': "GDU",
    'domain': "note",
    'name': "Message Detail Update",
    'method': "PUT",
    'desc': "Update a message",
    'baseUrl':'/api',
    'path':"/messages"
  },
  {
    'id': "GUI",
    'domain': "message",
    'name': "Message User Slice",
    'method': "GET",
    'desc': "List of messages for one user",           
    'baseUrl':'/api',
    'path':"/messages/user/~userId#",
  },
  {
    'id': "GNI",
    'domain': "message",
    'name': "Message Note Slice",
    'method': "GET",
    'desc': "List of messages associated with one note",
    'baseUrl':'/api',
    'path':"/messages/note/~mongoId#"
  },
  {
    'id': "SGV",
    'domain': "message",
    'name': "Sys Google View",
    'method': "GET",
    'desc': "Get Sys Google object",
    'baseUrl':'/api',
    'path':"/sys/google"
  },
  {
    'id': "KDV",
    'domain': "task",
    'name': "Task Detail View",
    'method': "GET",
    'desc': "View full detail of one task",
    'baseUrl':'/api',
    'path':"/tasks/~mongoId#"
  },
  {
    'id': "KAL",
    'domain': "task",
    'name': "Task All List",
    'method': "GET",
    'desc': "View list of all tasks",
    'baseUrl':'/api',
    'path':"/tasks"
  },
  {
    'id': "KAI",
    'domain': "task",
    'name': "Task All Slice",
    'method': "GET",
    'desc': "View list of tasks filtered by any known task attribute",
    'baseUrl':'/api',
    'path':"/tasks",
  },
  {
    'id': "KEV",
    'domain': "task",
    'name': "Task Empty View",
    'method': "GET",
    'desc': "Get empty task object with default property values",
    'baseUrl':'/api',
    'path':"/tasks/new"
  },
  {
    'id': "KDS",
    'domain': "task",
    'name': "Task Detail Save",
    'method': "PUT",
    'desc': "Save detail of one task",
    'baseUrl':'/api',
    'path':"/tasks"
  },
  {
    'id': "KDC",
    'domain': "task",
    'name': "Task Detail Create",
    'method': "POST",
    'desc': "Create a task",
    'baseUrl':'/api',
    'path':"/tasks"
  },
  {
    'id': "KCI",
    'domain': "task",
    'name': "Task Client Slice",
    'method': "GET",
    'desc': "List of tasks for one client",
    'baseUrl':'/api',
    'path':"/tasks/~mongoId#",
  },
  {
    'id': "UscSV",
    'domain': "uscis",
    'name': "Uscis (Gov) Status View",
    'method': "GET",
    'desc': "View USCIS case status for one case",
    'baseUrl':'/api',
    'path':"/uscis/case-status/~all#",
  },
  {
    'id': "GooUV",
    'domain': "google",
    'name': "Google Url (auth) View",
    'method': "GET",
    'desc': "Get the Google auth url necessary for google login",
    'baseUrl':'/api',
    'path':"/google/loginurl",
  },
  {
    'id': "GooLE",
    'domain': "google",
    'name': "Google Login Edit",
    'method': "GET",
    'desc': "Complete the google login",
    "baseUrl":"/googlecompletelogin",
  },
  {
    'id': "GooPV",
    'domain': "google",
    'name': "Google Profile (me) View",
    'method': "GET",
    'desc': "View my own google profile",
    'baseUrl':'/api',
    'path':"/google/me",
  },
  {
    'id': "GooLP",
    'domain': "google",
    'name': "Google Logout Poke - logout",
    'method': "GET",
    'desc': "Log out of google for this user",
    'baseUrl':'/api',
    'path':"/google/logout/me",
  },
  {
    'id': "GooEC",
    'domain': "google",
    'name': "Google Email Create (Send)",
    'method': "POST",
    'desc': "Send email for logged in user",
    'baseUrl':'/api',
    'path':"/google/email",
  },
  {
    'id': "CalCL",
    'domain': "google",
    'name': "Google Calendar List",
    'method': "GET",
    'desc': "Get user's google calendar list",
    'baseUrl':'/api',
    'path':"/calendars/calendarlist",
  },
  {
    'id': "CalPV",
    'domain': "google",
    'name': "Calendar Primary View",
    'method': "GET",
    'desc': "Get user's primary calendar",
    'baseUrl':'/api',
    'path':"/calendars/me",
  },
  {
    'id': "CalEC",
    'domain': "google",
    'name': "Calendar Event Create",
    'method': "POST",
    'desc': "Create a new calendar event",
    'baseUrl':'/api',
    'path':"/calendars/~all#/events",
  },
  {
    'id': "CalES",
    'domain': "google",
    'name': "Calendar Event Save",
    'method': "PUT",
    'desc': "Update a calendar event",
    'baseUrl':'/api',
    'path':"/calendars/~all#/events",
  },
  {
    'id': "CalEL",
    'domain': "google",
    'name': "Calendar Events List",
    'method': "GET",
    'desc': "Get list of calendar events",
    'baseUrl':'/api',
    'path':"/calendars/events",
  },
  {
    'id': "CalEV",
    'domain': "google",
    'name': "Calendar Event View",
    'method': "GET",
    'desc': "Get one event given calendar ID and event ID",
    'baseUrl':'/api',
    'path':"/calendars/~all#/events/~all#",
  },
  {
    'id': "CalED",
    'domain': "google",
    'name': "Calendar Event Delete",
    'method': "DELETE",
    'desc': "Delete one event given calendar ID and event ID",
    'baseUrl':'/api',
    'path':"/calendars/~all#/events/~all#"
  },

];  // end of aclRules

