<template>
  <section class="accounts minh90 p-3">
    <div class="pr-hideme">
      <h3 class="text-danger fa fa-eraser larger"
      @click="search_term = ''" v-if="search_term"></h3>
      <input v-model="search_term" class="form-control" :placeholder="custom_labels['search_customers']">
      <br/>
    </div>

    <h1>حسابات البائعين - معاملات اليوم</h1>
    <div class="row" 
    v-for="(outgoing, idx) in fltrd_unique_daily_customers" :key="idx">
      <router-link   
      :to="{name:'customer_details', params: {id: outgoing.customer_id}}"
      class="col-5 btn btn-lg m-2 btn-block text-primary d-print-none pr-hideme" >
        &nbsp; 
        عرض حساب البياع - {{outgoing.customer_name}} 
        <div style="color: black">اجمالي الدين: {{outgoing.customer_debt | round | toAR }} </div>
      </router-link>
      <button class="col-5 m-1 btn btn-lg d-print-none pr-hideme " 
      :class="{ 'btn-danger': ! printed_all[outgoing.customer_id], 'btn-primary': printed_all[outgoing.customer_id]}"
      @click="showOutModal(outgoing.customer_id)">
        <span class="fa fa-cash-register"></span>   &nbsp;  {{'kashf_cust' | tr_label}} اليوم 
      <span v-if="printed_all[outgoing.customer_id]" style="float:left">
        ( تمت طباعته )
      </span>
      </button>
    </div>

    <!-- Modal TODO No dublicate -->
<b-modal id="modal-daily" size="xl" class="col-print-12"
hide-header hide-footer hide-header-close hide-backdrop>

<template>
  <p class="recp-header pr-only" v-if="kashf_header && ! kashf_header.includes('.png')" v-html="kashf_header"></p>
  <img class=" pr-only" v-if="kashf_header && kashf_header.includes('.png')"
  :src="require(`@/assets/${kashf_header}`)" 
   style="width: 100%;margin: 0px auto;margin-top: -25px;"/>
</template>

<div class="row">
  <div class="col-5">
    <h4>
      تحريراً في {{outg_day | arDate(app_config.shader_name) }}
    </h4>
    <h4>
      <span style="font-size: .6em;">المطلوب من السيد/ </span> 
      <span style="font-size: 1.1em;">{{customer.name}}</span>
    </h4>
  </div>

  <div class="col-7"  >
    <h3 > {{'kashf_cust' | tr_label}} </h3>
    <h2 class="text-center" v-if="daily_out_trans[0]"> حساب سابق : {{ daily_out_trans[0].debt_was | toAR }}</h2>
  </div>
