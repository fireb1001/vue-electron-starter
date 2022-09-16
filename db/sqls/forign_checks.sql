-- cascade on delete customer_trans
-- TO_DO_ALSO cascade on delete outgoings
PRAGMA foreign_keys = 0;

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM customer_trans;

DROP TABLE customer_trans;

CREATE TABLE customer_trans (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    day          TEXT    NOT NULL,
    customer_id  INTEGER NOT NULL
                         REFERENCES customers (id) ON DELETE CASCADE,
    outgoing_id  INTEGER,
    cashflow_id  INTEGER,
    amount       REAL,
    trans_type   TEXT,
    debt_was     REAL,
    product_name TEXT,
    sum          TEXT,
    notes        TEXT,
    count        INTEGER,
    actual_sale  REAL,
    product_id   INTEGER,
    debt_after   REAL,
    packaging_id INTEGER,
    FOREIGN KEY (
        customer_id
    )
    REFERENCES customers (id) 
);

INSERT INTO customer_trans (
                               id,
                               day,
                               customer_id,
                               outgoing_id,
                               cashflow_id,
                               amount,
                               trans_type,
                               debt_was,
                               product_name,
                               sum,
                               notes,
                               count,
                               actual_sale,
                               product_id,
                               debt_after,
                               packaging_id
                           )
                           SELECT id,
                                  day,
                                  customer_id,
                                  outgoing_id,
                                  cashflow_id,
                                  amount,
                                  trans_type,
                                  debt_was,
                                  product_name,
                                  sum,
                                  notes,
                                  count,
                                  actual_sale,
                                  product_id,
                                  debt_after,
                                  packaging_id
                             FROM sqlitestudio_temp_table;

DROP TABLE sqlitestudio_temp_table;

PRAGMA foreign_keys = 1;

-------------- 

PRAGMA foreign_keys = 0;

CREATE TABLE sqlitestudio_temp_table AS SELECT *
                                          FROM outgoings;

DROP TABLE outgoings;

CREATE TABLE outgoings (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    day             TEXT    NOT NULL,
    supplier_id     INTEGER NOT NULL,
    product_id      INTEGER NOT NULL,
    customer_id     INTEGER REFERENCES customers (id) ON DELETE CASCADE,
    count           INTEGER NOT NULL,
    kg_price        REAL    NOT NULL,
    weight          REAL    NOT NULL,
    notes           TEXT,
    sell_type       TEXT,
    sell_comm       REAL,
    sell_comm_value REAL,
    collecting      REAL,
    value_calc      REAL,
    income_day      TEXT    NOT NULL,
    product_rahn    REAL,
    FOREIGN KEY (
        product_id
    )
    REFERENCES products (id),
    FOREIGN KEY (
        supplier_id
    )
    REFERENCES suppliers (id),
    FOREIGN KEY (
        customer_id
    )
    REFERENCES customers (id) 
);

INSERT INTO outgoings (
                          id,
                          day,
                          supplier_id,
                          product_id,
                          customer_id,
                          count,
                          kg_price,
                          weight,
                          notes,
                          sell_type,
                          sell_comm,
                          sell_comm_value,
                          collecting,
                          value_calc,
                          income_day,
                          product_rahn
                      )
                      SELECT id,
                             day,
                             supplier_id,
                             product_id,
                             customer_id,
                             count,
                             kg_price,
                             weight,
                             notes,
                             sell_type,
                             sell_comm,
                             sell_comm_value,
                             collecting,
                             value_calc,
                             income_day,
                             product_rahn
                        FROM sqlitestudio_temp_table;

DROP TABLE sqlitestudio_temp_table;

PRAGMA foreign_keys = 1;
