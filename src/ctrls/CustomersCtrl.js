import { bookshelf } from '../main'

export class CustomerDAO {

  id 
  name 
  debt 
  phone
  address
  notes
  is_self
  deleted_at

  static get INIT_DAO() {
    return { }
  }

  parseTypes() {
    this.debt = this.debt ? parseFloat(this.debt) : 0 
  }

  constructor (data) {
    Object.assign(this, data)
  }
}

export class CustomersCtrl {
  /**@type {import('bookshelf').Model} */
  model

  constructor() {
    this.model = require('../models/CustomersModel')(bookshelf)
  }

  /**@param {CustomerDAO} data */
  async create(data) {
    data.parseTypes()

    // It Creates And Saves !!!
    let record_id = null
    try {
      let record = await this.model.forge(data).save()
      record_id = record.id
    } catch (error) {
      throw error
    }
    return record_id
    // TODO Add Customer Trans
  }

  async findAll(filter = {}) {
    let all = await this.model.where(filter).fetchAll({softDelete: false})
    console.log(all.toJSON())
    return all.map( _=> new CustomerDAO(_.attributes))
  }

  async deleteById(id){
    
    let instance = await this.model.where('id',id).fetch()
    if(instance)
      return await instance.destroy()
    else
      return null
  }

  async resotreById(id) {
    /**@type import('bookshelf').ModelBase */
    let instance = await this.model.where('id',id).fetch({softDelete: false})
    console.log(instance.attributes)
    instance.set('deleted_at',null)
    return await instance.save()
  }
}