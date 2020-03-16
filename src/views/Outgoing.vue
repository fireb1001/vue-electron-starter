<template>
  <div class="out row ">
    <div class="col-5 bg-outgoing minh90 d-print-none" v-if="flags.detailed === false">
    <br/>
    <!--
    <img alt="Vue logo" src="../assets/logo.png"> 
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    
<ul class="nav nav-tabs">
  <li class="nav-item">
    <router-link class="nav-link" to="/">وارد اليوم</router-link>
  </li>
  <li class="nav-item">
    <a class="nav-link active" href="#">صادر اليوم</a>
  </li>
  <li class="nav-item">
    <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
  </li>

</ul>
-->

<div class="p-2" v-show="! selected_inc || ! selected_inc.product_id">

  <div class="pr-hideme">
    <h3 class="text-danger fa fa-eraser larger"
    @click="search_term_incomings = ''" v-if="search_term_incomings"></h3>
    <input v-model="search_term_incomings" class="form-control" :placeholder="custom_labels['search_incomings']">
    <br>
  </div>

<div v-for="(incom, idx) in fltrd_avilable_incomings" :key="idx" class="row m-1">
  <button  v-b-toggle.collapse2 
  :disabled="day.stricted"
  @click="setSelectedInc(incom)"
  class="btn btn-lg btn-block col-10" 
  :class="{'btn-primary': incom.day === day.iso, 'btn-danger': incom.day !== day.iso}">
    <span class="fa fa-shopping-cart"></span> &nbsp; 
    {{incom.product_name}} - 
    زرع <b> {{incom.supplier_name}} </b> 
    <br/>
    متبقي ({{incom.diff}}) 
    <span v-if="incom.day !== day.iso"> -
  وارد {{incom.day | arDate }}
    </span>
  </button>

  <button 
    v-if="! day.stricted"
   class="btn text-danger col-2" @click="removeRestIncom(incom, idx)" >
    <span class="fa fa-caret-square-down "></span> 
    <template v-if="! confirm_step_rest[idx]">  </template>
    <template v-if="confirm_step_rest[idx]"> تأكيد </template>
  </button>
</div>

</div>


<div class="p-4" v-if="selected_inc && selected_inc.product_id">


  <h4 :class="{ 'text-danger':  outgoing_form.count > selected_inc.diff}">
    بيع {{outgoing_form.count}} من
      {{selected_inc.product_name}} - 
  زرع <b> {{selected_inc.supplier_name}} </b> - 
  متبقي ({{selected_inc.diff}}) 

  </h4>
    <form  @submit="saveOutgoing">
  <div class="form-group row">
    <label class="col-sm-3">التاريخ</label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.day" class="form-control" disabled>
    </div>
  </div>

  <div class="form-group row">
    <label :class="{ 'text-danger':  outgoing_form.count > selected_inc.diff}" class="col-sm-3">عدد</label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.count" class="form-control">
    </div>
  </div>

  <div class="form-group row">
    <label :class="{ 'text-danger':  outgoing_form.sell_comm > 10 }" class="col-sm-3">
      قيمة البياعة
    </label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.sell_comm" class="form-control" placeholder="ادخل القيمة">
    </div>
  </div>
  <!-- no need it will be added automaticly -->
  <div class="form-group row" v-if="false && outgoing_form.product_rahn" >
    <label :class="{ 'text-danger':  outgoing_form.product_rahn > 50 }" class="col-sm-3">
     رهن الطرد
    </label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.product_rahn" class="form-control" placeholder="ادخل القيمة">
    </div>
  </div>

  <div class="form-group row" v-if=" outgoing_form.weight_deduct" >
    <label class="col-sm-3">
    الوزن قايم
    </label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.total_weight" class="form-control" placeholder="ادخل القيمة">
    </div>
  </div>

  <div class="form-group row">
    <label class="col-sm-3">صافي الوزن</label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.weight" class="form-control" placeholder="ادخل الوزن">
    </div>
  </div>

  <div class="form-group row">
    <label :class="{ 'text-danger':  outgoing_form.kg_price > 50 }" class="col-sm-3">سعر الكيلو</label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.kg_price" class="form-control" placeholder="ادخل القيمة">
    </div>
    <div class="text-danger" v-if="outgoing_form.kg_price > 50">
      سعر الكيلو اكبر من 50 جنيه
    </div>
  </div>

