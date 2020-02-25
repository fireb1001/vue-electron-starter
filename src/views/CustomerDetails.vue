<template>
  <section class="customer-details p-3 pr-me row">
    <div class="col-4 pr-hideme">
        <button class="btn btn-primary d-print-none pr-hideme" @click="$router.go(-1)">
            <span class="fa fa-arrow-right"></span> &nbsp;   العودة
        </button>
        <br />

        <h3 class="d-inline-block ">كشف مديونية / {{customer.name}}</h3>
        <table class="table table-bordered mt-1 pr-hideme" 
        v-if=" ! customer.is_self && flags.show_cust_det">
            <tr>
              <th>تليفون </th>
              <td>{{customer.phone}}</td>
            </tr>
            <tr>
              <th>عنوان </th>
              <td>{{customer.address}}</td>
            </tr>
            <tr>
              <th>رقم بطاقة </th>
              <td>{{customer.nat_id}}</td>
            </tr>
        </table>

        <table class="table table-bordered mt-1 pr-hideme" v-if="shader_configs['F_SHOW_NET_RAHN']">
          <tr>
            <th class="text-danger">صافي الرهونات</th>
            <th>{{net_rahn}}</th>
          </tr>
        </table>

  <button @click="flags.show_cust_det = true" 
  v-if="! flags.show_cust_det"
  class="btn btn-success m-1 d-print-none">
    <span class="fa fa-table"></span> &nbsp; 
    عرض التليفون والعنوان ورقم البطاقة
  </button> 

  <button @click="showOutModal()" class="btn btn-primary m-1 d-print-none">
    <span class="fa fa-table"></span> &nbsp; 
    عرض {{'kashf_cust' | tr_label}} اليوم
  </button>

  <button v-b-toggle.collapse_collect class="btn btn-success m-1 d-print-none">
    <span class="fa fa-credit-card"></span> &nbsp; 
    حركة نقدية : تحصيل / امانة 
  </button> 


  <div>
    <h3>عرض الحركات من يوم</h3>
        <datetime 
    v-model="show_trans_after" 
    :auto="true" 
    class="datetime" 
    min-datetime="2019-01-01"
    max-datetime="2030-01-01">
    </datetime>
  </div>


  <!-- Element to collapse -->
  <b-collapse id="collapse_collect" class="d-print-none p-1">
    <div class="entry-form">
    <form  @submit="createCustomerTrans" class="m-2">
      <!-- todo get dynamic 
      <b-form-group label="نوع الحركة">
        <b-form-radio-group  v-model="customer_trans_form.trans_type">
          <b-form-radio value="cust_collecting">تحصيل</b-form-radio>
          <b-form-radio value="cust_advance_pay">سلفة</b-form-radio>
          <b-form-radio value="cust_acc_rest">باقي حساب</b-form-radio>
          <b-form-radio value="cust_discount">خصم للتاجر</b-form-radio>
          |
          <b-form-radio value="cust_trust">امانة</b-form-radio>
          <b-form-radio value="repay_cust_trust">رد امانة</b-form-radio>
          |
          <b-form-radio value="rhn">رهن</b-form-radio>
          <b-form-radio value="p_rhn">رد رهن</b-form-radio>
        </b-form-radio-group>
      </b-form-group>
      -->

      <AlertDay />

      <div class="form-group row">
        <label  class="col-sm-2"> نوع الحركة </label>
        <div class="col-sm-10">
          <select v-model="customer_trans_form.trans_type" class="form-control"  >
            <option 
            :class="{ 'text-danger': trans_type.sum == '+' }"
            v-for="(trans_type, idx) in trans_types_opts" :key='idx' :value="trans_type.name">
              {{trans_type.ar_name}}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group row">
        <label  class="col-sm-2">المبلغ</label>
        <div class="col-sm-10">
          <input v-model="customer_trans_form.amount" class="form-control "  placeholder="ادخل المبلغ ">
        </div>
      </div>

      <div class="form-group row">
        <label  class="col-sm-2">ملاحظات</label>
        <div class="col-sm-10">
          <input v-model="customer_trans_form.notes" class="form-control " placeholder="ادخال الملاحظات">
        </div>
      </div>

      <button  v-if="customer_trans_form.trans_type" type="submit" class="btn btn-success" :disabled="! valid_form">
        اضافة
      </button>
    </form>
    </div>
  </b-collapse>
      
      <div class=" row d-print-none p-1 "  v-if="customer.is_self">
        <h3 class="text-center"> الزرع المتبقي في حساب المحل </h3>
        <br>
        <button v-for="(item, idx) in self_rest_products" :key="idx" 
        v-b-toggle.collapse_sell  @click="sell_rest = item"
        class="btn btn-lg btn-primary m-1 btn-block">
          <span class="fa fa-shopping-cart"></span> &nbsp; 
          {{products_arr[item.product_id]}}  - 
          عدد ({{item.count}}) <br/> السعر التقديري {{item.amount}}
        </button>
      </div>
        <b-collapse id="collapse_sell" class="d-print-none p-1">
          <div class="entry-form">
          <form  @submit="sellRest" class="m-2">
            <div class="form-group row">
              <label  class="col-sm-2">السعر الفعلي</label>
              <div class="col-sm-10">
                <input v-model="sell_rest.actual_sale" class="form-control "  placeholder="ادخل مبلغ البيع">
              </div>
            </div>
            <div class="form-group row">
              <label  class="col-sm-2">ملاحظات</label>
              <div class="col-sm-10">
                <input v-model="sell_rest.notes" class="form-control " placeholder="ادخال الملاحظات">
              </div>
            </div>
            <button type="submit" class="btn btn-success" :disabled="! sell_rest.amount">تحصيل</button>
          </form>
          </div>
        </b-collapse>
      </div>

      <div class="table-responsive col-8 " v-if="flags.modal_closed">

        <h1 class="pr-only">كشف مديونية  {{customer.name}}</h1>

        <table class="table table-striped ">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>سابق</th>
              <th>مبلغ</th>     
              <th>الحركة</th>              
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(trans, idx) in comp_customer_trans" >
            <tr :key='idx' 
            v-if="
            trans.amount && 
            trans.trans_type != 'coll_anti_rahn' &&
            trans.trans_type != 'repay_rahn_auto' &&
            trans.trans_type != 'add_rahn_auto' &&
            trans.trans_type != 'cust_add_rahn' &&
            ! show_trans_after || 
            Date.parse(trans.day) >= Date.parse(show_trans_after)
            ">
              <td>{{trans.day | arDate }}</td>
              <td class="text-primary">{{trans.c_debt_was | round | toAR}}</td>
              <td>{{trans.amount | round | toAR}}</td>
              <td>
                {{trans.trans_type | tr_label('trans_types')}}
                <span v-if="trans.notes">- {{trans.notes}} </span> 
              </td>              
              <td>
                <button  
                :disabled="day.stricted || closed_days[trans.day]"
                v-if="trans.id"
                class="btn text-danger pr-hideme" @click="removeTrans(trans)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[trans.id]"> حذف </template>
                  <template v-if="confirm_step[trans.id]"> تأكيد </template>
                </button>

                <button  v-if="trans.trans_type === 'sum_outgoing'"
                class="btn text-primary pr-hideme" @click="showOutModal(trans.day)" >
                  <span class="fa fa-table "></span> 
                  عرض الكشف
                </button>
              </td>
            </tr>
            </template>
            <tr>
              <td></td>
              <td>رصيد المديونية الحالي</td>
              <td></td>
              <td>
                <b>{{sum_debt_cmpt | round | toAR}}</b>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-printo pr-hideme m-1" 
        @click="print_co()">
          <span class="fa fa-print"></span> طباعة كشف المديونية
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
    <h2 class="text-center" v-if="daily_out_trans[0] && app_config.shader_name == 'magdy'"> حساب سابق : {{ daily_out_trans[0].debt_was | toAR }}</h2>
  </div>
