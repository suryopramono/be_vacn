'use strict';
var response = require('./res');
var fungsi = require('./fungsi');
const con = require('./conn');
const Logger = require('./lib/logger')
const present = require('present')



exports.index = function (req, res) {
  response.ok("Server Node JS has been Runing on:", res)

};

exports.cek_koneksi = function (req, res) {
  var index = {
    "msg": "Connected",
    "success": true,
    "time": Date.now().toString()
  };

  response.normal(index, res);

};

exports.ReadQRMRP = async function (req, res) {
  var start = performance.now();
  var item_detail_code = req.body.itemdetailcode;
  var rcv_no = req.body.rcvno;
  var loc_no = req.body.locno;
  var devices = 'qr';

  const waktu = `Time taken by ReadQRMRP item detail code:${item_detail_code} rcv_no: ${rcv_no} loc_no: ${loc_no} devices: ${devices}  `

  const hasil = await new Promise((success, failure) => {
    fungsi.getEOH(item_detail_code, rcv_no, loc_no, devices, (value) => {
      try {
        if ((value != null) && (value.toString().trim() != '')) {
          var data = {
            "msg": "Success",
            "success": true,
            "time": Date.now().toString(),
            "data": value
          }
          success(data);
        } else {
          var data = {
            "msg": "Data is empty",
            "success": false,
            "time": Date.now().toString()
          }
          success(data);
        }

      } catch (error) {
        var data = {
          "msg": error,
          "success": false,
          "time": Date.now().toString()
        }
        failure(data);
      }

    });
  });
  response.normal(hasil, res);

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)
};

exports.FindItem = async function (req, res) {
  var start = performance.now();
  var itemName = req.body.item_name;
  var devices = req.body.devices;

  const waktu = `Time taken by FindItem itemName:${itemName} devices: ${devices}  `

  fungsi.findData(itemName, devices, (val) => {
    response.normal(val, res);
  });

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)
}

exports.getEOH = async function (req, res) {
  var start = performance.now();
  var item_detail_code = req.body.item_detail_code;
  var devices = req.body.devices;

  const waktu = `Time taken by getEOH item_detail_code:${item_detail_code} devices: ${devices}  `

  // Logger.info(devices);
  const hasil = await new Promise((success, failure) => {
    fungsi.getEOH(item_detail_code, '', '', devices, (value) => {
      if (value != null) {
        success(value);
      } else
        failure(0);
    });
  });

  response.normal(hasil, res);

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)

}


exports.SOHandHeld = async function (req, res) {
  var start = performance.now();
  var offset = req.params.offset;
  var limit = req.params.limit;
  var param = req.body.param;
  var tipe = req.body.tipe;
  var bisnisUnit = req.body.bisnis_unit;
  var flag = req.body.flag; // isisan nya seperti cycleCount atau StockOpname
  var sc_so_date = req.body.sc_so_date;

  const waktu = `Time taken by buildSoHandHeld offset:${offset} limit: ${limit} param: ${param} tipe: ${tipe} bisnisUnit: ${bisnisUnit} flag: ${flag} sc_so_date: ${sc_so_date} `

  const hasil = await new Promise((success, failure) => {
    fungsi.buildSoHandHeld(offset, limit, param, tipe, bisnisUnit, flag, sc_so_date, (value) => {
      try {
        if (value != null) {
          var data = {
            "msg": "Success",
            "success": true,
            "time": Date.now().toString(),
            "data": value
          }
          success(data);
        } else
          var data = {
            "msg": "Data is empty",
            "success": false,
            "time": Date.now().toString()
          }
        success(data);
      } catch (error) {
        var data = {
          "msg": error,
          "success": false,
          "time": Date.now().toString()
        }
      }
      failure(data)
    });
  });
  response.normal(hasil, res)

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)


}




