const mysql = require("mysql2");

// Connect to database
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  // Your MySQL username,
  user: 'root',
  // Your MySQL password
  password: 'MySql2021!!',
  database: 'employee_tracker'
});

db.connect(function (err) { 
  if (err) throw err;
  console.log(`Welcome to the EMPLOYEE MANAGER`)

});



  module.exports = db;