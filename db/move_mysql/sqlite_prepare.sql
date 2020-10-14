# SELECT * FROM customer_trans WHERE outgoing_id NOT IN (SELECT id FROM outgoings); 
# SELECT * FROM customer_trans WHERE cashflow_id NOT IN (SELECT id FROM cashflow);

# cashflow
update cashflow set customer_id = null where customer_id not in (select id from customers);
update cashflow set supplier_id = null where supplier_id not in (select id from suppliers);
update cashflow set dealer_id = null where dealer_id not in (select id from dealers);


# customer_trans
delete from customer_trans where customer_id not in (select id from customers);
UPDATE customer_trans SET cashflow_id = NULL WHERE cashflow_id NOT IN (SELECT id FROM cashflow);
UPDATE customer_trans SET outgoing_id = NULL WHERE outgoing_id NOT IN (SELECT id FROM outgoings);

# customers_daily
delete from customers_daily where customer_id not in (select id from customers);

# supplier_trans
delete from supplier_trans where supplier_id not in (select id from suppliers);

# dealer_trans
delete from dealer_trans where dealer_id not in (select id from dealers);

# select * from incomings where supplier_id not in (select id from suppliers);

# products 
update products set product_rahn = null where product_rahn = '';
update products set weight_deduct = null where weight_deduct = '';
update products set cust_mashal = null where cust_mashal = '';

# trans_types
update trans_types set optional = null where optional = '';
update trans_types set map_cashflow = null where map_cashflow = '';
update trans_types set map_customer_trans = null where map_customer_trans = '';
update trans_types set sum_rahn = null where sum_rahn = '';
update trans_types set flags = null where flags = '';
update trans_types set map_packaging = null where map_packaging = '';