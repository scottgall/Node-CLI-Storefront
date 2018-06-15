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
        choices: ['View products for sale.', 'View low inventory.', 'Add to inventory.', 'Add new product.', '\n'],
        name: 'choice'
        }
      ]).then(choice => {
        switch (choice.choice) {
          case 'View products for sale.':
            viewProducts('SELECT * FROM products');
            break;
          case 'View low inventory.':
            viewProducts('SELECT * FROM products WHERE stock_quantity < 5')
            break;
          case 'Add to inventory.':
            inventoryInquire();
            break;
          case 'Add new product.':
            addProduct();
            break;
          case '\n':
            menu();
            break;
        }
      })
}

function viewProducts(x) {
  connection.query(x, function(err, res) {
    if (err) throw err;
    console.log(`\n${columnify(res)}\n`);
    continueQuestion();
  })
}

function inventoryInquire() {
  let query = 'SELECT * FROM products';
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log(`\n${columnify(res)}\n`);
  })
  inquirer
    .prompt({
      name: 'id',
      type: 'input',
      message: 'Enter the ID of the product you want to add inventory to.\n'
    }).then(choice => {
        let id = numberCheck(choice.id);
        if (!id) {
          console.log(`\nNot a valid item ID.\n`);
          return inventoryInquire();
        }
        itemCheck(id);
    }); 
}

function itemCheck(x) {
  let query = 'SELECT product_name, stock_quantity FROM products where item_id = ?';
  connection.query(query, x, function(err, res) {
    if (res.length === 0) {
      console.log(`\nNo products found with that ID.\n`);
      return inventoryInquire();
    }
    inventoryAmount(res[0].product_name, res[0].stock_quantity);
  });
}

function inventoryAmount(x, y) {
  inquirer
    .prompt({
      name: 'amount',
      type: 'input',
      message: `How many ${x}s would you like to add to inventory?`
    }).then(choice => {
      let amount = numberCheck(choice.amount);
      if (!amount) {
        console.log(`\nNot a valid amount.\n`);
        return inventoryAmount(x);
      }
      inventoryAdd(x, y, amount);
    })
}

function inventoryAdd(x, y, z) {
  let newInventory = y + z;
  let query = 'UPDATE products SET stock_quantity = ? WHERE product_name = ?';
  connection.query(query, [newInventory, x], function(err, res) {
    if (err) throw err;
    console.log(`\nYou added ${z} ${x}s. The new ${x} inventory is ${newInventory}.\n`);
    continueQuestion();
  })
}

function addProduct() {
  let departments = [];
  let query = 'SELECT department_name FROM departments';
  connection.query(query, function(err, res) {
    for (var i = 0; i < res.length; i++) {
      departments.push(res[i].department_name);
    }
  });
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Enter product name.',
        name: 'name'
      },
      {
        type: 'list',
        message: 'Enter department name.',
        choices: departments,
        name: 'department'
      }
    ]).then(choice => {
      addProductPrice(choice.name, choice.department);
    });
}

function addProductPrice(x, y) {
  inquirer
    .prompt({
      type: 'input',
      message: `Enter the price for ${x}.`,
      name: 'price'
    }).then(choice => {
      var regex  = /^\d+(?:\.\d{0,2})$/;
      var numStr = choice.price;
      if (!regex.test(numStr)) {
        console.log(`Not a valid price.`);
        return addProductPrice(x, y);
      }
      numStr = +numStr;
      addProductStock(x, y, numStr);
    });
}

function addProductStock(name, dept, price) {
  inquirer
    .prompt({
      type: 'input',
      message: `Enter the stock quantity for ${name}.`,
      name: 'stock'
    }).then(choice => {

      let amount = numberCheck(choice.stock);
      if (!amount) {
        console.log(`\nNot a valid quantity.\n`);
        return addProductStock(name, dept, price);
      }
      addProductDB(name, dept, price, amount);
    })  
}

function addProductDB(name, dept, price, amount) {
  let query = 'INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [name, dept, price, amount, 0], function(err, res) {
    if (err) throw err;
    console.log(`\n${name} added as new product in database.\n`);
    continueQuestion();
  })
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

function numberCheck(x) {
  let amount = Number(x)
  if ((!Number.isInteger(amount)) || amount < 1) {
    return false;
  }
  return amount;
}