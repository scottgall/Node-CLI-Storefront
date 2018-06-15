let mysql = require('mysql');
let inquirer = require('inquirer');
var columnify = require('columnify');

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'bamazon'
});

connection.connect(function(err) {
  if (err) throw err;
  run();
});


// runs at start. logs products table data.
function run() {
  let query = 'SELECT * FROM products';
  connection.query(query, function(err, res) {
    var data = res;
    var columns = columnify(data, {columns: ['item_id', 'product_name', 'price']}); 
    console.log(`\nAVAILABLE ITEMS:\n${columns}\n`);
    purchaseInquire();
  });
}

// asks user if they want to make a purchase or exit.
function purchaseInquire() {
  inquirer
    .prompt({
      name: 'choice',
      type: 'list',
      choices: ['Make a purchase.', 'Exit store'],
      message: 'How can we help you?'
    }).then(choice => {
      switch (choice.choice) {
        case 'Make a purchase.':
          itemInquire();
          break;
        case 'Exit store':
          connection.end();
          break;
      }
    });
}

// asks user for id of product they want to purchase.
function itemInquire() {
  inquirer
    .prompt({
      name: 'productID',
      type: 'input',
      message: 'Enter the ID of the item you wish to purchase:'
    }).then(choice => {
        let productID = numberCheck(choice.productID);
        if (!productID) {
          console.log(`\nNot a valid item ID.\n`);
          return itemInquire();
        }
        itemCheck(productID);
    });
}

// searches for product with user's id.
function itemCheck(productID) {
  let query = 'SELECT product_name FROM products where item_id = ?';
  connection.query(query, productID, function(err, res) {
    if (res.length === 0) {
      console.log(`\nNo products found with that ID.\n`);
      return itemInquire();
    }
    let productName = res[0].product_name;
    console.log(`\nPRODUCT CHOSEN: ${productName}\n`);
    amountInquire(productName);
  });
}

// asks user for purchase quantity.
function amountInquire(productName) {
  inquirer
    .prompt({
      name: 'quantity',
      type: 'input',
      message: 'Enter purchase quantity:'
    }).then(choice => {
      let quantity = numberCheck(choice.quantity);
      if (!quantity) {
        console.log(`\nNot a valid quantity.\n`);
        return amountInquire(productName);
      }
      amountCheck(productName, quantity);
    });
}

// checks for stock availability.
function amountCheck(productName, quantity) {
  let query = 'SELECT stock_quantity FROM products WHERE product_name = ?';
  connection.query(query, productName, function(err, res) {
    let stock = res[0].stock_quantity;
    if (quantity <= stock) {
      fulfillOrder(productName, quantity, stock);
    } else {
      console.log(`\nSorry, not enough ${productName} in stock. We only have ${stock}.\n`);
      amountInquire(productName);
    }
  });
}

// updates product's stock in db. logs purchase total.
function fulfillOrder(productName, quantity, stock) {
  let newStock = stock - quantity;
  let query = 'UPDATE products SET ? WHERE ?';
  connection.query(query, [{stock_quantity: newStock}, {product_name: productName}], function(err, res) {
  });
  let query2 = 'SELECT price FROM products WHERE product_name = ?';
  connection.query(query2, productName, function(err, res) {
    let total = res[0].price * quantity;
    console.log(`\nPurchase complete!\nPRODUCT: ${productName}\nTOTAL: $${total}.\n`);
    updateSales(total, productName);
  });
}

// updates product's sales in db.
function updateSales(total, product) {
  let query = 'UPDATE products SET product_sales = product_sales + ? WHERE ?';
  connection.query(query, [total, {product_name: product}], function(err, res) {
    return continueQuestion();
  });
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
          run();
          break;
        case 'exit':
          connection.end();
          break;
      }
    })
}

// returns false if passed parameter is non-integer.
// returns passed parameter back if it's an integer.
function numberCheck(x) {
  let amount = Number(x);
  if ((!Number.isInteger(amount)) || amount < 1) {
    return false;
  }
  return amount;
}