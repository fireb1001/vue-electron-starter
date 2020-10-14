import { bookshelf, execRaw, knex, selectRaw } from "../main";

export class CashflowDAO {
  id;
  day;
  state;
  d_product;
  sum;
  amount;
  notes;
  outgoing_id;
  incoming_id;

  supplier_id;
  supplier_name;

  dealer_id;
  dealer_name;

  customer_id;
  customer_name;

  income_day;
  kg_price;
  count;
  weight;
  receipt_id;

  static get INIT_DAO() {
    return {};
  }

  /**@param {import('./TransTypesCtrl').TransTypeDAO} transDAO */
  set transType(transDAO) {
    this.state = transDAO.name;
    this.sum = transDAO.sum;
  }

  parseTypes() {
    this.amount = this.amount
      ? Math.abs(parseFloat(this.amount).toFixed(2))
      : 0;
    delete this.customer_name;
    delete this.supplier_name;
    delete this.dealer_name;

    delete this.count;
    delete this.kg_price;
    delete this.weight;
  }

  constructor(data) {
    Object.assign(this, data);
  }
}

export class CashflowCtrl {
  /**@type {import('bookshelf').Model} */
  model;

  constructor() {
    this.model = require("../models/CashflowModel")(bookshelf);
  }

  /**@param {CashflowDAO} data */
  async save(data) {
    console.log(data)
    data.parseTypes();
    let record = await this.model.forge(data).save();
    return record.id;
  }

  async findAll(filter = {}, orderBy = '') {
    // {withRelated: ['supplier','product','customer']}
    let all = await this.model
      .where(filter)
      .query(function(qb) {
        if(orderBy != 'id') {
          qb.orderBy("customer_id", "DESC");
          qb.orderBy("supplier_id", "DESC");
        }
      })
      .fetchAll({ withRelated: ["outgoing", "customer", "supplier","dealer"] });
    return all.map(_ => {
      let cashDAO = new CashflowDAO(_.attributes);
      cashDAO.income_day = _.related("outgoing").get("income_day") ? _.related("outgoing").get("income_day") : _.attributes.income_day;
      cashDAO.count = _.related("outgoing").get("count");
      cashDAO.kg_price = _.related("outgoing").get("kg_price");
      cashDAO.weight = _.related("outgoing").get("weight");
      cashDAO.customer_name = _.related("customer").get("name");
      cashDAO.supplier_name = _.related("supplier").get("name");
      cashDAO.dealer_name = _.related("dealer").get("name");
      // if(cashDAO.state == 'recp_paid') console.log(cashDAO.income_day)
      return cashDAO;
    });
  }

  async getExItems() {
    return await selectRaw(
      `select * from trans_types where category = 'cashflow' and sum = '-' and map_cashflow= 'ex'`
    );
  }

  async getNetCash(filter = { day: "" }) {
    let results = await selectRaw(
      `SELECT sum(CASE When sum='-' Then -amount Else amount End ) net_amount from cashflow where day= '${filter.day}'`
    );
    let net_amount = results && results.length > 0 ? results[0].net_amount : 0;
    return net_amount;
  }

  async getSupplierNolons(filter = { day: "", supplier_id: 0 }) {
    let query = `SELECT supplier_id, day, sum(amount) as total_nolon from cashflow WHERE 
    state= 'nolon' and supplier_id = '${filter.supplier_id}' and day = '${filter.day}'`;
    let [results] = await selectRaw(query);
    return results.total_nolon ? results.total_nolon  : 0;
  }

  async getSupplierRecpExpenses(filter = { day: "", supplier_id: 0 }) {
    let query = `SELECT id,supplier_id, day, amount from cashflow WHERE 
    state= 'supp_recp_expenses' and supplier_id = '${filter.supplier_id}' and income_day = '${filter.day}'`;
    console.log("getSupplierRecpExpenses query", query)
    let [result] = await selectRaw(query);
    console.log(result)
    return result ? new CashflowDAO(result) : null;
  }
  // async removeByOutgoingId(outgoing_id) { }
  async rawDelete(filter = {}) {
    //console.log('rawDelete filter', filter)
    if (filter.incoming_id)
      await execRaw(
        `delete from cashflow where incoming_id = ${filter.incoming_id}`
      );
    else if (filter.outgoing_id)
      await execRaw(
        `delete from cashflow where outgoing_id = ${filter.outgoing_id}`
      );
    else if (filter.state == "recp_paid" && filter.supplier_id && filter.day)
      await execRaw(
        `delete from cashflow where state= 'recp_paid' and day='${filter.day}' and supplier_id= ${filter.supplier_id}`
      );
    else if (filter.receipt_id)
      await execRaw(
        `delete from cashflow where receipt_id= ${filter.receipt_id}`
      );
    else if (filter.cashflow_id)
      await execRaw(`delete from cashflow where id= ${filter.cashflow_id}`);
  }
  async deleteById(id) {
    let instance = await this.model.where("id", id).fetch();
    if (instance) return await instance.destroy();
    else return null;
  }
}