exports.testPage = async function (req, res) {
  var data = req.body;
  // var offset = req.params.offset;
  // var limit = req.params.limit;
  // fungsi.testPage(offset, limit, (value) => {
  //   // var data= value
  //   var data = {
  //     "msg": "Success",
  //     "success": true,
  //     "time": Date.now().toString(),
  //     "data": value
  //   }
  //   response.normal(data, res)
  // })
  //   var xx = {}
  //   xx.data = 'abc abc abc"'
  // var strfy=JSON.stringify(xx)
  //   console.log(strfy)

  //   var js = JSON.parse(strfy)
  //   console.log(js.data)
  //   response.normal(js.data,res)


  // await  fungsi.checkTableSOEng('PJ-GE-00002A', 'EPD-R02-TEMP', 'BPBS/2008/011','2022-07-05', 'SanbeEPD', 'StockOpname', (value) => {
  //     response.normal(value,res)
  //   })

  // var date = new Date('2022-07-05');
  //  var x = date.getDate()
  //   console.log(x)

  // fungsi.checkTableSOEng("PJ-MC-00013A",
  //   "EPD-R01-I-3-4", '0001/EPD/SSF/W46/01/22', '2022-07-05', 'SanbeEPD', 'CycleCount', (result) => { 
  //     var value = result[0]
  //     console.log(result)
  //     if (value != null) { 
  //       console.log('masuk')
  //     }
  //    response.normal(value,res)
  // })


  // (item_detail_code, location, rcv_no, date, bisnis_unit, flag, cb)


  const w = await new Promise((success, failure) => {
    fungsi.checkTableSOEng("PJ-MC-00013A",
      "EPD-R01-I-3-4", '0001/EPD/SSF/W46/01/22', '2022-07-05', 'SanbeEPD', 'CycleCount', (result) => {

        var value = result[0]
        console.log(result)

        if (value != null) {
          // sc_stock_qty,sc_remark,sc_so_date,bussines_unit AS bisnis_unit,flag 
          console.log(value.sc_stock_qty)
          var hasil = {
            // "item_detail_code": item_detail_code,
            "sc_stock_qty": value.sc_stock_qty,
            "sc_remark": value.sc_remark,
            "sc_so_date": value.sc_so_date,
            "bisnis_unit": value.bisnis_unit,
            "flag": value.flag,
            // "index": index,
            "type": "cycle"
          }
          console.log(hasil)
          success(hasil)

        } else {
          success(null)
        }

      })
  })

  response.normal(w, res)




}

exports.decode = async function (req, res) {
  var start = performance.now();
  require('dotenv').config();
  var jwt = require('jsonwebtoken');

  const {
    KEY_JWT
  } = process.env;
  let jwtPayload;
  var data = req.body.data;
  const waktu = `Time taken by decode / Login  body:${data} `

  try {
    jwtPayload = jwt.verify(data, KEY_JWT)
    fungsi.findUser(jwtPayload.id, (value) => {
      if (value.length > 0) {
        var data = {
          "msg": "Success",
          "success": true,
          "time": Date.now().toString(),
          "data": value[0]
        }
        response.normal(data, res)
      } else {
        var err_auth = {
          "msg": "data not found on database",
          "success": false,
          "time": Date.now().toString()
        };
        response.normal(err_auth, res);
      }
    })
    // console.log(jwtPayload)


  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    var err_auth = {
      "msg": "data invalid",
      "success": false,
      "time": Date.now().toString()
    };

    response.error(401, err_auth, res);
  }

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)

}


exports.getLockupData = async function (req, res) {
  var start = performance.now();
  var rcv_no = req.body.rcv_no;
  var item_detail_code = (typeof req.body.item_detail_code=='undefined')?'':req.body.item_detail_code;
  var tipe = req.body.tipe;

  const waktu = `Time taken by getLockupData  rcv_no:${rcv_no} item_detail_code:${item_detail_code} tipe: ${tipe}`

  try {

    const hasil = await new Promise((success, failure) => {
      switch (tipe) {
        case "requestor_name":
          fungsi.queryUserRequestor(rcv_no, (value) => {
            success(value)
          })
          break;
        case "item_name":
          fungsi.queryItemName(rcv_no,item_detail_code, (value) => {
            success(value)
          })
          break;
        case "arrival_date":
          fungsi.queryArrivalDate(rcv_no, (value) => {
            success(value)
          })
          break;
        default:
          failure(0)
          break;
      }
    })

    if (hasil.length > 0) {
      var data = {
        "msg": "Success",
        "success": true,
        "time": Date.now().toString(),
        "data": hasil[0].value
      }
    } else {
      var data = {
        "error_msg": "Data Not Found \n " + rcv_no,
        "success": false,
        "time": Date.now().toString(),
        "data": null
      }
    }

    // console.log(data);
    response.normal(data, res)

  } catch (error) {
    var err_auth = {
      "error_msg": error,
      "success": false,
      "time": Date.now().toString(),
      "data": null
    };

    response.error(401, err_auth, res);
  }

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)


}

exports.getDataSC = async function (req, res) {
  var start = performance.now();
  var rcv_no = req.body.rcv_no;
  var location = req.body.location;
  var item_detail_code = req.body.item_detail_code;
  var sc_so_date = req.body.sc_so_date;
  var bisnisUnit = req.body.bisnis_unit;
  var flag = req.body.flag; // isisan nya seperti cycleCount atau StockOpname

  // console.log(`${rcv_no} ${location} ${item_detail_code} ${sc_so_date}`)

  const waktu = `Time taken by getDataSC  rcv_no:${rcv_no} location: ${location} item_detail_code: ${item_detail_code} sc_so_date: ${sc_so_date} bisnisUnit: ${bisnisUnit} flag:${flag} `

  try {
    const hasil = await new Promise((success, failure) => {
      fungsi.queryDataSC(rcv_no, location, item_detail_code, sc_so_date, bisnisUnit, flag, (value) => {
        success(value)
      })
    })

    if (hasil.length > 0) {
      var data = {
        "msg": "Success",
        "success": true,
        "time": Date.now().toString(),
        "data": hasil[0]
      }
    } else {
      var data = {
        "msg": "Data So Kosong",
        "success": true,
        "time": Date.now().toString(),
        "data": null
      }
    }

    // console.log(data);
    response.normal(data, res)

  } catch (error) {
    var err_auth = {
      "error_msg": error,
      "success": false,
      "time": Date.now().toString(),
      "data": null
    };

    response.error(401, err_auth, res);
  }

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)

}

