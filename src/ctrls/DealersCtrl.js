import { bookshelf, knex } from '../main'
import { store } from '../store'
import { TransTypesCtrl } from './TransTypesCtrl'
import { CashflowCtrl } from './CashflowCtrl'

export class DealerDAO {

  id 
  name
  sum_debt
  phone
  notes
  deleted_at
  balance

  static get INIT_DAO() {
    return { name: '' }
  }

  parseTypes() {
    this.name = (""+this.name).trim()
    delete this.sum_debt
    delete this.trans
    delete this.dealer_id
  }

  constructor (data) {
    Object.assign(this, data)
  }
}

export class DealerTransDAO {

  id
  dealer_id
  day
  cashflow_id
  amount
  trans_type
  sum
  notes

  static get INIT_DAO() {
    return { }
  }

  parseTypes () {
    this.amount = this.amount? parseFloat(this.amount) : 0
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

export class DealersCtrl {
  /**@type {import('bookshelf').Model} */
  model

  /**@type {import('bookshelf').Model} */
  dealerTransModel

  constructor() {
    this.model = require('../models/DealersModel')(bookshelf)
    this.dealerTransModel = require('../models/DealerTransModel')(bookshelf)
  }

  /**@param {DealerDAO} data */
  async save(data) {
    data.parseTypes()
    console.log(data)
    let record = await this.model.forge(data).save()
    if(! data.id && data.balance ) {
      // new one with init debt
      let transDAO = new DealerTransDAO({
        dealer_id: record.id,
        amount: data.balance,
        day: store.state.day.iso
      })

      let selectedTrans = await new TransTypesCtrl().findOne({name: 'dealer_init' , category: 'dealer_trans'})
      transDAO.transType = selectedTrans
      await this.createDealerTrans(transDAO)
    }
    return record.id
  }

  /**@param {DealerTransDAO} transDAO */
  async updateBalanceByTrans(transDAO) {
    /**@type {import('bookshelf').ModelBase} */
    let instance = await this.model.forge('id',transDAO.dealer_id).fetch({softDelete: false})
    let balance = parseFloat(instance.get('balance')) ? parseFloat(instance.get('balance')) : 0

    if(transDAO.sum == '-')
      transDAO.amount = - parseFloat(transDAO.amount)
    await this.createDealerTrans(transDAO)

    return await instance.save({balance: balance})
  }

  /**@param {DealerTransDAO} transDAO */
  async createDealerTrans(transDAO) {
    transDAO.parseTypes()

    let trans_record = await this.dealerTransModel.forge(transDAO).save()
    return trans_record.id
  }

  /**@param {DealerTransDAO} transDAO */
  async saveDealerTrans(transDAO) {
    transDAO.parseTypes()
    let trans_record

    trans_record = await this.dealerTransModel.forge(transDAO).save()
    
    return trans_record.id
  }

  async findAll(filter = { limit: null }, options= {softDelete: false, orderByBalance: false}) {

    let results = await knex.raw(`
    select * from (select * from dealers ${options.softDelete ? 'where deleted_at is null': ''}) dealers_g
    LEFT JOIN ( select dealer_id, sum(amount) as sum_debt from dealer_trans group by dealer_id ) dealer_trans_g
    ON dealers_g.id = dealer_trans_g.dealer_id ${options.orderByBalance ? 'order by balance desc' : ''}
    ${filter.limit ? "limit " + parseInt(filter.limit) : ""}
    `)

    return results.map( _=> {return new DealerDAO(_)})
  }

  
  async findById(id) {
    let instance = await this.model.where('id',id).fetch({withRelated:[
    {'trans': function(qb){
      qb.orderBy('day','desc')
    }}
    ],softDelete: false})
    return new DealerDAO(instance.attributes)
  }

  async sumDebt(){
    let result = await knex.raw(`select sum(balance) as sum_debt from dealers where deleted_at is null`)
    return result.length > 0 ? result[0] : null
  }

  async getDealerDetails(id){
    let one = await this.model.forge('id',id).fetch({withRelated:[
      {'trans': function(qb){
        qb.orderBy('day')
      }}
      ],softDelete: false})
    let trans = one.related('trans').map( _=> new DealerTransDAO(_.attributes))
    return {dao: new DealerDAO(one.toJSON()), trans: trans}
  }

  async removeDealerTrans(trans_id) {
    let transInstance = await this.dealerTransModel.forge('id', trans_id).fetch()
    let transDAO = new DealerTransDAO(transInstance.attributes)
    /**@type {import('bookshelf').ModelBase} */
    let instance = await this.model.forge('id',transDAO.dealer_id).fetch({softDelete: false})
    let balance = instance && instance.get('balance') ? instance.get('balance') : 0
    let amount = parseFloat(transDAO.amount)
    console.log(balance, amount)
    // TODO more organized !
    balance = parseFloat(balance) - amount

    await instance.save({balance: balance})
    await transInstance.destroy()

    await new CashflowCtrl().rawDelete({
      cashflow_id: transDAO.cashflow_id
    });
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
    await knex.raw(`delete from dealer_trans where dealer_id = ${id}`);
    await knex.raw(`delete from dealers where id = ${id}`)
  }

  async resotreById(id) {
    /**@type import('bookshelf').ModelBase */
    let instance = await this.model.where('id',id).fetch({softDelete: false})
    instance.set('deleted_at',null)
    return await instance.save()
  }
}