<hr/>

  <div class="form-group row">
    <label  class="col-sm-3">الاجمالي</label>
    <div class="col-sm-9" >
      <button class="btn btn-success" type="button" v-if="false && ! outgoing_form.value_calc && valid_form " @click="outgoing_form.value_calc=true"> حساب الاجمالي </button>
      <div v-if="value_calc && valid_form">
        <span style="float: right"> {{value_calc_text}} &nbsp; = </span>
        <b style="float: right"> {{value_calc | round2 }} </b> &nbsp; جنيه
      </div>
    </div>
  </div>


  <div class="form-group row">
    <label for="notes1" class="col-sm-3">اسم البياع</label>
    <div class="col-sm-9">
      <!--
      <select v-model="outgoing_form.customer_id" class="form-control"  >
        <option value="">كاش</option>
      <option v-for="(customer, idx) in active_customers" :key='idx' :value="customer.id">
        {{customer.name}}
      </option>
    </select>
    -->
    <v-select class="vselect-styler"  dir="rtl"
    ref='customerSelect'
    @search='new_customer'
    :options="active_customers" label="name" 
    :reduce="customer => customer.id"
    v-model="outgoing_form.customer_id"
    :key="outgoing_form.customer_id">
      <div slot="no-options">لا يوجد نتائج بحث <span class="text-primary" @click="new_customer('new')">انشاء جديد</span></div>
    </v-select>
    </div>
  </div>

  <div v-if="app_config.shader_name == 'mmn1'">
    <button 
    v-if="! show_insert_form"
    @click="show_insert_form = true"
    type="button" class="btn btn-primary" >ادخال بائع</button> 
    <div v-if="show_insert_form">
      <form @submit="insertCustomer">
        <input v-model="insert_customer_name" class="form-control"  >
        <button type="submit" class="btn btn-success" > ادخال </button>
      </form>
    </div>
  </div>

  <div class="form-group row" v-if="false && outgoing_form.customer_id">
    <label  class="col-sm-3">تحصيل جزء</label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.collecting" class="form-control" placeholder="ادخل قيمة التحصيل">
    </div>
  </div>
  
  <div class="form-group row">
    <label for="notes1" class="col-sm-3">
      {{'outgoing_notes' | tr_label}}
    </label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.notes" class="form-control" id="notes1"  >
    </div>
  </div>
  
  <div class="form-group row" v-if="shader_configs['F_AARBON_OUT']">
    <label for="aarbon" class="col-sm-3">
      {{'aarbon' | tr_label}}
    </label>
    <div class="col-sm-9">
      <input v-model="outgoing_form.aarbon" class="form-control" id="aarbon"  >
    </div>
  </div>

  <!-- Prevent implicit submission of the form to solve delay issu-->
  <button type="submit" disabled style="display: none" aria-hidden="true"></button>
  
  <button type="submit" class="btn btn-success" :disabled="! valid_form || submited">اضافة</button> 
  &nbsp;&nbsp;
  <button class="btn btn-danger" type="button" @click="refresh_all"> الغاء </button>
</form>

</div>

