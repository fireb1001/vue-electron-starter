<template>
  <section class="cashflow m-3 row">
  <div class="col-5">
    <AlertDay />
    <b-modal
      id="pass-in"
      hide-footer
      no-close-on-esc
      no-close-on-backdrop
      hide-header-close
      class="p-4"
    >
      <form @submit="passSubmit">
        <p class="h4 text-center mb-4">ادخل كلمة المرور</p>
        <br />
        <label for="defaultFormLoginPasswordEx" class="grey-text">كلمة المرور</label>
        <input type="password" v-model.lazy="password" class="form-control" />
        <div class="text-center mt-4">
          <button class="btn btn-success" type="submit">عرض</button> 
          <span>&nbsp;</span>
          <button class="btn btn-danger" @click="$bvModal.hide('pass-in')">اغلاق</button> 
        </div>
      </form>
    </b-modal>

        <div class="row detailed" 
        v-if="app_config.shader_name == 'mmn1' && logged_in_user.user_type != 'editor'">
          <div class="col-6">
            <span class="btn text-primary h3">
            {{'sum_capital' | tr_label}}
            </span>

            <span class="btn text-primary h3" 
            @click="show_dialog()">
              <span v-if="! flags.show_sum_capital" >+</span>
              <span v-else>-</span>
            </span>
          </div>
          <div class="col-6 btn text-primary" v-if="flags.show_sum_capital">
            <span class="h3">
            {{ sum_capital | round | toAR}}
            </span>
            <span class="fa fa-table"></span>
          </div>
        </div>
        <div class="row detailed" >
          <div class="col-6">
            <span class="btn text-primary h3">
            صافي الخزينة الان
            </span>
          </div>
          <div class="col-6 btn text-primary" >
            <span class="h3">
            {{ net_cash | round | toAR}}
            </span>
            <span class="fa fa-table"></span>
          </div>
        </div>

    <div class="alerty m-2" v-if="day.stricted">
      لا يمكن اضافة او تعديل علي يومية مغلقة, يمكن اعادة فتح اليومية للتعديل مع ملاحظة عدم ترحيل صافي الخزينة بالمبلغ الجديد
      <div>
        برجاء ادخال سبب فتح اليومية
        <br/>
        <textarea v-model="reason"></textarea>
      </div>
      <button @click="reopen_day"
      :disabled="reason.length < 3 "
      class="m-2 btn btn-danger"> اعادة فتح اليومية</button>
    </div> 
    
    <button class="btn btn-success" 
    v-else
    v-b-toggle.collapse_cash >اضافة جديد </button>

    <br/>

    <br/>
      <b-collapse id="collapse_cash" class="m-1">
        <div class="entry-form">
        <form  @submit="addCashflow">
          <div class="form-group row" v-if="$route.name == 'out_cashflow'"> 
            <label class="col-sm-2" >نوع المصروف</label>
            <div class="col-sm-10">
            <select class="form-control " v-model="cashflow_form.state">
              <template  v-for="(item, idx) in ex_items_arr">
                <option :key="idx" :value="item.name">{{item.ar_name}}</option>
              </template>
              
              <option v-if="app_config.shader_name == 'magdy'" value="حج مجدي">حج مجدي</option>
              <option v-if="app_config.shader_name == 'magdy'" value="كاتب حمادة">حمادة</option>
              <option v-if="app_config.shader_name == 'magdy'" value="كاتب 1">كاتب 1</option>
              <option v-if="app_config.shader_name == 'magdy'" value="كاتب زكاة مال">كاتب زكاة مال</option>
              <option v-if="app_config.shader_name == 'magdy'" value="كاتب 3">كاتب 3</option>
            </select>
            </div>
          </div>

          <div class="form-group row">
            <label  class="col-sm-2">مبلغ ال{{ $route.name | tr_label }}</label>
            <div class="col-sm-10">
              <div v-if="cashflow_form.state === 'men_account'" class="m-1">
                عدد الطرود المباعة اليوم {{day_count}} X 
                <input v-model="men_rate" class=""  placeholder="بياعة الرجالة">
                <br>
              </div>
              <input v-model="cashflow_form.amount" class="form-control "  placeholder="ادخل المبلغ ">
            </div>
          </div>

          <div class="form-group row">
            <label  class="col-sm-2">ملاحظات</label>
            <div class="col-sm-10">
              <input v-model="cashflow_form.notes" class="form-control " placeholder="ادخال الملاحظات">
            </div>
          </div>     

          <button type="submit" class="btn btn-success" :disabled="! valid_form" >اضافة</button>
          &nbsp;
          <button type="button" @click="refresh_all()" class="btn btn-danger"> الغاء </button>
        </form>
        </div>
      </b-collapse>
    </div>
    <div class="col-7 p-0">
      <h1 v-if="this.$route.name == 'in_cashflow'"> 
        تحصيلات اليوم {{day.arab}}
      </h1>
      <h1 v-if="this.$route.name == 'out_cashflow'"> 
        مصروفات اليوم {{day.arab}}
      </h1>
      <br/>
      <CashflowTable :cashflow_arr="cashflow_arr" 
      :flags="{can_remove: true,type: $route.name}"
      @refresh="refresh_all"></CashflowTable>
    </div>
  </section>