</div>

<img v-if="! kashf_header.includes('.png')"
:src='`https://i.imgur.com/HieletO.png`' style="margin-top: -375px;float: right;margin-right: 30px;" width="150" class="pr-only" />
<img v-if="! kashf_header.includes('.png')"
:src='`https://i.imgur.com/HieletO.png`'  style="margin-top: -375px;float: left;margin-left: 30px;" width="150" class="pr-only"/>

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
          </tr>
          <tr :class="{'pr-hideme': !d_collect_form.amount }" 
          v-if="app_config.shader_name != 'nada' ">
            <td ><input 
              v-if="! d_collect_form.id && outg_day == day.iso && ! day.stricted && ! closed_days[outg_day]" 
              v-model="d_collect_form.amount" class="form-control" placeholder="ادخل مبلغ التحصيل" >
              <span v-if="d_collect_form.id">({{d_collect_form.amount | toAR}})</span>
              </td>
            <td style="border: none !important;"> {{'collect' | tr_label}} </td>
            <td style="border: none !important;">
                <button  v-if="d_collect_form.id && ! day.stricted && ! closed_days[outg_day]"
                class="btn text-danger pr-hideme" @click="removeTrans(d_collect_form,true)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[d_collect_form.id]"> حذف </template>
                  <template v-if="confirm_step[d_collect_form.id]"> تأكيد </template>
                </button>
            </td>
          </tr>

          <tr :class="{'pr-hideme': !msh_collect_form.amount }" 
          v-if="app_config.shader_name != 'nada' ">
            <td ><input 
              v-if="! msh_collect_form.id && outg_day == day.iso && ! day.stricted && ! closed_days[outg_day]" 
              v-model="msh_collect_form.amount" class="form-control" placeholder="ادخل مبلغ المشال" >
              <span v-if="msh_collect_form.id">{{msh_collect_form.amount | toAR}}</span>
              </td>
            <td style="border: none !important;"> {{'mashal' | tr_label}} </td>
            <td style="border: none !important;">
                <button  v-if="msh_collect_form.id && ! day.stricted && ! closed_days[outg_day]"
                class="btn text-danger pr-hideme" @click="removeTrans(msh_collect_form,true)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[msh_collect_form.id]"> حذف </template>
                  <template v-if="confirm_step[msh_collect_form.id]"> تأكيد </template>
                </button>
            </td>
          </tr>

          <tr v-if="shader_configs['F_AARBON_KASHF']"
          :class="{'pr-hideme': !aarbon_form.amount }">
            <td ><input v-if="! aarbon_form.id && outg_day == day.iso && ! day.stricted && ! closed_days[outg_day]" 
              v-model="aarbon_form.amount" class="form-control" placeholder="ادخل مبلغ العربون" >
              <span v-if="aarbon_form.id">({{aarbon_form.amount | toAR}})</span>
              </td>
            <td style="border: none !important;"> 
            عربون
            </td>

            <td style="border: none !important;">
                <button  v-if="aarbon_form.id && ! day.stricted && ! closed_days[outg_day]"
                class="btn text-danger pr-hideme" @click="removeTrans(aarbon_form,true)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[aarbon_form.id]"> حذف </template>
                  <template v-if="confirm_step[aarbon_form.id]"> تأكيد </template>
                </button>
            </td>
          </tr>

          <tr v-if="shader_configs['F_REPAY_RAHN_KASHF']"
          :class="{'pr-hideme': !d_down_rahn_form.amount }">
            <td ><input v-if="! d_down_rahn_form.id && outg_day == day.iso && ! day.stricted && ! closed_days[outg_day]" 
              v-model="d_down_rahn_form.amount" class="form-control" placeholder="ادخل مبلغ رد الرهن" >
              <span v-if="d_down_rahn_form.id">({{d_down_rahn_form.amount | toAR}})</span>
              </td>
            <td style="border: none !important;"> 
            رد رهن
            </td>

            <td style="border: none !important;">
                <button  v-if="d_down_rahn_form.id && ! day.stricted && ! closed_days[outg_day]"
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
                <span>
                  {{ sum_outgoings_val | ceil5(app_config.shader_name) | toAR }}
                </span>
              </b>
            </td>
            <td style="border: none !important;"> اجمالي </td>
          </tr>
        </tbody>
      </table>

      <div class="col-6" v-if="shader_configs['F_SHOW_DEBT_KASHF']">
        <hr/>
        <h3 class="text-center" v-if="daily_out_trans[0]"> {{'total_debt' | tr_label}} : {{sum_debt_cmpt | ceil5(app_config.shader_name) | toAR}}</h3>
      </div>

      <span></span>
      <div class="m-2">
        <button class="btn btn-success pr-hideme" @click="modalSave" >
          <span class="fa fa-check "></span> &nbsp;
          حفظ
        </button>

        &nbsp;
        <button class="btn btn-printo pr-hideme" 
          @click="print_co();print_done(outg_day)">
          <span class="fa fa-print"></span> طباعة
        </button>
        &nbsp;
        <button class="btn btn-danger pr-hideme" @click="$bvModal.hide('modal-daily');d_collect_form= {};msh_collect_form= {}" >
          <span class="fa fa-close "></span> &nbsp;
          اغلاق
        </button>
      </div>
  </div>
