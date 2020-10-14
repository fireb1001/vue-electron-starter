import { bookshelf, execRaw, knex, selectRaw } from "../main";
import { store } from "../store";
import { TransTypesCtrl } from "./TransTypesCtrl";
import { CashflowCtrl } from "./CashflowCtrl";

export class CustomerDAO {
  id;
  name;
  debt;
  sum_debt;
  phone;
  address;
  nat_id;
  notes;
  is_self;
  deleted_at;

  static get INIT_DAO() {
    return { name: "" };
  }

  parseTypes() {
    this.debt = this.debt ? parseFloat(this.debt) : 0;
    this.name = ("" + this.name).trim();
    delete this.sum_debt;
    delete this.customer_id;
  }

  constructor(data) {
    Object.assign(this, data);
  }
}

/**
 * CustomerTransDAO
 *
 */
export class CustomerTransDAO {
  id;
  day;
  customer_id;
  outgoing_id;
  product_id;
  product_name;
  cashflow_id;
  amount;
  sum;
  trans_type;
  notes;
  count;
  weight;
  kg_price;
  actual_sale;
  debt_was;
  pkg_count;
  pkg_amount;

  constructor(data = {}) {
    Object.assign(this, data);
  }

  static get INIT_DAO() {
    return {};
  }

  /**@param {import('./TransTypesCtrl').TransTypeDAO} transDAO */
  set transType(transDAO) {
    this.trans_type = transDAO.name;
    this.sum = transDAO.sum;
  }

  parseTypes() {
    this.amount = this.amount ? parseFloat(this.amount) : 0;
    this.actual_sale = this.actual_sale ? parseFloat(this.actual_sale) : 0;
    this.debt_was = this.debt_was ? parseFloat(this.debt_was) : 0;
    delete this.weight;
    delete this.kg_price;

    delete this.pkg_count;
    delete this.pkg_amount;
  }
}

export class CustomersCtrl {
  /**@type {import('bookshelf').Model} */
  model;

  /**@type {import('bookshelf').Model} */
  customerTransModel;

  constructor() {
    this.model = require("../models/CustomersModel")(bookshelf);
    this.customerTransModel = require("../models/CustomerTransModel")(
      bookshelf
    );
  }

  /**@param {CustomerDAO} data */
  async save(data) {
    data.parseTypes();
    let record = await this.model.forge(data).save();
    if (!data.id && data.debt >= 0) {
      // new one with init debt
      let transDAO = new CustomerTransDAO({
        customer_id: record.id,
        amount: data.debt,
        day: store.state.day.iso
      });

      let selectedTrans = await new TransTypesCtrl().findOne({
        name: "init",
        category: "customer_trans"
      });
      transDAO.transType = selectedTrans;
      console.log(transDAO);
      await this.createCustomerTrans(transDAO);
    }
    return record.id;
    // TODO Add Customer Trans with debt
  }

  async findAll(
    filter = { limit: null, debt_g_than: null },
    options = { orderByName: false, orderByDebt: false, softDelete: false, noOrderByName: false }
  ) {
    //let all = await this.model.where(filter).fetchAll(options)
    // let results = await knex(`v_customers`)
    /*
    let query = `
select * from (select * from customers where 1=1
    ${options.softDelete ? " and deleted_at is null" : ""}
  ) customers_g
LEFT JOIN ( select customer_id, sum(amount) as sum_debt from customer_trans 
group by customer_id 
${filter.debt_g_than ? " having sum(amount)> "+ parseInt(filter.debt_g_than) : ""}
) customer_trans_g
ON customers_g.id = customer_trans_g.customer_id 
${options.orderByName ? "order by name " : ""}  ${
      options.orderByDebt ? "order by debt desc" : ""
    } 
${filter.limit ? "limit " + parseInt(filter.limit) : ""}
`;
    */
   console.log("options", options)
   let query = `
   select * from 
   (select customer_id, sum(amount) as sum_debt, max(day) as trans_day from customer_trans 
   group by customer_id 
   ${filter.debt_g_than ? " having sum(amount)> "+ parseInt(filter.debt_g_than) : ""}
   ) customer_trans_g
   left join
   (select * from customers where 1=1
    ${options.softDelete ? " and deleted_at is null" : ""}
     ) customers_g
   ON customer_trans_g.customer_id = customers_g.id 
   /*
   LEFT JOIN (
    select customer_id, sum(count) pkg_count, sum(amount) pkg_amount from packaging 
    where out_scope !=1 or out_scope is null  GROUP by customer_id
  ) cust_pkg
  ON  customers_g.id  = cust_pkg.customer_id
  */
  LEFT JOIN (
	  select customer_id, sum( amount ) net_rahn 
		from customer_trans 
		where trans_type in (
		  'repay_cust_rahn',
		  'repay_rahn_in',
		  'rahn_down',
		  'product_rahn_external',
		  'product_rahn',
		  'repay_rahn_internal',
		  'repay_rahn_auto',
		  'add_rahn_auto',
		  'repay_rahn_cash'
	) GROUP BY customer_id
) cust_net_rahn
ON cust_net_rahn.customer_id = customers_g.id 
   `;

   if(! options.noOrderByName) query +=
   `${ options.orderByDebt ? 'order by debt desc ' : ''}
   ${ options.orderByTransDay ? 'order by trans_day ' : '' }
   ${ options.orderByName ? 'order by name ' : '' }
   `
   query +=`${filter.limit ? "limit " + parseInt(filter.limit) : ""}`

    let results = await selectRaw(query, "find all customers");
    return results.map(_ => new CustomerDAO(_));
  }

