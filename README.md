# ShaderLite

## Adding bootstrap

- npm i bootstrap-vue -s 
- add bootstrap scripts to app.js
```
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
```

## Get knex and bookshelf working

- npm i mssql -s
- add Object.defineProperty(knex, "name", { value: "knex" }) to avoid knex name problem

## changes to background.js

- Add window.maximize()
- Changing icon for serve in background.js main window BrowserWindow config `icon:  'assets/logo.png'`

## Adding sqlite3
```
npm install --save-dev electron-builder
npm install --save sqlite3
npm run postinstall
// You need to remove --arch=ia32 once
```

---

## Business Constrains (TO REMOVE)

- Fixed sell_comm per product / or flexi receipts
- Products can't be edited

## Business TODOS

- يجب تحصيل خصم التاجر في النقدية 
- مراجعة النوالين مع الفواتير
- what else

## Tools And Resources

- SQLiteDatabaseBrowserPortable

## Manual migration
mysql -u root -p daily_mngr < {FILE}

**Select duplicates**
SELECT name FROM customers group by name HAVING COUNT(*) > 1; -- check
SELECT * FROM customers where name = ''; -- check
**Customers**
- Don't remove duplicates and empty
```
-- remove active not null and remove date_crated and rename active to deleted_at 
ALTER TABLE customers DROP COLUMN `date_created`, CHANGE COLUMN `active` `deleted_at` TINYINT(1) UNSIGNED;

delete from customers where id= 107 or id= 259 or id= 260 or id= 261;
delete FROM customer_trans where customer_id= 107 or customer_id= 259 or customer_id= 260 or customer_id= 261;

update customers set name = 'علي السيد' where id = 175;
update customers set name = 'عطية' where id = 229;

update customers set name = CONCAT(name, ' 2') where id = 246 or id = 223 or id = 224 or id = 66 or id = 108;

update customers set deleted_at = NULL where deleted_at = 1;
update customers set deleted_at = 1 where deleted_at = 0;
```
- export sql then import 

**Suppliers**
- remove duplicates and empty

```
SELECT MAX(ID),group_concat(id), group_concat(active) , name FROM suppliers GROUP BY name HAVING count(*) > 1;
update suppliers set name = CONCAT(name, ' 2') where id = 106 or id=322 or id=468 or id=67 or id=126 or id=380 or id=73 or id=138 or id=97 or id=383 or id=22 or id=23 or id=4 or id=76 or id=74 or id=3 or id=2 or id=306 or id=273 or id=374 or id=203 or id=194 or id=110 or id=10 or id = 393 or id = 18 or id = 107 or id = 251 or id = 578;
update suppliers set name = CONCAT(name, ' 3') where id = 410 or id=11 or id=504 ;
delete from suppliers where id= 141 ;
-- remove active not null and remove date_crated, total_count and rename active to deleted_at 
ALTER TABLE suppliers DROP COLUMN `date_created`, DROP COLUMN `total_count`, CHANGE COLUMN `active` `deleted_at` TINYINT(1) UNSIGNED;
update suppliers set deleted_at = NULL where deleted_at = 1;
update suppliers set deleted_at = 1 where deleted_at = 0;
update suppliers set balance = -(balance)
```
- export sql then import 

**Products**
- rename active to deleted_at and remove active not null , remove date_created
```
ALTER TABLE products CHANGE COLUMN `active` `deleted_at` TINYINT(1) UNSIGNED,
DROP COLUMN `date_created`;

update products set name = CONCAT(name, ' P') where id = 211 or id = 7 or id = 93 or id = 31 or id = 184 or id = 127 or id = 175 or id = 5 or id = 248 or id= 233 or id= 300;
update products set name = CONCAT(name, ' PP') where id = 26 ;
update products set deleted_at = NULL where deleted_at = 1;
update products set deleted_at = 1 where deleted_at = 0;
SELECT name FROM products group by name HAVING COUNT(*) > 1; -- check
```
- export sql then import 
- add comm and rahn
`update products set product_sell_comm = 6`

**Supplier_trans**
- remove d_product, date_created
`ALTER TABLE supplier_trans DROP COLUMN `date_created`, DROP COLUMN `d_product`;`
- export sql then import 
- rename trans_types

```
UPDATE supplier_trans set sum= '+' , amount =abs(amount), trans_type= 'supp_payment' where trans_type = 'payment';
UPDATE supplier_trans set sum= '-' , amount = -(amount) where trans_type = 'supp_collect';
-- or delete !
-- update supplier_trans set trans_type = 'supp_recp_expenses' where trans_type = 'out_receipt'; 
delete from supplier_trans where trans_type = 'out_receipt';
```
**Customer_trans**
`Delete FROM customer_trans WHERE customer_id not in (select id from customers)`
- export sql then import 
- add debt_was
- TODO remove product_name , count
- rename trans_types
```
--UPDATE customer_trans set amount = - (amount) where sum = '-' and amount > 0
--
UPDATE customer_trans set sum = '-' where amount < 0
UPDATE customer_trans set sum = '+' where amount > 0
--
update customer_trans set trans_type = 'cust_advance_pay' where trans_type = 'paid'; 
```

**Receipts**
- export sql then import 
- replace "\" to be valid json string
- `update receipts set serial = 1`

**receipts_details**
- replace receipts_details with receipt_details
`ALTER TABLE receipts_details DROP COLUMN `date_created`;`
- export sql then import 

**Incomings**
- remove product_name, supplier_name, notes, date_created, nolon, given 
```
ALTER TABLE incomings DROP COLUMN `supplier_name`,
 DROP COLUMN `product_name`,
 DROP COLUMN `notes`,
 DROP COLUMN `date_created`,
 DROP COLUMN `nolon`,
 DROP COLUMN `given`;

delete from incomings where count is null;
```
- export sql then import 
(before creating inout_head view)
- create forign keys

**outgoings**
```
ALTER TABLE outgoings DROP COLUMN `supplier_name`,
 DROP COLUMN `product_name`,
 DROP COLUMN `customer_name`,
 DROP COLUMN `date_created`,
 DROP COLUMN `income_head_id`,
 DROP COLUMN `sell_type`;

delete from outgoings where customer_id = 7;
update outgoings set customer_id = Null where customer_id = 0;
```

**Cashflow**
- move actor_id to supplier_id / customer_id
```
ALTER TABLE cashflow ADD COLUMN `supplier_id` INTEGER UNSIGNED AFTER `d_product`,
 ADD COLUMN `customer_id` INTEGER UNSIGNED AFTER `supplier_id`;

update cashflow set supplier_id = actor_id where state = 'nolon' or state = 'given' or state = 'recp_paid' or state = 'supp_payment' or state = 'out_receipt' or state = 'supp_collect';

update cashflow set customer_id = actor_id where state = 'paid' or state = 'collecting' or state = 'acc_rest' or state = 'acc_rest';

ALTER TABLE cashflow DROP COLUMN `state_data`,
 DROP COLUMN `actor_id`,
 DROP COLUMN `actor_name`,
 DROP COLUMN `date_created`;

```
- rename states !
```
update cashflow set state = 'cust_advance_pay' where state = 'paid';
update cashflow set state = 'supp_recp_expenses' where state = 'out_receipt';
```
- delete cols : state_data, actor_id, actor_name , date_created
- replace "\" to be valid json string

**Replaces**
double DEFAULT NULL > REAL
UNSIGNED > 
DEFAULT NULL > 

**Views**