exports.addSCData = async function (req, res) {
  var start = performance.now();
  var data = req.body;
  fungsi.deleteFromJson(data, 'id')
  fungsi.deleteFromJson(data, 'timestamp')

  const waktu = `Time taken by addSCData  body:${data} `


  try {
    const jsonEdited = await new Promise((success, failure) => {
      fungsi.beforeBuildQuery(data, (value) => {
        success(value)
      })
    })

    const resultInsert = await new Promise((success, failure) => {
      fungsi.insertDataSC(jsonEdited.only_keys, jsonEdited.only_value, (result) => {
        success(result)
      })
    })

    var data = {
      "msg": (resultInsert.status) ? "Insert Data Success" : "Terjadi Kesalahan",
      "success": resultInsert.status,
      "time": Date.now().toString(),
      "data": null
    }

    response.normal(data, res)
  } catch (error) {
    var err_auth = {
      "error_msg": error,
      "msg": "Error on Backend Please call 1075",
      "success": false,
      "time": Date.now().toString(),
      "data": null
    };

    response.error(401, err_auth, res);

  }

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)


}

exports.AutoCompilteHH = async function (req, res) {
  var start = performance.now();
  var param = req.body.param;
  var tipe = req.body.tipe;
  var bisnisUnit = req.body.bisnis_unit;

  const waktu = `Time taken by AutoCompilteHH param:${param}  tipe: ${tipe} bisnisUnit: ${bisnisUnit}  `

  try {
    const hasil = await new Promise((success, failure) => {
      fungsi.findDataHH(param, tipe, bisnisUnit, (val) => {
        // console.log(val)
        success(val);
      });
    })

    if (hasil.length > 0) {
      var data = {
        "msg": "Success",
        "success": true,
        "time": Date.now().toString(),
        "data": hasil
      }
    } else {
      var data = {
        "msg": "Data Auto Complite Kosong",
        "success": true,
        "time": Date.now().toString(),
        "data": null
      }
    }

    // console.log(data);
    response.normal(data, res)

  } catch (error) {
    var err_auth = {
      "error_msg": error,
      "success": false,
      "time": Date.now().toString(),
      "data": null
    };

    response.error(401, err_auth, res);
  }

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)
}

exports.ShowAllUser = async function (req, res) {
  var start = performance.now();

  const waktu = `Time taken by ShowAllUser `

  try {
    const hasil = await new Promise((success, failure) => {
      fungsi.queryShowAllUser( (val) => {
        // console.log(val)
        success(val);
      });
    })

    if (hasil.length > 0) {
      var data = {
        "msg": "Success",
        "success": true,
        "time": Date.now().toString(),
        "data": hasil
      }
    } else {
      var data = {
        "msg": "Data Auto Complite Kosong",
        "success": true,
        "time": Date.now().toString(),
        "data": null
      }
    }

    // console.log(data);
    response.normal(data, res)

  } catch (error) {
    var err_auth = {
      "error_msg": error,
      "success": false,
      "time": Date.now().toString(),
      "data": null
    };

    response.error(401, err_auth, res);
  }

  var end = performance.now();
  var time = end - start;
  Logger.info(`${waktu} - ${time} ms`)
}

exports.checkUpDateApps = async function (req, res) {
  var start = performance.now();
  var version = req.params.version;
  const waktu = `Time taken by checkUpDateApps `

  try{
  const hasil = await new Promise((success, failure) => {
    fungsi.queryCheckUpdate(version, (val) => {
      // console.log(val)
      success(val);
    });
  })

  if (hasil.length > 0) {
    var data = {
      "msg": "Update Available",
      "success": true,
      "time": Date.now().toString(),
      "data": hasil[0]
      }
    }
    else {
      var data = {
        "msg": "No Update Available",
        "success": true,
        "time": Date.now().toString(),
        "data":null
      }
    }

    response.normal(data, res)
    
} catch (error) {
  var err_auth = {
    "error_msg": error,
    "success": false,
    "time": Date.now().toString(),
  };

  response.error(401, err_auth, res);
}

var end = performance.now();
var time = end - start;
Logger.info(`${waktu} - ${time} ms`)
}