<template>
<section class="m-3">
  <section class="daily-receipts" v-if="logged_in_user.user_type != 'editor'">
    
    <div class="pr-hideme">
      <h3 class="text-danger fa fa-eraser larger"
      @click="search_term = ''" v-if="search_term"></h3>
      <input v-model="search_term" class="form-control" :placeholder="custom_labels['search_receipts']">
      <br>
    </div>
    
      <h2>فواتير يومية {{day.arab}}</h2>
      
      <div class="table-responsive">
        <table class="table table-striped table-sm pr-me-l">
          <thead>
            <tr>
              <th>اسم العميل</th>
              <th>الاصناف</th>
              <th>عدد الطرود</th>
              <th>البياعة</th>
              <th>العمولة</th>
              <th>بياعة + عمولة</th>
              <th>فرق فواتير</th>
              <th>نوالين</th>
              <th v-if="app_config.shader_name != 'nada'">خصم</th>
              <th v-if="app_config.shader_name == 'nada'">مصاريف</th>
              <th>وهبة </th>
              <th>{{'recp_others' | tr_label}}</th>
              <th>صافي فواتير</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in fltrd_daily_receipts" :key='idx'>
              <td>
                <router-link  :to="{name:'supplier_details', params: {id: item.supplier_id}}">
                <b>{{item.supplier_name}}</b>
                </router-link>
                <br/>
                <router-link :to="{name:'supp_recp_details', params: {supplier_id: item.supplier_id}}"
                v-for="(recp_paid, index) in receiptsSepStatus(item.concat_recp_paid)" :key="index">
                فاتورة {{'recp_status_'+ recp_paid | tr_label }} 
                  <span v-if="index+1 != receiptsSepStatus(item.concat_recp_paid).length"><br/></span>
                </router-link>
              </td>
              <td v-html="$options.filters.productsFilter(item.products_concat,'<br/> ')"></td>
              
              <td>{{ item.sum_total_count }}</td>
              <!--
              <td> 
                <span class="text-danger" v-if="item.total_current_rest">{{item.total_current_rest}}</span>
              </td>
              -->
              <td>{{item.sum_sell_comm | round2 }}</td>
              <td>{{item.sum_recp_comm | round2}}</td>
              <td>{{ ( item.sum_sell_comm + item.sum_recp_comm ) | round2}}</td>
              <td >
                <span v-if="(item.sum_out_value - item.sum_sale_value) > 0">+</span>
                {{ (item.sum_out_value - item.sum_sale_value) | round2}}
              </td>
              
              <td>{{item.sum_total_nolon | round2 }}</td>
              <td v-if="app_config.shader_name != 'nada'">{{item.sum_recp_deducts | round2 }}</td>
              <td v-if="app_config.shader_name == 'nada'">{{item.sum_recp_expenses | round2 }}</td>
              <td>{{item.sum_recp_given | round2 }}</td>
              <td>{{item.sum_recp_others | round2 }}</td>
              <td>{{item.sum_net_value | round2 }}</td>
            </tr>
            <tr>
              <td></td>
              <th>المجموع</th>
              <td></td>
              <td>{{recp_sums.sum_out_comm | round }}</td>
              <td>{{recp_sums.sum_recp_comm | round }}</td>
              <td>{{recp_sums.sum_comms | round }}</td>
              <th>
                <span v-if="recp_sums.sum_diffs  > 0">+</span>
                {{recp_sums.sum_diffs | round }}
              </th>
              <th>{{recp_sums.sum_nolons | round }}</th>
              <td></td>
              <th>{{recp_sums.sum_givens | round }}</th>
              <th>{{recp_sums.sum_others | round }}</th>
            </tr>
          </tbody>
        </table>
      </div>
  </section>
  <section v-if="logged_in_user.user_type != 'editor'">

    <div>
      <hr>
      <h4>اجمالي فواتير الرصد فقط : {{recp_sums.sum_rasd_net | round | toAR }}</h4>
    </div>

    <div>
      <hr>
      <h4 v-if="shader_configs['F_ADD_DIFF_TO_INCOME']">اجمالي ايرادات اليوم : 
        {{daily_totals.recp_sum_comm + daily_totals.out_sell_comm + (daily_totals.sum_out_value - daily_totals.recp_sum_sale)  | round | toAR }}
      </h4>
      <h4>اجمالي ايرادات اليوم : 
        {{daily_totals.recp_sum_comm + daily_totals.out_sell_comm | round | toAR }}
      </h4>
    </div>

    <div>
      <hr>
      <h4>اجمالي مصروفات تخصم من ايراد اليوم : {{daily_totals.sum_deducts | round | toAR }}</h4>
    </div>
  
    <div>
      <hr>
      <h4  v-if="shader_configs['F_ADD_DIFF_TO_INCOME']">صافي الايراد اليومي :
         {{ daily_totals.recp_sum_comm + daily_totals.out_sell_comm + (daily_totals.sum_out_value - daily_totals.recp_sum_sale) - daily_totals.sum_deducts| round | toAR }}
      </h4>
      <h4 >صافي الايراد اليومي :
         {{ daily_totals.recp_sum_comm + daily_totals.out_sell_comm - daily_totals.sum_deducts | round | toAR }}
      </h4>
    </div>

    <div>
      <hr>
      <h4>اجمالي مشال التجار  : {{daily_totals.sum_mashal | round | toAR }}</h4>
    </div>
  
    <div v-if="app_config.shader_name != 'magdy'">
      <hr>
      <h4>زمامات اليوم: {{ (daily_totals.out_zm_val + daily_totals.sum_cash_zm) | round | toAR }}</h4>
    </div>

    <div v-if="app_config.shader_name != 'magdy'">
      <hr>
      <h4>تحصيلات اليوم : {{ daily_totals.sum_collect_zm | round | toAR }}</h4>
    </div>
  
    <div v-if="app_config.shader_name == 'amn1'">
      <hr>
      <h4>{{'sum_capital' | tr_label}}: {{ sum_capital | round | toAR }}</h4>
    </div>

  
  </section>

    <div>
      <hr>
      <h4>صافي الخزينة : {{ cash_sums.net | toAR(true) }}</h4>
    </div>
  <hr>
  <section class="inout-cashflow">
    <h2>
      {{'menu_collecting'| tr_label}} اليوم
    </h2>
    <CashflowTable :cashflow_arr="cashflow_arr_in" 
    :flags="{type: 'cashflow_in'}" ></CashflowTable>

    <h2>
      {{'expenses' | tr_label}} اليوم
    </h2>
    <CashflowTable :cashflow_arr="cashflow_arr_out" 
    :flags="{type: 'cashflow_out'}" ></CashflowTable>
  </section>

    <button class="btn btn-printo pr-hideme" 
      @click="clipboard.writeText('كشف يومية '+day.iso);print_co()">
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
      daily_receipts: [],
      daily_totals: {},
      cashflow_arr_in: [],
      cashflow_arr_out: [],
      day_sums: {
        sum_collect: null,
        sum_oncredit: null, // oncredit outgoings and also on credit cashflows paid , acc_rest
        sum_exp_no_deduct: null
      },
      sum_capital: 0
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
    let sum_dealer_trans = dealer_trans && dealer_trans.sum_dealer_trans ? parseFloat(dealer_trans.sum_dealer_trans) : 0
    let net_cash = await this.cashflowCtrl.getNetCash({day: this.day.iso})
    this.net_cash = net_cash
    let {sum_net_rasd} = await new ReceiptsCtrl().sumNetRasd()

    this.sum_capital = cust_sum_debt + supp_sum_debt + net_cash - sum_net_rasd + sum_dealer_trans
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
    recp_sums: function() {
      let recp_sums = { 
        sum_count:0 ,
        sum_diffs:0 ,
        sum_nolons: 0 ,
        sum_net: 0 , 
        sum_rasd_net: 0 ,
        sum_out_comm: 0,
        sum_recp_comm: 0,
        sum_comms: 0 ,
        sum_givens: 0,
        sum_others: 0
      }
      this.daily_receipts.forEach( recp => {
        recp_sums.sum_count += parseInt(recp.sum_total_count)
        recp_sums.sum_diffs += ( recp.sum_out_value - recp.sum_sale_value )
        recp_sums.sum_nolons += parseFloat(recp.sum_total_nolon)
        recp_sums.sum_net += recp.sum_net_value
        recp_sums.sum_comms += recp.sum_sell_comm + recp.sum_recp_comm 
        recp_sums.sum_out_comm += recp.sum_sell_comm
        recp_sums.sum_recp_comm += recp.sum_recp_comm
        recp_sums.sum_givens += recp.sum_recp_given
        recp_sums.sum_others += recp.sum_recp_others
        recp_sums.sum_rasd_net += recp.sum_rasd_net
      })
      return recp_sums
    },
  }
}
</script>