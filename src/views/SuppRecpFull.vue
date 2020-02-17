<template>
<section class="m-2" v-if="modal_recp" style="line-height: 1;">
  <template>
    <p class="recp-header pr-only" v-if="shader_configs['recp_header'] && ! shader_configs['recp_header'].includes('.png')" v-html="shader_configs['recp_header']"></p>
    <img class=" pr-only" v-if="shader_configs['recp_header'] && shader_configs['recp_header'].includes('.png')"
    :src="require(`@/assets/${shader_configs['recp_header']}`)" 
    style="width: 100%;margin: -25px auto;margin-top: -75px;"/>
  </template>

  <h4 class="text-center"> فاتورة 
    <span class="pr-hideme">
      ({{modal_recp.serial}})
    </span>
  </h4>

<div style="display: grid;grid-template-columns: auto auto;">
  <div >
    <h4 style="
        font-size: 1.5em;
        margin: .5em;
    ">
      تحريراً في {{recp_day | arDate(app_config.shader_name) }}
    </h4>
    <h4 style="
        margin: .5em;margin-top: -.5em;
    ">
      <span style="font-size: .7em;">اسم العميل/ </span> 
      <span style="font-size: 1.1em;">{{supplier.name}}</span>
    </h4>
  </div>
  <div  v-if=" shader_configs['F_SHOW_DEBT_RECP']">
    <h3 class="text-center" > {{'curr_supp_debt' | tr_label}} : {{curr_debt | round | toAR}}</h3>
  </div>
</div>

<img style="margin-top: -450px;float: right;margin-right: 30px;" width="170" class="pr-only"
v-if="app_config.shader_name != 'magdy' && ! shader_configs['recp_header'].includes('.png')"
src='https://i.imgur.com/Ie2KPRE.jpg?1' />
<img style="margin-top: -450px;float: left;margin-left: 30px;" width="170" class="pr-only"
v-if="app_config.shader_name != 'magdy' && ! shader_configs['recp_header'].includes('.png')"
src='https://i.imgur.com/Ie2KPRE.jpg?1' />

<h3 
class="text-center" style="margin-top: -1.5rem;" 
v-if="app_config.shader_name == 'magdy'" >
 حساب سابق : {{ day_balance_was | toAR }}
