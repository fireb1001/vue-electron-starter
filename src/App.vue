<template>
  <div id="app">
    <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow d-print-none">
      <b class="navbar-brand col-sm-3 col-md-2 mr-0">برنامج الوكالة</b>
    </nav>
    <div class="container-fluid">
      <div class="row" style="max-width: 100%;">
        <nav class="col-md-2 d-none d-md-block bg-light sidebar d-print-none">
          <div class="sidebar-sticky mt-3" v-if="! require_login">
            <div class="pl-2 pr-2" v-if="false">مرحباً {{logged_in_user.username}}</div>
            <h4 class="d-flex justify-content-between align-items-center px-3 mb-1 text-muted">
              <router-link to="/daily">
                <span :class="{'alert-bg': day.iso != day.should_be, 'red-wedding': day.stricted }">
                 {{ day.iso | arDate(app_config.shader_name) }}
                </span>
              </router-link>
            </h4>
            <div class="p-3" >
              <b>{{ day.d_week }}</b>
              <b>
                <router-link
                  class="text-danger"
                  to="/daily"
                  style="float:left;padding: 0 5px;"
                >تغيير اليوم</router-link>
              </b>
            </div>

            <div class="p-2"></div>
            <!--
            <datetime v-model="luxon_date" @close="change_luxon_date"></datetime>
            -->
            <ul class="nav flex-column">
              <li class="nav-item bg-incoming">
                <router-link class="nav-link active" to="/incomings">
                  <span class="fa fa-sign-in-alt"></span>
                  {{ custom_labels['incomings'] }}
                  <span class="sr-only">(current)</span>
                </router-link>
              </li>
              <li class="nav-item bg-outgoing">
                <router-link class="nav-link active" to="/outgoing">
                  <span class="fa fa-sign-out-alt"></span>
                  {{ custom_labels['outgoings'] }}
                  <span class="sr-only">(current)</span>
                </router-link>
              </li>
              <li class="nav-item bg-dailymoves">
                <router-link class="nav-link active" to="/daily_moves">
                  <span class="fa fa-dolly"></span>
                  {{ custom_labels['daily_moves'] }}
                  <span
                    class="sr-only"
                  >(current)</span>
                </router-link>
              </li>
              <li class="nav-item bg-receipts">
                <router-link class="nav-link active" to="/suppliers_receipts">
                  <span class="fa fa-receipt"></span>
                  {{ custom_labels['suppliers_receipts'] }}
                </router-link>
              </li>
              <li class="nav-item bg-receipts" v-if="app_config.shader_name != 'nada' ">
                <router-link class="nav-link active" to="/ctg_receipts">
                  <span class="fa fa-receipt"></span>
                  فواتير الرصد
                </router-link>
              </li>
              <li class="nav-item bg-accounts">
                <router-link class="nav-link active" to="/customers_accounts">
                  <span class="fa fa-cash-register"></span>
                  {{ custom_labels['customers_accounts'] }}
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link active" to="/out_cashflow">
                  <span class="fa fa-money-bill-wave"></span>
                  {{ custom_labels['expenses'] }}
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link active" to="/in_cashflow">
                  <span class="fa fa-credit-card"></span>
                  {{ custom_labels['menu_collecting'] }}
                </router-link>
              </li>
            </ul>

            <h3 class="d-flex justify-content-between align-items-center px-3 mt-2 mb-1 text-muted">
              <span>مدير النظام</span>
              <a class="d-flex align-items-center text-muted" href="#">
                <span data-feather="plus-circle"></span>
              </a>
            </h3>
            <ul class="nav flex-column mb-2">
              <li class="nav-item">
                <router-link class="nav-link active" to="/suppliers">
                  <span class="fa fa-th-list"></span>
                  {{ custom_labels['manage_suppliers'] }}
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link active" to="/customers">
                  <span class="fa fa-handshake"></span>
                  {{ custom_labels['manage_customers'] }}
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link active" to="/products">
                  <span class="fa fa-apple-alt"></span>
                  {{ custom_labels['manage_products'] }}
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link active" to="/dealers">
                  <span class="fa fa-handshake"></span>
                  {{ custom_labels['manage_dealers'] }}
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link active" to="/users">
                  <span class="fa fa-code"></span>
                  {{ custom_labels['manage_users'] }}
                </router-link>
              </li>

              <li class="nav-item" v-if="logged_in_user.user_type != 'editor'">
                <router-link class="nav-link active" to="/daily_totals">
                  <span class="fa fa-calendar-alt"></span>
                  المجمعات اليومية
                </router-link>
              </li>

              <li class="nav-item" 
              v-if="app_config.shader_name == 'amn1' && logged_in_user.user_type != 'editor'">
                <router-link class="nav-link active" to="/daily_revenue">
                  <span class="fa fa-calendar-alt"></span>
                  مجمع الارباح
                </router-link>
              </li>


              <li class="nav-item" 
              v-if=" app_config.shader_name == 'amn1' && logged_in_user.user_type != 'editor'">
                <router-link class="nav-link active" to="/daily_rahn">
                  <span class="fa fa-box"></span>
                  مجمع الرهونات
                </router-link>
              </li>

              <li class="nav-item" 
              v-if="app_config.shader_name != 'magdy' && logged_in_user.user_type != 'editor'">
                <router-link class="nav-link active" to="/daily_expenses">
                  <span class="fa fa-calendar-alt"></span>
                  المصروفات اليومية
                </router-link>
              </li>

              <li class="nav-item" v-if="logged_in_user.user_type != 'editor'">
                <router-link class="nav-link active" to="/developer">
                  <span class="fa fa-database"></span>
                  بيانات البرنامج
                  <span class="sr-only">(current)</span>
                </router-link>
              </li>
            </ul>
          </div>
        </nav>

        <b-modal
          id="login-modal"
          hide-footer
          no-close-on-esc
          no-close-on-backdrop
          hide-header-close
          class="p-4"
        >
          <form @submit="loginSubmit">
            <p class="h4 text-center mb-4">تسجيل الدخول</p>
            <label for="defaultFormLoginEmailEx" class="grey-text">اسم المستخدم</label>
            <input v-model="user.username" class="form-control" />
            <br />
            <label for="defaultFormLoginPasswordEx" class="grey-text">كلمة المرور</label>
            <input type="password" v-model="user.password" class="form-control" />
            <div class="text-center mt-4">
              <button class="btn btn-success" type="submit">دخـول</button>
            </div>
          </form>
        </b-modal>

        <main role="main" class="col-md-9 mr-sm-auto col-lg-10 px-0 col-print-12">
          <router-view :key="$route.fullPath"></router-view>
        </main>
      </div>
    </div>
  </div>
