import {knex, selectRaw} from '../main'

export class InoutHeadCtrl {

  async findAll(filter = { day: '' , diff : '', supplier_id: null}){
    let results = []
    if (filter.diff == '> 0' && filter.day) {
      results = await knex('v_inout_heads').where('diff', '>' , 0).andWhere('day', '<=', filter.day)
    }
    else if (filter.day && filter.supplier_id) {
      results = await knex('v_inout_heads').where('supplier_id', filter.supplier_id).andWhere('day', filter.day)
    }
    else if (filter.day) {
      results = await knex('v_inout_heads').where('day', filter.day)
    }
    return results
  }

  async findOne(filter = { day: '' , supplier_id : 0, product_id: 0}) {
    let results = {}
    results = await knex('v_inout_heads').where('day', filter.day)
    .andWhere('supplier_id', filter.supplier_id)
    .andWhere('product_id',  filter.product_id)
    .first()
    return results
  }

  async findNotCreatedRecps() {
    let query = `
    SELECT * from (
      select day, supplier_id, supplier_name, sum(diff) as sum_diff from v_inout_heads  GROUP by day , supplier_id HAVING sum_diff = 0
      ) inout_heads
      where not EXISTS (select * from receipts where receipts.supplier_id = inout_heads.supplier_id and receipts.day = inout_heads.day)
    UNION
    select day, supplier_id, suppliers.name as supplier_name, null as sum_diff from receipts 
    JOIN suppliers
    on receipts.supplier_id = suppliers.id
    where recp_paid = 0
`
    console.log(query)
    let result = await selectRaw(query);
    return result;
  }

  async findDailySuppliers(filter = { day: ''}) {
    let query = `
    SELECT 
    inoutv.day as day,
    inoutv.supplier_id as supplier_id,
    inoutv.supplier_name as supplier_name,
    inoutv.sum_diff as sum_diff,
    inoutv.sum_inc_count as sum_inc_count,
    inoutv.sum_sold_count as sum_sold_count,
    inoutv.products_concat as products_concat,
    receipts_g.concat_recp_paid as concat_recp_paid,
    receipts_g.concat_printed as concat_printed,
    receipts_g.sum_recp_count as sum_recp_count,
    cashflow_v.total_nolon as total_nolon
  From
    (SELECT v_inout_heads.day, v_inout_heads.supplier_id, v_inout_heads.supplier_name, sum(inc_count) as sum_inc_count,sum(sold_count) as sum_sold_count, sum(v_inout_heads.diff) as sum_diff, group_concat(v_inout_heads.product_name, " ,") as products_concat from v_inout_heads GROUP BY day,supplier_id) inoutv
  LEFT JOIN 
    (select supplier_id, day ,group_concat(recp_paid) as concat_recp_paid,group_concat(printed) as concat_printed, sum(total_count) as sum_recp_count from receipts GROUP by supplier_id, day) receipts_g
    ON inoutv.day = receipts_g.day and inoutv.supplier_id = receipts_g.supplier_id
  LEFT JOIN 
    (SELECT supplier_id, day, sum(amount) as total_nolon from cashflow where state= 'nolon' group by supplier_id, day ) cashflow_v
    on inoutv.day = cashflow_v.day and inoutv.supplier_id = cashflow_v.supplier_id
  WHERE
    inoutv.day = '${filter.day}'
  OR (
    inoutv.day in (SELECT income_day from outgoings where day= '${filter.day}' and income_day <> '${filter.day}')
    and inoutv.supplier_id in (SELECT supplier_id from outgoings where day= '${filter.day}' and income_day <> '${filter.day}')
  )
`
    console.log(query)
    let result = await selectRaw(query);
    return result;
  }

}