"use strict";

require("dotenv").config();
var connection = require("./conn");
var connection_telegram = require("./conn_110");
const Logger = require("./lib/logger");
const axios = require("axios");
const present = require("present");

const { exit } = require("process");
const { loggers } = require("winston");

exports.formatTgl = function (_tanggal) {
  var tanggal = new Date(_tanggal);
  tgl = tanggal.getDate();
  bln = tanggal.getMonth();
  thn = tanggal.getFullYear();

  if (tgl < 10) {
    tgl = "0" + tgl;
  }
  if (bln < 10) {
    bln = "0" + bln;
  }

  return tgl + "-" + bln + "-" + thn;
};

exports.formatTglDB = function (_tanggal) {
  // console.log(_tanggal)
  var tanggal = new Date(_tanggal);
  tgl = tanggal.getDate();
  bln = tanggal.getMonth();
  thn = tanggal.getFullYear();
  if (tgl < 10) {
    tgl = "0" + tgl;
  }
  if (bln < 10) {
    bln = "0" + bln;
  }

  return thn + "-" + bln + "-" + tgl;
};

exports.formatDateTimeDB = function (_date) {
  var date = new Date(_date);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

exports.formatDateDB = function formatDateDB(_date) {
  var date = new Date(_date);
  return date.toISOString().slice(0, 10).replace("T", " ");
};

exports.setWeek = function (_tanggal) {
  var index_start, index_end;
  var forReturn = {};
  const tanggal = new Date(_tanggal);
  const tgl = tanggal.getDate();
  const bln = tanggal.getMonth();
  const thn = tanggal.getFullYear();

  switch (tanggal.getDay()) {
    case 0:
      index_start = -7;
      index_end = 6;
      break;
    case 1:
      index_start = -1;
      index_end = 5;
      break;
    case 2:
      index_start = -2;
      index_end = 4;
      break;
    case 3:
      index_start = -3;
      index_end = 3;
      break;
    case 4:
      index_start = -4;
      index_end = 2;
      break;
    case 5:
      index_start = -5;
      index_end = 1;
      break;
    case 6:
      index_start = -6;
      index_end = 0;
      break;

    default:
      Logger.error("date not indexed");
      break;
  }

  forReturn.date_start = new Date(
    thn,
    bln,
    tgl + index_start
  ).toLocaleDateString("en-CA");
  forReturn.date_end = new Date(thn, bln, tgl + index_end).toLocaleDateString(
    "en-CA"
  );
  return forReturn;
};

exports.setMonth = function (_tanggal) {
  var forReturn = {};
  const tanggal = new Date(_tanggal);
  const bln = tanggal.getMonth();
  const thn = tanggal.getFullYear();

  forReturn.date_start = new Date(thn, bln, 1).toLocaleDateString("en-CA");
  forReturn.date_end = new Date(thn, bln + 1, 0).toLocaleDateString("en-CA");
  return forReturn;
};

exports.removeRDP = function (_data) {
  // untuk menghapus RowDataPacket pada return mysql
  return JSON.parse(JSON.stringify(_data));
};

exports.formatFullDayEng = function formatFullDayEng(_day) {
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  return weekday[_day];
};

exports.updateAllFromJson = function (data, keys, value) {
  if (data.length > 0) {
    for (var index = 0; index < data.length; index++) {
      data[index][keys] = value;
    }
    return data;
  } else {
    // Logger.warn(`updateAllFromJson(${data}, ${keys}, ${value})`);
    return "";
  }
};

exports.deleteFromJson = function (data, key) {
  return delete data[key];
};

exports.beforeBuildQuery = function beforeBuildQuery(data, callback) {
  var forReturn = {};
  forReturn.data = data;
  forReturn.only_keys = Object.keys(data).toString();
  forReturn.only_value =
    typeof data.length === "undefined"
      ? Object.values(data)
      : data.map(Object.values);

  callback(forReturn);
};

exports.updateFromJson = function (data, keys, value, index) {
  if (data.length > 0) {
    data[index][keys] = value;
    // console.log(value)
    return data;
  } else {
    // Logger.warn(`updateFromJson(${data}, ${keys}, ${value}, ${index})`);
    return "";
  }
};

exports.getFromJson = function (data, keys, index) {
  if (data.length > 0) {
    return data[index][keys];
  } else {
    //  Logger.warn(`getFromJson(${data}, ${keys}, ${index})`);
    return "";
  }
};

exports.calculateEOH = function (_acp, _adj, _iss, tipe, cb) {
  var acp = this.getFromJson(_acp, "acp", 0);
  var adj = this.getFromJson(_adj, "adj", 0);
  var iss = this.getFromJson(_iss, "iss", 0);

  var blc = acp - iss + adj;
  var temp = this.updateAllFromJson(_acp, "adj", adj);
  var temp1 = this.updateAllFromJson(temp, "iss", iss);
  var temp2 = this.updateAllFromJson(temp1, "blc", blc);

  cb(temp2);
};

exports.findDataWHGRN = function findDataWHGRN(
  itemdetailcode,
  rcvno,
  locno,
  tipe,
  cb
) {
  var query =
    "SELECT  a.`rcv_no`, a.`pr_no`, a.`po_no`, f.`emp_firstname`, e.`project_name`, " +
    " b.`item_code`, b.`item_detail_code`, b.`item_detail_name`, c.`location_no`, " +
    " IFNULL(SUM(c.`acp`),0) AS acp , IFNULL(SUM(c.`adj`),0) AS adj, " +
    " IFNULL(SUM(c.`iss`),0) AS iss, IFNULL(SUM(c.`blc`),0) AS blc " +
    " FROM  `inv_item_non_production_rcv` a " +
    " INNER JOIN `inv_item_non_production_rcv_item` b  ON a.`id` = b.`rcv_id`  " +
    " INNER JOIN `inv_item_non_production_wh` c  ON b.`id` = c.`rcv_detail_id`  " +
    " LEFT JOIN mst_item_non d  ON b.`item_detail_code` = d.`ITEM_CODE`  " +
    " LEFT JOIN purchase_request_non_production e  ON a.`pr_no` = e.`pr_no` " +
    " LEFT JOIN `adm_mst_emp` f ON e.`requestor_code` = f.`EMP_CODE` " +
    ' WHERE a.`grn_status` <> "Cancel"  ';
  if (itemdetailcode != "") {
    query = query + ' AND b.`item_detail_code` = "' + itemdetailcode + '" ';
  }

  if (rcvno != "") {
    query = query + ' AND a.`rcv_no` = "' + rcvno + '" ';
  }

  if (locno != "") {
    query = query + ' AND c.`location_no` = "' + locno + '" ';
  }

  if (rcvno == "") {
    query = query + " GROUP BY  b.`item_detail_code` ;";
  } else {
    query = query + " GROUP BY a.rcv_no, b.`item_detail_code` ;";
  }
  // console.log('------------------------------------------')
  // console.log(query);
  // console.log('------------------------------------------')

  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`findDataWHGRN -  ${error})`);
      // console.log(error);
      cb([]);
      // response.error(error, res);
    } else {
      //  response.ok2(rows, res);
      cb(rows);
    }
  });
};

