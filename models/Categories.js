let  connection = require('../config/database')

class Categories{

	static all (cb) {

		connection.query('SELECT * FROM categories',(err ,rows) => {
			
			if(err)throw err

			cb(rows)
		})
	}
}
module.exports = Categories