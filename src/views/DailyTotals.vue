<template>

  <section class="template m-3">

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

    <h2>الفترة</h2>
    <div class="row">
      <div class="col-4">
          من
        <datetime v-model="from_day" 
        @input="change_day" 
        :auto="true"  class="datetime" 
        min-datetime="2019-01-01"
        :max-datetime="max_datetime">
        </datetime>
      </div>
      <div class="col-4">
        الي
        <datetime v-model="to_day" 
        @input="change_day" 
        :auto="true"  class="datetime" 
        min-datetime="2019-01-01"
        :max-datetime="max_datetime">
        </datetime>
      </div>
      <div class="col-4 mt-3">
      <button 
      v-if="show_daily == 'daily_totals' && ! show_only" 
      class="btn btn-primary " @click="show_daily='daily_expenses';" >
        عرض المصاريف اليومية
        &nbsp; <span class="fa fa-money-bill"></span>
      </button>
      <button v-if="show_daily == 'daily_expenses'" class="btn btn-primary " @click="show_daily='daily_totals';daily_expenses = []" >
        عرض المجمعات اليومية   &nbsp; <span class="fa fa-calendar-alt"></span>
      </button>
      <br/><br/>
      <button class="btn btn-primary " v-if="app_config.shader_name == 'magdy' && show_daily != 'daily_expenses'" @click="showInitModal" >
        ادخال ارصدة مجمعات اول المدة
        &nbsp; <span class="fa fa-money-bill-wave"></span>
      </button>
      <br/><br/>
      <button  class="btn btn-primary "  v-if="app_config.shader_name == 'magdy' && show_daily != 'daily_expenses'" @click="showExpModal" >
        ادخال ارصدة مصروفات اول المدة
        &nbsp; <span class="fa fa-money-bill-wave"></span>
      </button>
      </div>
    </div>
<!--
recp_given
given
comms
out_cashflow
net_income
supp_payments
supp_deducts
rahn
repay_rahn

-->
<b-modal id="exp-modal" size="lg" class="col-print-12" hide-footer >
  <h2>ارصدة المصاريف اليومية </h2>
  <div class="row m-4" v-if="daily_expenses.length == 0">
  <form  class="">
    <div class="row m-2">
      <div class="form-group row" style="width:100%">
        <label class="col-sm-5" >التاريخ</label>
        <div class="col-sm-7">
          <input v-model="init_exp_data.day" class="form-control" disabled>
        </div>
      </div>
      <template v-for="(item, idx) in expenses_items" >

        <div class="form-group row" style="width:100%" v-if="item.notes && (item.notes.includes('كاتب') || item.notes.includes('حج'))" :key='idx'>
          <label class="col-sm-5">{{item.notes}}</label>
          <div class="col-sm-7">
            <input class="form-control" v-model="init_exp_data[item.notes]" >
          </div>
        </div>
      </template>
    </div>
    <!-- prevent enter to supmit -->
    <button type="button" @click="saveExpData" class="btn btn-success" >ادخال الارصدة</button>
    &nbsp;
    <button type="button" @click="$bvModal.hide('exp-modal');" class="btn btn-danger"> الغاء </button>
    
  </form>
  </div>
</b-modal>

    <b-modal id="init-modal" size="lg" class="col-print-12" hide-footer >
<h2 class="m-2">ارصدة اول المدة</h2>
<div class="row m-4">
  <form  class="">
    <div class="form-group row">
      <label class="col-sm-5">التاريخ</label>
      <div class="col-sm-7">
        <input v-model="init_data.day" class="form-control" disabled>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'recp_given' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.recp_given" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'given' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.given" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'comms' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.comms" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'out_cashflow' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.out_cashflow" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'net_income' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.net_income" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'supp_payments' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.supp_payments" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'supp_deducts' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.supp_deducts" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'rahn' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.rahn" class="form-control">
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-5">رصيد {{'repay_rahn' | tr_label}}</label>
      <div class="col-sm-7">
        <input v-model="init_data.repay_rahn" class="form-control">
      </div>
    </div>

    <!-- prevent enter to supmit -->
    <button type="button" @click="saveInitData" class="btn btn-success" >ادخال الارصدة</button>
    &nbsp;
    <button type="button" @click="$bvModal.hide('init-modal');" class="btn btn-danger"> الغاء </button>
    
  </form>
</div>
    </b-modal>


    <!-- netincom Modal -->
