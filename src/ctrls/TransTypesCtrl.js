import { bookshelf } from '../main'

export class TransTypeDAO {
 
  name 
  ar_name
  sum
  category
  map_cashflow
  map_customer_trans
  cust_form
  map_packaging

  static get INIT_DAO() {
    return { }
  }

  parseTypes() {
  }

  constructor (data) {
    Object.assign(this, data)
  }
}

export class TransTypesCtrl {
  /**@type {import('bookshelf').Model} */
  model

  constructor() {
    this.model = require('../models/TransTypesModel')(bookshelf)
  }

  /**@param {TransTypeDAO} data */
  async save(data) {
    data.parseTypes()
    let record = await this.model.forge(data).save()
    return record.id
  }

  async findAll(filter = {}) {
    let all = await this.model.where(filter).fetchAll({})
    return all.map( _=> new TransTypeDAO(_.attributes))
  }

  async getTranstypesArr(){
    let all = await this.model.where({}).fetchAll()
    return all.reduce( (arr, _) => {
      arr[_.attributes.name] = _.attributes.ar_name
      return arr
    },{})
  }

  /**@returns {TransTypeDAO} */
  async findOne(filter = {}) {
    try {
      let transTypeInst = await this.model.where(filter).fetch()
      return new TransTypeDAO(transTypeInst.attributes)
    } catch (error) {
      console.error(error)
      return 
    }
  }

  async deleteById(id){
    
    let instance = await this.model.where('id',id).fetch()
    if(instance)
      return await instance.destroy()
    else
      return null
  }

}