exports.findDataWHIss = function findDataWHIss(
  itemdetailCode,
  rcvno,
  locno,
  tipe,
  cb
) {
  var query;

  query =
    " SELECT b.`item_detail_code`, c.`location_number`,f.`rcv_no`,       " +
    " IFNULL(SUM(c.`requested_qty`),0) AS iss            " +
    " FROM `inv_item_iss_non_production` a               " +
    " INNER JOIN `inv_item_iss_non_production_detail` b  " +
    "  ON a.`id` = b.`iss_id`                            " +
    " INNER JOIN `inv_item_iss_non_production_wh` c      " +
    "   ON b.`id` = c.`iss_detail_id`                    " +
    " INNER JOIN `inv_item_non_production_wh` d          " +
    "   ON c.`inv_item_non_production_wh_id` = d.id      " +
    " INNER JOIN inv_item_non_production_rcv_item e      " +
    "   ON e.`id` = d.`rcv_detail_id`                    " +
    " INNER JOIN inv_item_non_production_rcv f           " +
    "   ON f.`id` = e.`rcv_id`                           " +
    ' WHERE    a.`status`<>"Cancel"                      ';

  if (itemdetailCode != "") {
    query = query + ' AND b.`item_detail_code` = "' + itemdetailCode + '" ';
  }
  if (rcvno != "") {
    query = query + ' AND f.`rcv_no` = "' + rcvno + '"';
  }
  if (locno != "") {
    query = query + ' AND c.`location_number` = "' + locno + '"';
  }
  // console.log('------------------------------------------')
  // console.log(query);
  // console.log('------------------------------------------')
  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`findDataWHIss -  ${error})`);
      // console.log(error);
      cb([]);
      // response.error(error, res);
    } else {
      //  response.ok2(rows, res);
      cb(rows);
    }
  });
};