</div>
<!-- conditional class col-6 -->
<div class="p-3 col-print-12 pr-me" :class="{ 'col-7': ! flags.detailed , 'col-12':  flags.detailed }">

    <div class="pr-hideme">
      <h3 class="text-danger fa fa-eraser larger"
      @click="search_term = ''" v-if="search_term"></h3>
      <input v-model="search_term" class="form-control" :placeholder="custom_labels['search_outgoings']">
    </div>

  <div class="m-3  ">
  <h2>بيع اليوم {{day.arab}}</h2>
      <div class="table-responsive">
        <table class="table table-striped table-sm pr-me">
          <thead>
            <tr>
              <th>#</th>

              <th>زرع العميل</th>
              <th>عدد</th>
              <th>الصنف</th>
              <th v-if="flags.detailed ">وارد يوم</th>
              <th>اسم البياع</th>
              
              <th v-if="flags.detailed ">بياعة </th>
              
              <th >الوزن</th>
              <th>السعر</th>
              <th>المبلغ</th>
              <th v-if="flags.detailed ">ملاحظات</th>
              <th v-if="flags.detailed "></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in fltrd_outgoings_arr" :key='idx'>
              <td>{{item.id}}</td>
              <td>
                <router-link  :to="{name:'supplier_details', params: {id: item.supplier_id}}">
                  {{item.supplier_name}}
                </router-link>
              </td>
              <td>{{item.count }}</td>
              <td>{{item.product_name}}</td>
              <td v-if="flags.detailed ">{{item.income_day | arDate}}</td>
              <td>
                <router-link v-if="item.customer_id" :to="{name:'customer_details', params: {id: item.customer_id}}" >
                  {{item.customer_name}}
                </router-link>
              </td>

              <td v-if="flags.detailed ">{{item.sell_comm * item.count}}</td>
              
              <td>{{item.weight}}</td>
              <td>{{item.kg_price}}</td>
              <th>{{item.value_calc | round2 }}</th>
              <td v-if="flags.detailed ">{{item.notes}}</td>
              <td v-if="flags.detailed && ! day.stricted" class="d-print-none">
                <button class="btn text-danger" @click="discard(item.id)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[item.id]"> حذف </template>
                  <template v-if="confirm_step[item.id]"> تأكيد </template>
                </button>
                <button class="btn text-danger" @click="out_redirect(item)" >
                  <span class="fa fa-directions "></span> 
                  <template v-if="! confirm_step[item.id]"> تحويل </template>
                  <template v-if="confirm_step[item.id]">  تأكيد </template>
                </button>
              </td>
            </tr>
            <tr v-if="! search_term">
              <td></td>
              <th>المجموع</th>              
              <th>{{out_sums.total_count}}</th>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-primary pr-hideme" v-if="flags.detailed === false" @click="flags.detailed = true"> عرض التفاصيل </button>
        
        <button class="btn btn-printo pr-hideme" v-if="flags.detailed !== false" 
        @click="clipboard.writeText('بيع اليوم '+day.iso);print_co()">
          <span class="fa fa-print"></span> طباعة
        </button>
        &nbsp;
        <button class="btn btn-primary pr-hideme" v-if="flags.detailed !== false" @click="flags.detailed= false"> العودة للبيع </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { InoutHeadCtrl } from '../ctrls/InoutHeadCtrl'
import { OutgoingDAO, OutgoingsCtrl } from '../ctrls/OutgoingsCtrl'
import { CustomersCtrl, CustomerDAO, CustomerTransDAO } from '../ctrls/CustomersCtrl';
import { CashflowDAO, CashflowCtrl } from '../ctrls/CashflowCtrl';
import { MainMixin } from '../mixins/MainMixin';
import { IncomingsCtrl } from '../ctrls/IncomingsCtrl';
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl';

