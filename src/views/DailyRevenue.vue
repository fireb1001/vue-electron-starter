<template>
  <section class="template m-3">
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

      </div>
    </div>

    <section class="m-2" v-if="show_daily == 'daily_totals'">
    <h2>الارباح اليومية</h2>
      <div class="table-responsive">
        <table class="table table-striped table-sm pr-me-l">
          <thead>
            <tr>
              <th>اليوم</th>
              <th v-if="show_totals.includes('comms')"> {{'comms' | tr_label}} </th>
              <th v-if="show_totals.includes('out_cashflow')"> {{'out_cashflow' | tr_label}} </th>
              <th v-if="show_totals.includes('net_income')"> {{'net_income' | tr_label}} </th>
              <th v-if="show_totals.includes('recp_diff')"> {{'recp_diff' | tr_label}} </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in daily_totals" :key='idx'>
              <td>
                <span class="text-primary" @click="change_today_date(item.day)">
                  {{item.day | arDate }}
                </span>
              </td>
              <td v-if="show_totals.includes('comms')">
                {{item.recp_sum_comm + item.out_sell_comm | round }}
              </td>

              <td v-if="show_totals.includes('out_cashflow')">
                {{item.sum_deducts | round }}
              </td>
              <td v-if="show_totals.includes('net_income')">
                {{item.recp_sum_comm + item.out_sell_comm - item.sum_deducts | round }}
              </td>

              <td v-if="show_totals.includes('recp_diff')">
                {{item.sum_out_value - item.recp_sum_sale | round }}
              </td>
            </tr>
            <tr >
              <th>المجموع</th>
            </tr>
          </tbody>
        </table>
      </div>
      </section>
        <button class="btn btn-printo pr-hideme"  @click="print_co">
          <span class="fa fa-print"></span> طباعة
        </button>
        {{sum_totals}}
  </section>
</template>
<script>
import { MainMixin } from '../mixins/MainMixin'
import { knex, moment } from '../main'
import { Settings, DateTime } from 'luxon'

Settings.defaultLocale = 'ar'
Settings.defaultZoneName = 'UTC'

export default {
  name: 'daily-totals',
  data() {
    return {
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
      max_datetime: '',
      show_daily: 'daily_totals',
      show_totals: '',
      all_fukn_expenses: []
    }
  },
  mixins:[MainMixin],
  methods: {
    async save(evt) {
      evt.preventDefault()
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
      //console.log(this.daily_totals)
      let all_exp_init = await knex.raw(`select * from cashflow where state='expenses' and d_product='init'`);
      let all_exp_init_arr = {}
      all_exp_init.forEach(item => all_exp_init_arr[item.notes] = item.amount)
      console.log(all_exp_init_arr)
      this.all_fukn_expenses = all_exp_init_arr
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
    this.refresh_all()
    this.show_totals = this.shader_configs['show_totals'] ? this.shader_configs['show_totals'] : ''
  },
  computed: {
    sum_totals: function() {
      //this.daily_totals
      let total = this.daily_totals.reduce((prev_val, new_val)=> {
        comms: prev_val.comms + new_val.comms
      })
      console.log("totals", total)
      return total
    }
  }
}
</script>

