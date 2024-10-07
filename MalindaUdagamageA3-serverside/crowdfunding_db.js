const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Manjitha@123',
  database: 'crowdfunding_db'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the crowdfunding_db!');
});