<b-modal id="modal-netincom"  
 hide-footer hide-header-close hide-backdrop>
  <template slot="modal-title">
    صرف صافي ايراد ليوم {{netincom_form.day | arDate}}
  </template>
  <table class="table table-striped table-sm pr-me">
    <thead>
      <tr>
        <th>المبلغ</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr >
        <td>{{netincom_form.amount}}</td>
        <td>
          <input v-model="netincom_form.amount" class="form-control"  >
        </td>
      </tr>
    </tbody>
  </table>

  <div class="m-2">
    <button class="btn btn-success pr-hideme"
    :disabled="day.stricted"
     @click="$bvModal.hide('modal-netincom');saveNetincome()" >
      <span class="fa fa-money-check-alt "></span> &nbsp;
      صرف
    </button>
    <span>&nbsp;</span>
    <button class="btn btn-primary pr-hideme"
    :disabled="day.stricted"
     @click="$bvModal.hide('modal-netincom');saveNetincome(false)" >
      <span class="fa fa-check "></span> &nbsp;
      تم الصرف مسبقاً
    </button>
  </div>
</b-modal>

    <!-- expenses Modal -->
<b-modal id="modal-recpgiven"  
 hide-footer hide-header-close hide-backdrop>
  <template slot="modal-title">
    صرف الوهبة  ليوم {{recpgiven_form.day | arDate}}
  </template>
  <table class="table table-striped table-sm pr-me">
    <thead>
      <tr>
        <th>المبلغ</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr >
        <td>{{recpgiven_form.amount}}</td>
        <td>
          <input v-model="recpgiven_form.amount" class="form-control"  >
        </td>
      </tr>
    </tbody>
  </table>

  <div class="m-2">
    <button class="btn btn-success pr-hideme"
    :disabled="day.stricted"
     @click="$bvModal.hide('modal-recpgiven');saveRecpgiven()" >
      <span class="fa fa-money-check-alt "></span> &nbsp;
      صرف
    </button>
    <span>&nbsp;</span>
    <button class="btn btn-primary pr-hideme"
    :disabled="day.stricted"
     @click="$bvModal.hide('modal-recpgiven');saveRecpgiven(false)" >
      <span class="fa fa-check "></span> &nbsp;
      تم الصرف مسبقاً
    </button>
  </div>
</b-modal>

    <section class="m-2" v-if="show_daily == 'daily_totals'">
    <h2 v-if="show_only =='rahn'">الرهونات اليومية</h2>
    <h2 v-else-if="show_only =='revenue'">الارباح اليومية</h2>
    <h2 v-else>المجاميع اليومية</h2>
      <div class="table-responsive">
        <table class="table table-striped table-sm pr-me-l">
          <thead>
            <tr>
              <th>اليوم</th>
              <th v-if="show_totals.includes('recp_given')"> {{'recp_given' | tr_label}} </th>
              <th v-if="show_totals.includes('given')"> {{'given' | tr_label}} </th>
              <th v-if="show_totals.includes('comms')"> {{'comms' | tr_label}} </th>
              <th v-if="show_totals.includes('recp_others')"> {{'recp_others' | tr_label}} </th>
              <th v-if="show_totals.includes('out_cashflow')"> {{'out_cashflow' | tr_label}} </th>
              <th v-if="show_totals.includes('net_income')"> {{'net_income' | tr_label}} </th>
              <th v-if="show_totals.includes('recp_diff')"> {{'recp_diff' | tr_label}} </th>
              <th v-if="show_totals.includes('supp_payments')"> {{'supp_payments' | tr_label}} </th>
              <th v-if="show_totals.includes('supp_deducts')"> {{'supp_deducts' | tr_label}} </th>
              <th v-if="show_totals.includes('rahn_incr')"> شراء عدايات  </th>
              <th v-if="show_totals.includes('rahn')"> {{'rahn' | tr_label}}  </th>
              <th v-if="show_totals.includes('repay_rahn')"> {{'رد رهن' | tr_label}} </th>
            </tr>
          </thead>
