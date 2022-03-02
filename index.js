const db = require("./db/connection")
require("console.table");
const inquirer = require("inquirer");


// initialize task prompts
const initPrompts = () => {
  inquirer.prompt({
    type: "list",
    name: "task",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "View All Departments",
      "View All Roles",
      "Add an Employee",
      "Add a Department",
      "Add a Role",
      "Update Employee Role",
      "Exit"]
  })
  // function calls based on choices
    .then(function ({ task }) {
      switch (task) {

        case "View All Employees":
          viewAllEmployees();
          break;

        case 'View All Departments':
          viewDepts();
          break;

        case 'View All Roles':
          viewRoles();
          break;

        case 'Add a Department':
          addDept();
          break;

        case 'Add a Role':
          addRole();
          break;

        case 'Add an Employee':
          addEmp();
          break;

        case 'Update Employee Role':
          updateEmpRole();
          break;

        case 'Exit':
          process.exit()
      }
    });
}

// functions

const viewAllEmployees = () => {

  // for last LEFT JOIN:  <table> <new column name> ON <new column name>.<table PK id> = <table>.<field>
  console.log("Viewing All Employees\n");
  var query =
    `SELECT employees.id, employees.first_name, employees.last_name, roles.title,
    roles.salary, depts.dept_name AS department, CONCAT(manager.first_name,' ',manager.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON roles.id = employees.role_id  
    LEFT JOIN depts ON roles.dept_id = depts.id
    LEFT JOIN employees manager ON manager.id = employees.manager_id
    ORDER BY employees.id;
    `

  db.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees viewed!");
    initPrompts();
  });
}

const viewDepts = () => {

  console.log("Viewing Departments\n");
  var query =
    `SELECT * FROM depts`

  db.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Departments viewed!");
    initPrompts();
  });
}

const viewRoles = () => {

  console.log("Viewing All Roles\n");
  var query =
    `SELECT roles.id, roles.title, depts.dept_name AS department, roles.salary
    FROM roles
    JOIN depts ON roles.dept_id = depts.id
    ORDER BY roles.id;
    `

  db.query(query, function (err, res) { 
    if (err) throw err;
    console.table(res);
    console.log("Roles viewed!");
    initPrompts();
  });
}

const addDept = () => {

  console.log("Add a Department\n");

  inquirer.prompt([
    {
      name: "dept_name",
      type: "input",
      message: "Enter Department Name"
    }
  ]).then((answer) => {

    db.query(`INSERT INTO depts (dept_name) VALUES (?)`, [answer.dept_name], (err, res) => {
      if (err) throw err;
      console.log('The new department was successfully added!');

      db.query(`SELECT * FROM depts`, (err, res) => {
        if (err) {
          res.status(500).json({ error: err.message })
          return;
        }
        console.table(res);
        initPrompts()
      });
    });
  });
};

const addRole = () => {

  console.log("Add a Role\n");

  db.query(`SELECT * FROM depts`, (err, res) => {
    var departmentChoices = res.map(department => ({
      name: department.dept_name,
      value: department.id
    }))

    inquirer.prompt([
      {
        name: "title",
        type: "input",
        message: "Please enter the title of role."
      },
      {
        name: "salary",
        type: "input",
        message: "Please enter the role salary (decimal)"
      },
      {
        name: "dept_id",
        type: "list",
        message: "Please choose a department for the role.",
        choices: departmentChoices
      }
    ]).then((answer) => {

      db.query(`INSERT INTO roles (title, salary, dept_id) VALUES (?, ?, ?)`,
        [answer.title, answer.salary, answer.dept_id], (err, res) => {

          if (err) throw err;
          console.log('The new role was successfully added!');

          db.query(`SELECT roles.id, roles.title, depts.dept_name AS department, roles.salary
          FROM roles
          JOIN depts ON roles.dept_id = depts.id
          ORDER BY roles.id;
          `, (err, res) => {
            if (err) {
              res.status(500).json({ error: err.message })
              return;
            }
            console.table(res);
            initPrompts()
          });
        });
    });
  })
};

const addEmp = () => {

  console.log("Add an Employee\n");

  db.query(`SELECT * FROM roles ORDER BY title`, (err, res) => {
    var roleChoices = res.map(role => ({
      name: role.title,
      value: role.id
    }))

    db.query(`SELECT * FROM employees`, (err, res) => {
      var mgrChoices = res.map(manager => ({
        name: manager.first_name + " " + manager.last_name,
        value: manager.id
      }))

      inquirer.prompt([
        {
          name: "first_name",
          type: "input",
          message: "Please enter the NEW EMPLOYEE first name."
        },
        {
          name: "last_name",
          type: "input",
          message: "Please enter the NEW EMPLOYEE last name."
        },
        {
          name: "role_id",
          type: "list",
          message: "Please choose a ROLE for the NEW EMPLOYEE.",
          choices: roleChoices
        },
        {
          name: "manager_id",
          type: "list",
          message: "Please choose a Manager for the NEW EMPLOYEE.",
          choices: mgrChoices
        }
      ])

        .then((answer) => {

          db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
            [answer.first_name, answer.last_name, answer.role_id, answer.manager_id], (err, res) => {

              if (err) throw err;
              console.log('The new employee was successfully added!');

              db.query(`SELECT employees.id, employees.first_name, employees.last_name, roles.title,
                roles.salary, depts.dept_name AS department, CONCAT(manager.first_name,' ',manager.last_name) AS manager
                FROM employees
                LEFT JOIN roles ON roles.id = employees.role_id  
                LEFT JOIN depts ON roles.dept_id = depts.id
                LEFT JOIN employees manager ON manager.id = employees.manager_id
                ORDER BY employees.id;`, (err, res) => {
                if (err) {
                  res.status(500).json({ error: err.message })
                  return;
                }
                console.table(res);
                initPrompts()
              })
            })
        })
    })
  })
};

const updateEmpRole = () => {

  console.log("Select an Employee to Update.\n");

  db.query(`SELECT * FROM employees ORDER BY last_name`, (err, res) => {
    var empChoices = res.map(emp => ({
      name: emp.first_name + " " + emp.last_name,
      value: emp.id
    }))

    db.query(`SELECT * FROM roles ORDER BY title`, (err, res) => {
      var roleChoices = res.map(role => ({
        name: role.title,
        value: role.id
      }))

      inquirer.prompt([
        {
          name: "employee",
          type: "list",
          message: "Please choose an employee who's roll you wish to update.",
          choices: empChoices
        },
        {
          name: "role",
          type: "list",
          message: "Please choose a roll you wish to update for the employee.",
          choices: roleChoices
        }
      ])
        .then((answer) => {
          db.query(`UPDATE employees SET role_id = ${answer.role} WHERE id = ${answer.employee}`, (err, res) => {

              if (err) throw err;
              console.log('Update to employee role was successful!');

              db.query(`SELECT employees.id, employees.first_name, employees.last_name, roles.title,
              roles.salary, depts.dept_name AS department, CONCAT(manager.first_name,' ',manager.last_name) AS manager
              FROM employees
              LEFT JOIN roles ON roles.id = employees.role_id  
              LEFT JOIN depts ON roles.dept_id = depts.id
              LEFT JOIN employees manager ON manager.id = employees.manager_id
              ORDER BY employees.last_name;`, (err, res) => {
              if (err) {
                res.status(500).json({ error: err.message })
                return;
              }
              console.table(res);
              initPrompts()
            })
            
            })
        })
    })
  })
};
initPrompts()