exports.findDataWHAdj = function findDataWHAdj(
  itemdetailCode,
  rcvno,
  locno,
  tipe,
  cb
) {
  var query;

  query =
    "SELECT b.`item_detail_code`, c.`location_number`,f.`rcv_no`,   " +
    " IFNULL(SUM(c.`adjusted_qty`),0) AS adj             " +
    " FROM `inv_item_adj_non_production` a               " +
    " INNER JOIN `inv_item_adj_non_production_detail` b  " +
    "   ON a.`id` = b.`adj_id`                           " +
    " INNER JOIN `inv_item_adj_non_production_wh` c      " +
    "   ON b.`id` = c.`adj_detail_id`                    " +
    " INNER JOIN `inv_item_non_production_wh` d          " +
    "   ON c.`inv_item_non_production_wh_id` = d.id      " +
    " INNER JOIN inv_item_non_production_rcv_item e      " +
    "   ON e.`id` = d.`rcv_detail_id`                    " +
    " INNER JOIN inv_item_non_production_rcv f           " +
    "   ON f.`id` = e.`rcv_id`                           " +
    " WHERE                                              " +
    '  a.`status`<>"Cancel "                          ';
  if (itemdetailCode != "") {
    query = query + ' AND b.`item_detail_code` = "' + itemdetailCode + '" ';
  }
  if (rcvno != "") {
    query = query + ' AND f.`rcv_no` = "' + rcvno + '"';
  }
  if (locno != "") {
    query = query + ' AND c.`location_number` = "' + locno + '"';
  }

  // console.log('------------------------------------------')
  // console.log(query);
  // console.log('------------------------------------------')
  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`findDataWHAdj -  ${error})`);
      // console.log(error);
      cb([]);
      // response.error(error, res);
    } else {
      //  response.ok2(rows, res);
      cb(rows);
    }
  });
};

exports.findData = function (data, tipe, cb) {
  var forReturn = [];
  var forCallBack = {};
  var hasil;
  if (tipe.toLowerCase() == "telegram") {
    var query =
      'SELECT CONCAT(a.`item_detail_code`," - ",a.`item_detail_desc`) AS `text`, a.`item_detail_code` AS `callback_data` ' +
      ' FROM `mst_item_detail_non2_bu` a WHERE a.`item_detail_desc` LIKE("%' +
      data +
      '%")'; // and division_code in("SanbePlant3")
  } else if (tipe.toLowerCase() == "flutter") {
    var query =
      "SELECT a.`item_detail_code` ,a.`item_detail_desc`  " +
      ' FROM `mst_item_detail_non2_bu` a WHERE a.`item_detail_desc` LIKE("%' +
      data +
      '%")'; // and division_code in("SanbePlant3")
  } else {
    var query = 'select "query tipe error" as error';
    //  console.log('query');
  }

  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`findData -  ${error})`);
      // forReturn.itemname = 0;
      // forReturn.itemcode = 'error querry find 1';
      // forReturn.msg = 'error query find 1';
    } else {
      if (tipe.toLowerCase() == "telegram") {
        for (let index = 0; index < rows.length; index++) {
          const element = rows[index];
          forReturn.push([element]);
        }
        hasil = JSON.parse(JSON.stringify(forReturn));
      } else if (tipe.toLowerCase() == "flutter") {
        hasil = rows;
      } else {
        hasil = rows;
      }
    }
    cb(hasil);
  });
};

exports.cekLogin_Telegram = function (chat_id, cb) {
  var query =
    'SELECT * FROM `user` WHERE chat_id="' + chat_id + '" and active=1';
  var forReturn = {};
  // console.log(query);

  connection_telegram.query(query, function (error, rows, fields) {
    if (error) {
      // console.log(error);
      Logger.error(`cekLogin_Telegram -  ${error})`);
      forReturn.login = 0;
      forReturn.msg = "error cek login";
      cb(forReturn);
    } else {
      if (rows.length > 0) {
        forReturn.login = 1;
        forReturn.msg = "you are login in";
        forReturn.name = rows[0].name;
        forReturn.inisial = rows[0].inisial;
      } else {
        forReturn.login = 0;
        forReturn.msg = "you must login first";
      }
      cb(forReturn);
    }
  });
};

exports.login_Telegram = function (phone_number, chat_id, cb) {
  var query =
    'SELECT * FROM `user` WHERE phone_number="' +
    phone_number +
    '" and active=1';

  var query_update =
    'update `user` set chat_id="' +
    chat_id +
    '" where  phone_number="' +
    phone_number +
    '" and active=1';

  var forReturn = {};

  connection_telegram.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`cekLogin_Telegram -  ${error})`);
      forReturn.login = 0;
      forReturn.msg = "error querry 1";
      forReturn.name = "error query 1";
      forReturn.inisial = "";
    } else {
      if (rows.length == 0) {
        forReturn.login = 0;
        forReturn.msg = "Sorry Your Account Not Registerd";
      } else {
        connection_telegram.query(query_update, function (error, rows, fields) {
          if (error) {
            forReturn.login = 0;
            forReturn.msg = "error querry 2";
            forReturn.name = "error query 2";
            forReturn.inisial = "";
          } else {
          }
        });
        forReturn.login = 1;
        forReturn.msg = "you are login in";
        forReturn.name = rows[0].name;
        forReturn.inisial = rows[0].inisial;
      }

      cb(forReturn);
    }
  });
};