</h3>
  <div class="table-responsive p-2 m-2" style="border: 2px solid #79ace0; border-radius: 12px;" > 
      <table class="table table-bordered table-sm pr-me-xx" >
        <thead>
          <tr>
            <th>الاجمالي</th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}">عدد </th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}"> الوزن</th>
            <th> </th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}" >سعر 
            </th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}" >الصنف</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in modal_recp.details" 
          :key='idx' 
          
          >
            <td>
              {{item.kg_price *  item.weight | round2 | toAR }}
            </td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" v-model="item.count" class="form-control"  >
              <span v-else>{{item.count | toAR }}</span>
            </td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" v-model="item.weight" class="form-control"  >
              <span v-else>{{item.weight | toAR }}</span>
            </td>
            <td>X</td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" v-model="item.kg_price" class="form-control"  >
              <span v-else> {{item.kg_price | toAR(true) }}</span>
            </td>
            <td >{{item.product_name}} </td>
            <td>
              <span class="fa fa-minus-circle pr-hideme" @click="remove_from_list(modal_recp.details, idx)"
              style="color:red;float: left;"></span>
            </td>
          </tr>
          <tr>
            <td ><b class="border-top border-primary">{{modal_recp.sale_value | round2 | toAR }} </b></td>
            <td >
              <b v-if="modal_recp.details.length && modal_recp.details.length > 1"
              class="border-top border-primary">
                {{ counts.total_count | toAR }}
                </b>
            </td>
            <td colspan="5" class="noborder"></td>
          </tr>
          </tbody>
          </table>
    <!--todo zabat errors -->
    <div v-if="modal_recp.recp_paid < 1 && false">
      <div v-for="(incom, idx) in inc_headers" :key='idx' class="text-danger" >
        <span v-if="incom.sold_count != incom.recp_in_count "> <span class="fa fa-error"></span> &nbsp;
        صنف {{incom.product_name}} تم بيع {{incom.sold_count | default0 }} طرد  - تم انشاء فواتير بعدد {{incom.recp_in_count | default0}} طرد
        فقط
        <span class="text-primary"
        @click="newRecpDetial(incom)"> اضافة {{parseInt(incom.sold_count) - parseInt(incom.recp_in_count) }}</span>
        </span>
        <br/>
      </div>
    </div>
        <table class="table  table-sm pr-me-xx" >
        <tbody>
          <tr class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              :class="{'font-small': app_config.shader_name == 'magdy'}"
              v-model="modal_recp.comm_rate" class="form-control"  >
            </td>
            <td></td>
            <th>
              <span class="pr-hideme">
                
               </span>
            </th>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_comm | round2 | toAR(true) }} )</td>
            <th  :class="{ 'bbordered': app_config.shader_name == 'amn1'}" >عمولة</th>
          </tr>
          <tr v-if="modal_recp.total_nolon" class="noborder">
            <td colspan="7" class="noborder"></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}"><b >( {{modal_recp.total_nolon | round2 | toAR(true) }} )</b></td>
            <td  :class="{ 'bbordered': app_config.shader_name == 'amn1'}">نولون</td>
          </tr>
          <tr v-if="modal_recp.recp_expenses" class="noborder">
            <td colspan="7" class="noborder" ></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}"><b >( {{modal_recp.recp_expenses | round2 | toAR }} )</b></td>
            <td  :class="{ 'bbordered': app_config.shader_name == 'amn1'}">{{ 'recp_expenses' | tr_label }}</td>
          </tr>

          <tr v-if="app_config.shader_name != 'nada' && app_config.shader_name != 'amn1'" class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_deducts" class="form-control" placeholder="ادخل مبلغ الخصم" >
            </td>
            <td></td>
            <td></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_deducts | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">خصم</th>
          </tr>

          <tr class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_given" class="form-control"  >
            </td>
            <td></td>
            <td></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_given | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">
              {{'recp_given' | tr_label}}
            </th>
          </tr>

          <tr v-if="app_config.shader_name != 'nada'" class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_others" class="form-control"  >
            </td>
            <td></td>
            <td></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_others | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">
              {{'recp_others' | tr_label}}
            </th>
          </tr>
          <tr v-if="app_config.shader_name != 'nada'" >
            <td colspan="4" class="noborder"></td>
            <td >
            </td>
            <td></td>
            <td></td>
            <td class="text-danger bbordered" v-if="app_config.shader_name == 'amn1'">( {{ modal_recp.recp_comm +
               modal_recp.total_nolon +
               modal_recp.recp_expenses + 
               modal_recp.recp_given +
               modal_recp.recp_others | toAR(true) }})</td>
            <td class="text-danger" v-else>( {{ modal_recp.recp_comm +
               modal_recp.total_nolon +
               modal_recp.recp_expenses + 
               modal_recp.recp_deducts + 
               modal_recp.recp_given +
               modal_recp.recp_others | toAR(true) }})</td>
            <th  :class="{ 'bbordered': app_config.shader_name == 'amn1'}">
              {{'total_disc' | tr_label}} 
            </th>
          </tr>
          <tr v-if="app_config.shader_name != 'amn1'">
            <td colspan="2" class="noborder"></td>
            <td class="noborder">صافي الفاتورة</td>
            <td >
              <b class="border-top border-primary" >
                {{modal_recp.net_value | ceil5(app_config.shader_name) | round | toAR }}
              </b>
            </td>
          </tr>
          <tr v-if="app_config.shader_name == 'amn1'">
            <td >
              <b class="border-top border-primary" >
                {{modal_recp.net_value + modal_recp.recp_deducts | round | toAR }}
              </b>
            </td>
            <td class="noborder">اجمالي الفاتورة</td>
          </tr>
          <tr v-if="app_config.shader_name == 'amn1'" class="noborder">
            <td v-if="! print_mode && ! modal_recp.recp_paid" >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_deducts" class="form-control" placeholder="ادخل مبلغ الخصم" >
            </td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_deducts | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">خصم</th>
          </tr>
          <tr v-if="app_config.shader_name == 'amn1'">
            <td >
              <b class="border-top border-primary" >
                {{modal_recp.net_value | round | toAR }}
              </b>
            </td>
            <td class="noborder">صافي الفاتورة</td>

          </tr>
        </tbody>
      </table>

      <div class="m-2 pr-hideme">
          <button class="btn btn-success pr-hideme" 
          v-if="! modal_recp.id || modal_recp.recp_paid == 0"
          @click="saveRecp();" >
            <span class="fa fa-check "></span> &nbsp;
            حفظ 
          </button>

          &nbsp;
          <button class="btn btn-primary pr-hideme" 
          :disabled="day.stricted"
          v-if="modal_recp.id && modal_recp.recp_paid != 2"
          @click="setRecpPaid(modal_recp, 2)" >
            <span class="fa fa-money-bill "></span> &nbsp;
            <span v-if="day.stricted"> لا يمكن </span>
            صرف
          </button>
          &nbsp;
          <button class="btn btn-printo pr-hideme" 
            @click="modal_recp.printed = 1 ;print_mode=true;saveRecp();print_co()">
            <span class="fa fa-print"></span> طباعة
          </button>

          &nbsp;
          <button class="btn btn-danger pr-hideme" 
          @click="$router.go(-1)">
          <span class="fa fa-sign-out-alt "></span> &nbsp; اغلاق
          </button>

          &nbsp;
          <button class="btn btn-primary pr-hideme" v-if="modal_recp.id &&  modal_recp.recp_paid != 1 && modal_recp.recp_paid != 2"
          @click="setRecpPaid(modal_recp, 1)" >
            <span class="fa fa-money-bill "></span> &nbsp;
            رصد
          </button>
      </div>

  </div>
      <div class="row">
        <p class="col-9 text-danger pr-me" v-if="app_config.shader_name != 'magdy'">
          * خالص بيد حامله ولا تلغي أي شيكات أو ايصالات امانة
        </p>
        <span class="col-2">
         ف
        {{modal_recp.recp_paid}}
        (م {{modal_recp.serial}})
        </span>
      </div>
