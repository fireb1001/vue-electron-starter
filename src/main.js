import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { store, MyStoreMutations } from "./store";
import BootstrapVue from "bootstrap-vue";
import vSelect from "vue-select";

Vue.use(BootstrapVue);
Vue.component("v-select", vSelect);

require("events").EventEmitter.defaultMaxListeners = 25;

// Import vue-datetime with specific loader for CSS files
import Datetime from "vue-datetime";
import "vue-datetime/dist/vue-datetime.css";
Vue.use(Datetime);

Vue.config.productionTip = false;

const { app } = require("electron").remote;
const path = require("path");
const log = require("electron-log");

const dbFile = path.resolve(app.getPath("userData"), "db/shaderlite.db");

log.info("dbFile", dbFile);

let app_config = {
  app_path: app.getAppPath(),
  curr_dir: path.dirname(app.getAppPath()),
  user_data_path: app.getPath("userData"),
  db_path: dbFile,
  env: process.env
}
console.log(app_config);
store.commit("setAppConfig", app_config);


let sqlite_config = {
  client: "sqlite3",
  connection: {
    filename: dbFile
  },
  useNullAsDefault: true
};

const knex = require("knex")({
  client: "mysql",
  connection: {
    host: "localhost",
    user: "root",
    password: "",
    database: "shaderdb",
  },
});
Object.defineProperty(knex, "name", { value: "knex" });

// const knex = require("knex")(sqlite_config);
// knexraw('select 1+1;').then((res) => console.log(res[0]));
// let bookshelfMysql = require("bookshelf")(mysqlknex);

async function selectRaw (sql, labeled ) {
  if(labeled)
    console.log(`=== selectRaw : ${labeled} ====\n`,sql)
  let [results] = await knex.raw(sql);
  return results;
}

async function execRaw(sql) {
  await knex.raw(sql);
}

let bookshelf = require("bookshelf")(knex);
bookshelf.plugin(require("bookshelf-soft-delete"));

export { knex , selectRaw, execRaw , bookshelf as bookshelfMysql, sqlite_config, bookshelf, MyStoreMutations, log };
export * from "./tools";
import { moment } from "./tools";

Vue.filter("arDate", function(date, shader_name = '') {
  return moment(date).format(shader_name == 'mmn1' ? "L": "LL");
});

Vue.filter("tr_label", function(string, collection) {
  if (!collection)
    return store.state.custom_labels[string]
      ? store.state.custom_labels[string]
      : string;
  else if (collection == "trans_types")
    return store.state.transtypes_arr[string]
      ? store.state.transtypes_arr[string]
      : string;
});

String.prototype.toAR = function() {
  return this.replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
};

Vue.filter("toAR", function(number, fixed) {
  let num = number || number === 0 ? parseFloat(number) : "--";
  let minmax = fixed
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : {};
  return num.toLocaleString("ar-EG", { useGrouping: false, ...minmax });
});

function roundOf(n, p) {
  const n1 = n * Math.pow(10, p + 1);
  const n2 = Math.floor(n1 / 10);
  if (n1 >= n2 * 10 + 5) {
    return (n2 + 1) / Math.pow(10, p);
  }
  return n2 / Math.pow(10, p);
}

Vue.filter("round", function(value, decimals) {
  if (!value) value = 0;

  if (!decimals) decimals = 0;

  value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return value;
});

Vue.filter("round2", function(number) {
  let rounded = number ? parseFloat(number) : 0;
  return roundOf(rounded, 2).toFixed(2);
});

Vue.filter("ceil5", function(number, shader_name) {
  number = number ? parseFloat(number) : 0;
  let ceil_5 = Math.ceil(number / 5) * 5;
  let last_res = number;
  
  if (shader_name == 'mmn1') {
    //last_res =   ceil_5 ;
    last_res = ceil_5 - number <= 2 ? ceil_5 : Math.ceil(number);
  }
  else if(shader_name == 'magdy') {
    last_res = ceil_5 - number <= 2 ? ceil_5 : Math.ceil(number);
  }
  
  return last_res;
});

Vue.filter("default0", function(number) {
  return parseInt(number) ? parseInt(number) : 0;
});

Vue.filter("concat_recp_paid", function(concat_recp_paid) {
  return concat_recp_paid;
});

function testJSON(text) {
  if (typeof text !== "string" || parseInt(text) > 0 || parseInt(text) === 0) {
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
}

Vue.filter("productsFilter", function(products, separator = " , ") {
  let only_prod_names = [];
  products = products ? products : "";
  //console.log('productsFilter', products , separator)
  if (testJSON(products)) {
    let all_products = JSON.parse(products);
    all_products.forEach(prod => {
      //console.log("prod",prod)
      if (prod.product) only_prod_names.push(prod.product);
      else if (prod.product_name) only_prod_names.push(prod.product_name);
    });
    let uniqueItems = [...new Set(only_prod_names)];
    return uniqueItems.join(separator);
  } else if (products.includes(",") && products.indexOf(",") > -1) {
    let products_ids = products.split(",");
    products_ids.forEach(id => {
      only_prod_names.push(store.state.products_arr[id]);
    });
    return only_prod_names.join(separator);
  } else if (parseInt(products) > 0) {
    return store.state.products_arr[parseInt(products)];
  } else {
    return products;
  }
});

new Vue({
  router,
  store,
  render: h => h(App),
  created: function () {
    console.log("Vue instance created !")
    // Prevent blank screen in Electron builds
    // this.$router.push('/')
  },
}).$mount("#app");

Vue.prototype.vue_window = window;
Vue.prototype.vue_log = console.log;
Vue.prototype.vue_document = document;