</template>
<script>
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "vue-select/dist/vue-select.css";
import { Settings, DateTime } from "luxon";
import { ShaderConfigsCtrl } from "./ctrls/ShaderConfigsCtrl";
import { ProductsCtrl } from "./ctrls/ProductsCtrl";
import { TransTypesCtrl } from "./ctrls/TransTypesCtrl";
import { MyStoreMutations, knex } from "./main.js";
import { UsersCtrl } from "./ctrls/UsersCtrl";
import { MainMixin } from "./mixins/MainMixin";

Settings.defaultLocale = "ar";
Settings.defaultZoneName = "UTC";

const moment = require("moment");

export default {
  data() {
    return {
      require_login: true,
      shaderConfigsCtrl: new ShaderConfigsCtrl(),
      usersCtrl: new UsersCtrl(),
      user: { username: null, password: null }
    };
  },
  mixins: [MainMixin],
  methods: {
    async loginSubmit(evt) {
      evt.preventDefault();
      //console.log(this.user)
      let logged_in = await this.usersCtrl.login(this.user);
      if (logged_in) {
        // Store logged in user
        this.require_login = false;
        this.$store.commit(MyStoreMutations.setLoggedInUser, logged_in);
        this.$bvModal.hide("login-modal");
      } else {
        console.log("logged_in else ");
      }
    }
  },
  async mounted() {
    let products_arr = await new ProductsCtrl().getProductsArr();
    this.$store.commit(MyStoreMutations.setProductsArr, products_arr);

    let transNames = await new TransTypesCtrl().getTranstypesArr();
    this.$store.commit(MyStoreMutations.setTranstypesArr, transNames);
  },
  async beforeMount() {

    let custom_labels = null;
    try {
      await knex.raw("PRAGMA integrity_check;");
      let [fk] = await knex.raw("PRAGMA foreign_keys = true ;");
      console.log(fk)
      let [tables] = await knex.raw("SELECT name FROM sqlite_master WHERE type = 'table';");
      if(! tables) throw "Empty DB - No Tables"
    } catch (error) {
      console.error(error);
      window.alert("لم يتم ربط قاعدة البيانات");
      this.$router.push("developer");
      return;
    }

    let shader_results = await knex.raw(`select config_value as shader_name from shader_configs where config_name = 'shader_name'`)
    console.log(shader_results);
    if(! shader_results[0] || ! shader_results[0].shader_name) {
      console.error('shader_name Not Set');
      window.alert('shader_name Not Set');
    } else {
      this.$store.commit('setAppConfig', {
        ... this.$store.state.app_config,
        shader_name: shader_results[0].shader_name
      })
    }

    custom_labels = await this.shaderConfigsCtrl.getAppLabels();
    this.$store.commit(MyStoreMutations.setCustomLabels, custom_labels);

    let shader_conf = await this.shaderConfigsCtrl.getAppCongifs();
    this.$store.commit(MyStoreMutations.setShaderConfigs, shader_conf);
  
    let till_val = + shader_conf['till_val'];
    if(! till_val ) {
      window.alert("!");
      return 
    } else {
      // verify till_val
      let [verify] = await knex.raw(`select config_verify as verify from shader_configs where config_name = 'till_val'`)
      console.log(verify['verify'],shader_conf['shader_name'], verify['verify'], undefined);
      let should_be = till_val + + shader_conf['shader_name'].split('').map(x => ! isNaN(x) ? + x: x.charCodeAt(0)).reduce((a,b) => a+b);
      console.log(verify['verify'], "should_be00-" + should_be)
      if(+ verify['verify'] != should_be) {
        window.alert("!");
        return 
      }
    }

    this.require_login = shader_conf["require_login"]
      ? shader_conf["require_login"]
      : false;
    
    if (this.require_login) {
      this.$bvModal.show("login-modal");
    }

    // to get current local time correctly
    moment.locale("en");
    let dateTime = DateTime.fromISO(moment().format("YYYY-MM-DD"));
    if (
      shader_conf["new_day_opens"] &&
      moment().format("HH") >= shader_conf["new_day_opens"]
    ) {
      // Open new Day
      dateTime = DateTime.fromISO(
        moment()
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }

    moment.locale("ar");
    let iso =  dateTime.toISODate()
    let [stricted] = await knex.raw(`select closed from daily_close where day = '${iso}'`);
    const day = {
      ts: dateTime.valueOf(),
      iso: dateTime.toISODate(),
      d_week: dateTime.toLocaleString({ weekday: "long" }),
      arab: moment(dateTime.toISODate()).format("LL"),
      should_be : dateTime.toISODate(),
      stricted: stricted && stricted.closed == 'true' ? true : false
    };
    this.$store.commit("setDay", day);

    // get all stricted days
    let all = await knex.raw(`select day,closed from daily_close`);
    let assos = all.reduce((a,b)=>{
      a[b.day]= b.closed == 'true'
      return a;
    },{})
    this.$store.commit('setClosedDays' , assos )
  }
};
</script>
<style>

body {
  direction: rtl;
  text-align: right;
  -webkit-print-color-adjust: exact !important;
  font-size: 1.2em;
}

h1,
h2,
h3,
h4,
h5 {
  color: #666;
}

pre {
  direction: ltr;
  text-align: left;
}

.feather {
  width: 16px;
  height: 16px;
  vertical-align: text-bottom;
}

/*
 * Sidebar
 */

.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100; /* Behind the navbar */
  padding: 40px 0 0; /* Height of navbar */
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
}

