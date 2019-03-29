let mysql = require('mysql');

let connection = mysql.createConnection({

	host:'localhost',

	user:'root',

	password:'',

	database:'burger_code'
});

connection.connect()
module.exports = connection