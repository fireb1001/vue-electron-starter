-- Empty All Data

delete from incomings;
delete from outgoings;
delete from products;
delete from receipts;
delete from receipt_details;
delete from customer_trans;
delete from customers;
delete from supplier_trans;
delete from suppliers;
delete from customers_daily;
delete from cashflow;
delete from dealer_trans;
delete from dealers;
delete from packaging;

-- Empty only daily data
delete from cashflow;
delete from incomings;
delete from outgoings;
delete from receipts;
delete from receipt_details;
delete from customer_trans;
delete from supplier_trans;