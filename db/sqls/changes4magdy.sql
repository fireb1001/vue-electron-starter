INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('till_val', '1641037191', '1641037721', 'magdy', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('till_hide', 'true', '', 'magdy', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('MANUAL_UPGRADED_TO', '1.44', '', 'default', 'config');

update shader_configs set config_value = '1641037191' where config_name = 'till_val';
update "shader_configs" set config_value='1.61' where config_name = 'MANUAL_UPGRADED_TO';

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


INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('init_recp_given', '1', '', 'mmn1', 'config');


CREATE TABLE "daily_close" (
	"day"	TEXT NOT NULL,
	"closed"	TEXT,
	"net_cash"	REAL,
	"json"	TEXT,
	PRIMARY KEY("day")
);

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('sum_capital', 'اجمالي رأس المال', '', 'default', 'label');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('sum_rasd', 'اجمالي الرصد', '', 'default', 'label');


--- //////////

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

--///////////////////////////

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

-- ///////

INSERT INTO trans_types ("name", "ar_name", "shader_name", "sum", "optional", "category") 
VALUES ('anti_cust_discount', 'تعويض خصم التاجر', 'default', '+', '', 'cashflow');

ALTER TABLE customers add side_acc REAL;
-- R 1.42
-- ## Add alwasit logo 
ALTER TABLE suppliers add side_acc REAL;


--------- /// ---------


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
);

-- DELETE cols from trans_types

alter TABLE incomings add COLUMN pkg_dismiss INTEGER;
alter TABLE trans_types add COLUMN cust_form INTEGER;
alter TABLE trans_types add COLUMN map_packaging TEXT;

update trans_types set cust_form = 1 where flags = 'CUST_FORM';

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


INSERT INTO trans_types ("name", "ar_name", "shader_name", "sum", "optional", "category") 
VALUES ('coll_cust_rahn', 'تحصيل رهن', 'default', '+', '', 'cashflow');
-- product_rahn_external no map_packaging
-- update v_daily_sums view 

-- 1.57

-- map_cashflow cust_discount,anti_cust_discount

alter TABLE packaging add COLUMN cashflow_id INTEGER;
alter TABLE packaging add COLUMN out_scope INTEGER;