  async getCustomerDetails(id) {
    let one = await this.model
      .forge("id", id)
      .fetch({ withRelated: ["trans"], softDelete: false });
    let trans = one
      .related("trans")
      .map(_ => new CustomerTransDAO(_.attributes));
    return { dao: new CustomerDAO(one.toJSON()), trans: trans };
  }

  async findOne(id) {
    let one = await this.model.forge("id", id).fetch({ softDelete: false });
    return new CustomerDAO(one.toJSON());
  }

  async sumDebt() {
    let [result] = await selectRaw(
      `select sum(sum_debt) as sum_debt from
      (select * from customers where deleted_at is null and (is_self is null or is_self = 0) )customers_g
      LEFT JOIN  (select customer_id, sum(amount) as sum_debt from customer_trans group by customer_id ) customer_trans_g
      ON customers_g.id = customer_trans_g.customer_id `
    );
    return result;
  }

  async getCustomerSumDebt(customer_id) {
    let [result] = await selectRaw(
      `select sum(amount) as sum_debt from
      customer_trans where customer_id = ${customer_id}`
    );
    return result;
  }

  async getDailyOutTrans(filter = { id: null, day: "" }) {
    
    let daily_out_trans = await this.customerTransModel
      .query(
        {
          whereRaw: `customer_id = ${filter.id} and day = '${filter.day}' and trans_type in ('outgoing','cust_in_collecting','mashal','aarbon','repay_rahn_internal')`
        }
      )
      .fetchAll({ withRelated: ["outgoing", "product"] });
    
    let trans_arr = daily_out_trans.map(item => {
      
      let transDAO = new CustomerTransDAO(item.attributes);
      if (item.related("outgoing")) {
        transDAO.kg_price = item.related("outgoing").get("kg_price");
        transDAO.weight = item.related("outgoing").get("weight");
        transDAO.count = item.related("outgoing").get("count");
        transDAO.product_name = item.related("product").get("name");
      }
      console.log(transDAO);
      return transDAO;
    });

    /*
   // Grouping Transes
    let [daily_out_trans] = await knexraw(`select 
v_trans.id,
v_trans.day,
v_trans.customer_id,
outgoing_id,
cashflow_id,
sum(amount) as amount,
trans_type,
actual_sale,
v_outgoings.kg_price,
sum(v_outgoings.weight) as weight,
sum(v_outgoings.count) as count,
v_outgoings.product_id,
v_products.name as product_name

from (SELECT * from customer_trans 
where customer_id = ${filter.id} and day = '${filter.day}'
and trans_type in ('outgoing','cust_in_collecting','mashal')
 ) as v_trans
left join (select * from outgoings  ) as v_outgoings 
on v_trans.outgoing_id = v_outgoings.id
left join (select * from products ) as v_products
on v_trans.product_id = v_products.id

GROUP by kg_price, v_outgoings.product_id, trans_type`);

    let trans_arr = daily_out_trans.map(item => {
      let transDAO = new CustomerTransDAO(item);
      console.log(transDAO)
      return transDAO;
    });
    /**/
    let product_rahn_trans = await selectRaw(`select day, customer_id, trans_type, sum(amount) amount
    from customer_trans where customer_id= ${filter.id} and
    trans_type= 'product_rahn' and
    day= '${filter.day}'`);
    product_rahn_trans.map(item => {
      if (item && item.amount) trans_arr.push(new CustomerTransDAO(item));
    });

    return trans_arr;
  }

  async getCustomerTrans(filter = { id: null, day: "" }) {
    let results = await selectRaw(`
select null as id, day, notes, customer_id,null as cashflow_id,'+' as sum  ,sum(amount) as amount, 'sum_outgoing' as trans_type  from customer_trans 
where customer_id = ${filter.id} and 
(trans_type= 'outgoing' 
or trans_type= 'product_rahn' 
or trans_type= 'cust_in_collecting' 
or trans_type= 'mashal' 
or trans_type= 'repay_rahn_internal' 
or trans_type= 'aarbon') GROUP BY day
UNION
select id, day, notes, customer_id, cashflow_id, sum , amount , trans_type  from customer_trans 
where customer_id = ${filter.id} 
and trans_type <> 'outgoing' 
and trans_type <> 'product_rahn' 
and trans_type <> 'cust_in_collecting'
and trans_type <> 'mashal'
and trans_type <> 'repay_rahn_internal'
and trans_type <> 'aarbon'
ORDER BY day 
`);
    return results.map(_ => new CustomerTransDAO(_));
  }

