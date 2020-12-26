<template>
<section class="m-3">

      <div >

        <table class="table table-bordered mt-1 ">
        <tr>
          <th> اجمالي مديونيات الفلاحين</th>
          <td>{{capital_sums.supp_sum_debt | round | toAR}}</td>

          <th> اجمالي مديونيات التعاملات</th>
          <td>{{capital_sums.sum_dealer_trans | round | toAR}}</td>

        </tr>
        <tr>
        
        <th> اجمالي مديونيات التجار</th>
          <td>{{capital_sums.cust_sum_debt | round | toAR}}</td>

          <th>اجمالي فواتير الرصد</th>
          <td>({{ capital_sums.sum_net_rasd | round | toAR }})</td>
        </tr>
        <tr>
          <th>   نقدية</th>
          <td>{{capital_sums.net_cash | round | toAR}}</td>

          <th>اجمالي صافي الايراد </th>
          <td>({{ capital_sums.sum_net_income_no_diff | round | toAR }})</td>
        </tr>

      </table>
      <hr>
      <table class="table table-bordered mt-1 "> 
                <tr>
          <th>{{'sum_capital' | tr_label}}</th>
          <td>{{ capital_sums.sum_capital | round | toAR }}</td>
        </tr>
      </table>
      </div>

    <button class="btn btn-printo pr-hideme" 
      @click="print_co">
      <span class="fa fa-print"></span> طباعة
    </button>

</section>
</template>

<script>
import { CashflowCtrl } from '../ctrls/CashflowCtrl'
import { ReceiptsCtrl } from '../ctrls/ReceiptsCtrl'
import CashflowTable from '@/components/CashflowTable.vue'
import { MainMixin } from '../mixins/MainMixin'
import { knex } from '../main'
import { CustomersCtrl } from '../ctrls/CustomersCtrl'
import { SuppliersCtrl } from '../ctrls/SuppliersCtrl'

export default {
  name: 'daily-moves',
  components: {
    CashflowTable
  },
  mixins: [MainMixin],
  data(){
    return {
      cashflowCtrl: new CashflowCtrl(),
      receiptsCtrl: new ReceiptsCtrl(),
      capital_sums: {
        sum_capital:0, 
        cust_sum_debt: 0,
        supp_sum_debt: 0, 
        net_cash: 0,
        sum_net_rasd: 0,
        sum_dealer_trans: 0,
        sum_net_income_no_diff: 0
      }
    }
  },
  methods: {
    async refresh_all(){
      this.cashflow_arr_in = await this.cashflowCtrl.findAll({sum: '+', day: this.$store.state.day.iso})
      this.cashflow_arr_out = await this.cashflowCtrl.findAll({sum: '-', day: this.$store.state.day.iso})
      this.daily_receipts = await this.receiptsCtrl.findDailyReceipts({day: this.$store.state.day.iso })
      // TODO MOVE
      let totals = await knex('v_daily_sums').where('day', this.day.iso).first()
      this.daily_totals = totals ? totals : {}
      
    },
    receiptsSepStatus(concat_recp_paid) {
      if(concat_recp_paid)
        return concat_recp_paid.split(',')
      else
        return []
    }
  },
  async mounted() {
    let { sum_debt: cust_sum_debt } = await new CustomersCtrl().sumDebt()
    let {sum_debt: supp_sum_debt } = await new SuppliersCtrl().sumDebt()
    let [ dealer_trans ]  = await knex.raw('select sum(amount) as sum_dealer_trans from dealer_trans');
    let [ net_income_no_diff ]  = await knex.raw('select sum (net_income_no_diff) as sum_net_income_no_diff from v_daily_sums;');
    let sum_dealer_trans = dealer_trans && dealer_trans.sum_dealer_trans ? parseFloat(dealer_trans.sum_dealer_trans) : 0;
    let sum_net_income_no_diff = net_income_no_diff && net_income_no_diff.sum_net_income_no_diff ? parseFloat(net_income_no_diff.sum_net_income_no_diff) : 0;
    this.net_cash = await this.cashflowCtrl.getNetCash({day: this.day.iso})
    let {sum_net_rasd} = await new ReceiptsCtrl().sumNetRasd()
    this.capital_sums = {
      sum_capital: cust_sum_debt + supp_sum_debt + this.net_cash - sum_net_rasd + sum_dealer_trans - sum_net_income_no_diff,
      cust_sum_debt: cust_sum_debt,
      supp_sum_debt: supp_sum_debt,
      net_cash: this.net_cash,
      sum_net_rasd: sum_net_rasd,
      sum_dealer_trans: sum_dealer_trans,
      sum_net_income_no_diff: sum_net_income_no_diff
    }
    this.refresh_all()
  },
  computed: {
    fltrd_daily_receipts: function(){
      return this.daily_receipts.filter( item => {
        return (item.supplier_name.includes(this.search_term) )
      })
    },
    cash_sums: function() {
      let cash_sums = {
        net: 0
      }
      this.cashflow_arr_in.forEach( item => {
        cash_sums.net += parseFloat(item.amount)
      })
      this.cashflow_arr_out.forEach( item => {
        cash_sums.net -= parseFloat(item.amount)
      })
      return cash_sums
    },

  }
}
</script>