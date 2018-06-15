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

// menu prompt at start.
function menu() {
  console.log(`\nHELLO MANAGER.`);
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

// displays all values from products table.
function viewProducts(query) {
  connection.query(query, function(err, res) {
    if (err) throw err;
    if (res.length === 0) {
      console.log(`\nno low stock\n`);
      return continueQuestion();
    }
    console.log(`\n${columnify(res)}\n`);
    continueQuestion();
  });
}

// displays products and asks for ID of product user wishes to increase inventory on.
function inventoryInquire() {
  let query = 'SELECT * FROM products';
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log(`\n${columnify(res)}\n`);
  })
  inquirer
    .prompt({
      name: 'productID',
      type: 'input',
      message: 'Enter the ID of the product you want to add inventory to.\n'
    }).then(choice => {
        let productID = numberCheck(choice.productID);
        if (!productID) {
          console.log(`\nNot a valid item ID.\n`);
          return inventoryInquire();
        }
        itemCheck(productID);
    }); 
}

// checks if product id exists in products table.
function itemCheck(productID) {
  let query = 'SELECT product_name, stock_quantity FROM products where item_id = ?';
  connection.query(query, productID, function(err, res) {
    if ((res.length === 0) || (err)) {
      console.log(`\nNo products found with that ID.\n`);
      return inventoryInquire();
    }
    inventoryAmount(res[0].product_name, res[0].stock_quantity);
  });
}

// asks user for quantity to add to stock.
function inventoryAmount(productName, stock) {
  inquirer
    .prompt({
      name: 'quantity',
      type: 'input',
      message: `Enter quantity of ${productName} you would like to add to inventory?`
    }).then(choice => {
      let quantity = numberCheck(choice.quantity);
      if (!quantity) {
        console.log(`\nNot a valid amount.\n`);
        return inventoryAmount(productName, stock);
      }
      inventoryAdd(productName, stock, quantity);
    })
}

// adds inventory to product.
function inventoryAdd(productName, stock, quantity) {
  let newInventory = stock + quantity;
  let query = 'UPDATE products SET stock_quantity = ? WHERE product_name = ?';
  connection.query(query, [newInventory, productName], function(err, res) {
    if (err) throw err;
    console.log(`\nNew ${productName} inventory: ${newInventory}\n`);
    continueQuestion();
  })
}

// asks user for new product and department name
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
        name: 'productName'
      },
      {
        type: 'list',
        message: 'Enter department name.',
        choices: departments,
        name: 'department'
      }
    ]).then(choice => {
      addProductPrice(choice.productName, choice.department);
    });
}

// asks user for new product price.
function addProductPrice(productName, department) {
  inquirer
    .prompt({
      type: 'input',
      message: `Enter the price for ${productName}.`,
      name: 'price'
    }).then(choice => {
      var regex  = /^\d+(?:\.\d{0,2})$/;
      var numStr = choice.price;
      if (!regex.test(numStr)) {
        console.log(`Not a valid price.`);
        return addProductPrice(productName, department);
      }
      numStr = +numStr;
      addProductStock(productName, department, numStr);
    });
}

// asks user for new product stock quantity.
function addProductStock(productName, department, price) {
  inquirer
    .prompt({
      type: 'input',
      message: `Enter ${productName} stock quantity.`,
      name: 'stock'
    }).then(choice => {
      let stock = numberCheck(choice.stock);
      if (!stock) {
        console.log(`\nNot a valid quantity.\n`);
        return addProductStock(productName, department, price);
      }
      addProductDB(productName, department, price, stock);
    })  
}

// adds new product to products table
function addProductDB(productName, department, price, stock) {
  let query = 'INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [productName, department, price, stock, 0], function(err, res) {
    if (err) throw err;
    console.log(`\nNew product added: ${productName}\n`);
    continueQuestion();
  })
}

// asks user to continue or exit.
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
    });
}

// returns false if passed parameter is non-integer.
// returns passed parameter back if it's an integer.
function numberCheck(x) {
  let amount = Number(x)
  if ((!Number.isInteger(amount)) || amount < 1) {
    return false;
  }
  return amount;
}