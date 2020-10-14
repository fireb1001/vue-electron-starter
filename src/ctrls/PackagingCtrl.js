import { bookshelf, knex, selectRaw } from "../main";

export class PackagingDAO {
  id;
  day;
  sum;
  count;
  amount;
  notes;
  supplier_id;
  supplier_name;
  dealer_id;
  dealer_name;
  customer_id;
  customer_name;
  cashflow_id;
  out_scope;

  static get INIT_DAO() {
    return {};
  }



  parseTypes() {
    this.count = this.count ? parseInt(this.count) : 0 ;
    this.amount = this.amount ? parseFloat(this.amount) : 0 ; 
    if(this.sum === '-') this.count = - this.count
    if(this.sum === '-') this.amount = - this.amount
    delete this.customer_name;
    delete this.supplier_name;
    delete this.dealer_name;

  }

  constructor(data) {
    Object.assign(this, data);
  }
}

export class PackagingCtrl {
  /**@type {import('bookshelf').Model} */
  model;

  constructor() {
    this.model = require("../models/PackagingModel")(bookshelf);
  }

  /**@param {PackagingDAO} data */
  async save(data) {
    data.parseTypes();
    let record = await this.model.forge(data).save();
    return record.id;
  }

  async getPersonSum(filter= {supplier_id: 0, customer_id:0 , dealer_id: 0}){
    let result = null 
    if(filter.supplier_id){
      let raw_sql = `select sum(count) count, sum(amount) amount from packaging 
      where supplier_id =${filter.supplier_id} and (out_scope !=1 or out_scope is null)`;
      [result] = await selectRaw(raw_sql);
    } else if(filter.customer_id){
      let raw_sql = `select sum(count) count, sum(amount) amount from packaging where customer_id =${filter.customer_id}`;
      [result] = await selectRaw(raw_sql);
    }
    else if (filter.dealer_id){
      let raw_sql = `select sum(count) count, sum(amount) amount from packaging where dealer_id =${filter.dealer_id}`;
      [result] = await selectRaw(raw_sql);
    }
    let { count, amount } = result;
    console.log('%c getPersonSum result ', 'background: #bada55' , result);
    return {count: +count, amount: +amount}
  }

  async getInitStock(day) {
    let raw_sql = `select sum(count) count, sum(amount) amount from packaging where day < '${day}'`;
    let [result] = await selectRaw(raw_sql);
    return result;
  }

  async getAllCounts() {
    let [result] = await selectRaw(`select
    sum(count_purchase) sum_purchase ,
    sum(count_destruct) sum_destruct ,
    sum(count_suppliers) sum_suppliers ,
    sum(count_customers) sum_customers ,
    sum(count_dealers) sum_dealers 
    from ( 
    select 
      case when supplier_id is null and dealer_id is null and customer_id is null and sum = '+' then count END count_purchase,
      case when supplier_id is null and dealer_id is null and customer_id is null and sum = '-' then count END count_destruct,
      case when supplier_id IS NOT NULL and ( out_scope !=1 or out_scope is null) then count END count_suppliers,
      case when customer_id IS NOT NULL then count END count_customers,
      case when dealer_id IS NOT NULL then count END count_dealers
    from packaging
    ) packaging_totals`);
    return result;
  }

  async findAll(filter = {}, orderBy = '') {
    let all = await this.model
      .where(filter)
      .query(function(qb) {
        if(orderBy != 'id') {
          qb.orderBy("customer_id", "DESC");
          qb.orderBy("supplier_id", "DESC");
        }
      })
      .fetchAll({ withRelated: ["customer", "supplier","dealer"] });
    return all.map(_ => {
      let pkgDAO = new PackagingDAO(_.attributes);
      pkgDAO.customer_name = _.related("customer").get("name");
      pkgDAO.supplier_name = _.related("supplier").get("name");
      pkgDAO.dealer_name = _.related("dealer").get("name");
      return pkgDAO;
    });
  }

  // async removeByOutgoingId(outgoing_id) { }
  async rawDelete(filter = {}) {
    console.log(filter)
  }
  async deleteById(id) {
    let instance = await this.model.where("id", id).fetch();
    if (instance) return await instance.destroy();
    else return null;
  }
}