exports.getEOH = async function (item_detail_code, rcv_no, loc_no, tipe, cb) {
  // console.log(1);
  const waktu = `Time taken by ReadQR item_detail_code:${item_detail_code} rcv_no:${rcv_no} loc_no:${loc_no} tipe:${tipe}`;
  console.time(waktu);
  const dataGRN = await new Promise((success, failure) => {
    this.findDataWHGRN(item_detail_code, rcv_no, loc_no, tipe, (value) => {
      if (value != null) {
        success(value);
      } else failure(0);
    });
  });
  // console.log(2);
  // console.log(dataGRN);

  const dataISS = await new Promise((success, failure) => {
    this.findDataWHIss(item_detail_code, rcv_no, loc_no, tipe, (value) => {
      if (value != null) {
        success(value);
      } else failure(0);
    });
  });
  // console.log(3);
  // console.log(dataISS);

  const dataADJ = await new Promise((success, failure) => {
    this.findDataWHAdj(item_detail_code, rcv_no, loc_no, tipe, (value) => {
      if (value != null) {
        success(value);
      } else failure(0);
    });
  });
  // console.log(4);
  // console.log(dataADJ);

  const hasil = await new Promise((success, failure) => {
    this.calculateEOH(dataGRN, dataADJ, dataISS, tipe, (value) => {
      if (value != null) {
        success(value);
      } else failure(0);
    });
  });
  // console.log(5);
  // console.log(hasil);
  console.timeEnd(waktu);
  cb(hasil);
};

exports.sendTelegram = function sendTelegram(message) {
  var token = "5007573427:AAHr9qhSgkW6wkxUTVmz2TrkHZ0fZ_69k5Q";
  var chatId = 1444350003;
  axios({
    method: "get",
    url: `https://api.telegram.org/bot${token}/sendMessage`,
    headers: {},
    data: {
      chat_id: chatId,
      text: message,
    },
  })
    .then(function (response) {
      // handle success
      if (response.data.ok) {
        Logger.info("send message Telegram Succsess");
      } else {
        Logger.info("terjadi kesalahan " + response);
      }
    })
    .catch(function (error) {
      // handle error
      Logger.error(`sendTelegram - catch - ${error}`);
    });
};

exports.testquery = function testquery(res) {
  var query =
    "SELECT * FROM `inv_item_non_production_rcv` WHERE rcv_no='BPBS/2205/007'";
  connection.query(query, function (error, rows, fields) {
    if (error) {
      // response.error(error, res);
    } else {
      //  response.ok2(rows, res);
      res.json(rows);
    }
  });
};

exports.setlimit = function async(offset, limit, param, tipe, bisnis_unit, flag, cb) {
  var query;
  query =
    "SELECT b.`item_detail_code`, b.`item_detail_name`, c.`location_no`," +
    ' a.`arrival_date`, f.`EMP_FIRSTNAME` AS requestor_user ,"" AS `detail`' +
    " FROM  `inv_item_non_production_rcv` a " +
    " INNER JOIN `inv_item_non_production_rcv_item` b  ON a.`id` = b.`rcv_id`  " +
    " INNER JOIN `inv_item_non_production_wh` c  ON b.`id` = c.`rcv_detail_id`  " +
    " LEFT JOIN mst_item_non d  ON b.`item_detail_code` = d.`ITEM_CODE`  " +
    " LEFT JOIN purchase_request_non_production e  ON a.`pr_no` = e.`pr_no` " +
    " LEFT JOIN `adm_mst_emp` f ON e.`requestor_code` = f.`EMP_CODE` " +
	" LEFT JOIN `stock_opname_sbe` s ON s.rcv_no = a.RCV_NO " +
    ' WHERE a.`grn_status` = "Closed" AND s.flag = "${flag}" '

  switch (tipe) {
    case "byloc":
      query += ` AND c.location_no = '${param}' `;

      break;
    case "byname":
      query += ` AND  b.item_detail_name like "%${param}%" or b.item_detail_name like '%${param}%'`;
      break;
    case "byarrdate":
      query += ` AND a.arrival_date = '${param}' `;
      break;
    case "byuser":
      query += ` AND f.EMP_FIRSTNAME like '%${param}%' `;
      break;

    default:
      loggers.error("setlimit: tipe tidak di masukan");
      cb([]);
      break;
  }

  // query += ` and a.division_code ='${bisnis_unit}' `;

  query +=
    " GROUP BY b.`item_detail_code` ORDER BY b.`item_detail_name`,a.`rcv_no` ";
  query += ` limit ${offset},${limit}`;

  console.log(query);
  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`setlimit -  ${error})`);
      // console.log(error);
      cb([]);

      // response.error(error, res);
    } else {
      cb(rows);
    }
  });
};

