/*  See design/Auth.design.txt
    This roles class determines roles and the access codes allowed for a given role as assigned to a user. 
    A "." in the access code indicates all access to that position. 
       For example: "C.." indicates all access (Save, Create, List, etc) for the Client domain
*/

module.exports = {
  getRole: function(role) {
  // console.log("roles.getRole().role:" + role);
    return roles.filter(function(el) {
      return el.role.toUpperCase() === role.toUpperCase(); 
    })[0] || null;
  },
  getRoleAsync: function(role, cb) {
  // console.log("roles.getRole().role:" + role);
    var r = this.getRole(role);
    return cb(null, r); 
  }
}; 

var roles = 
[
  {
    "role": "ADM",
    "desc": "Admin level all access",
    "acs": [
      "Cli..",
      "T..",
      "Usr..",
      "A..",
      "M..",
      "N..",
      "G..",
      "S..",
      "K..",
      "Usc..",
      "Goo..",
      "Cal..",
      "LIP"
    ]
  },
  {
    "role": "BOS",
    "desc": "Boss level including all financials",
    "acs": [
      "Cli..",
      "T..",
      "M..",
      "N..",
      "G..",
      "Usr..",
      "SGV",
      "K..",
      "Usc..",
      "Goo..",
      "Cal..",
      "LIP"
    ]
  },
  {
    "role": "OFF",
    "desc": "Office staff - client & txtn detail view, create & save (no financials)",
    "acs": [
      "Cli[^K].",
      "M..",
      "N..",
      "G..",
      "UsrDL",
      "SGV",
      "K..",
      "Usc..",
      "Goo..",
      "Cal..",
      "LIP"
    ]
  }
];


