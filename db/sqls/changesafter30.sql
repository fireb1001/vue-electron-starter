-- 1.58
update "shader_configs" set config_value='1.58' where config_name = 'MANUAL_UPGRADED_TO';
INSERT INTO trans_types ("name", "ar_name", "shader_name", "sum", "optional", "category") 
VALUES ('coll_cust_rahn', 'تحصيل رهن', 'default', '+', '', 'cashflow');
-- product_rahn_external no map_packaging

-- 1.57

-- map_cashflow cust_discount,anti_cust_discount

alter TABLE packaging add COLUMN cashflow_id INTEGER;
alter TABLE packaging add COLUMN out_scope INTEGER;


INSERT INTO trans_types ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow", "map_customer_trans", "sum_rahn", "flags", "cust_form") 
VALUES ('init_pkg', 'عدايات لدي التاجر', 'default', '+', '', 'customer_trans', '', '', '', 'CUST_FORM', '1');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow", "map_customer_trans", "sum_rahn", "flags") 
VALUES ('pkg_destruct', 'اهلاك عدايات', 'default', '-', '', 'packaging', 'pkg_destruct,anti_pkg_destruct', '', '', '');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow", "map_customer_trans", "sum_rahn", "flags") 
VALUES ('pkg_destruct', 'اهلاك عدايات', 'default', '-', '1', 'cashflow', 'ex', '', '', 'DEDUCT');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow", "map_customer_trans", "sum_rahn", "flags") 
VALUES ('anti_pkg_destruct', 'تعويض اهلاك عدايات', 'default', '+', '', 'cashflow', '', '', '', '');

-- 1.56

---
-- for amn1
update shader_configs set config_value = '1614970718' where config_name = 'till_val';
update shader_configs set config_verify = '1614971035' where config_name = 'till_val';

alter TABLE incomings add COLUMN pkg_dismiss INTEGER;
alter TABLE trans_types add COLUMN cust_form INTEGER;
alter TABLE trans_types add COLUMN map_packaging TEXT;

update trans_types set cust_form = 1 where flags = 'CUST_FORM';

INSERT INTO shader_configs ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('pkg_price', '10', '', 'amn1', 'config');

-- Adding packaging
CREATE TABLE "packaging" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"day"	TEXT NOT NULL,
	"sum"	TEXT,
	"count"	INTEGER,
	"amount"	REAL,
	"notes"	TEXT,
	"supplier_id"	INTEGER,
	"customer_id"	INTEGER,
	"dealer_id"	INTEGER
)

-- DELETE cols from trans_types
PRAGMA foreign_keys = 0;

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM trans_types;

DROP TABLE trans_types;

CREATE TABLE trans_types (
    name               TEXT    NOT NULL,
    ar_name            TEXT    NOT NULL,
    shader_name        TEXT    NOT NULL,
    sum                TEXT    NOT NULL,
    optional           INTEGER,
    category           TEXT    NOT NULL,
    map_cashflow       TEXT,
    map_customer_trans TEXT,
    cust_form          INTEGER,
    map_packaging          TEXT,
    PRIMARY KEY (
        name,
        category
    )
);

INSERT INTO trans_types (
                            name,
                            ar_name,
                            shader_name,
                            sum,
                            optional,
                            category,
                            map_cashflow,
                            map_customer_trans,
                            cust_form,
                            map_packaging
                        )
                        SELECT name,
                               ar_name,
                               shader_name,
                               sum,
                               optional,
                               category,
                               map_cashflow,
                               map_customer_trans,
                               cust_form,
                               map_packaging
                          FROM sqlitestudio_temp_table;

DROP TABLE sqlitestudio_temp_table;

PRAGMA foreign_keys = 1;

-- 1.55