exports.getItemAwal = function (param, tipe, limitIn, bisnis_unit, cb) {
  var query;
  query =
    " SELECT  a.`rcv_no`,a.`arrival_date`, f.`emp_firstname`, b.`uom`, " +
    " b.`item_detail_code`, b.`item_detail_name`, c.`location_no`,  " +
    'SUM(c.acp) AS "acp", ' +
    // ' c.`acp` AS "acp", '+
    ' 0 AS "iss", 0 AS "adj",' +
    'SUM(c.acp) AS "blc", ' +
    // 'c.`acp` as "blc"' +
    ' a.`division_code` AS bisnis_unit, FALSE AS "isFiledSO","" AS sc_remark, ' +
    ' 0 AS sc_stock_qty, DATE(NOW()) AS sc_so_date, "" AS flag,"" as user ' +
    " FROM  `inv_item_non_production_rcv` a  " +
    " INNER JOIN `inv_item_non_production_rcv_item` b  ON a.`id` = b.`rcv_id`   " +
    " INNER JOIN `inv_item_non_production_wh` c  ON b.`id` = c.`rcv_detail_id`   " +
    " LEFT JOIN mst_item_non d  ON b.`item_detail_code` = d.`ITEM_CODE`   " +
    " LEFT JOIN purchase_request_non_production e  ON a.`pr_no` = e.`pr_no`  " +
    " LEFT JOIN `adm_mst_emp` f ON e.`requestor_code` = f.`EMP_CODE` " +
    ' WHERE a.`grn_status` = "Closed" ';
  // if (itemName!=''){ query=query+' AND b.`item_detail_code` = "'+itemdetailCode+'" ';}

  switch (tipe) {
    case "byloc":
      query += ` AND c.location_no = '${param}' `;

      break;
    case "byname":
      query += ` AND  b.item_detail_name like "%${param}%" or b.item_detail_name like '%${param}%'`;
      break;
    case "byarrdate":
      query += ` AND a.arrival_date = '${param}' `;
      break;
    case "byuser":
      query += ` AND f.EMP_FIRSTNAME like '%${param}%' `;
      break;

    default:
      loggers.error("getItemAwal: tipe tidak di masukan");
      cb([]);
      break;
  }

  if (limitIn != "") {
    query += ` AND b.item_detail_code in(${limitIn}) `;
  }
  //query += ` and a.division_code ='${bisnis_unit}' `;
  //  GROUP BY c.`location_no`
  query +=
    " GROUP BY c.`location_no`,a.`rcv_no`,b.`item_detail_code`  ORDER BY b.`item_detail_name`,a.`rcv_no`";

  //  console.log(query)
  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`getItemAwal -  ${error})`);
      // console.log(error);
      cb([]);
      // response.error(error, res);
    } else {
      cb(rows);
    }
  });
};

