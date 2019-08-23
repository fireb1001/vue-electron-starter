import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {store, MyStoreMutations} from './store'
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)

// Import vue-datetime with specific loader for CSS files
import Datetime from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
Vue.use(Datetime)

Vue.config.productionTip = false

const {app} = require('electron').remote
const path = require('path')
const log = require('electron-log')

log.info('app.getAppPath())'+ app.getAppPath())

const dbFile = path.resolve(path.dirname(app.getAppPath()), './db/shaderlite.db')

log.info('dbFile',dbFile)

store.commit('setElectronData',{
  app_path: app.getAppPath(),
  curr_dir: path.dirname(app.getAppPath()),
  db_path: dbFile,
  env:process.env
})

let sqlite_config = {
  client: 'sqlite3',
  connection: {
    filename: dbFile
  },
  useNullAsDefault: true
}

const knex = require('knex')(sqlite_config)
Object.defineProperty(knex, "name", { value: "knex" })

let bookshelf= require('bookshelf')(knex)
bookshelf.plugin(require('bookshelf-soft-delete'))

export { knex, sqlite_config, bookshelf, MyStoreMutations };
export * from './tools';
import {moment} from './tools'

Vue.filter('arDate' , function(date) {
  return moment(date).format('LL')
})

Vue.filter('tr_label' , function(string, collection) {

  if(! collection)
    return (store.state.custom_labels[string])? store.state.custom_labels[string] : string
  else if (collection == 'trans_types')
    return (store.state.transtypes_arr[string])? store.state.transtypes_arr[string] : string
})

String.prototype.toAR= function() {
  return this.replace(/\d/g, d =>  '٠١٢٣٤٥٦٧٨٩'[d])
}

Vue.filter('toAR' , function(number) {
  let num = ( number || number === 0 ) ? parseFloat(number) : '--'
  return num.toLocaleString('ar-EG')
})

function roundOf(n, p) {
  const n1 = n * Math.pow(10, p + 1);
  const n2 = Math.floor(n1 / 10);
  if (n1 >= (n2 * 10 + 5)) {
      return (n2 + 1) / Math.pow(10, p);
  }
  return n2 / Math.pow(10, p);
}

Vue.filter('round', function(value, decimals) {
  if(!value) 
    value = 0;

  if(!decimals) 
    decimals = 0;

  value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return value;
});

Vue.filter('round2' , function(number) {
  let rounded = number? parseFloat(number) : 0
  return roundOf(rounded,2)
})

Vue.filter('default0' , function(number) {
  
  return parseInt(number)? parseInt(number) : 0
})

Vue.filter('concat_recp_paid' , function(concat_recp_paid) {
  
  return concat_recp_paid
})

function testJSON(text){
  if (typeof text!=="string" || parseInt(text) > 0 || parseInt(text) === 0){
    return false;
  }
  try{
    JSON.parse(text);
    return true;
  }
  catch (error){
    return false;
  }
}

Vue.filter('productsFilter' , function(products , separator = ' , ') {
  let only_prod_names = []
  products = products ? products : ''
  //console.log('productsFilter', products , separator)
  if(testJSON(products)) {
    let all_products = JSON.parse(products)
    all_products.forEach(prod => {
      //console.log("prod",prod)
      if(prod.product)
        only_prod_names.push(prod.product)
      else if (prod.product_name)
        only_prod_names.push(prod.product_name)
    });
    let uniqueItems = [...new Set(only_prod_names)]
    return uniqueItems.join(separator)
  } 
  else if(products.includes(',') && products.indexOf(',') > -1) {
    let products_ids = products.split(',')
    products_ids.forEach(id => {
      only_prod_names.push(store.state.products_arr[id])
    })
    return only_prod_names.join(separator)
  }
  else if (parseInt(products) > 0) {
    return store.state.products_arr[parseInt(products)]
  }
  else {
    return products
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

Vue.prototype.vue_window = window
Vue.prototype.vue_document = document