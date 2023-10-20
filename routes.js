"use strict";

module.exports = function (app) {
  var todoList = require("./controller");

  app.route("/").get(todoList.index);

  app.route("/readqrmrp").post(todoList.ReadQRMRP);

  app.route("/finditem").post(todoList.FindItem);
  
  app.route("/geteoh").post(todoList.getEOH);

  app.route("/cek_koneksi").get(todoList.cek_koneksi);


  app.route("/testpage").get(todoList.testPage)

  app.route("/login").post(todoList.decode)

  app.route("/getlookupdata").post(todoList.getLockupData)

  app.route("/soforhandheld/:offset/:limit").post(todoList.SOHandHeld)

  app.route("/findscdata").post(todoList.getDataSC)

  app.route("/insertscdata").post(todoList.addSCData)

  app.route("/autocomplite").post(todoList.AutoCompilteHH)

  app.route("/alluser").get(todoList.ShowAllUser)

  app.route("/checkupdateapps/:version").get(todoList.checkUpDateApps)

};
