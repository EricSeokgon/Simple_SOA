var fs = require('fs');
var mysql = require('mysql');

function readFile(path, callback) {
	try {
		fs.readFile(require.resolve(path), 'utf8', callback);
	} catch (e) {
		callback(e);
	}
}

exports.handler = function(event, context) {
	console.log('Received event: ', JSON.stringify(event, null, 2));
	console.log('event.cardNo: ', event.cardNo);
	console.log('event.cardHolder: ', event.cardHolder);

	var cardNo = event.cardNo;
	var cardHolder = event.cardHolder;

	var conn = mysql.createConnection({
		host:'soa.cvvoqmioxbcp.us-east-1.rds.amazonaws.com',
		port:'3306',
		user:'soa_user',
		password:'password',
		database:'SOA_TEST'
	});
	console.log('Trying to connect Database.');
	conn.connect(function(err) {
		if (err) {
			console.error('Error connection: ' + err.stack);
			return;
		}

		console.log('Connected as id ' + conn.threadId);
	});

	console.log('Trying to insert data into Database.');
	var sql = 'INSERT INTO CARDINFO (cardNo, cardHolder) VALUES ("'+cardNo+'", "'+cardHolder+'")';
	var result = conn.query(sql, function(error, info) {
		if (error) {
			console.log(error.message);

			if (error.errno = 1062) {
				console.log("Already exists");
			}

			readFile('./unsuccessful.html', function(err, res) {
				console.log("Unsuccessful");
				context.succeed({"response":res});
			});
		} else {
			readFile('./successful.html', function(err, res) {
				console.log("Successful");
				console.log("Inserted data into database:", result.sql);
				context.succeed({"response":res});
			});
		}
	});
};