
delete from incomings where supplier_id not in (select id from suppliers);
delete from outgoings where supplier_id not in (select id from suppliers);
delete from outgoings where customer_id not in (select id from customers);

delete from customer_trans where customer_id not in (select id from customers);
delete from supplier_trans where supplier_id not in (select id from suppliers);

delete from customers where deleted_at is not null and id < 500 ;