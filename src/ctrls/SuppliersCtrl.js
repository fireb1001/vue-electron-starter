import { bookshelf } from '../main'

export class SupplierDAO {

  id 
  name 
  balance 
  phone
  address
  notes
  is_self
  deleted_at

  static get INIT_DAO() {
    return { }
  }

  parseTypes() {
    this.balance = this.debt ? parseFloat(this.debt) : 0 
  }

  constructor (data) {
    Object.assign(this, data)
  }
}

export class SupplierTransDAO {

  id
  supplier_id
  day
  cashflow_id
  amount
  trans_type
  sum
  balance_after
  notes

  static get INIT_DAO() {
    return { }
  }

  parseTypes () {
    this.amount = this.amount? parseFloat(this.amount) : 0
  }

  constructor (data) {
    Object.assign(this, data)
  }
}

export class SuppliersCtrl {
  /**@type {import('bookshelf').Model} */
  model

  constructor() {
    this.model = require('../models/SuppliersModel')(bookshelf)
  }

  /**@param {SupplierDAO} data */
  async save(data) {
    data.parseTypes()
    let record = await this.model.forge(data).save()
    return record.id
  }

  async findAll(filter = {}, options = {}) {
    let all = await this.model.where(filter).fetchAll(options)
    
    return all.map( _=> new SupplierDAO(_.attributes))
  }

  
  async findById(id) {
    let instance = await this.model.where('id',id).fetch({withRelated:['trans']})
    return new SupplierDAO(instance.attributes)
  }

  async getSupplierDetails(id){
    let one = await this.model.forge('id',id).fetch({withRelated:['trans']})
    let trans = one.related('trans').map( _=> new SupplierTransDAO(_.attributes))
    return {dao: new SupplierDAO(one.toJSON()), trans: trans}
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
    instance.set('deleted_at',null)
    return await instance.save()
  }
}