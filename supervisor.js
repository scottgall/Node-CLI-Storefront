let mysql = require('mysql');
let inquirer = require('inquirer');
var columnify = require('columnify')

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'bamazon'
});
  
connection.connect(function(err) {
  if (err) throw err;
  menu();
});

function menu() {
    inquirer
        .prompt([
          {
          type:'list',
          message: 'Choose an option:',
          choices: ['View product sales by department.', 'Create new department.', '\n'],
          name: 'choice'
          }
        ]).then(choice => {
          switch (choice.choice) {
            case 'View product sales by department.':
              viewSales();
              break;
            case 'Create new department.':
              newDepartmentName();
              break;
            case '\n':
              menu();
              break;
          }
        })
}

function viewSales() {
    let query = `SELECT departments.department_id,
                        departments.department_name, 
                        departments.over_head_costs, 
                        IFNULL(SUM(products.product_sales), 0) AS product_sales,
                        IFNULL(product_sales, 0) - departments.over_head_costs AS total_profit
                    FROM products 
                    RIGHT JOIN departments 
                    ON products.department_name = departments.department_name
                    GROUP BY departments.department_id,
                        departments.department_name,
                        departments.over_head_costs,
                        total_profit`;
    connection.query(query, function(err, res) {
        if (err) throw err;
        console.log(`\n${columnify(res)}\n`);
        return continueQuestion();
    });
}

function newDepartmentName() {
    inquirer
        .prompt({
            type: 'input',
            message: 'Enter department name.',
            name: 'name'
        }).then(choice => {
            newDepartmentOverhead(choice.name);
        })
}

function newDepartmentOverhead(name) {
    inquirer
    .prompt({
      type: 'input',
      message: `Enter the overhead costs for ${name}.`,
      name: 'price'
    }).then(choice => {
      var regex  = /^\d+(?:\.\d{0,2})$/;
      var numStr = choice.price;
      if (!regex.test(numStr)) {
        console.log(`\nNot a valid price(ex. 100.00).\n`);
        return newDepartmentOverhead(name);
      }
      numStr = +numStr;
      addDepartmentDB(name, numStr);
    });
}

function addDepartmentDB(name, overhead) {
    let query = 'INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)';
    connection.query(query, [name, overhead], function(err, res) {
        if (err) throw err;
        console.log(`\n${name} added as new department\n`);
        return continueQuestion();
    });
}

function continueQuestion() {
    inquirer
      .prompt({
        type:'list',
        message: 'Next',
        choices: ['menu', 'exit'],
        name: 'choice'
      }).then(choice => {
        switch (choice.choice) {
          case 'menu':
            menu();
            break;
          case 'exit':
            connection.end();
            break;
        }
      })
  }