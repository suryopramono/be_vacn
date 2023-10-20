'use strict';

var mysql = require('mysql');

const con = mysql.createPool({
  connectionLimit : 3,
  host: "192.168.11.8",
  user: "mrpuserprog",
  password: "ProgMrpPassUser",
  database: "DBMRPENGVC",
  timezone: 'wib'
});


// con.connect(function (err){
    // if(err) throw err;
// });

// var conn=con;

// function handleDisconnect() {
 // conn = mysql.createConnection(con); // Recreate the connection, since
                                   //               // the old one cannot be reused.

  // conn.connect(function(err) {              // The server is either down
    // if(err) {                                     // or restarting (takes a while sometimes).
      // console.log('error when connecting to db:', err);
      // setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    // }
// else{console.log('Connected! Database)');}	// to avoid a hot loop, and to allow our node script to
  // });                                     // process asynchronous requests in the meantime.
                                         // If you're also serving http, display a 503 error.
  // conn.on('error', function(err) {
    // console.log('db error', err);
    // if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      // handleDisconnect();                         // lost due to either server restart, or a
    // } else {                                      // connnection idle timeout (the wait_timeout
      // throw err;                                  // server variable configures this)
    // }
  // });
// }

//handleDisconnect();

module.exports = con;


