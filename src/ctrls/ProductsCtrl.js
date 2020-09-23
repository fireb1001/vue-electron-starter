import { bookshelf, knex } from '../main'

export class ProductDAO {
    id
    name
    notes
    product_sell_comm
    product_rahn
    weight_deduct
    cust_mashal
    // season 
    // collection = ''

  static get INIT_DAO() {
    return { name: ''}
  }

  constructor( data = {} ){
    Object.assign(this, data)
  }
  
  parseTypes() {  }
}

export class ProductsCtrl {
    /**@type {import('bookshelf').Model} */
    model
  
    constructor() {
      this.model = require('../models/ProductsModel')(bookshelf)
    }

      /**@param {ProductDAO} data */
  async save(data) {
    data.parseTypes()
    let record = await this.model.forge(data).save()
    return record.id
  }

  async findById(id) {
    let instance = await this.model.where('id',id).fetch()
    return new ProductDAO(instance.attributes)
  }

  async findAll(filter = {}, options = {}) {
    let all = await this.model.where(filter).query('orderBy', 'id', 'desc').fetchAll(options)
    return all.map( _=> new ProductDAO(_.attributes))
  }

  async getProductsArr(){
    // get all products
    let all = await this.model.where({}).fetchAll({softDelete: false})
    return all.reduce( (arr, _) => {
      arr[_.id] = _.attributes.name
      return arr
    },{})
  }

  async deleteById(id){
    
    let instance = await this.model.where('id',id).fetch()
    if(instance)
      return await instance.destroy()
    else
      return null
  }

  async permenentDeleteById(id) {
    await knex.raw(`delete from products where id = ${id}`);
  }


  async resotreById(id) {
    /**@type import('bookshelf').ModelBase */
    let instance = await this.model.where('id',id).fetch({softDelete: false})
    instance.set('deleted_at',null)
    return await instance.save()
  }
}