exports.checkTableSOEng = async function (
  item_detail_code,
  location,
  rcv_no,
  date,
  bisnis_unit,
  flag,
  cb
) {
  try {
    // console.log(item_detail_code)
    // console.log(location)
    // console.log(rcv_no)
    // console.log(date)
    // console.log(bisnis_unit)
    // console.log(flag)

    var dateStart, dateEnd;
    switch (flag) {
      case "StockOpname":
        var _date = this.setMonth(date);
        dateStart = _date.date_start;
        dateEnd = _date.date_end;
        break;
      case "CycleCount":
        var _date = this.setWeek(date);
        dateStart = _date.date_start;
        dateEnd = _date.date_end;
        break;
      default:
        dateStart = new Date();
        dateEnd = new Date();
        break;
    }

    var query = `SELECT sc_stock_qty,sc_remark,sc_so_date,bussines_unit AS bisnis_unit,flag,item_detail_code,create_user
             FROM stock_opname_sbe a WHERE a.rcv_no='${rcv_no}' 
             AND a.item_detail_code='${item_detail_code}' 
             AND a.location='${location}' 
             AND a.sc_so_date BETWEEN '${dateStart}' AND '${dateEnd}' `;

             // AND a.bussines_unit='${bisnis_unit}' AND flag='${flag}' 

			 
    // console.log(query)
    connection.query(query, function (error, rows, fields) {
      // console.log('masuk')
      if (error) {
        Logger.error(`checkTableSOEng -  ${error})`);
        // console.log(error);
        cb([]);
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`checkTableSOEng - catch - ${error}`);
    cb([]);
  }
};

exports.buildSoHandHeld = async function (
  offset,
  limit,
  param,
  tipe,
  bisnis_unit,
  flag,
  sc_so_date,
  cb
) {
  const waktu = `Time taken by buildSoHandHeld offset:${offset} limit:${limit} param:${param} tipe:${tipe}`;
  console.time(waktu);

  var arrPromise = [];
  ////untuk membuat limit
  const dataLimit = await new Promise((berhasil, gagal) => {
    this.setlimit(offset, limit, param, tipe, bisnis_unit, flag, (val) => {
      // Logger.info(`1 `);
      var forReturn = {};
      forReturn.filter = "";
      for (let index = 0; index < val.length; index++) {
        forReturn.filter += '"' + val[index].item_detail_code + '"';
        if (index < val.length - 1) {
          forReturn.filter += ",";
        }
      }
      forReturn.data = this.removeRDP(val);
      berhasil(forReturn);
    });
  });
  ////membuat isisan limit
  const builditemHead = await new Promise((success, failure) => {
    // location, itemName, arivalDate, reqUser,limitIn

    this.getItemAwal(param, tipe, dataLimit.filter, bisnis_unit, (value) => {
      if (value != null) {
        success(value);
      } else failure(0);
    });
  });
  await this.updateAllFromJson(builditemHead, "isFiledSO", false);
  ////membuat array promise
  for (let index = 0; index < builditemHead.length; index++) {
    // builld adj
    arrPromise.push(
      new Promise((resolve, reject) => {
        // console.log( 'adj'+index)
        this.findDataWHAdj(
          builditemHead[index].item_detail_code,
          builditemHead[index].rcv_no,
          builditemHead[index].location_no,
          tipe,
          (value) => {
            if (value != null) {
              var adjValue = this.getFromJson(value, "adj", 0);
              if (adjValue != 0) {
                var item_detail_code = this.getFromJson(
                  value,
                  "item_detail_code",
                  0
                );
                var rcv_no = this.getFromJson(value, "rcv_no", 0);
                var hasil = {
                  value: adjValue,
                  item_detail_code: item_detail_code,
                  index: index,
                  type: "adj",
                  rcv_no: rcv_no,
                };
                resolve(hasil);
              } else {
                resolve(null);
              }
            } else {
              reject(new Error(0));
            }
          }
        );
      })
    );

    // build iss
    arrPromise.push(
      new Promise((resolve, reject) => {
        // console.log( 'iss'+index)
        this.findDataWHIss(
          builditemHead[index].item_detail_code,
          builditemHead[index].rcv_no,
          builditemHead[index].location_no,
          tipe,
          (value) => {
            if (value != null) {
              var issValue = this.getFromJson(value, "iss", 0);
              if (issValue != 0) {
                var item_detail_code = this.getFromJson(
                  value,
                  "item_detail_code",
                  0
                );
                var rcv_no = this.getFromJson(value, "rcv_no", 0);
                var hasil = {
                  value: issValue,
                  item_detail_code: item_detail_code,
                  index: index,
                  type: "iss",
                  rcv_no: rcv_no,
                };
                resolve(hasil);
              } else {
                resolve(null);
              }
            } else {
              reject(new Error(0));
            }
          }
        );
      })
    );

    //cek data so
    arrPromise.push(
      new Promise((resolve, reject) => {
        try {
          this.checkTableSOEng(
            builditemHead[index].item_detail_code,
            builditemHead[index].location_no,
            builditemHead[index].rcv_no,
            sc_so_date,
            bisnis_unit,
            flag,
            (result) => {
              var value = result[0];
              // console.log(result)
              if (value != null) {
                // sc_stock_qty,sc_remark,sc_so_date,bussines_unit AS bisnis_unit,flag
                var hasil = {
                  item_detail_code: value.item_detail_code,
                  sc_stock_qty: value.sc_stock_qty,
                  sc_remark: value.sc_remark,
                  sc_so_date: value.sc_so_date,
                  bisnis_unit: value.bisnis_unit,
                  flag: value.flag,
                  index: index,
                  type: "cycle",
                  user: value.create_user,
                };
                resolve(hasil);
              } else {
                resolve(null);
              }
            }
          );
        } catch (error) {
          reject(error);
        }
      })
    );
  }
  // console.log(builditemHead)
  // console.log(arrPromise.length)

  ////ruuning array promise
  const hasil = await new Promise(async (success, failure) => {
    try {
      success(await Promise.all(arrPromise));
    } catch (error) {
      Logger.error(`buildSoHandHeld - catch - ${error}`);
    }
  });
  // console.log(hasil)

  ////update data jason from db
  for (let i = 0; i < hasil.length; i++) {
    if (hasil[i] != null) {
      var itemcode = this.getFromJson(
        builditemHead,
        "item_detail_code",
        hasil[i].index
      );
      var rcv_no = this.getFromJson(builditemHead, "rcv_no", hasil[i].index);
      // console.log('-------------------------')
      // console.log(rcv_no)
      // console.log(hasil[i].rcv_no)
      // console.log('-------------------------')

      //  var   b = builditemHead.filter(e => e === 1 || e === 2)
      //        .reduce((p,c) => p.concat(a.indexOf(c)),[]);

      if (itemcode == hasil[i].item_detail_code) {
        switch (hasil[i].type) {
          case "iss":
            if (rcv_no == hasil[i].rcv_no) {
              this.updateFromJson(
                builditemHead,
                "iss",
                hasil[i].value,
                hasil[i].index
              );
            }
            break;
          case "adj":
            if (rcv_no == hasil[i].rcv_no) {
              this.updateFromJson(
                builditemHead,
                "adj",
                hasil[i].value,
                hasil[i].index
              );
            }
            break;
          case "cycle":
            this.updateFromJson(
              builditemHead,
              "sc_stock_qty",
              hasil[i].sc_stock_qty,
              hasil[i].index
            );
            this.updateFromJson(
              builditemHead,
              "sc_remark",
              hasil[i].sc_remark,
              hasil[i].index
            );
            this.updateFromJson(
              builditemHead,
              "sc_so_date",
              hasil[i].sc_so_date,
              hasil[i].index
            );
            this.updateFromJson(
              builditemHead,
              "bisnis_unit",
              hasil[i].bisnis_unit,
              hasil[i].index
            );
            this.updateFromJson(
              builditemHead,
              "flag",
              hasil[i].flag,
              hasil[i].index
            );
            this.updateFromJson(
              builditemHead,
              "isFiledSO",
              true,
              hasil[i].index
            );
            this.updateFromJson(
              builditemHead,
              "user",
              hasil[i].user,
              hasil[i].index
            );

            break;

          default:
            Logger.error(`switch case type tidak ada sama ${hasil[i].type} `);
            break;
        }

        //fungsi hitung saldo akhir
        var acp = this.getFromJson(builditemHead, "acp", hasil[i].index);
        var adj = this.getFromJson(builditemHead, "adj", hasil[i].index);
        var iss = this.getFromJson(builditemHead, "iss", hasil[i].index);
        var blc = acp - iss + adj;
        if (itemcode == "PJ-GE-00518A") {
          console.log(acp);
        }

        this.updateFromJson(builditemHead, "blc", blc, hasil[i].index);
      } else {
        console.log(
          `item code tidak sama dengan head hasil=${hasil[i].item_detail_code} ${itemcode} ${hasil[i].rcv_no} ${rcvno} ${hasil[i].index}`
        );
      }
    }
  }

  // cb(builditemHead)

  //// gabung 2 jeson jadi 1 dan filter blc harus >0
  for (let index = 0; index < dataLimit.data.length; index++) {
    const element = dataLimit.data[index].item_detail_code;

    {
      dataLimit.data[index].detail = builditemHead.filter(
        ({ item_detail_code, blc }) => item_detail_code == element && blc > 0
      ); //
    }

    // if (dataLimit.data[index].detail.length <= 0) {
    //     this.deleteFromJson(dataLimit.data,index)
    //   }
  }

  // var end = performance.now();
  // var time = end - start;
  // Logger.info(time)

  console.timeEnd(waktu);
  // connection.end()

  // penambahan filter karena detail ada kemungkinan kosong saat di limit
  // cb(dataLimit.data.filter(function (val){return val!=null}))
  cb(dataLimit.data);
};

exports.testPage = async function (offset, limit, cb) {
  var query;
  query =
    " SELECT id,rcv_no,remark FROM `inv_item_non_production_rcv` LIMIT " +
    offset +
    "," +
    limit;

  // console.log(query)
  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`testPage -  ${error})`);
      // console.log(error);
      cb([]);
      // response.error(error, res);
    } else {
      cb(rows);
    }
  });
};

