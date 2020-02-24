-- v_inout_heads --
DROP VIEW if EXISTS  v_inout_heads;
CREATE VIEW v_inout_heads AS
SELECT 
v_inc.day as day,
v_inc.supplier_id as supplier_id,
v_inc.product_id as product_id,
v_inc.inc_count as inc_count,
v_out.sold_count as sold_count,
(v_inc.inc_count - IFNULL(v_out.sold_count, 0)) as diff,
suppliers.name as supplier_name,
products.name as product_name,
products.product_sell_comm as product_sell_comm,
products.product_rahn as product_rahn,
products.weight_deduct as weight_deduct
FROM
	(SELECT day, supplier_id, product_id, sum(count) as 'inc_count' FROM incomings group by day,supplier_id , product_id) v_inc
LEFT JOIN
	(SELECT income_day, supplier_id, product_id, sum(count) as 'sold_count' from outgoings  group by income_day,supplier_id , product_id) v_out
ON 
	v_inc.day = v_out.income_day and v_inc.supplier_id = v_out.supplier_id and v_inc.product_id = v_out.product_id
LEFT JOIN 
	suppliers ON v_inc.supplier_id = suppliers.id
LEFT JOIN 
	products ON v_inc.product_id = products.id;

-- v_recp_sums --
DROP VIEW if EXISTS  v_recp_sums;
CREATE VIEW v_recp_sums AS SELECT 
day,
recp_gsums.supplier_id as supplier_id,
suppliers.name as supplier_name,
sum_recp_comm,
sum_sale_value,
sum_net_value,
sum_total_nolon,
sum_recp_expenses,
sum_recp_given,
sum_recp_others,
sum_recp_deducts,
sum_total_count,
concat_recp_paid,
sum_out_value,
sum_sell_comm,
products_concat,
sum_rasd_net
FROM 
    (SELECT 
    day as day,
    supplier_id as supplier_id,
    sum(recp_comm) as sum_recp_comm,
    sum(sale_value) as sum_sale_value,
    sum(net_value) as sum_net_value,
    sum(total_nolon) as sum_total_nolon ,
    sum(total_count) as sum_total_count ,
    sum(recp_given) as sum_recp_given ,
	sum(recp_others) as sum_recp_others ,
    sum(recp_expenses) as sum_recp_expenses,
	sum(recp_deducts) as sum_recp_deducts,
    group_concat(recp_paid) as concat_recp_paid,
	sum(CASE  
		WHEN recp_paid = 1 THEN net_value 
			ELSE 0 
        END) as sum_rasd_net
    from receipts 
    GROUP by supplier_id, day) recp_gsums
  JOIN 
    (SELECT income_day,	
    supplier_id,
    sum(kg_price *weight) as sum_out_value ,
    sum(sell_comm * count) as sum_sell_comm ,
    group_concat(DISTINCT(product_id)) as products_concat
    FROM outgoings
    GROUP BY income_day, supplier_id ) out_gsums
  ON  
    recp_gsums.day = out_gsums.income_day and recp_gsums.supplier_id = out_gsums.supplier_id
  JOIN
    suppliers on recp_gsums.supplier_id = suppliers.id;

-- v_daily_sums --
DROP VIEW if EXISTS  v_daily_sums;
CREATE VIEW v_daily_sums AS
SELECT days.day as day,
recp_sum_net,
recp_sum_given,
recp_sum_rasd_net,
recp_sum_comm,
recp_sum_expenses,
recp_sum_deducts,
recp_sum_others,
recp_sum_sale,
sum_out_value,
out_sell_comm,
out_zm_val,
sum_collect_zm,
sum_cash_zm,
sum_deducts,
sum_given,
sum_nolon,
sum_supp_payment,
sum_supp_collect,
sum_product_rahn,
sum_mashal,
sum_repay_rahn,
sum_rahn_down,
sum_rahn_increase
FROM
	( select DISTINCT day from outgoings UNION select DISTINCT day from incomings UNION select DISTINCT day from cashflow ) days
LEFT JOIN 
	(select day,
	round(sum(recp_given),2) recp_sum_given,
	round(sum(recp_comm),2) recp_sum_comm,
	round(sum(net_value),2) recp_sum_net,
	sum(sale_value) recp_sum_sale,
	sum(recp_expenses) recp_sum_expenses,
	sum(recp_deducts) recp_sum_deducts,
	sum(recp_others) recp_sum_others,
	round(sum(CASE  WHEN recp_paid = 1 THEN net_value ELSE 0 END),2) recp_sum_rasd_net
	FROM receipts GROUP By day ) recp_day_g
	ON days.day = recp_day_g.day
LEFT JOIN 
	(select day,
	sum(case when state = 'given' then amount else null end) as sum_given,
	sum(case when state = 'nolon' then amount else null end) as sum_nolon,
	sum(case when state = 'rahn_down' then amount else null end) as sum_rahn_down,
	sum(case when state = 'rahn_increase' then amount else null end) as sum_rahn_increase,
	sum(case when state in ('cust_advance_pay','acc_rest') then amount else null end) as sum_cash_zm,
	sum(case when state in ('collecting','cust_collecting','cust_in_collecting') then amount else null end) as sum_collect_zm,
	sum(case when state = 'supp_payment' then amount else null end) as sum_supp_payment,
             sum(case when state = 'supp_collect' then amount else null end) as sum_supp_collect,
	sum(case when state in (select name FROM trans_types where category = 'cashflow' and optional = 1) then amount else null end) sum_deducts
	from cashflow  GROUP by day ) cash_deducts
	ON  days.day = cash_deducts.day
LEFT JOIN 
	(select day,
	sum(case when trans_type = 'product_rahn' then amount else null end) as sum_product_rahn,
	sum(case when trans_type = 'mashal' then amount else null end) as sum_mashal,
	abs(sum(case when trans_type in ( 'repay_cust_rahn','repay_rahn_in','repay_rahn_internal') then amount else null end)) as sum_repay_rahn
	from customer_trans group by day ) cust_rahn_g
	ON  days.day = cust_rahn_g.day
LEFT JOIN
	(select day, sum(sell_comm * count) out_sell_comm FROM outgoings GROUP By day) outgoings_day_g
	ON days.day = outgoings_day_g.day
LEFT JOIN 
	(select day, sum(value_calc) out_zm_val FROM outgoings where customer_id > 0 GROUP By day) outgoings_zm
	ON days.day = outgoings_zm.day
LEFT JOIN
	(select income_day, sum(kg_price *weight) sum_out_value FROM outgoings GROUP By income_day) outg_incday_g
	ON days.day = outg_incday_g.income_day;

-- v_out_sums
DROP VIEW if EXISTS  v_out_sums;
CREATE VIEW v_out_sums AS
SELECT
income_day,
supplier_id,
product_id,
products.name as product_name,
kg_price,
sell_comm,
sum_weight,
sum_count
FROM
	(SELECT income_day,	supplier_id, product_id, kg_price, sell_comm, sum(weight) as sum_weight, sum(count) as sum_count
	FROM outgoings
	GROUP BY income_day, kg_price , product_id, supplier_id, sell_comm ) out_sums
LEFT JOIN products ON out_sums.product_id = products.id;