</section>
<!--</b-modal> -->
</template>
<script >
import { InoutHeadCtrl } from '../ctrls/InoutHeadCtrl'
import { CashflowCtrl, CashflowDAO } from '../ctrls/CashflowCtrl'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl'
import { ReceiptDAO, ReceiptsCtrl } from '../ctrls/ReceiptsCtrl'
import { OutgoingsCtrl } from '../ctrls/OutgoingsCtrl'
import {  SuppliersCtrl } from '../ctrls/SuppliersCtrl'
import { MainMixin } from '../mixins/MainMixin'
import {knex} from '../main'
import AlertDay from '@/components/AlertDay.vue'

export default {
  name: 'supp-recp-full',
  data () {
    return {
      recp_day: this.$route.params.day,
      supplier_id: this.$route.params.supplier_id,
      inc_headers: [],
      modal_recp: null,
      supplier: null,
      total_nolon: 0,
      recp_expenses: 0,
      recp_deducts: 0,
      curr_debt: 0,
      recp_init_comm_rate: this.$store.state.shader_configs['init_recp_comm'] ? parseFloat(this.$store.state.shader_configs['init_recp_comm']) : 0 ,
      recp_init_recp_given: this.$store.state.shader_configs['init_recp_given'] ? parseFloat(this.$store.state.shader_configs['init_recp_given']) : 0 ,
      print_mode: false,
    }
  },
  mixins: [MainMixin],
  methods: {
    async refresh_all(){
      let [calc_debt] = await knex.raw(`select sum(amount) as curr_debt from supplier_trans where supplier_id = ${this.supplier_id}`);
      console.log(calc_debt)
      if( calc_debt && calc_debt.curr_debt ){
        this.curr_debt = parseFloat(calc_debt.curr_debt)
      }
    },
    async saveRecp(receipt = null){
      if(! receipt) receipt = this.modal_recp
      receipt = new ReceiptDAO({
        ...receipt,
        day: this.recp_day,
        supplier_id: this.supplier_id,
      })
      return await new ReceiptsCtrl().save(receipt)
    },
    async newRecpDetial(incom) {
      console.log(incom)
      this.modal_recp.details.push({
        supplier_id: this.supplier.id,
        receipt_id: this.modal_recp.id,
        day: this.modal_recp.day,
        count: parseInt(incom.sold_count) - parseInt(incom.recp_in_count),
        product_id: incom.product_id,
        product_name: incom.product_name,
      })
    },
    async setRecpPaid( receipt, recp_paid ) {
      receipt.recp_paid = recp_paid
      if(recp_paid == 2 ){
        let cashflow_id ;
        let cashflowDAO = new CashflowDAO({
          day: this.day.iso,
          supplier_id: this.supplier_id,
          amount: receipt.net_value,
          d_product: receipt.products_arr,
          receipt_id: receipt.id,
          income_day: receipt.day
        })
        let transType = await new TransTypesCtrl().findOne({name: 'recp_paid', category: 'cashflow'})
        cashflowDAO.transType = transType
        cashflow_id = await new CashflowCtrl().save(cashflowDAO)
        if(cashflow_id) {
          receipt.cashflow_id = cashflow_id;
          this.saveRecp();
        } else {
          window.alert('لم يتم صرف الفاتورة يوجد خطأ')
        }
      } else {
        this.saveRecp();
      }
      
    },
    /**@param {Array} list */
    remove_from_list(list, id) {
      list.splice(id, 1)
    },
    /**@param {OutgoingDAO} dao*/
    clone(dao){
      // Custom clone to return a new Element
      return {
          count: dao.sum_count,
          product_name: dao.product_name,
          product_id:  dao.product_id,
          kg_price: dao.kg_price,
          weight: dao.sum_weight,
          sell_comm: dao.sell_comm
      }
    },
    /**@param {ReceiptDAO} dao*/
    calc_receipt(dao) {
      let sale_value = 0
      let total_count = 0
      dao.details.forEach(item => {
        sale_value += parseFloat(item.weight) * parseFloat(item.kg_price)
        total_count += parseInt(item.count)
      })

      dao.sale_value = sale_value
      dao.total_count = total_count
      // TODO INIT VALUES
      dao.comm_rate = dao.comm_rate ? dao.comm_rate : 0
      dao.recp_comm = Math.round(( dao.comm_rate / 100 ) * sale_value * 100) / 100
      dao.recp_expenses = dao.recp_expenses ? dao.recp_expenses : 0
      dao.recp_deducts = dao.recp_deducts ? dao.recp_deducts : 0
      dao.recp_given = dao.recp_given ? dao.recp_given : 0 
      if(this.shader_configs['init_mashal'])
        dao.recp_others = dao.recp_others ? dao.recp_others 
        : Math.round( total_count * parseFloat(this.shader_configs['init_mashal']))
      else
        dao.recp_others = dao.recp_others ? dao.recp_others : 0
      dao.total_nolon = dao.total_nolon ? dao.total_nolon : 0
      dao.net_value = sale_value - dao.recp_comm - dao.recp_given -  dao.recp_others - dao.recp_expenses - dao.recp_deducts -  dao.total_nolon
    }
  },
  async mounted(){
    this.supplier = await new SuppliersCtrl().findById(this.supplier_id)
    //console.log(this.supplier)
    if(this.app_config.shader_name == 'amn1' && this.supplier.address){
      try {
        if(JSON.parse(this.supplier.address) && JSON.parse(this.supplier.address).comm_rate)
        this.recp_init_comm_rate = parseFloat(JSON.parse(this.supplier.address).comm_rate)
        console.log(parseFloat(JSON.parse(this.supplier.address).comm_rate))
      } catch (err) {
        console.log(err)
      }
    }

    this.inc_headers = await new InoutHeadCtrl().findAll({supplier_id: this.supplier_id, day: this.recp_day})

    this.total_nolon = await new CashflowCtrl().getSupplierNolons({supplier_id: this.supplier_id, day: this.recp_day})
    // TODO ظبط
    this.recp_expenses_dao = await new CashflowCtrl().getSupplierRecpExpenses({supplier_id: this.supplier_id, day: this.recp_day})
    this.recp_expenses_dao = this.recp_expenses_dao ? this.recp_expenses_dao : new CashflowDAO({
      state: 'supp_recp_expenses',
      sum: '-',
      amount: 0
    })
    this.recp_expenses = this.recp_expenses_dao.amount 
    
    let [receipt] = await new ReceiptsCtrl().findAll({supplier_id: this.supplier_id, day: this.recp_day})
    
    if(receipt) {
      console.log(receipt)
      this.modal_recp = receipt
    } else {
      console.log('np recp')
      // if no recp_id init recp 
      let outgoings_sums = await new OutgoingsCtrl().findSuppDaySums({supplier_id: this.supplier_id, day: this.recp_day})
      if(outgoings_sums.length < 1) throw "No Details";
      let new_recp = new ReceiptDAO({serial: 1, recp_given: this.recp_init_recp_given, comm_rate: this.recp_init_comm_rate, ...ReceiptDAO.INIT_DAO})
      let all = outgoings_sums.map( dao => this.clone(dao))
      new_recp.details = all
      new_recp.total_nolon = this.total_nolon
      new_recp.balance_was = this.supplier.balance
      new_recp.recp_expenses = this.recp_expenses
      new_recp.recp_deducts = this.recp_deducts
      console.log(new_recp)
      let ret_recp = await this.saveRecp(new_recp);
      console.log(ret_recp);
      // Save recp then get it
      let [fresh_recp] = await new ReceiptsCtrl().findAll({supplier_id: this.supplier_id, day: this.recp_day})
      this.modal_recp = fresh_recp
    }
    this.refresh_all()
  },
  components: {
    AlertDay
  },
  computed: {
    counts: function() {
      let counts = { total_count: 0}
      this.modal_recp.details.forEach( item => {
        counts.total_count += parseInt(item.count)
      })
      return counts
    },
    total_diff: function() {
      let total_diff = 0
      this.inc_headers.forEach(one => {
        total_diff += one.diff
      });
      return total_diff;
    }
  },
  watch: {
    modal_recp: {
      /**@param {ReceiptDAO} dao*/
      handler: async function(dao) {
        this.calc_receipt(dao)
      },
      deep: true
    },
  }
}
</script>