</div>
<img v-if="! kashf_header.includes('.png')"
:src='`https://i.imgur.com/HieletO.png`' style="margin-top: -375px;float: right;margin-right: 30px;" width="150" class="pr-only"/>
<img v-if="! kashf_header.includes('.png')"
:src='`https://i.imgur.com/HieletO.png`' style="margin-top: -375px;float: left;margin-left: 30px;" width="150" class="pr-only"/>
  <div class="table-responsive p-2 m-2" style="border: 2px solid #79ace0; border-radius: 12px;" > 
      <table class="table table-bordered table-sm pr-me-xx" >
        <thead>
          <tr>
            <th>المبلغ</th>
            <th>عدد </th>
            <th> وزن</th>
            <th>سعر </th>
            <th>صنف</th>
            <th>
              <span v-if="shader_configs['pay_arboon']">
              عربون
              </span>
              <span v-else>
                ملاحظات
              </span>
              </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in daily_out_trans" :key='idx'>
            <template v-if="item.trans_type == 'outgoing'">
              <td>{{ item.amount | toAR(true) }} </td>
              <td> {{ item.count | toAR }}</td>
              <td> {{ item.weight | toAR }}</td>
              <td> {{ item.kg_price | toAR(true) }}</td>
              <td>{{ item.product_name }} </td>
              <td >
                <b v-if="shader_configs['pay_arboon'] && item.notes">
                  عربون : 
                </b>
                {{item.notes }}
              </td>
            </template>
            <!--
            <template v-if="item.trans_type == 'product_rahn'">
              <td>{{ item.amount | toAR(true) }} </td>
              <td> {{ item.count | toAR }}</td>
              <td> </td>
              <td> </td>
              <td> رهن {{ item.product_name }} </td>
              <td >
                {{item.notes }}
              </td>
            </template>
            <template v-if="false && item.trans_type == 'cust_in_collecting'">
              <td>( {{ item.amount | toAR(true) }} ) </td>
              <td> تنزيل</td>
              <td> </td>
            </template>
            -->
          </tr>

          <tr>
            <td >
              <b class="border-top border-primary">
                <span>
                  {{ sum_out_products_only | round2 | toAR }}
                </span>
              </b>
            </td>
            <td style="border: none !important;"> مجموع </td>
          </tr>

          <tr>
            <td >
              <b class="border-top border-primary">
                <span>
                  {{ sum_rahn_only | round2 | toAR }}
                </span>
              </b>
            </td>
            <td style="border: none !important;"> رهن </td>
          </tr>

          <tr v-if="app_config.shader_name != 'nada'"
          :class="{'pr-hideme': !d_collect_form.amount }">
            <td >
              <input v-if="! d_collect_form.id && ! day.stricted" 
              v-model="d_collect_form.amount" class="form-control" placeholder="ادخل مبلغ التحصيل" >
              <span v-if="d_collect_form.id">({{d_collect_form.amount | toAR}})</span>
              </td>
            <td style="border: none !important;"> 
            {{'collect' | tr_label}}
            </td>

            <td style="border: none !important;">
                <button  v-if="d_collect_form.id && ! day.stricted"
                class="btn text-danger pr-hideme" @click="removeTrans(d_collect_form,true)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[d_collect_form.id]"> حذف </template>
                  <template v-if="confirm_step[d_collect_form.id]"> تأكيد </template>
                </button>
            </td>
          </tr>

          <tr v-if="app_config.shader_name != 'nada'"
          :class="{'pr-hideme': !msh_collect_form.amount }">
            <td ><input v-if="! msh_collect_form.id && ! day.stricted" 
              v-model="msh_collect_form.amount" class="form-control" placeholder="ادخل مبلغ المشال" >
              <span v-if="msh_collect_form.id">{{msh_collect_form.amount | toAR}}</span>
              </td>
            <td style="border: none !important;"> 
            {{'mashal' | tr_label}}
            </td>

            <td style="border: none !important;">
                <button  v-if="msh_collect_form.id && ! day.stricted"
                class="btn text-danger pr-hideme" @click="removeTrans(msh_collect_form,true)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[msh_collect_form.id]"> حذف </template>
                  <template v-if="confirm_step[msh_collect_form.id]"> تأكيد </template>
                </button>
            </td>
          </tr>

          <tr v-if="shader_configs['F_AARBON_KASHF']"
          :class="{'pr-hideme': !aarbon_form.amount }">
            <td ><input v-if="! aarbon_form.id && ! day.stricted" 
              v-model="aarbon_form.amount" class="form-control" placeholder="ادخل مبلغ العربون" >
              <span v-if="aarbon_form.id">({{aarbon_form.amount | toAR}})</span>
              </td>
            <td style="border: none !important;"> 
            عربون
            </td>

            <td style="border: none !important;">
                <button  v-if="aarbon_form.id && ! day.stricted"
                class="btn text-danger pr-hideme" @click="removeTrans(aarbon_form,true)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[aarbon_form.id]"> حذف </template>
                  <template v-if="confirm_step[aarbon_form.id]"> تأكيد </template>
                </button>
            </td>
          </tr>

          <tr v-if="shader_configs['F_REPAY_RAHN_KASHF']"
          :class="{'pr-hideme': !d_down_rahn_form.amount }">
            <td ><input v-if="! d_down_rahn_form.id && ! day.stricted " 
              v-model="d_down_rahn_form.amount" class="form-control" placeholder="ادخل مبلغ رد الرهن" >
              <span v-if="d_down_rahn_form.id">({{d_down_rahn_form.amount | toAR}})</span>
              </td>
            <td style="border: none !important;"> 
            رد رهن
            </td>

            <td style="border: none !important;">
                <button  v-if="d_down_rahn_form.id && ! day.stricted"
                class="btn text-danger pr-hideme" @click="removeTrans(d_down_rahn_form,true)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[d_down_rahn_form.id]"> حذف </template>
                  <template v-if="confirm_step[d_down_rahn_form.id]"> تأكيد </template>
                </button>
            </td>
          </tr>

          <tr>
            <td >
              <b class="border-top border-primary">
                <span v-if="app_config.shader_name != 'nada'">{{ sum_outgoings_val | ceil5(app_config.shader_name) | toAR }} </span>
                <span v-else>{{ sum_outgoings_val | round | toAR }} </span>
              </b>
            </td>
            <td style="border: none !important;"> صافي </td>
          </tr>
        </tbody>
      </table>
      
      <div class="col-6" v-if="shader_configs['F_SHOW_DEBT_KASHF']">
        <hr/>
        <h3 class="text-center" v-if="daily_out_trans[0]">
          {{'total_debt' | tr_label}} 
          : {{sum_debt_cmpt | ceil5(app_config.shader_name) | toAR}}</h3>
          
      </div>
      <span></span>

      <div class="m-2">
          <button class="btn btn-success pr-hideme" @click="modalSave" >
            <span class="fa fa-check "></span> &nbsp;
            حفظ
          </button>
          &nbsp;
          <button class="btn btn-printo pr-hideme" 
            @click="print_co();print_done(outg_day, customer.id);">
            <span class="fa fa-print"></span> طباعة
          </button>
           &nbsp;
          <button class="btn btn-danger pr-hideme" @click="$bvModal.hide('modal-daily');refresh_all();d_collect_form= {};msh_collect_form={}" >
            <span class="fa fa-close "></span> &nbsp;
            اغلاق
          </button>
      </div>
  </div>
