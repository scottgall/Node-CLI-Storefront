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

function run() {
  let query = 'SELECT * FROM products';
  connection.query(query, function(err, res) {
    var data = res;
    var columns = columnify(data, {columns: ['item_id', 'product_name', 'price']}); 
    console.log(`\nAVAILABLE ITEMS:\n${columns}\n`);

    purchaseInquire();
  })
}

function numberCheck(x) {
  let amount = Number(x);
  if ((!Number.isInteger(amount)) || amount < 1) {
    return false;
  }
  return amount;
}

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
    })
}

function itemInquire() {
  inquirer
    .prompt({
      name: 'id',
      type: 'input',
      message: 'Enter the ID of the item you wish to purchase:'
    }).then(choice => {
        let id = numberCheck(choice.id);
        if (!id) {
          console.log(`\nNot a valid item ID.\n`);
          return itemInquire();
        }
        itemCheck(id);
    });
}

function itemCheck(x) {
    let query = 'SELECT product_name FROM products where item_id = ?';
    connection.query(query, x, function(err, res) {
      if (res.length === 0) {
        console.log(`\nNo products found with that ID.\n`);
        return itemInquire();
      }
      let product = res[0].product_name;
      console.log(`\nPRODUCT CHOSEN: ${product}\n`);
      amountInquire(product);
    });
}

function amountInquire(product) {
    inquirer
      .prompt({
        name: 'quantity',
        type: 'input',
        message: `Enter the quantity you would like to purchase:`
      }).then(choice => {
        let quantity = numberCheck(choice.quantity);
        if (!quantity) {
          console.log(`\nNot a valid quantity.\n`);
          return amountInquire(product);
        }
        amountCheck(product, quantity);
      });
}

function amountCheck(product, amount) {
  let query = 'SELECT stock_quantity FROM products WHERE product_name = ?';
  connection.query(query, product, function(err, res) {
    if (amount <= res[0].stock_quantity) {
      fulfillOrder(product, amount, res[0].stock_quantity);
    } else {
      console.log(`Sorry. We only have ${res[0].stock_quantity} ${product}'s left in stock.`);
      amountInquire(product);
    }
  });
}

function fulfillOrder(product, amount, stock) {
  let newStock = stock - amount;
  let query = 'UPDATE products SET ? WHERE ?';
  connection.query(query, [{stock_quantity: newStock}, {product_name: product}], function(err, res) {
  });
  let query2 = 'SELECT price FROM products WHERE product_name = ?';
  connection.query(query2, product, function(err, res) {
    let total = res[0].price * amount;
    console.log(`Your total is $${total}.`);
    updateSales(total, product);
  });
}

function updateSales(total, product) {
  let query = 'UPDATE products SET product_sales = product_sales + ? WHERE ?';
  connection.query(query, [total, {product_name: product}], function(err, res) {
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
          run();
          break;
        case 'exit':
          connection.end();
          break;
      }
    })
}