exports.findUser = async function (id, cb) {
  try {
    var query;
    query =
      ' SELECT *,"" AS bisnis_unit,"" AS flag FROM `user` WHERE id=' +
      id +
      " AND active=1";

    connection_telegram.query(query, function (error, rows, fields) {
      if (error) {
        Logger.error(`findUser -  ${error})`);
        // console.log(error);
        cb([]);
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`findUser - catch - ${error} `);
    // console.log(error)
  }
};

exports.queryUserRequestor = async function (rcv_no, cb) {
  var query;
  try {
    query =
      "SELECT b.`EMP_FIRSTNAME` AS value FROM `inv_item_non_production_rcv` a " +
      " LEFT JOIN `adm_mst_emp` b ON a.`requestor` = b.`EMP_CODE` WHERE a.`rcv_no`='" +
      rcv_no +
      "'";
    connection.query(query, function (error, rows, fields) {
      if (error) {
        Logger.error(`getUserRequestor -  ${error})`);
        // console.log(error);
        cb("");
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`getUserRequestor - catch -  ${error})`);
    cb(error);
  }
};

exports.queryArrivalDate = async function (rcv_no, cb) {
  var query;
  try {
    query =
      "SELECT a.`arrival_date` AS value FROM inv_item_non_production_rcv a  WHERE a.`rcv_no`='" +
      rcv_no +
      "'";
    connection.query(query, function (error, rows, fields) {
      if (error) {
        Logger.error(`getArrivalDate -  ${error})`);
        // console.log(error);
        // cb();
        return;
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`getArrivalDate - catch -  ${error})`);
    cb(error);
  }
};

exports.queryItemName = async function (rcv_no, item_detail_code, cb) {
  var query;
  try {
    if (item_detail_code == "") {
      query =
        " SELECT b.`item_detail_name`AS value FROM inv_item_non_production_rcv a " +
        " LEFT JOIN inv_item_non_production_rcv_item b ON a.`id` = b.`rcv_id`" +
        "  WHERE a.`rcv_no`= '" +
        rcv_no +
        "'  limit 1";
    } else {
      query =
        " SELECT b.`item_detail_name`AS value FROM inv_item_non_production_rcv a " +
        " LEFT JOIN inv_item_non_production_rcv_item b ON a.`id` = b.`rcv_id`" +
        "  WHERE a.`rcv_no`= '" +
        rcv_no +
        "' and b.item_detail_code= '" +
        item_detail_code +
        "' limit 1";
    }

    // console.log(query)
    connection.query(query, function (error, rows, fields) {
      if (error) {
        Logger.error(`getItemName -  ${error})`);
        // console.log(error);
        // cb();
        return;
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`getItemName - catch -  ${error})`);
    cb(error);
  }
};

exports.queryDataSC = async function (
  rcv_no,
  location,
  item_detail_code,
  sc_so_date,
  bisnisUnit,
  flag,
  cb
) {
  var query = `SELECT * FROM stock_opname_sbe WHERE rcv_no='${rcv_no}' and item_detail_code = '${item_detail_code}' 
                and location='${location}' and sc_so_date='${sc_so_date}' and flag='${flag}'`;// and bussines_unit='${bisnisUnit}'

  try {
    connection.query(query, function (error, rows, fields) {
      if (error) {
        Logger.error(`queryDataSC -  ${error})`);
        // console.log(error);
        // cb();
        return;
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`queryDataSC - catch - ${error}`);
    // console.log(error)
    cb(error);
  }
};

exports.insertDataSC = async function (fields, values, cb) {
  var query = `insert into stock_opname_sbe (${fields}) VALUES ?`;
  var forReturn = {};
  // console.log(fields)
  // console.log(values)
  try {
    connection.query(query, [[values]], function (error, rows, fields) {
      if (error) {
        Logger.error(`insertDataSC -  ${error})`);
        forReturn.status = false;
        forReturn.data = error;
        cb(forReturn);
        // response.error(error, res);
      } else {
        forReturn.status = true;
        forReturn.data = rows;
        cb(forReturn);
      }
    });
  } catch (error) {
    Logger.error(`insertDataSC -  ${error})`);
    forReturn.status = false;
    forReturn.data = error;
    cb(forReturn);
  }
};

exports.findDataHH = function (param, tipe, bisnisUnit, cb) {
  var query;

  switch (tipe) {
    case "byloc":
      query = ` SELECT  c.location_no as value,'${tipe}' as tipe FROM  inv_item_non_production_rcv a 
                LEFT JOIN inv_item_non_production_rcv_item b  ON a.id = b.rcv_id  
                LEFT JOIN inv_item_non_production_wh c  ON b.id = c.rcv_detail_id  
                WHERE a.division_code = '${bisnisUnit}' 
                AND c.location_no like '%${param}%'
                AND c.location_no IS NOT NULL
                GROUP BY c.location_no ORDER BY c.location_no`;

      break;
    case "byname":
      query = `SELECT a.item_detail_desc as value,'${tipe}' as tipe FROM mst_item_detail_non2_bu a 
               WHERE a.item_detail_desc like '%${param}%' and division_code = '${bisnisUnit}'`;
      break;
    case "byarrdate":
      query = ` select '' `;
      break;
    case "byuser":
      query = ` SELECT b.EMP_FIRSTNAME AS value,'${tipe}' AS tipe FROM purchase_request_non_production a
                LEFT JOIN adm_mst_emp b ON a.requestor_code=b.EMP_CODE
                WHERE b.EMP_FIRSTNAME LIKE '%${param}%'
                AND b.EMP_FIRSTNAME NOT LIKE '%Hafizh%'
                GROUP BY	 a.requestor_code `; //a.business_unit= '${bisnisUnit}' AND 
      break;

    default:
      loggers.error("findDataHH: tipe tidak di masukan");
      cb([]);
      break;
  }

  // console.log(query);
  connection.query(query, function (error, rows, fields) {
    if (error) {
      Logger.error(`findDataHH -  ${error})`);
      // forReturn.itemname = 0;
      // forReturn.itemcode = 'error querry find 1';
      // forReturn.msg = 'error query find 1';
    } else {
      // console.log(rows)
      cb(rows);
    }
  });
};

exports.queryShowAllUser = async function (cb) {
  var query = `SELECT * FROM user WHERE active=1 `;
  try {
    connection_telegram.query(query, function (error, rows, fields) {
      if (error) {
        Logger.error(`queryShowAllUser -  ${error})`);
        // console.log(error);
        // cb();
        return;
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`queryShowAllUser - catch error -  ${error})`);
    cb(error);
  }
};

exports.queryCheckUpdate = async function (version, cb) {
  var query = `select * from sbe_admin.list_app_version where active=1 
               and CAST(REPLACE(version,".","") AS UNSIGNED) > CAST(REPLACE("${version}",".","") AS UNSIGNED) `;
  // console.log(query)
  try {
    connection_telegram.query(query, function (error, rows, fields) {
      if (error) {
        Logger.error(`queryCheckUpdate -  ${error})`);
        // console.log(error);
        // cb();
        return;
        // response.error(error, res);
      } else {
        cb(rows);
      }
    });
  } catch (error) {
    Logger.error(`queryCheckUpdate - catch error -  ${error})`);
    cb(error);
  }
};
