import { bookshelf } from '../main'
import { CashflowDAO , CashflowCtrl} from './CashflowCtrl';
import { TransTypesCtrl } from './TransTypesCtrl';
import { InoutHeadCtrl } from './InoutHeadCtrl';

export class IncomingDAO {

  id
  day
  supplier_id
  supplier_name
  product_id 
  product_name
  count
  group_id
  nolon
  given

  // Constant member
  static get INIT_DAO() {
    return { }
  }

  constructor (data) {
    Object.assign(this, data)
  }

  parseTypes() {
    this.count = parseInt(this.count)
    this.product_id = parseInt(this.product_id)
    delete this.supplier_name
    delete this.product_name
    delete this.nolon
    delete this.given
  }
}

export class IncomingsData {
  day
  supplier_id
  products_arr = []
  nolon
  given
  recp_expenses

  static get INIT_DAO() {
    return { }
  }

  constructor (data) {
    Object.assign(this, data)
  }

  parseTypes() {
    this.nolon = this.nolon ? parseFloat(this.nolon): 0
    this.given = this.given ? parseFloat(this.given): 0
  }
}

export class IncomingsCtrl {
  /**@type {import('bookshelf').Model} */
  model
  /**@type {TransTypesCtrl} */
  transTypesCtrl
  /**@type {CashflowCtrl} */
  cashflowCtrl
  /**@type {InoutHeadCtrl} */
  inoutHeadCtrl

  constructor() {
    this.model = require('../models/IncomingsModel')(bookshelf)
    this.transTypesCtrl = new TransTypesCtrl()
    this.cashflowCtrl = new CashflowCtrl()
    this.inoutHeadCtrl = new InoutHeadCtrl()
  }

  /**@param {IncomingDAO} data */
  async save(data) {
    data.parseTypes()
    let record = await this.model.forge(data).save()
    return record.id
    // TODO Add Customer Trans
  }

  // To solve foreach async problem
  async asyncEach(array, callback) {
    for (let index = 0 ; index < array.length ; index ++) {
      await callback( array[index] , index )
    }
  }

  /**@param {IncomingsData} data */
  async saveIncomingsData(data) {
    console.log(data)
    data.parseTypes()
    console.log("now", data)
    let first_inc_id = null , products_ids = []

    await this.asyncEach(data.products_arr, async (product)=> {
      products_ids.push(product.id)
      
      let incDAO = new IncomingDAO({day: data.day,
        supplier_id: data.supplier_id,
        product_id: product.id,
        count: product.count,
        group_id: first_inc_id
      })
      let record_id = await this.save(incDAO)
      first_inc_id = first_inc_id ? first_inc_id : record_id
    })

    if(data.nolon || data.given || data.recp_expenses ) {

      // default cashflow
      let cashDAO = new CashflowDAO({
        supplier_id: data.supplier_id,
        day: data.day,
        d_product: products_ids.join(),
        incoming_id: first_inc_id,
        income_day: data.day
      })

      if(data.nolon) {
        let transType = await this.transTypesCtrl.findOne({name: 'nolon', category: 'cashflow'})
        cashDAO.transType = transType
        cashDAO.amount = data.nolon
        this.cashflowCtrl.save(cashDAO)
      }
      
      if(data.given) {
        let transType = await this.transTypesCtrl.findOne({name: 'given', category: 'cashflow'})
        cashDAO.transType = transType
        cashDAO.amount = data.given
        this.cashflowCtrl.save(cashDAO)
      }
      
      if(data.recp_expenses) {
        let transType = await this.transTypesCtrl.findOne({name: 'supp_recp_expenses', category: 'cashflow'})
        cashDAO.transType = transType
        cashDAO.amount = data.recp_expenses
        this.cashflowCtrl.save(cashDAO)
      }
    }
    return first_inc_id
  }

  async removeIncoming(id) {
    let instance = await this.model.forge('id',id).fetch()
    let inoutHeadRecord = await this.inoutHeadCtrl.findOne({
      day: instance.get('day'),
      product_id: instance.get('product_id'),
      supplier_id: instance.get('supplier_id')
    })
    if(parseInt(instance.get('count')) <= inoutHeadRecord.diff) {
      // Save to remove
      await instance.destroy()
      await this.cashflowCtrl.rawDelete({incoming_id: id})
      return true
    }
    else {
      return false
    }
  }

  async removeRestInc(incom) {
    let instance = await this.model.query(q => {
      q.where({
        supplier_id: incom.supplier_id,
        day: incom.day,
        product_id: incom.product_id
      })
      q.andWhere('count','>=' , incom.diff)
      // q.debug(true)
    }).fetch()
    console.log(instance.get('count'))
    let rest = parseInt(instance.get('count') - parseInt(incom.diff))
    await instance.save({count: rest})
  }

  async findAll(filter = {}) {
    let all = await this.model.where(filter).fetchAll({withRelated: ['supplier','product','cashflows']})
    return all.map( _=> {
      let incDAO = new IncomingDAO(_.attributes)
      incDAO.supplier_name = _.related('supplier').get('name')
      incDAO.product_name = _.related('product').get('name')
      if(_.related('cashflows').toJSON()[0]) { // is array 
        _.related('cashflows').toJSON().forEach(cashflow => {
          if(cashflow.state == 'nolon')
            incDAO.nolon = cashflow.amount
          else if (cashflow.state == 'given')
            incDAO.given = cashflow.amount
        })
      }
      return incDAO
    })
  }

  async deleteById(id){
    let instance = await this.model.where('id',id).fetch()
    if(instance)
      return await instance.destroy()
    else
      return null
  }
}