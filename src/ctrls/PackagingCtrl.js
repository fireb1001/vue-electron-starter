import { bookshelf, knex } from "../main";

export class PackagingDAO {
  id;
  day;
  sum;
  amount;
  notes;
  supplier_id;
  supplier_name;
  dealer_id;
  dealer_name;
  customer_id;
  customer_name;

  static get INIT_DAO() {
    return {};
  }



  parseTypes() {
    this.amount = this.amount
      ? parseInt(this.amount)
      : 0;
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
    let amount = 0 
    if(filter.supplier_id){
      let raw_sql = `select sum(amount) amount from packaging where supplier_id =${filter.supplier_id}`;
      let [result] = await knex.raw(raw_sql);
      amount = result.amount
    }

    return parseInt(amount)
  }

  async getInitStock(filter= {day: ''}) {
    let result = null
    if(filter.day) {
      // get sum before day
      let raw_sql = `select sum(amount) amount from packaging where day < '${filter.day}'`;
      console.log(raw_sql)
      result = await knex.raw(raw_sql);
    } else {
      throw Error('day is not provided')
    }
    console.log(result)
    return result
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