<!--
recp_sum_net,
recp_sum_given,
recp_sum_rasd_net,
recp_sum_comm,
recp_sum_expenses,
recp_sum_deducts,
recp_sum_sale,
sum_out_value,
out_sell_comm,
out_zm_val,
sum_collect_zm,
sum_cash_zm,
sum_deducts,
sum_given,
sum_nolon,
sum_supp_payment,
sum_product_rahn,
sum_repay_rahn,
sum_rahn_down,
sum_rahn_increase
-->
          <tbody>
            <tr v-if="app_config.shader_name == 'magdy' && ! past_init_vals">
              <th>المجموع</th>
              <th v-if="show_totals.includes('recp_given')">
                {{sum_totals.recp_sum_given | round}}
              </th>
              <th v-if="show_totals.includes('given')">
                {{sum_totals.sum_given | round}}
              </th>
              <th v-if="show_totals.includes('comms')" >
                {{sum_totals.sum_comm_plus_sell_comm | round}}
              </th>
              
              <th v-if="show_totals.includes('recp_others')">
              </th>
              <th v-if="show_totals.includes('out_cashflow')">
                {{sum_totals.sum_deducts | round}}
              </th>
              <th v-if="show_totals.includes('net_income')"></th>
              <th v-if="show_totals.includes('recp_diff')"></th>

              <th v-if="show_totals.includes('supp_payments')">
                {{sum_totals.sum_supp_payment | round}}
              </th>
              <th v-if="show_totals.includes('supp_deducts')">
                {{sum_totals.recp_sum_deducts + sum_totals.sum_supp_collect | round}}
              </th>
              <th v-if="show_totals.includes('rahn')">
                {{sum_totals.sum_product_rahn | round}}
              </th>
              <th v-if="show_totals.includes('repay_rahn')">
                {{sum_totals.sum_repay_rahn | round}}
              </th>

            </tr>

            <tr v-if="past_init_vals">
              <th>ارصدة اول المدة</th>
              <th v-if="show_totals.includes('recp_given')">
                {{past_init_vals.recp_given | round}}
              </th>
              <th v-if="show_totals.includes('given')">
                {{past_init_vals.given | round}}
              </th>
              <th v-if="show_totals.includes('comms')" >
                {{past_init_vals.comms | round}}
              </th>
              
              <th v-if="show_totals.includes('recp_others')"></th>

              <th v-if="show_totals.includes('out_cashflow')">
                {{past_init_vals.out_cashflow | round}}
              </th>

              <th v-if="show_totals.includes('recp_diff')"></th>

              <th v-if="show_totals.includes('net_income')">
                {{past_init_vals.net_income | round}}
              </th>

              <th v-if="show_totals.includes('supp_payments')">
                {{past_init_vals.supp_payments | round}}
              </th>
              <th v-if="show_totals.includes('supp_deducts')">
                {{past_init_vals.supp_deducts | round}}
              </th>
              <th v-if="show_totals.includes('rahn')">
                {{past_init_vals.rahn | round}}
              </th>
              <th v-if="show_totals.includes('repay_rahn')">
                {{past_init_vals.repay_rahn | round}}
              </th>
            </tr>
            <tr v-for="(item, idx) in daily_totals" :key='idx'>
              <td>
                <span class="text-primary" @click="change_today_date(item.day)">
                  {{item.day | arDate }}
                </span>
              </td>
              <td v-if="show_totals.includes('recp_given')">
                <span 
                :class="{'text-success': recpgiven_paid_days[item.day], 'font-weight-bold': recpgiven_paid_days[item.day]}" 
                @click="showRecpgivenModal(item.recp_sum_given, item.day)">
                {{item.recp_sum_given | round }}
                </span>
              </td>
              <td v-if="show_totals.includes('given')">
                {{item.sum_given | round }}
              </td>
              <td v-if="show_totals.includes('comms')">
                {{item.recp_sum_comm + item.out_sell_comm | round }}
              </td>

              <td v-if="show_totals.includes('recp_others')">
                {{item.recp_sum_others | round }}
              </td>
              <td v-if="show_totals.includes('out_cashflow')">
                {{item.sum_deducts | round }}
              </td>
              <!-- Not inlude recp diff for mmn1 -->
              <td v-if="show_totals.includes('net_income_no_diff')" >
                <span 
                :class="{'text-success': netinc_paid_days[item.day], 'font-weight-bold': netinc_paid_days[item.day]}" 
                @click="showIncomeModal(item.recp_sum_comm + item.out_sell_comm - item.sum_deducts, item.day)">
                {{item.recp_sum_comm + item.out_sell_comm - item.sum_deducts | round }}
                </span>
              </td>
              <td v-else-if="show_totals.includes('net_income')" >
                
                {{item.recp_sum_comm + item.out_sell_comm + (item.sum_out_value - item.recp_sum_sale) - item.sum_deducts | round }}
              </td>
               
              <td v-if="show_totals.includes('recp_diff')">
                {{item.sum_out_value - item.recp_sum_sale | round }}
              </td>
              <td v-if="show_totals.includes('supp_payments')">
                {{item.sum_supp_payment | round }}
              </td>
              <td v-if="show_totals.includes('supp_deducts')">
                {{item.recp_sum_deducts+ item.sum_supp_collect | round }}
              </td>
              <td v-if="show_totals.includes('rahn_incr')">
                {{item.sum_rahn_increase | round }}
              </td>
              <td v-if="show_totals.includes('rahn')">
                {{item.sum_product_rahn | round }}
              </td>
              <td v-if="show_totals.includes('repay_rahn')">
                {{item.sum_repay_rahn + item.sum_rahn_down | round }}
              </td>
            </tr>
            <tr >
              <th>
                <span @click="show_dialog()">
                 المجموع
                </span>
              </th>
              <template v-if="flags.show_totals_confirm" >
              <th v-if="show_totals.includes('recp_given')">
                {{sum_totals.recp_sum_given | round}}
              </th>
              <th v-if="show_totals.includes('given')">
                {{sum_totals.sum_given | round}}
              </th>
              <th v-if="show_totals.includes('comms')" >
                {{sum_totals.sum_comm_plus_sell_comm | round}}
              </th>

              <th v-if="show_totals.includes('recp_others')">
                {{sum_totals.recp_sum_others | round}}
              </th>
              <th v-if="show_totals.includes('out_cashflow')">
                {{sum_totals.sum_deducts | round}}
              </th>
              <th v-if="show_totals.includes('net_income')">
                {{sum_totals.sum_net_income | round}}
              </th>

              <th v-if="show_totals.includes('recp_diff')">
                {{sum_totals.recp_sum_diff | round}}
              </th>

              <th v-if="show_totals.includes('supp_payments')">
                {{sum_totals.sum_supp_payment | round}}
              </th>
              <th v-if="show_totals.includes('supp_deducts')">
                {{sum_totals.sum_supp_deducts  | round}}
              </th>
              <th v-if="show_totals.includes('rahn_incr')">
                {{sum_totals.sum_rahn_incr | round}}
              </th>
              <th v-if="show_totals.includes('rahn')">
                {{sum_totals.sum_product_rahn | round}}
              </th>
              <th v-if="show_totals.includes('repay_rahn')">
                {{sum_totals.sum_repay_rahn | round}}
              </th>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      </section>
      <section class="m-2" v-if="show_daily == 'daily_expenses'">
        <h2>المصاريف اليومية</h2>
        <div v-if="daily_expenses.length == 0">
          <div class="row m-2">
            <template v-for="(item, idx) in expenses_items" class=" p-2 col-3">
              <span v-if="item.notes && (item.notes.includes('كاتب') || item.notes.includes('حج'))" :key='idx' class=" p-2 col-3">
                <input class="pr-hideme" :id="item.notes" :value="item.notes" type="checkbox" v-model="checkedItems" />
                {{item.notes}}
              </span>
            </template>
          </div>
            <button  class="btn btn-primary mr-2" @click="showSelected()" >
              عرض بنود المصروفات   &nbsp; <span class="fa fa-external-link-square-alt"></span>
            </button>
        </div>
        <div class="table-responsive" v-if="daily_expenses.length > 0">
          <table class="table table-striped table-sm pr-me-l">
            <thead>
              <tr>
                <th>اليوم</th>
                <th v-for="(item, idx) in checkedItems" :key='idx'>
                  {{item}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>الارصدة</th>
                <th v-for="(key, idx) in checkedItems" :key='idx'>
                  {{all_fukn_expenses[key]}}
                </th>
              </tr>
              <tr v-for="(exp, idx) in daily_expenses" :key='idx'>
                <td>{{exp.day}}</td>
                <template v-for="(item, idx) in checkedItems" >
                  <td :key='idx'>
                    <span v-if="item == exp.notes">
                      {{exp.amount}}
                    </span>
                  </td>
                </template>
              </tr>
              <tr>
                <th>المجموع</th>
                <template v-for="(item, idx) in checkedItems" >
                  <th :key='idx'>
                    <span >
                      {{checkedTotals[item]}}
                    </span>
                  </th>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
        <button class="btn btn-printo pr-hideme"  @click="print_co">
          <span class="fa fa-print"></span> طباعة
        </button>
  </section>
</template>
<script>
import { MainMixin } from '../mixins/MainMixin'
import { knex, moment } from '../main'
import { Settings, DateTime } from 'luxon'
import { CashflowCtrl, CashflowDAO } from '../ctrls/CashflowCtrl'

Settings.defaultLocale = 'ar'
Settings.defaultZoneName = 'UTC'

export default {
  name: 'daily-totals',
  data() {
    return {
      flags: { show_totals_confirm : false },
      daily_totals: [],
      daily_expenses: [],
      checkedItems: [],
      confirm_step: [],
      expenses_items : [],
      single: {},
      init_data: {day: this.$store.state.day.iso},
      init_exp_data: {day: this.$store.state.day.iso},
      past_init_vals: null,
      from_day: '',
      to_day: '',
      password: null,
      max_datetime: '',
      show_daily: 'daily_totals',
      show_totals: '',
      all_fukn_expenses: [],
      netincom_form: {day: '', amount: 0},
      recpgiven_form: {day: '', amount: 0},
      netinc_paid_days: {},
      recpgiven_paid_days: {}
    }
  },
  mixins:[MainMixin],
  methods: {
    async show_dialog() {
      if(this.shader_configs['F_MMN1_PASS']) {
        this.$bvModal.show("pass-in");
      } else {
        this.flags.show_totals_confirm = ! this.flags.show_totals_confirm
      }
    },
    async passSubmit(evt){
      evt.preventDefault();
      if(this.shader_configs['F_MMN1_PASS'] == this.password){
        this.flags.show_totals_confirm = ! this.flags.show_totals_confirm
        this.$bvModal.hide("pass-in");
      }
    },
    async save(evt) {
      evt.preventDefault()
    },
    async saveRecpgiven(cashflow = true){
      let {day, amount}  = this.recpgiven_form
      if(cashflow) {
        await new CashflowCtrl().save(new CashflowDAO({
          amount: amount,
          day: this.day.iso,
          state: 'expenses',
          sum: '-',
          notes: 'صرف وهبة ليوم '+day
        }))
      }
      // save daily flag
      let [{json}] = await knex.raw(`select json from daily_close where day='${day}' `)
      if(json) json = JSON.parse(json)
      json = { ...json, recpgiven_out: true}
      await knex.raw(`update daily_close set json='${JSON.stringify(json)}' where day='${day}' `)
      this.recpgiven_form = {day: '', amount : 0}
      await this.refresh_all()
    },
    async saveNetincome(cashflow = true) {
      let {day, amount}  = this.netincom_form
      if(cashflow) {
        // save out cashflow دفعة لا تخصم من الايراد
        await new CashflowCtrl().save(new CashflowDAO({
          amount: amount,
          day: this.day.iso,
          state: 'ex_comm',
          sum: '-',
          notes: 'عمولة يوم '+day
        }))
      }
      // save daily flag
      let [{json}] = await knex.raw(`select json from daily_close where day='${day}' `)
      console.log(json)
      if(json) json = JSON.parse(json)
      json = { ...json, income_out: true}
      await knex.raw(`update daily_close set json='${JSON.stringify(json)}' where day='${day}' `)
      this.netincom_form = {day: '', amount : 0}
      await this.refresh_all()
    },
    async showInitModal() {
      this.$bvModal.show("init-modal");
    },
    async showExpModal() {
      this.$bvModal.show("exp-modal");
    },
    async saveInitData(){
      console.log(this.init_data);
      await knex.raw(`delete from shader_configs where config_name = 'init-totals';`);
      await knex.raw(`INSERT into shader_configs ( "config_name", "config_value", "config_verify") 
      VALUES (
       'init-totals','${JSON.stringify(this.init_data)}','${this.init_data.day}'
      )`);
      this.$bvModal.hide("init-modal");
    },
    async showRecpgivenModal(amount, day){
      this.recpgiven_form.day = day
      this.recpgiven_form.amount = Math.round(amount)

      this.$bvModal.show('modal-recpgiven')
    },
    async showIncomeModal(amount, day) {
      console.log(amount, day)
      this.netincom_form.day = day
      this.netincom_form.amount = Math.round(amount)

      this.$bvModal.show('modal-netincom')
    },
    async saveExpData(){
      console.log(this.init_exp_data);
      await knex.raw(`delete from cashflow where d_product = 'init';`);
      let alldata = {...this.init_exp_data};
      let day = alldata.day;
      delete alldata.day;
      let newData = Object.keys(alldata).map( k => ( {notes: k , amount: parseFloat(alldata[k]), day: day, state: 'expenses', sum: '-', d_product:'init'} ));
      await knex('cashflow').insert(newData)

      this.$bvModal.hide("exp-modal");
    },
    async refresh_all(){
      
      this.expenses_items = await knex.raw(`SELECT DISTINCT(notes) notes from cashflow where state = 'expenses' or state = 'act_pymnt' group by notes HAVING COUNT(*) > 1`);
      let inits_record = await knex.raw(`SELECT * from shader_configs where config_name='init-totals'`);
      let init_record_values = inits_record[0] ? JSON.parse(inits_record[0].config_value): null;
      if(init_record_values && this.$store.state.day.iso >= init_record_values.day ) {
        // Set init vals
        this.past_init_vals = init_record_values;
        this.from_day = init_record_values.day;
        let fromDateTime = DateTime.fromISO(this.from_day);
        this.daily_totals = await knex('v_daily_sums').where('day','>=',fromDateTime.toISODate()).orderBy('day',"asc");
      } else {
        this.daily_totals = await knex('v_daily_sums').orderBy('day',"asc")
      }
      console.log(this.daily_totals)
      let all_exp_init = await knex.raw(`select * from cashflow where state='expenses' and d_product='init'`);
      let all_exp_init_arr = {}
      all_exp_init.forEach(item => all_exp_init_arr[item.notes] = item.amount)
      this.all_fukn_expenses = all_exp_init_arr

      let netinc_paid_days = await knex.raw(`select day from daily_close where json like '%"income_out":"true"%' or  json like '%"income_out":true%'`);
      let recpgiven_days = await knex.raw(`select day from daily_close where json like '%"recpgiven_out":"true"%' or  json like '%"recpgiven_out":true%'`);
      let all = {}
      let all_recpgiven = {}
      netinc_paid_days.forEach(i => all[i.day] = true)
      recpgiven_days.forEach(i => all_recpgiven[i.day] = true)
      this.netinc_paid_days = all
      this.recpgiven_paid_days = all_recpgiven
      console.log(this.netinc_paid_days)
    },
    async change_today_date(date){
      let dateTime = DateTime.fromISO(date)
      if(dateTime.valueOf()) {
        let new_day = {
          ts: dateTime.valueOf(),
          iso: dateTime.toISODate(),
          d_week: dateTime.toLocaleString({ weekday: 'long'}),
          arab: moment(dateTime.toISODate()).format('LL') 
        }
        this.$store.commit('setDay' , new_day)
        //let ok = alert('تم تغيير اليوم الحالي الي'+ new_day.arab)
        const { dialog } = require('electron').remote
        const response = dialog.showMessageBox({
          message: 'تم تغيير اليوم الحالي الي'+ new_day.arab
        });
        console.log(response);
      }
    },
    async showSelected(){
      let fromDateTime = DateTime.fromISO(this.from_day)
      let toDateTime = DateTime.fromISO(this.to_day)

      let sql = `select day, amount, notes from cashflow where ( state = 'expenses' or state = 'act_pymnt' ) and notes in
      ('${this.checkedItems.join("','")}')`
      if(fromDateTime && fromDateTime.toISODate()) sql += ` and day >= '${fromDateTime.toISODate()}'`
      if(toDateTime && toDateTime.toISODate()) sql += ` and day <= '${toDateTime.toISODate()}'`
      this.daily_expenses = await knex.raw(sql)
      console.log(this.daily_expenses)
    },
    async change_day(){
      let fromDateTime = DateTime.fromISO(this.from_day)
      let toDateTime = DateTime.fromISO(this.to_day)

      let inits_record = await knex.raw(`SELECT * from shader_configs where config_name='init-totals'`);
      let init_record_values = inits_record[0] ? JSON.parse(inits_record[0].config_value): null;
      if( init_record_values && this.from_day < init_record_values.day ) {
        this.past_init_vals = null
      }
      if( this.from_day && ! this.to_day) {
        this.daily_totals = await knex('v_daily_sums').where('day','>=',fromDateTime.toISODate()).orderBy('day',"asc")
      }
      else if ( this.from_day && this.to_day ) {
        this.daily_totals = await knex('v_daily_sums').where('day','>=',fromDateTime.toISODate())
        .andWhere('day','<=',toDateTime.toISODate()).orderBy('day',"asc")
      }
      //this.daily_totals = await knex('v_daily_sums').where('day','>',dateTime.toISODate()).orderBy('day',"asc")
    }
  },
  async mounted() {
    console.log(this.$route)
    if(! this.shader_configs['F_MMN1_PASS'])
      this.flags.show_totals_confirm = true
    this.show_totals = this.shader_configs['show_totals'] ? this.shader_configs['show_totals'] : ''
    this.show_totals = this.show_only == 'rahn' ? 'rahn,repay_rahn,rahn_incr' : this.show_totals
    this.show_totals = this.show_only == 'revenue' ? 'comms,recp_diff,out_cashflow,net_income_no_diff' : this.show_totals
    this.refresh_all()
  },
  props: ['show_only'],
  computed: {
    sum_totals: function() {

      let sum_totals = {
        recp_sum_given: 0,
        recp_sum_others: 0,
        recp_sum_diff: 0,
        sum_given: 0,
        sum_deducts: 0,
        sum_comm_plus_sell_comm: 0,
        sum_supp_payment: 0,
        sum_supp_deducts: 0,
        sum_product_rahn: 0,
        sum_repay_rahn: 0,
        sum_rahn_incr: 0,
        sum_net_income: 0
      }

      if(this.past_init_vals) {
        let past_init_vals = this.past_init_vals
        sum_totals = {
          recp_sum_given: parseFloat( past_init_vals.recp_given ? past_init_vals.recp_given : 0),
          recp_sum_others: parseFloat( past_init_vals.recp_others ? past_init_vals.recp_others : 0),
          recp_sum_diff: parseFloat( past_init_vals.recp_diff ? past_init_vals.recp_diff : 0),
          sum_given: parseFloat( past_init_vals.given ? past_init_vals.given : 0),
          sum_deducts: parseFloat( past_init_vals.out_cashflow ? past_init_vals.out_cashflow : 0),
          sum_comm_plus_sell_comm: parseFloat( past_init_vals.comms ? past_init_vals.comms : 0),
          sum_supp_payment: parseFloat( past_init_vals.supp_payments ? past_init_vals.supp_payments : 0),
          sum_supp_deducts: parseFloat( past_init_vals.supp_deducts ? past_init_vals.supp_deducts : 0),
          sum_product_rahn: parseFloat( past_init_vals.rahn ? past_init_vals.rahn : 0),
          sum_repay_rahn: parseFloat( past_init_vals.repay_rahn ? past_init_vals.repay_rahn : 0),
          sum_net_income: parseFloat( past_init_vals.net_income ? past_init_vals.net_income : 0)
        }
      }

      this.daily_totals.forEach(one => {
        sum_totals.recp_sum_given += one.recp_sum_given 
        sum_totals.recp_sum_others += one.recp_sum_others 
        sum_totals.recp_sum_diff += one.sum_out_value - one.recp_sum_sale
        sum_totals.sum_given += one.sum_given 
        sum_totals.sum_deducts += one.sum_deducts 
        sum_totals.sum_comm_plus_sell_comm += one.recp_sum_comm +one.out_sell_comm
        sum_totals.sum_supp_payment += one.sum_supp_payment
        sum_totals.sum_supp_deducts += one.recp_sum_deducts + one.sum_supp_collect 
        sum_totals.sum_product_rahn += one.sum_product_rahn
        sum_totals.sum_repay_rahn += one.sum_repay_rahn + one.sum_rahn_down
        sum_totals.sum_rahn_incr += one.sum_rahn_increase
        sum_totals.sum_net_income += one.recp_sum_comm + one.out_sell_comm + (one.sum_out_value - one.recp_sum_sale) - one.sum_deducts
      })
      return sum_totals
    },
    checkedTotals: function(){
      let checkedTotals = {}
      this.checkedItems.forEach( item => {
        checkedTotals[item] = 0
      })
      console.log(checkedTotals)
      this.daily_expenses.forEach( one => {
        checkedTotals[one.notes] += one.amount
        console.log(one.notes, checkedTotals[one.notes] , one.amount)
      })
      return checkedTotals
    }
  }
}
</script>