.sidebar-sticky {
  position: relative;
  font-size: large;
  top: 0;
  height: calc(100vh - 48px);
  padding-top: 0.5rem;
  overflow-x: hidden;
  overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
}

@supports ((position: -webkit-sticky) or (position: sticky)) {
  .sidebar-sticky {
    position: -webkit-sticky;
    position: sticky;
  }
}

.sidebar .nav-link {
  font-weight: 500;
  color: #333;
}

.sidebar .nav-link .feather {
  margin-right: 4px;
  color: #999;
}

.sidebar .nav-link.active {
  color: #007bff;
}

.btn-printo {
  color: white;
  background-color: #55595d;
}

.sidebar .nav-link:hover .feather,
.sidebar .nav-link.active .feather {
  color: inherit;
}

.sidebar-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
}

/*
 * Content
 */

[role="main"] {
  padding-top: 133px; /* Space for fixed navbar */
}

@media (min-width: 768px) {
  [role="main"] {
    padding-top: 48px; /* Space for fixed navbar */
  }
}

/*
 * Navbar
 */
 .nav {
  padding-inline-start: 1em;
 }

.navbar-brand {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, 0.25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.25);
}

.navbar .form-control {
  padding: 0.75rem 1rem;
  border-width: 0;
  border-radius: 0;
}

input.form-control {
  direction: ltr;
  text-align: center;
  font-weight: bold;
}

select.form-control {
  font-size: 1.1em;
  font-weight: bold;
}

.form-control option {
  font-weight: bold;
  font-size: 1.1em;
}