export default {
  name: 'outgoings',

  data() {
    return {
      outgoings_arr: [],
      active_customers: [],
      inoutHeadCtrl: new InoutHeadCtrl(),
      outgoingsCtrl: new OutgoingsCtrl(),
      customersCtrl: new CustomersCtrl(),
      customer_search: '',
      avilable_incomings: [],
      selected_inc: {},
      submited: false,
      outgoing_form: new OutgoingDAO({ day: this.$store.state.day.iso, ...OutgoingDAO.INIT_DAO}),
      flags:{detailed: false},
      confirm_step: [],
      confirm_step_rest: [],
      discard_success: false,
      show_insert_form: false,
      insert_customer_name: '',
      search_term_incomings: ''
    }
  },
  components: {
     
  },
  mixins: [MainMixin],
  methods: {
    async insertCustomer(evt){
      evt.preventDefault()
      console.log(this.insert_customer_name)
      let new_customer_id = await new CustomersCtrl().save(new CustomerDAO({name: this.insert_customer_name }))
      this.active_customers = await this.customersCtrl.findAll({},{softDelete: true})
      this.outgoing_form.customer_id = new_customer_id
      this.insert_customer_name = ''
      this.show_insert_form = false
    },
    async saveOutgoing(evt){
      this.submited = true
      evt.preventDefault()
      this.outgoing_form.value_calc = this.value_calc
      this.outgoing_form.income_day = this.selected_inc.day
      this.outgoing_form.supplier_id = this.selected_inc.supplier_id
      this.outgoing_form.product_id = this.selected_inc.product_id
      this.outgoing_form.sell_comm_value = this.outgoing_form.count * this.outgoing_form.sell_comm
      let aarbon = 0
      if(this.outgoing_form.aarbon){
        aarbon = parseFloat(this.outgoing_form.aarbon)
        delete this.outgoing_form.aarbon
      }
      let outg_id = await this.outgoingsCtrl.saveOutgoingData(this.outgoing_form)
      if(aarbon) {
        let selectedTrans = await new TransTypesCtrl().findOne({
          name: 'aarbon',
          category: "customer_trans"
        });
        // create customer trans
        if (selectedTrans) {
          let cashflow_id = null;
          if (selectedTrans.map_cashflow) {
            // Create cashflow with trans
            let cashflowTrans = await new TransTypesCtrl().findOne({
              name: selectedTrans.map_cashflow,
              category: "cashflow"
            });

            let newCashflow = new CashflowDAO({
              amount: aarbon,
              day: this.$store.state.day.iso,
              customer_id: this.outgoing_form.customer_id
            });

            newCashflow.transType = cashflowTrans;
            newCashflow.outgoing_id = outg_id
            cashflow_id = await new CashflowCtrl().save(newCashflow);
          }

          let custtransDAO = new CustomerTransDAO({
            amount: aarbon
          });
          custtransDAO.day = this.$store.state.day.iso;
          custtransDAO.customer_id = this.outgoing_form.customer_id;
          custtransDAO.cashflow_id = cashflow_id;
          custtransDAO.outgoing_id = outg_id;
          custtransDAO.transType = selectedTrans;
          await this.customersCtrl.updateDebtByTrans(custtransDAO);
        }
      }

      // console.log(this.outgoing_form)
      this.refresh_all()
    },
    async discard(id) {
      if( this.confirm_step[id] ) {
        this.discard_success = await this.outgoingsCtrl.deleteById(id)
        this.confirm_step = []
        this.refresh_all()
      }
      else {
        this.confirm_step = []
        this.confirm_step[id] = true
      }
    },
    async removeRestIncom(incom, idx) {

      if( this.confirm_step_rest[idx] ) {
        await new IncomingsCtrl().removeRestInc(incom)
        this.confirm_step_rest = []
        this.refresh_all()
      }
      else {
        this.confirm_step_rest = []
        this.confirm_step_rest[idx] = true
      }
    },
    async out_redirect(item) {
      if( this.confirm_step[item.id] ) {
        await this.outgoingsCtrl.deleteById(item.id)
        this.confirm_step = []
        await this.refresh_all()
        let selected_incoms = this.avilable_incomings.filter( incom => incom.day == item.income_day &&
          incom.supplier_id == item.supplier_id &&
          incom.product_id == item.product_id )
        this.flags.detailed = false
        this.$root.$emit('bv::toggle::collapse', 'collapse2')
        this.setSelectedInc(selected_incoms[0])
        this.outgoing_form.count = item.count
        this.outgoing_form.weight = item.weight
        this.outgoing_form.kg_price = item.kg_price
        this.outgoing_form.customer_id = item.customer_id
        console.log(item)
      }
      else {
        this.confirm_step = []
        this.confirm_step[item.id] = true
      }
    },
    async new_customer(search) {
      this.customer_search = (search && search != 'new') ? search : this.customer_search
      if(search == 'new') {
        console.log(this.customer_search)
        let new_customer_id = await new CustomersCtrl().save(new CustomerDAO({name: this.customer_search }))
        this.active_customers = await this.customersCtrl.findAll({},{softDelete: true})
        this.outgoing_form.customer_id = new_customer_id
      }
    },
    async setSelectedInc(incom){
      console.log(incom)
      this.selected_inc = incom
      // remove getLastKgPrice
      //this.outgoing_form.kg_price = await this.outgoingsCtrl.getLastKgPrice(incom.product_id)
      this.outgoing_form.sell_comm = incom.product_sell_comm
      this.outgoing_form.product_rahn = incom.product_rahn
      this.outgoing_form.weight_deduct = incom.weight_deduct
    },
    async refresh_all() {
      this.avilable_incomings = await this.inoutHeadCtrl.findAll({diff: '> 0', day: this.$store.state.day.iso})
      this.active_customers = await this.customersCtrl.findAll({},{softDelete: true})
      console.log(this.active_customers)
      this.outgoings_arr = await this.outgoingsCtrl.findAll({day: this.day.iso})
      this.outgoing_form = new OutgoingDAO({ day: this.$store.state.day.iso, ...OutgoingDAO.INIT_DAO})
      this.selected_inc = {}
      this.submited = false
    }
  },
  async mounted() {
    this.refresh_all()
  },
  computed: {
    fltrd_outgoings_arr: function(){
      return this.outgoings_arr.filter( item => {
        return (
          item.supplier_name.includes(this.search_term) 
          || item.product_name.includes(this.search_term)
          || (item.customer_name && item.customer_name.includes(this.search_term))
        )
      })
    },
    fltrd_avilable_incomings: function(){
      return this.avilable_incomings.filter( item => {
        return (item.supplier_name && item.supplier_name.includes(this.search_term_incomings) 
        || item.product_name.includes(this.search_term_incomings))
      })
    },
    value_calc_text: function () {
      if(this.outgoing_form.count && 
      this.outgoing_form.sell_comm &&
      this.outgoing_form.weight &&
      this.outgoing_form.kg_price)
      return `(${this.outgoing_form.count} * ${this.outgoing_form.sell_comm}) + (${this.outgoing_form.weight} * ${this.outgoing_form.kg_price})`
    },
    value_calc: function () {
      if(this.outgoing_form.count && 
      this.outgoing_form.sell_comm &&
      this.outgoing_form.weight &&
      this.outgoing_form.kg_price) {
        // this.outgoing_form.parseTypes()
        // only parse count
        // this.outgoing_form.count = parseInt(this.outgoing_form.count)
        let sell_comm_value = this.outgoing_form.count * this.outgoing_form.sell_comm
        let weight = this.outgoing_form.weight 
        let kg_price = this.outgoing_form.kg_price

        return sell_comm_value + ( weight * kg_price)
      }
      else return false
    },
    valid_form: function () {
      return this.outgoing_form.count > 0 && this.outgoing_form.count <= this.selected_inc.diff &&
      this.outgoing_form.sell_comm > 0 && this.outgoing_form.sell_comm <= 10 &&
      this.outgoing_form.weight > 0 &&
      this.outgoing_form.kg_price > 0
    },
    out_sums: function() {
      let out_sums = {total_count: 0}
      this.outgoings_arr.forEach( item => {
        out_sums.total_count += item.count
      })
      return out_sums
    }
  },
  watch:{
    'outgoing_form.total_weight': function(val){
      if(val){
        let total = parseFloat(val)
        this.outgoing_form.weight = total - ( parseFloat(this.outgoing_form.weight_deduct) * parseInt(this.outgoing_form.count))
      }
    }
  }
}
</script>
