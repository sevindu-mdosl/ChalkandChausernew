// var express = require("express");
var mysql = require("mysql");
// var bodyparser = require("body-parser");

// var app = express();

// app.use(bodyparser.urlencoded({ extended: true }));
// app.use(bodyparser.json());

var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "chalk&chauser",
    multipleStatements: true,



});

mysqlConnection.connect(function(err) {
    if (!err) {
        console.log("Dtabase Connected");

    } else {
        console.log("Database connection failed");
        console.log(err.message);
    }
});
module.exports = mysqlConnection;