</template>

<script>
import { CashflowCtrl , CashflowDAO } from '../ctrls/CashflowCtrl'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl';
import CashflowTable from '@/components/CashflowTable.vue'
import AlertDay from '@/components/AlertDay.vue'
import { MainMixin } from '../mixins/MainMixin'
import { execRaw, knex, selectRaw } from '../main';
import { CustomersCtrl } from '../ctrls/CustomersCtrl';
import { SuppliersCtrl } from '../ctrls/SuppliersCtrl';
import { ReceiptsCtrl } from '../ctrls/ReceiptsCtrl';
import { PackagingCtrl, PackagingDAO } from '../ctrls/PackagingCtrl';

export default {
  name: 'cashflow',
  data () {
    return {
      flags: { show_sum_capital : false },
      cashflow_arr: [],
      ex_items_arr: [],
      store_day: this.$store.state.day,
      cashflow_form: new CashflowDAO(CashflowDAO.INIT_DAO),
      cashflowCtrl: new CashflowCtrl(),
      day_count : 0,
      men_rate : 1.5,
      password: null,
      sum_capital: 0,
      net_cash: 0,
      reason:''
    }
  },
  mixins:[MainMixin],
  methods: {
    async show_dialog() {
      if(this.shader_configs['F_MMN1_PASS']) {
        this.$bvModal.show("pass-in");
      } else {
        this.flags.show_sum_capital = ! this.flags.show_sum_capital
      }
    },
    async passSubmit(evt){
      evt.preventDefault();
      if(this.shader_configs['F_MMN1_PASS'] == this.password){
        this.flags.show_sum_capital = ! this.flags.show_sum_capital
        this.$bvModal.hide("pass-in");
      }
    },
    async refresh_all() {
      this.cashflow_form = new CashflowDAO(CashflowDAO.INIT_DAO)
      // let states = null
      let sum = null
      // TODO get states manually
      if(this.$route.name == 'out_cashflow') {
        // states = ['given','expenses','nolon','payment','act_pymnt' ,'recp_paid','paid','acc_rest','repay_cust_trust','men_account','repay_cust_rahn','supp_payment','out_receipt']
        sum = '-'
      }
      else if(this.$route.name == 'in_cashflow') {
        this.cashflow_form.state = 'inc_collect'
        // states = ['collecting','outgoing_cash','supp_collect','cust_trust','cust_rahn','inc_collect'] 
        sum = '+'
      }
      this.cashflow_arr = await this.cashflowCtrl.findAll({sum: sum, day: this.$store.state.day.iso},'id')
      this.ex_items_arr = await this.cashflowCtrl.getExItems();
      console.log("ex_items_arr", this.ex_items_arr)
      let [day_count_res] = await selectRaw(`SELECT sum(count) as sum_count FROM outgoings where day='${this.$store.state.day.iso}'`)
      this.day_count = day_count_res.sum_count ? day_count_res.sum_count : this.day_count

      let net_cash = await this.cashflowCtrl.getNetCash({day: this.day.iso})
      this.net_cash = net_cash
      
    },
    async reopen_day(){
      let [{json}] = await selectRaw(`select json from daily_close where day='${this.day.iso}' `)
      console.log('%c Mo2Log reopen_day json', 'background: #bada55', json );
      if(json) json = JSON.parse(json)
      json = { ...json, reason: this.reason}
      await execRaw(`update daily_close set closed='false', json='${JSON.stringify(json)}' where day = '${this.day.iso}'`)
      await this.change_day(this.day.iso)
    },
    async addCashflow(evt) {
      evt.preventDefault()
      let cashDAO = new CashflowDAO(this.cashflow_form)
      cashDAO.day = this.store_day.iso
      
      if(cashDAO.state && 
      (cashDAO.state.includes('كاتب') || cashDAO.state.includes('حج'))
      ) {
        cashDAO.notes = cashDAO.state
        cashDAO.state = 'expenses'
      }
      let transTypesCtrl = new TransTypesCtrl()
      let cashTrans = await transTypesCtrl.findOne({name: cashDAO.state , category: 'cashflow' })
      cashDAO.sum = cashTrans.sum

      await this.cashflowCtrl.save(cashDAO);
      if(cashTrans.map_packaging && this.shader_configs['pkg_price']) {
        // Create packaging trans
        let pkg_count = cashDAO.amount / +this.shader_configs['pkg_price'];
        console.log(pkg_count, this.shader_configs['pkg_price'])
        await new PackagingCtrl().save(new PackagingDAO({
          count: pkg_count,
          amount: cashDAO.amount,
          day: this.day.iso,
          sum: cashTrans.map_packaging,
          notes: cashTrans.ar_name
        }))
      }
      this.$root.$emit('bv::toggle::collapse', 'collapse_cash')
      this.cashflow_form = new CashflowDAO(CashflowDAO.INIT_DAO)
      this.refresh_all()
      /*
      cashDAO.state = (this.cashflow_form.state) ? this.cashflow_form.state : this.$route.name
      if(cashDAO.state === 'collecting')
        cashDAO.state = 'inc_collect'
      
      if(this.$route.name == 'expenses')
      cashDAO.sum = '-'

      await CashflowDB.addNew(cashDAO)
      this.$root.$emit('bv::toggle::collapse', 'collapse_cash')
      this.cashflow_form = {}
      this.refresh_all()
      */
    }
  },
  components: {
    CashflowTable,
    AlertDay
  },
  async mounted() {
    this.men_rate =this.shader_configs['men_rate'] ? parseFloat(this.shader_configs['men_rate']) : this.men_rate;
    
    let { sum_debt: cust_sum_debt } = await new CustomersCtrl().sumDebt()
    let {sum_debt: supp_sum_debt } = await new SuppliersCtrl().sumDebt()
    let [dealer_trans]  = await selectRaw('select sum(amount) as sum_dealer_trans from dealer_trans');
    let sum_dealer_trans = dealer_trans && dealer_trans.sum_dealer_trans ? parseFloat(dealer_trans.sum_dealer_trans) : 0
    let net_cash = await this.cashflowCtrl.getNetCash({day: this.day.iso})
    this.net_cash = net_cash
    let {sum_net_rasd} = await new ReceiptsCtrl().sumNetRasd()

    this.sum_capital = cust_sum_debt + supp_sum_debt + net_cash - sum_net_rasd + sum_dealer_trans
    this.refresh_all()
  },
  updated() {
    // this.refresh_all()
  },
  computed: {
    /*
    comp_cashflow_arr : async function() {
      return await CashflowDB.getAll({state:'collecting'})
    }
    */
    valid_form: function() {
      if(this.cashflow_form.amount && parseFloat(this.cashflow_form.amount) ){
        return true
      }
    }
  },
  watch : {
    "$route": function() {
      this.refresh_all()
    },
    "cashflow_form.state": function(val) {
      if(val === 'men_account') {
        this.cashflow_form.amount = this.day_count * this.men_rate
      }
    },
    men_rate: function(newval) {
      this.cashflow_form.amount = this.day_count * newval
    }
  }
}
</script>