  async getCustomerNetRahn(filter = { id: null }) {
    let [result] = await selectRaw(`select sum( amount ) net_rahn 
    from customer_trans where customer_id = ${filter.id}
    and trans_type in (
      'repay_cust_rahn',
      'repay_rahn_in',
      'rahn_down',
      'product_rahn_external',
      'product_rahn',
      'repay_rahn_internal',
      'repay_rahn_auto',
      'add_rahn_auto',
      'repay_rahn_cash'
    )
`);
    return result.net_rahn;
  }

  async getSumNetRahn() {
    let [result] = await selectRaw(`select sum( amount ) as net_rahn 
    from customer_trans 
    where trans_type in (
      'repay_cust_rahn',
      'repay_rahn_in',
      'rahn_down',
      'product_rahn_external',
      'product_rahn',
      'repay_rahn_internal',
      'repay_rahn_auto',
      'add_rahn_auto',
      'repay_rahn_cash'
    )
`);
    return result.net_rahn;
  }

  async getRestInSelf(customer_id) {
    let results = await selectRaw(`
select * from customer_trans where customer_id = ${customer_id} and trans_type = 'outgoing' and 
(actual_sale is null or actual_sale = 0)
`);
    return results.map(_ => new CustomerTransDAO(_));
  }

  /**@param {CustomerTransDAO} transDAO */
  async updateDebtBySelfTrans(transDAO) {
    let transInstance = await this.customerTransModel
      .forge("id", transDAO.id)
      .fetch();
    await transInstance.save({
      actual_sale: transDAO.actual_sale,
      cashflow_id: transDAO.cashflow_id
    });
    /**@type {import('bookshelf').ModelBase} */
    let customerInstance = await this.model
      .forge("id", transDAO.customer_id)
      .fetch({ softDelete: false });
    let debt = customerInstance.get("debt");
    // TODO more organized !
    debt = parseFloat(debt) - parseFloat(transDAO.actual_sale);
    await customerInstance.save({ debt: debt });
  }

  /**@param {CustomerTransDAO} transDAO */
  async updateDebtByTrans(transDAO) {
    /**@type {import('bookshelf').ModelBase} */
    let instance = await this.model
      .forge("id", transDAO.customer_id)
      .fetch({ softDelete: false });

    let debt =
      instance.get("debt") && parseFloat(instance.get("debt"))
        ? parseFloat(instance.get("debt"))
        : 0;
    transDAO.debt_was = debt;

    if (transDAO.sum == "-") transDAO.amount = -parseFloat(transDAO.amount);

    await this.createCustomerTrans(transDAO);

    debt += parseFloat(transDAO.amount);
    return await instance.save({ debt: debt });
  }

  /**@param {CustomerTransDAO} transDAO */
  async createCustomerTrans(transDAO) {
    transDAO.parseTypes();

    let trans_record = await this.customerTransModel.forge(transDAO).save();
    return trans_record.id;
  }

  /**@param {CustomerTransDAO} transDAO */
  async removeCustomerTrans(transDAO) {
    let transInstance = await this.customerTransModel
      .forge("id", transDAO.id)
      .fetch();
    transDAO = new CustomerTransDAO(transInstance.attributes);
    /**@type {import('bookshelf').ModelBase} */
    let customerInstance = await this.model
      .forge("id", transDAO.customer_id)
      .fetch({ softDelete: false });
    console.log(customerInstance.attributes);
    let debt = customerInstance.get("debt");
    let amount = parseFloat(transDAO.amount);
    // console.log(debt,amount)
    // TODO more organized !
    debt = parseFloat(debt) - amount;

    let p1 = customerInstance.save({ debt: debt });
    let p2 = new CashflowCtrl().rawDelete({
      cashflow_id: transDAO.cashflow_id
    });
    let p3 = transInstance.destroy();
    return Promise.all([p1, p2, p3]);
  }

  // To solve foreach async problem
  async asyncEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index);
    }
  }

  async removeTransByOutgoingId(outgoing_id) {
    let transArr = await this.customerTransModel
      .where("outgoing_id", outgoing_id)
      .fetchAll();
    transArr = transArr.map(_ => new CustomerTransDAO(_.attributes));
    await this.asyncEach(transArr, async item => {
      console.log(item);
      await this.removeCustomerTrans(item);
    });
    /*
    if(transInstance){
      let transDAO = new CustomerTransDAO(transInstance.toJSON())
      await this.removeCustomerTrans(transDAO)
    }
    */
  }

  async deleteById(id) {
    let instance = await this.model.where("id", id).fetch();
    if (instance) return await instance.destroy();
    else return null;
  }

  async permenentDeleteById(id) {
    await execRaw(`delete from customer_trans where customer_id = ${id}`);
    await execRaw(`delete from customers where id = ${id}`);
  }

  async resotreById(id) {
    /**@type import('bookshelf').ModelBase */
    let instance = await this.model
      .where("id", id)
      .fetch({ softDelete: false });
    instance.set("deleted_at", null);
    return await instance.save();
  }
}
