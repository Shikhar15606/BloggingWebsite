const mysql = require("mysql");
const key = require('../key');

const mySqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: key.PASSWORD,
    database: "blog"
});
mySqlConnection.connect(err => {
    if (err) console.log(err);
    console.log("Database Connected!");
});
module.exports = mySqlConnection;