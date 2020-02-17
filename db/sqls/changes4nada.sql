-- TODO add فرق الفواتير F_ADD_DIFF_TO_INCOME true

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

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
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

ALTER TABLE products add cust_mashal REAL;
ALTER TABLE products add weight_deduct REAL;

ALTER TABLE suppliers add box_count INTEGER;

-- version 1.33 -- 
ALTER TABLE receipts add cashflow_id INTEGER;

ALTER TABLE cashflow add income_day TEXT;

update cashflow set income_day = day where state = 'supp_recp_expenses';

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('shader_name', 'nada', '', 'default', 'config');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('supp_deducts', 'خصوم فلاح', '', 'default', 'label');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('recp_others', 'مبالغ اخري', '', 'default', 'label');

INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category")
VALUES ('F_SHOW_DEBT_KASHF', 'true', '', 'nada', 'config');


/*
-- Manual Changes
-- add ex to expenses
-- change show_totals in shader_configs
-- remove supp_pre_recp trans
-- label total_debt , sum_rasd
*/

/*
INSERT INTO "shader_configs" ("config_name", "config_value", "config_verify", "shader_name", "category") 
VALUES ('init_mashal', '.35', '', 'amn1', 'config');

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

*/