.form-control-dark {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

.form-control-dark:focus {
  border-color: transparent;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}
.minh90 {
  min-height: 90vh;
}

.bg-incoming {
  background-color: #cff9c4;
  border-radius: 0 10px 10px 0;
}
.bg-outgoing {
  background-color: #f5c5b6;
  border-radius: 0 10px 10px 0;
}
.bg-receipts {
  background-color: #f1e1e1;
  border-radius: 0 10px 10px 0;
}
.bg-accounts {
  background-color: #d1dbf3;
  border-radius: 0 10px 10px 0;
}
.bg-dailymoves {
  /*
  background-color: #e1e6b3;
  */
  border-radius: 0 10px 10px 0;
}

.vdatetime-input {
  padding: 8px 10px;
  font-size: 18px;
  border: solid 1px #ddd;
  color: #444;
}

.collect-box {
  margin: 5px;
  width: 100%;
  height: 3em;
  display: block;
  border: 2px solid;
}
.pr-only {
  display: none;
}
.recp-header {
  font-family: arial;
  margin: 0 auto;
}
.recp-hr {
  border: 0;
  height: 2px;
  margin: 6px;
  background-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.75),
    rgba(0, 0, 0, 0)
  );
}
.h-shadow {
  color: white !important;
  background-color: #777;
  border-radius: 5px;
  padding: 5px 0;
  margin: 0 auto;
  max-width: 90%;
  font-size: 1.4em;
}
.detailed {
  font-size: 1.2em !important;
}

/*Vue Select Style*/
.vselect-styler .vs__search::placeholder,
.vselect-styler .vs__dropdown-toggle,
.vselect-styler .vs__dropdown-menu {
  background: white;
  border: none;
  text-align: right;
  padding: 5px;
}
.vselect-styler .vs__search {
  text-align: right;
  direction: rtl;
}

.vselect-styler .vs__clear,
.vselect-styler .vs__open-indicator {
  padding: 5px;
}
/*
#app {
  direction: rtl;
  text-align: right;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 90%;
  padding:10px;
  margin:10px;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
*/

.bbordered {
  border: .1em solid black !important;
}
.noborder {
  border: none !important;
}

.alert-bg {
  background-color: yellow;
}

.red-wedding {
  background-color: #ff847e;
}


.alerty {
  border-radius: 10px;
  text-align: center;
  font-size: 1.2em;
  background-color: yellow;
}

/* printing */
@media print {
  .col-print-1 {
    flex: 0 0 8.33333%;
    max-width: 8.33333%;
  }
}

@media print {
  .col-print-2 {
    flex: 0 0 16.66667%;
    max-width: 16.66667%;
  }
}

@media print {
  .col-print-3 {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

@media print {
  .col-print-4 {
    flex: 0 0 33.33333%;
    max-width: 33.33333%;
  }
}

@media print {
  .col-print-5 {
    flex: 0 0 41.66667%;
    max-width: 41.66667%;
  }
}

@media print {
  .col-print-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media print {
  .col-print-7 {
    flex: 0 0 58.33333%;
    max-width: 58.33333%;
  }
}

@media print {
  .col-print-8 {
    flex: 0 0 66.66667%;
    max-width: 66.66667%;
  }
}

@media print {
  .col-print-9 {
    flex: 0 0 75%;
    max-width: 75%;
  }
}

@media print {
  .col-print-10 {
    flex: 0 0 83.33333%;
    max-width: 83.33333%;
  }
}

@media print {
  .col-print-11 {
    flex: 0 0 91.66667%;
    max-width: 91.66667%;
  }
}

@media print {
  .col-print-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

@media print {
  h1,
  h2 {
    margin: 1rem;
    font-size: 3rem;
    color: black !important;
  }
  h3,
  h4 {
    margin: 1rem;
    font-size: 2rem;
    color: black !important;
  }
  .pr-me {
    color: black !important;
    font-size: x-large;
  }
  .pr-me-l {
    color: black !important;
    font-size: large;
  }
  .pr-me-xx {
    color: black !important;
    font-size: xx-large;
  }
  .pr-hideme {
    display: none;
  }
  .pr-only {
    display: block;
  }
  .pr-mt-2 {
    margin-top: 2em;
  }
  .pr-mt-3 {
    margin-top: 3em;
  }
  .nav-link,
  a {
    text-decoration: none !important;
    color: black !important;
  }
  .table thead tr,
  .table thead tr td {
    border-top-width: 2px;
    border-top-style: solid;

    border-bottom-style: solid;
    border-color: black;
    -webkit-print-color-adjust: exact;
    -webkit-border-vertical-spacing: 0px !important;
  }
  a:not(.btn) {
    text-decoration: none !important;
  }
}
</style>
