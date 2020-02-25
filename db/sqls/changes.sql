-- move days

update cashflow set day='2020-02-24' where day='2020-02-25';
update customer_trans set day='2020-02-24' where day='2020-02-25';
update outgoings set day='2020-02-24' where day='2020-02-25';
update outgoings set income_day='2020-02-24' where income_day='2020-02-25';
update receipt_details set day='2020-02-24' where day='2020-02-25';
update receipts set day='2020-02-24' where day='2020-02-25';
update supplier_trans set day='2020-02-24' where day='2020-02-25';
update incomings set day='2020-02-24' where day='2020-02-25';

-- 0.1.24
ALTER TABLE receipts add recp_others REAL;

-- 0.1.23

-- new view --

----	

INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('show_totals', 'recp_given,
given,
comms,
net_income,
out_cashflow,
supp_payments,
supp_deducts,
rahn,
repay_rahn', '', 'magdy', 'config');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('rahn', 'رهن', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('repay_rahn', 'رد رهن', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('repay_rahn', 'تنزيل رهن', '', 'magdy', 'label');

INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('expenses', 'مخرجات', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('recp_given', 'وهبة فاتورة', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('recp_given', 'مشال', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('collect', 'تحصيل', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('collect', 'تنزيل', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('customers_accounts', 'معاملات التجار', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('customers_accounts', 'حسابات البائعين', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('menu_collecting', 'تحصيل', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('net_income', 'صافي الايراد', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('comms', 'عمولات + بياعة', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('comms', 'عمولة', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('supp_payments', 'دفعات عملاء', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('silent_print', 'true', '', 'magdy', 'config');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('supp_payments', 'واصل فلاح', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('supp_deducts', 'خصوم فلاح', '', 'magdy', 'label');


-- 0.1.15 -- 

-- nada changes --
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('recp_header', '<h1 class="text-danger text-center"> أولاد الحاج/ مصطفي ندا مصطفي</h1>
<h1 class="text-primary text-center">الأستاذ / جمــال نــدا</h1>
<h3 class="text-danger text-center"> لتجارة وتسويق الفاكهة </h3>
<h4 class="text-primary text-center">
سوق العبور - القاهرة - محل رقم ١٥٠ عنبر ٤ فاكهة س.ت :٢٨٤٠٤٠
</h4>
<h4 class="text-primary text-center">
ت : ٤٤٧٧٠١٨٠ المعلم سلامة : ٠١١١٨٣٥٧٧٥٠ الأستاذ محمد : ٠١٠٢٣٩٢٩٢٢٣
</h4>', '', 'nada', 'config');

----------------------------------------------------------------------------

INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category") VALUES ('rahn_down', 'تنزيل في رهن', 'default', '-', '', 'cashflow');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('kashf_cust', 'كشف وجبة', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('kashf_cust', 'كشف حساب', '', 'magdy', 'label');


ALTER TABLE receipts add balance_was REAL;

-- 0.1.13 -- 
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") VALUES ('cust_in_collecting', 'تحصيل اليوم', 'default', '-', '', 'customer_trans', 'cust_collecting');
ALTER TABLE cashflow add receipt_id INTEGER;
-- 0.1.11 -- 

-- products add product_rahn , change product_sell_comm to real
-- outgoings add product_rahn 

INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category") VALUES ('supp_init_payment', 'رصيد اول المدة', 'default', '', '', 'supplier_trans');
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category") VALUES ('product_rahn', 'رهن طرود', 'default', '+', '', 'customer_trans');

INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('product_rahn', '10', '', 'magdy', 'config');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('product_sell_comm', '6', '', 'default', 'config');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('product_sell_comm', '3', '', 'magdy', 'config');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('sum_customers_debt', 'اجمالي مديونيات التجار', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('sum_suppliers_debt', 'اجمالي واصل العملاء', '', 'default', 'label');


-- rewrite trans_types


-- 0.1.11 -- 
UPDATE customer_trans set amount = - (amount) where sum = '-' and amount > 0;
UPDATE supplier_trans set amount = - (amount) where sum = '-' and amount > 0;

-- 0.1.9 --
-- add receipt_id to supplier_trans
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category") VALUES ('recp_deducts', 'خصم الفلاح', 'default', '-', '', 'supplier_trans');
-- 0.1.8

-- 11/9 --
--change supp_recp_expensess to supp_recp_expenses
-- تعديل اسم supp_recp_expensess لمجدي
-- https://transfer.sh/kiduO/shaderlite.db

--==============================================================--

-- 1 / 9 --
-- rename trans_types.in_deduct to optional

-- Add ShaderName as primary key to trans_types

UPDATE customer_trans set debt_after = NULL;
-- rename customer_trans.debt_after to debt_was
-- remove developer mode in shader_configs

INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('outgoing_notes', 'ملاحظات', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('outgoing_notes', 'عربون', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('given', 'دخان', '', 'magdy', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('printed', 'تم الطباعة', '', 'default', 'label');

INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('pay_arboon', 'true', '', 'magdy', 'config');

INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") VALUES ('repay_cust_trust', 'رد امانة', 'default', '+', '3', 'customer_trans', 'repay_cust_trust');
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") VALUES ('repay_cust_trust', 'رد امانة', 'default', '-', '', 'cashflow', '');
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") VALUES ('cust_rahn', 'رهن', 'default', '-', '3', 'customer_trans', 'cust_rahn');
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") VALUES ('cust_rahn', 'رهن', 'default', '+', '2', 'cashflow', '');
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") VALUES ('repay_cust_rahn', 'رد الرهن', 'default', '+', '3', 'customer_trans', 'repay_cust_rahn');
INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") VALUES ('repay_cust_rahn', 'رد الرهن', 'default', '-', '1', 'cashflow', '');

ALTER TABLE receipts add printed INTEGER

-- 25 / 8  --
CREATE TABLE "customers_daily" (
	"day"	TEXT NOT NULL,
	"customer_id"	INTEGER NOT NULL,
	"printed"	INTEGER,
	PRIMARY KEY("day","customer_id")
);

ALTER TABLE incomings add group_id INTEGER;
ALTER TABLE customers add nat_id TEXT;

INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('search_incomings', 'بحث في الوارد', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('search_receipts', 'بحث في الفواتير', '', 'default', 'label');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('new_day_opens', '16', '', 'magdy', 'config');
INSERT INTO "main"."shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") VALUES ('search_outgoings', 'بحث في المبيعات', '', 'default', 'label');

INSERT INTO "main"."trans_types" ("name", "ar_name", "shader_name", "sum", "in_deduct", "category", "map_cashflow") VALUES ('sum_outgoing', 'كشف مبيعات تاجر', 'default', '+', '', 'customer_trans', '');