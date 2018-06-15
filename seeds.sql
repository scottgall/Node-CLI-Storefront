USE bamazon;

-- INITIAL DEPARTMENT ROWS
INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('produce', 2000, 0);

INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('meat', 1000, 0);

INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('frozen', 1200, 0);

INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('dairy', 700, 0);

INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('pharmacy', 600, 0);

INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('bakery', 5000, 0);

INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('alcohol', 1500, 0);

INSERT INTO departments (department_name, over_head_costs, product_sales)
VALUES ('grocery', 999, 0);

-- INITIAL PRODUCT ROWS
INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('avocado', 'produce', 1.88, 182, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('bacon', 'meat', 3.99, 55, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('sausage', 'produce', 1.80, 182, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('pizza', 'frozen', 4.99, 44, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('cheese', 'dairy', 3.00, 77, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('ibuprofen', 'pharmacy', 5.99, 60, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('bread', 'bakery', 2.99, 24, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('beer', 'alcohol', 8.99, 101, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('granola', 'grocery', 2.50, 200, 0);

INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ('cornmeal', 'grocery', 0.99, 420, 0);