</b-modal>
  </section>
</template>

<script >
import { CustomersCtrl, CustomerTransDAO } from '../ctrls/CustomersCtrl'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl'
import { CashflowDAO, CashflowCtrl } from '../ctrls/CashflowCtrl'
import { MainMixin } from '../mixins/MainMixin';
import { knex } from '../main';
import AlertDay from '@/components/AlertDay.vue'
// import image from '../assets/vegetables.png'

export default {
  name: 'customer-details',
  data () {
    return {
      customer: {},
      customersCtrl: new CustomersCtrl(),
      transTypesCtrl: new TransTypesCtrl(),
      customer_trans_form: {id:null , trans_type:'cust_collecting', amount: null , notes: null},
      d_collect_form: {id:null , trans_type:'cust_in_collecting', amount: null , notes: null},
      msh_collect_form: {id:null , trans_type:'mashal', amount: null , notes: null},
      d_down_rahn_form: {id:null , trans_type:'repay_rahn_internal', amount: null , notes: null},
      aarbon_form: {id:null , trans_type:'aarbon', amount: null , notes: null},
      trans_types_opts : [],
      customer_trans: [],
      daily_out_trans: [],
      self_rest_products: [],
      customer_id: this.$route.params.id,
      transtypes_labels: this.$store.state.transtypes_arr,
      confirm_step: [],
      flags: {modal_closed: true, show_cust_det: false },
      discard_success: false,
      sell_rest: {actual_sale: 0 , notes: ''},
      outg_day: {},
      show_trans_after: '',
      net_rahn: 0,
      kashf_header:''
    }
  },
  mixins: [MainMixin],
  methods: {
    async getCustomerDetails() {
      //let {dao, trans} = await this.customersCtrl.getCustomerDetails(this.customer_id)
      // TODO get trans dynamicly
      this.customer = await this.customersCtrl.findOne(this.customer_id)
      this.customer_trans = await this.customersCtrl.getCustomerTrans({id: this.customer_id})
      console.log(this.customer_trans);
      this.net_rahn = await this.customersCtrl.getCustomerNetRahn({id: this.customer_id})
      console.log(this.net_rahn)
      this.trans_types_opts = await this.transTypesCtrl.findAll({category: 'customer_trans', flags: 'CUST_FORM' })
      if(this.customer.is_self ) {
        this.self_rest_products = await this.customersCtrl.getRestInSelf(this.customer_id)
      }
    },
    async showOutModal(day = null){
      this.d_collect_form = {trans_type: "cust_collecting"}
      this.d_down_rahn_form = {trans_type: "repay_rahn_internal"}
      this.msh_collect_form = {trans_type: "mashal"}
      this.aarbon_form = {trans_type: "aarbon"}

      this.outg_day = day ? day : this.day.iso
      this.daily_out_trans = await this.customersCtrl.getDailyOutTrans({id: this.customer_id, day: this.outg_day})
      // TODO show incollect_trans amount
      let filtered_incollect = this.daily_out_trans.filter(item => item.trans_type === 'cust_in_collecting')
      if(filtered_incollect.length > 0){
        this.d_collect_form.amount = Math.abs(filtered_incollect[0].amount)
        this.d_collect_form.id = filtered_incollect[0].id
      }
      let filtered_mashal = this.daily_out_trans.filter(item => item.trans_type === 'mashal')
      if(filtered_mashal.length > 0){
        this.msh_collect_form.amount = Math.abs(filtered_mashal[0].amount)
        this.msh_collect_form.id = filtered_mashal[0].id
      }

      let fltr_rahn_in = this.daily_out_trans.filter(item => item.trans_type === 'repay_rahn_internal')
      console.log('fltr_rahn_in', fltr_rahn_in)
      if(fltr_rahn_in.length > 0){
        this.d_down_rahn_form.amount = Math.abs(fltr_rahn_in[0].amount)
        this.d_down_rahn_form.id = fltr_rahn_in[0].id
      }

      let fltr_aarbon = this.daily_out_trans.filter(item => item.trans_type === 'aarbon')
      if(fltr_aarbon.length > 0){
        this.aarbon_form.amount = Math.abs(fltr_aarbon[0].amount)
        this.aarbon_form.id = fltr_aarbon[0].id
      }
      this.$bvModal.show('modal-daily')
    },
    async modalSave(evt){
      if(! this.d_collect_form.id && this.d_collect_form.amount ) {
        // await this.customersCtrl.removeCustomerTrans(this.customer_trans_form)
        this.d_collect_form.trans_type = 'cust_in_collecting'
        await this.createCustomerTrans(evt, this.d_collect_form)
      }

      if(! this.msh_collect_form.id && this.msh_collect_form.amount) {
        this.msh_collect_form.trans_type = 'mashal'
        await this.createCustomerTrans(evt, this.msh_collect_form)
      }

      if(! this.aarbon_form.id && this.aarbon_form.amount) {
        this.aarbon_form.trans_type = 'aarbon'
        await this.createCustomerTrans(evt, this.aarbon_form)
      }

      if(! this.d_down_rahn_form.id && this.d_down_rahn_form.amount) {
        this.d_down_rahn_form.trans_type = 'repay_rahn_internal'
        await this.createCustomerTrans(evt, this.d_down_rahn_form)
      }
      await this.showOutModal(this.outg_day)
    },
    async removeTrans(trans, in_kashf = false) {
      if( this.confirm_step[trans.id] ) {
        let init_time = new Date().getTime()
        this.discard_success = await this.customersCtrl.removeCustomerTrans(trans)
        console.log('⌚ Time to removeCustomerTrans in ms = ' , new Date().getTime() - init_time)
        this.confirm_step = []
        this.getCustomerDetails()
        if(in_kashf) {
          this.d_collect_form = {}
          this.d_down_rahn_form = {}
          this.aarbon_form = {}
          this.msh_collect_form = {}
          this.showOutModal(this.outg_day)
        }
      }
      else {
        this.confirm_step = []
        this.confirm_step[trans.id] = true
      }
    },
    async print_done(outg_day){
      await knex.raw(`insert into customers_daily (customer_id, day, printed) values( ${this.customer_id} , '${outg_day}', 1)`)
    },
    async sellRest(evt) {
      evt.preventDefault()
      let cashflowDAO = new CashflowDAO({
        day: this.day.iso,
        amount: parseFloat(this.sell_rest.actual_sale),
        customer_id: this.customer_id,
        state: 'cust_collecting',
        sum: '+',
        notes: this.sell_rest.notes
      })
      let cashflow_id = await new CashflowCtrl().save(cashflowDAO)

      /*
      await this.customersCtrl.save(new CustomerDAO({id: this.customer_id, 
        debt: parseFloat(this.customer.debt) - cashflowDAO.amount }))
        */

      await this.customersCtrl.updateDebtBySelfTrans(new CustomerTransDAO({
        id: this.sell_rest.id,
        actual_sale: this.sell_rest.actual_sale,
        cashflow_id: cashflow_id
      }))
      await this.getCustomerDetails()
      this.$root.$emit('bv::toggle::collapse', 'collapse_sell')
    },
    async createCustomerTrans(evt , trans_form = null ) {
      evt.preventDefault()
      console.log(trans_form)
      if(! trans_form)
        trans_form = this.customer_trans_form
      let selectedTrans = await this.transTypesCtrl.findOne({name: trans_form.trans_type , category: 'customer_trans'})
      // create customer trans
      if(selectedTrans) {
        let cashflow_id = null
        if(selectedTrans.map_cashflow){
          // Create cashflow with trans
          let cashflowTrans = await this.transTypesCtrl.findOne({name: selectedTrans.map_cashflow , category: 'cashflow'})
          
          let newCashflow = new CashflowDAO({
            amount: trans_form.amount,
            day: this.$store.state.day.iso,
            customer_id: this.customer_id,
          })

          newCashflow.transType = cashflowTrans
          let cashflowCtrl = new CashflowCtrl()
          cashflow_id = await cashflowCtrl.save(newCashflow)
        }

        let custtransDAO = new CustomerTransDAO(trans_form)
        custtransDAO.day = this.$store.state.day.iso
        custtransDAO.customer_id = this.customer_id
        custtransDAO.cashflow_id = cashflow_id
        custtransDAO.transType = selectedTrans
        await this.customersCtrl.updateDebtByTrans(custtransDAO)

        if(selectedTrans.map_customer_trans){
          console.log(selectedTrans)
          // get selected customer trans
          let selectedCustTrans = await this.transTypesCtrl.findOne({name: selectedTrans.map_customer_trans , category: 'customer_trans'})
          let custtransDAO = new CustomerTransDAO(trans_form)
          custtransDAO.day = this.$store.state.day.iso
          custtransDAO.customer_id = this.customer_id
          custtransDAO.cashflow_id = cashflow_id
          custtransDAO.transType = selectedCustTrans
          await this.customersCtrl.updateDebtByTrans(custtransDAO)
        }

      }
      
      this.getCustomerDetails()
      trans_form = {trans_type:trans_form.trans_type, amount: null , notes: null}
      this.$root.$emit('bv::toggle::collapse', 'collapse_collect')
    }
  },
  components: { AlertDay },
  mounted() {
    this.kashf_header = this.shader_configs['kashf_header'] ? this.shader_configs['kashf_header'] : this.shader_configs['recp_header']
    this.getCustomerDetails()
    this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
      if(modalId == 'modal-daily') this.flags.modal_closed = false
    })
    this.$root.$on('bv::modal::hide', (bvEvent, modalId) => {
      if(modalId == 'modal-daily') this.flags.modal_closed = true
    })
  },
  computed: {
    valid_form: function() {
      if(this.customer_trans_form.amount && parseFloat(this.customer_trans_form.amount) && this.customer_trans_form.trans_type){
        return true
      }
    },
    comp_customer_trans: function() {
      let new_customer_trans = []
      let prev = 0
      this.customer_trans.forEach ( trans => {
        trans.c_debt_was = prev
        prev = prev + trans.amount
        new_customer_trans.push(trans)
      })
      return new_customer_trans
    },
    sum_debt_cmpt: function() {
      let sum_debt = 0
      this.customer_trans.forEach( trans => {
        sum_debt += parseFloat(trans.amount)
      })
      return sum_debt
    },
    sum_outgoings_val: function() {
      let sum = 0
      this.daily_out_trans.forEach(item => {
        console.log(item)
        sum += parseFloat(item.amount)
      })
      return sum
    }
  }
}
</script>

