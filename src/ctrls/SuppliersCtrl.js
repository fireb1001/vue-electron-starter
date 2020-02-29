import { bookshelf, knex } from '../main'
import { store } from '../store'
import { TransTypesCtrl } from './TransTypesCtrl'

export class SupplierDAO {

  id 
  name 
  balance 
  
  phone
  address
  notes
  //is_self
  deleted_at
  box_count

  sum_debt
  sum_net_rasd

  static get INIT_DAO() {
    return { name: '' }
  }

  parseTypes() {
    this.balance = this.balance ? parseFloat(this.balance) : 0 
    this.name = (""+this.name).trim()
    delete this.sum_debt
    delete this.sum_net_rasd

    delete this.trans
    delete this.supplier_id
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
  receipt_id
  notes

  static get INIT_DAO() {
    return { }
  }

  parseTypes () {
    this.amount = this.amount? parseFloat(this.amount) : 0
    delete this.products
    delete this.count

  }

  /**@param {import('./TransTypesCtrl').TransTypeDAO} transDAO */
  set transType(transDAO) {
    this.trans_type = transDAO.name
    this.sum = transDAO.sum
  }

  constructor (data) {
    Object.assign(this, data)
  }
}

export class SuppliersCtrl {
  /**@type {import('bookshelf').Model} */
  model

  /**@type {import('bookshelf').Model} */
  supplierTransModel

  constructor() {
    this.model = require('../models/SuppliersModel')(bookshelf)
    this.supplierTransModel = require('../models/SupplierTransModel')(bookshelf)
  }

  /**@param {SupplierDAO} data */
  async save(data) {
    data.parseTypes()
    let record = await this.model.forge(data).save()
    if(! data.id && data.balance >= 0) {
      // new one with init debt
      let transDAO = new SupplierTransDAO({
        supplier_id: record.id,
        amount: data.balance,
        day: store.state.day.iso
      })

      let selectedTrans = await new TransTypesCtrl().findOne({name: 'supp_init_payment' , category: 'supplier_trans'})
      transDAO.transType = selectedTrans
      console.log(transDAO)
      await this.createSupplierTrans(transDAO)
    }
    return record.id
  }

  /**@param {SupplierTransDAO} transDAO */
  async updateBalanceByTrans(transDAO) {
    /**@type {import('bookshelf').ModelBase} */
    let instance = await this.model.forge('id',transDAO.supplier_id).fetch({softDelete: false})
    let balance = parseFloat(instance.get('balance')) ? parseFloat(instance.get('balance')) : 0
    /*
    if(transDAO.sum === '+') {
      balance += parseFloat(transDAO.amount)
    } else if(transDAO.sum === '-'){
      balance -= parseFloat(transDAO.amount)
    }
    await instance.save({balance: balance})
    transDAO.balance_after = balance
    return await this.createSupplierTrans(transDAO)
    */

    if(transDAO.sum == '-')
      transDAO.amount = - parseFloat(transDAO.amount)
    await this.createSupplierTrans(transDAO)
    
    balance += parseFloat(transDAO.amount)

    return await instance.save({balance: balance})
  }

  /**@param {SupplierTransDAO} transDAO */
  async createSupplierTrans(transDAO) {
    transDAO.parseTypes()

    if(transDAO.trans_type == 'supp_pre_payment') {
      transDAO.trans_type = 'supp_payment'
    }

    let trans_record = await this.supplierTransModel.forge(transDAO).save()
    return trans_record.id
  }

  /**@param {SupplierTransDAO} transDAO */
  async saveSupplierTrans(transDAO) {
    transDAO.parseTypes()
    let trans_record
    if(transDAO.trans_type == 'supp_pre_payment') {
      transDAO.trans_type = 'supp_payment'
    }
    if(transDAO.receipt_id) {
      let foundTrans = await this.supplierTransModel.where('receipt_id',transDAO.receipt_id).fetch()
      if(foundTrans) {
        trans_record = await foundTrans.save({amount: transDAO.amount})
      } else {
        trans_record = await this.supplierTransModel.forge(transDAO).save()
      }

    } else {
      trans_record = await this.supplierTransModel.forge(transDAO).save()
    }

    return trans_record.id
  }

  async findAll(filter = { limit: null }, options= {softDelete: false, orderByBalance: false}) {
    /*
    let all = await this.model.where(filter).fetchAll(options)
    return all.map( _=> new SupplierDAO(_.attributes))
    */
    console.log(options)
    let SQL = `
select * from (select * from suppliers ${options.softDelete ? 'where deleted_at is null': ''}) suppliers_g
LEFT JOIN ( 
  select supplier_id, sum(amount) as sum_debt from supplier_trans group by supplier_id 
) supplier_trans_g
ON suppliers_g.id = supplier_trans_g.supplier_id 
LEFT JOIN (
  select supplier_id, sum(net_value) as sum_net_rasd from receipts group by supplier_id 
) supp_recp_g
ON  suppliers_g.id = supp_recp_g.supplier_id
${options.orderByBalance ? 'order by balance desc' : ''}
${filter.limit ? "limit " + parseInt(filter.limit) : ""}
`
    let results = await knex.raw(SQL)
    console.log(SQL)

    return results.map( _=> {return new SupplierDAO(_)})
  }

  
  async findById(id) {
    let instance = await this.model.where('id',id).fetch({withRelated:[
    {'trans': function(qb){
      qb.orderBy('day','desc')
    }}
    ],softDelete: false})
    return new SupplierDAO(instance.attributes)
  }

  async sumDebt(){
    let result = await knex.raw(`select sum(balance) as sum_debt from suppliers where deleted_at is null`)
    return result.length > 0 ? result[0] : null
  }

  async getSupplierDetails(id){
    let one = await this.model.forge('id',id).fetch({withRelated:[
      {'trans': function(qb){
        qb.orderBy('day')
      }}
      ],softDelete: false})
    let trans = one.related('trans').map( _=> new SupplierTransDAO(_.attributes))
    return {dao: new SupplierDAO(one.toJSON()), trans: trans}
  }

  async removeSupplierTrans(trans_id) {
    let transInstance = await this.supplierTransModel.forge('id', trans_id).fetch()
    let transDAO = new SupplierTransDAO(transInstance.attributes)
    /**@type {import('bookshelf').ModelBase} */
    let instance = await this.model.forge('id',transDAO.supplier_id).fetch({softDelete: false})
    let balance = instance && instance.get('balance') ? instance.get('balance') : 0
    let amount = parseFloat(transDAO.amount)
    console.log(balance, amount)
    // TODO more organized !
    balance = parseFloat(balance) - amount

    await instance.save({balance: balance})
    await transInstance.destroy()
    return true 
  }

  async deleteById(id){
    
    let instance = await this.model.where('id',id).fetch()
    if(instance)
      return await instance.destroy()
    else
      return null
  }

  async permenentDeleteById(id) {
    await knex.raw(`delete from supplier_trans where supplier_id = ${id}`);
    await knex.raw(`delete from suppliers where id = ${id}`)
  }


  async resotreById(id) {
    /**@type import('bookshelf').ModelBase */
    let instance = await this.model.where('id',id).fetch({softDelete: false})
    instance.set('deleted_at',null)
    return await instance.save()
  }
}