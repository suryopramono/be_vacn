'use strict';

exports.ok = function(values, res) {
 var data = {
    // 'status': 200,
      'data': values
 };
  res.json(data);
  res.end();
};

exports.normal = function(values, res) {
  res.json(values);
  res.end();
};

exports.error = function(code,values, res) {
  res.status(code).send(values);
  res.end();
};