-- Nada
INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('till_val', '1614970718', '1902769658', 'amn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('till_hide', 'true', '', 'nada', 'config');

INSERT INTO trans_types ("name", "ar_name", "shader_name", "sum", "optional", "category") 
VALUES ('anti_cust_discount', 'تعويض خصم التاجر', 'default', '+', '', 'cashflow');

ALTER TABLE customers add side_acc REAL;
-- R 1.42
-- ## Add alwasit logo 
ALTER TABLE suppliers add side_acc REAL;
-- R 1.41 
-- ## add till_val instead of dome_till
-- validate till_val using 
-- "mmn1".split('').map(x => ! isNaN(x) ? + x: x.charCodeAt(0)).reduce((a,b) => a+b);

-- for amn1
INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('till_val', '1591446827', '1591447144', 'amn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('till_hide', 'true', '', 'amn1', 'config');

-- 1.45 
-- ## update views

-- (only 4 mmn1)
delete from customer_trans where customer_id not in (select id from customers);
INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('kashf_header', 'kashf_mmn1.png', '', 'mmn1', 'config');

-- 1.44
-- F_STRICT_MODE

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('demo_hide', 'true', '', 'mmn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('MANUAL_UPGRADED_TO', '1.44', '', 'default', 'config');


-- 1.43
-- Solve PRAGMA foreign_key_check;
-- select * from receipts where cashflow_id not in (select id from cashflow);

-- incomings = 0 trigger
CREATE TRIGGER validate_incomings_GT_0
after update on incomings
when old.count > new.count and new.count = 0
BEGIN
DELETE from incomings where count = 0 ;
END;

alter TABLE trans_types add COLUMN map_customer_trans TEXT;
alter TABLE trans_types add COLUMN sum_rahn TEXT;
alter TABLE trans_types add COLUMN flags TEXT;

update trans_types set flags = 'DEDUCT' where optional = 1;
update trans_types set flags = 'CUST_FORM' where optional = 3;

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow", "map_customer_trans", "sum_rahn", "flags")
VALUES ('repay_rahn_auto', 'تنزيل رهن بدون تأثير علي الحساب', 'default', '-', '', 'customer_trans', '', 'coll_anti_rahn', '', 'CUST_FORM');

-- change CUST_FORM for coll_anti_rahn
-- rename repay_rahn_internal label
--- 
PRAGMA foreign_keys = 0;

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM receipts;

DROP TABLE receipts;

CREATE TABLE receipts (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id        INTEGER NOT NULL,
    day                TEXT    NOT NULL,
    total_nolon        REAL,
    recp_given         REAL,
    comm_rate          REAL,
    sale_value         REAL,
    net_value          REAL,
    recp_paid          INTEGER,
    products_arr       TEXT,
    total_current_rest INTEGER,
    total_count        INTEGER,
    total_sell_comm    REAL,
    recp_comm          REAL,
    supplier_name      TEXT,
    out_sale_value     REAL,
    recp_expenses      REAL,
    serial             INTEGER,
    printed            INTEGER,
    recp_deducts       REAL,
    balance_was        REAL,
    recp_others        REAL,
    cashflow_id        INTEGER,
    FOREIGN KEY (
        cashflow_id
    )
    REFERENCES cashflow (id) ON DELETE RESTRICT
);

INSERT INTO receipts (
        id,
        supplier_id,
        day,
        total_nolon,
        recp_given,
        comm_rate,
        sale_value,
        net_value,
        recp_paid,
        products_arr,
        total_current_rest,
        total_count,
        total_sell_comm,
        recp_comm,
        supplier_name,
        out_sale_value,
        recp_expenses,
        serial,
        printed,
        recp_deducts,
        balance_was,
        recp_others,
        cashflow_id
    )
    SELECT id,
        supplier_id,
        day,
        total_nolon,
        recp_given,
        comm_rate,
        sale_value,
        net_value,
        recp_paid,
        products_arr,
        total_current_rest,
        total_count,
        total_sell_comm,
        recp_comm,
        supplier_name,
        out_sale_value,
        recp_expenses,
        serial,
        printed,
        recp_deducts,
        balance_was,
        recp_others,
        cashflow_id
    FROM sqlitestudio_temp_table;

DROP TABLE sqlitestudio_temp_table;

PRAGMA foreign_keys = 1;

-- 1.42

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('sum_capital', 'اجمالي رأس المال', '', 'default', 'label');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('sum_rasd', 'اجمالي الرصد', '', 'default', 'label');

CREATE TABLE "daily_close" (
	"day"	TEXT NOT NULL,
	"closed"	TEXT,
	"net_cash"	REAL,
	"json"	TEXT,
	PRIMARY KEY("day")
);

/**  only 4 mmn1

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('F_MMN1_PASS', '4242', '', 'mmn1', 'config');

insert into daily_close ('day', 'closed') 
select DISTINCT(day), 'true' as true from cashflow where day >= '2020-02-05';
*/

-- 1.41
-- https://github.com/fireb1001/shaderlite/releases/

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category") 
VALUES ('dealer_init', 'رصيد', 'default', '+', '', 'dealer_trans');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") 
VALUES ('dealer_pay', 'دفع تعامل', 'default', '+', '', 'dealer_trans', 'dealer_pay');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") 
VALUES ('dealer_pay', 'دفع تعامل', 'default', '-', '', 'cashflow', '');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") 
VALUES ('dealer_collect', 'تحصيل تعامل', 'default', '-', '', 'dealer_trans', 'dealer_collect');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow") 
VALUES ('dealer_collect', 'تحصيل تعامل', 'default', '+', '', 'cashflow', '');

INSERT INTO "shader_configs" 
("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('manage_dealers', 'ادارة المعاملات', '', 'default', 'label');


alter TABLE cashflow add dealer_id INTEGER;

CREATE TABLE dealers (
	id	INTEGER PRIMARY KEY AUTOINCREMENT,
	name	TEXT NOT NULL UNIQUE,
	phone	TEXT,
	deleted_at	INTEGER,
	balance REAL,
	notes	TEXT
);


CREATE TABLE dealer_trans (id INTEGER PRIMARY KEY AUTOINCREMENT,
day TEXT NOT NULL,
dealer_id INTEGER NOT NULL,
cashflow_id INTEGER,
amount REAL,
trans_type TEXT,
sum TEXT,
notes TEXT, FOREIGN KEY (dealer_id) REFERENCES dealers (id));


-- version 1.40
ALTER TABLE products add cust_mashal REAL;

-- version 1.38
INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('init_mashal', '.35', '', 'amn1', 'config');
ALTER TABLE suppliers add box_count INTEGER;


-- version 1.35 

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('F_AARBON_OUT', 'true', '', 'mmn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('F_RECP_EXPENSES_INC', 'true', '', 'mmn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('F_REPAY_RAHN_KASHF', 'true', '', 'mmn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('F_AARBON_KASHF', 'true', '', 'mmn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('F_SHOW_DEBT_KASHF', 'true', '', 'mmn1', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('shader_name', 'nada', '', 'default', 'config');

-- version 1.33 -- 
ALTER TABLE receipts add cashflow_id INTEGER;
ALTER TABLE cashflow add income_day TEXT;
update cashflow set income_day = day where state = 'supp_recp_expenses';

-- Add Net Weight option
ALTER TABLE products add weight_deduct REAL;


--- ------------------------

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category")
VALUES ('product_rahn_external', 'رهن', 'default', '+', '3', 'customer_trans');
-- config.json file
INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow")
VALUES ('aarbon', 'عربون', 'default', '-', '', 'customer_trans', 'aarbon');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow")
VALUES ('aarbon', 'عربون', 'default', '+', '', 'cashflow', '');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category", "map_cashflow")
VALUES ('repay_rahn_internal', 'عربون', 'default', '-', '', 'customer_trans', '');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category")
VALUES ('ex_comm', 'عمولة + بياعة', 'default', '-', '', 'cashflow');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category")
VALUES ('ex_mashal', 'اجمالي المشال', 'default', '-', '', 'cashflow');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category")
VALUES ('ex_momen', 'حساب شركاء - معلم مؤمن', 'default', '-', '', 'cashflow');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category")
VALUES ('ex_said', 'حساب شركاء - معلم السيد', 'default', '-', '', 'cashflow');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category")
VALUES ('ex_mohamed', 'مصروف كاتب استاذ محمد', 'default', '-', '1', 'cashflow');

INSERT INTO "trans_types" ("name", "ar_name", "shader_name", "sum", "optional", "category")
VALUES ('ex_hisham', 'مصروف كاتب استاذ هشام', 'default', '-', '1', 'cashflow');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('init_recp_given', '1', '', 'mmn1', 'config');


