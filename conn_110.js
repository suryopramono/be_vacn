'use strict';

var mysql = require('mysql');

var con_110 = mysql.createPool({
    connectionLimit : 10,
    // host: "192.168.11.110",
    // user: "itdev",
    // password: "innomodule",
    // database: "telegram"
    host: "192.168.11.232",
    user: "suryo",
    password: "innomodule",
    database: "telegram"
});
  
// var getConnection = function(callback) {
//   con_110.getConnection(function(err, connection) {
//       callback(err, connection);
//   });
// };

module.exports = con_110;

// module.exports = getConnection;