</b-modal>
  </section>
</template>

<script >
import { OutgoingsCtrl } from "../ctrls/OutgoingsCtrl";
import { knex } from "../main";
import { MainMixin } from "../mixins/MainMixin";
import { CustomersCtrl, CustomerTransDAO } from "../ctrls/CustomersCtrl";
import { CashflowCtrl, CashflowDAO } from "../ctrls/CashflowCtrl";
import { TransTypesCtrl } from "../ctrls/TransTypesCtrl";
import { PackagingCtrl, PackagingDAO } from '../ctrls/PackagingCtrl';

export default {
  name: "accounts",
  data() {
    return {
      unique_daily_customers: [],
      printed_all: {},
      outg_day: {},
      daily_out_trans: [],
      customer: {},
      customer_trans: [],
      kashf_header: '',
      d_collect_form: {
        id: null,
        trans_type: "cust_collecting",
        amount: null,
        notes: null
      },
      d_down_rahn_form: {
        id: null,
        trans_type: "repay_rahn_internal",
        amount: null,
        notes: null
      },
      aarbon_form: {
        id: null,
        trans_type: "aarbon",
        amount: null,
        notes: null
      },
      msh_collect_form: {
        id: null,
        trans_type: "mashal",
        amount: null,
        notes: null
      },
      confirm_step: [],
      customersCtrl: new CustomersCtrl(),
      transTypesCtrl: new TransTypesCtrl()
    };
  },
  mixins: [MainMixin],
  methods: {
    async refresh_all() {
      let outgoingsCtrl = new OutgoingsCtrl();
      let printed = await knex.raw(
        `select customer_id, printed from customers_daily where day ='${this.day.iso}'`
      );
      printed.forEach(one => {
        if (one.printed === 1)
          this.printed_all[one.customer_id] = one.printed == 1;
      });
      this.unique_daily_customers = await outgoingsCtrl.findDailyCustomers({
        day: this.$store.state.day.iso
      });
    },
    async showOutModal(customer_id) {
      this.customer_trans = [];
      this.d_collect_form = {trans_type: "cust_collecting"}
      this.d_down_rahn_form = {trans_type: "repay_rahn_internal"}
      this.msh_collect_form = {trans_type: "mashal"}
      this.aarbon_form = {trans_type: "aarbon"}

      this.customer = await this.customersCtrl.findOne(customer_id);
      this.customer_trans = await this.customersCtrl.getCustomerTrans({id: customer_id})
      this.outg_day = this.day.iso;
      this.daily_out_trans = await this.customersCtrl.getDailyOutTrans({
        id: customer_id,
        day: this.outg_day
      });
      let filtered_incollect = this.daily_out_trans.filter(
        item => item.trans_type === "cust_in_collecting"
      );
      if (filtered_incollect.length > 0) {
        this.d_collect_form.amount = Math.abs(filtered_incollect[0].amount);
        this.d_collect_form.id = filtered_incollect[0].id;
        this.d_collect_form.customer_id = filtered_incollect[0].customer_id;
      }
      let filtered_mashal = this.daily_out_trans.filter(
        item => item.trans_type === "mashal"
      );
      if (filtered_mashal.length > 0) {
        this.msh_collect_form.amount = Math.abs(filtered_mashal[0].amount);
        this.msh_collect_form.id = filtered_mashal[0].id;
        this.msh_collect_form.customer_id = filtered_mashal[0].customer_id;
      }
      let fltr_rahn_in = this.daily_out_trans.filter(
        item => item.trans_type === "repay_rahn_internal"
      );
      if (fltr_rahn_in.length > 0) {
        this.d_down_rahn_form.amount = Math.abs(fltr_rahn_in[0].amount);
        this.d_down_rahn_form.id = fltr_rahn_in[0].id;
        this.d_down_rahn_form.customer_id = fltr_rahn_in[0].customer_id;
      }
      let fltr_aarbon = this.daily_out_trans.filter(
        item => item.trans_type === "aarbon"
      );
      if (fltr_aarbon.length > 0) {
        this.aarbon_form.amount = Math.abs(fltr_aarbon[0].amount);
        this.aarbon_form.id = fltr_aarbon[0].id;
        this.aarbon_form.customer_id = fltr_aarbon[0].customer_id;
      }
      this.$bvModal.show("modal-daily");
    },
    async modalSave(evt) {
      if (!this.d_collect_form.id && this.d_collect_form.amount) {
        this.d_collect_form.trans_type = "cust_in_collecting";
        await this.createCustomerTrans(evt, this.d_collect_form);
      }
      if (!this.msh_collect_form.id && this.msh_collect_form.amount) {
        this.msh_collect_form.trans_type = "mashal";
        await this.createCustomerTrans(evt, this.msh_collect_form);
      }

      if (!this.aarbon_form.id && this.aarbon_form.amount) {
        this.aarbon_form.trans_type = "aarbon";
        await this.createCustomerTrans(evt, this.aarbon_form);
      }

      if (!this.d_down_rahn_form.id && this.d_down_rahn_form.amount) {
        this.d_down_rahn_form.trans_type = "repay_rahn_internal";
        await this.createCustomerTrans(evt, this.d_down_rahn_form);
      }
      
      await this.showOutModal(this.customer.id);
    },
    async removeTrans(trans, in_kashf = false) {
      if (this.confirm_step[trans.id]) {
        this.discard_success = await this.customersCtrl.removeCustomerTrans(
          trans
        );
        this.confirm_step = [];
        if (in_kashf) {
          this.d_collect_form = {};
          this.msh_collect_form = {};
          this.aarbon_form = {};
          this.d_down_rahn_form = {};
          this.showOutModal(this.customer.id);
        }
      } else {
        this.confirm_step = [];
        this.confirm_step[trans.id] = true;
      }
    },
    async createCustomerTrans(evt, trans_form) {
      evt.preventDefault();

      let selectedTrans = await this.transTypesCtrl.findOne({
        name: trans_form.trans_type,
        category: "customer_trans"
      });
      // create customer trans
      if (selectedTrans) {
        let cashflow_id = null;
        if (selectedTrans.map_cashflow) {
          // Create cashflow with trans
          let cashflowTrans = await this.transTypesCtrl.findOne({
            name: selectedTrans.map_cashflow,
            category: "cashflow"
          });

          let newCashflow = new CashflowDAO({
            amount: trans_form.amount,
            day: this.$store.state.day.iso,
            customer_id: this.customer.id
          });

          newCashflow.transType = cashflowTrans;
          let cashflowCtrl = new CashflowCtrl();
          cashflow_id = await cashflowCtrl.save(newCashflow);
        }

        if( selectedTrans.map_packaging ) {
          await new PackagingCtrl().save(new PackagingDAO({
            count: +trans_form.amount / this.shader_configs['pkg_price'],
            amount: +trans_form.amount,
            sum: selectedTrans.map_packaging,
            customer_id: this.customer.id,
            day: this.day.iso,
            notes: selectedTrans.ar_name
          }))
        }

        let custtransDAO = new CustomerTransDAO(trans_form);
        custtransDAO.day = this.$store.state.day.iso;
        custtransDAO.customer_id = this.customer.id;
        custtransDAO.cashflow_id = cashflow_id;
        custtransDAO.transType = selectedTrans;
        await this.customersCtrl.updateDebtByTrans(custtransDAO);
      }
      trans_form = {trans_type:trans_form.trans_type, amount: null , notes: null}
      this.showOutModal(this.customer.id);
    },
    async print_done(outg_day, customer_id) {
      try {
        await knex.raw(
          `insert into customers_daily (customer_id, day, printed) values( ${customer_id} , '${outg_day}', 1)`
        );
      } catch (error) {
        error;
      }
    }
  },
  components: {},
  computed: {
    fltrd_unique_daily_customers: function() {
      return this.unique_daily_customers.filter(item => {
        if (item.customer_name)
          return item.customer_name.includes(this.search_term);
      });
    },
    sum_outgoings_val: function() {
      let sum = 0;
      this.daily_out_trans.forEach(item => {
        sum += parseFloat(item.amount);
      });
      return sum;
    },
    sum_out_products_only: function() {
      let sum = 0
      this.daily_out_trans.forEach(item => {
        if(item.trans_type == 'outgoing')
          sum += parseFloat(item.amount)
      })
      return sum
    },
    sum_rahn_only: function() {
      let sum = 0
      this.daily_out_trans.forEach(item => {
        if(item.trans_type == 'product_rahn')
          sum += parseFloat(item.amount)
      })
      return sum
    },
    sum_debt_cmpt: function() {
      let sum_debt = 0
      this.customer_trans.forEach( trans => {
        sum_debt += parseFloat(trans.amount)
      })
      return sum_debt
    }
  },
  mounted() {
    this.kashf_header = this.shader_configs['kashf_header'] ? this.shader_configs['kashf_header'] : this.shader_configs['recp_header']
    this.refresh_all();
  }
};
</script>
