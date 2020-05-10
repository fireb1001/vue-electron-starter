<template>
  <section class="customers row">

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
            <input type="password" v-model.lazy="password" class="form-control"/>
            <div class="text-center mt-4">
              <button class="btn btn-success" type="submit">عرض</button> 
              <span>&nbsp;</span>
              <button class="btn btn-danger" @click="$bvModal.hide('pass-in')">اغلاق</button> 
            </div>
          </form>
        </b-modal>

    <div class="col-5 d-print-none" v-if="! flags.detailed">
          <br/>
        <div class="row detailed" v-if="logged_in_user.user_type != 'editor'">
          <div class="col-6">
            <span class="btn text-primary h3">
            {{custom_labels['sum_customers_debt']}}
            </span>

            <span class="btn text-primary h3" 
            @click="show_dialog()">
              <span v-if="! flags.show_sum_debt" >+</span>
              <span v-else>-</span>
            </span>
          </div>
          <div class="col-6 btn text-primary" v-if="flags.show_sum_debt">
            <span class="h3">
            {{ sum_debt| round | toAR}}
            </span>
            <span class="fa fa-table"></span>
          </div>
        </div>
    <hr>
<button @click="fresh_form" class="btn btn-primary mr-3" v-if="flags.form_collabsed">
  {{custom_labels['add_new_customer']}}
  &nbsp; <span class="fa fa-address-book"></span>
</button>
  <!-- Element to collapse -->
  <b-collapse id="collapse_form" style="padding:25px;">
    <div class="entry-form">
    <form  @submit="saveCustomer">

    <b-toast id="example-toast" title="حدث خطأ" static auto-hide-delay=2000 class="text-danger">
      {{'تم ادخال بائع بنفس الاسم'}}
    </b-toast>

      <div class="form-group row">
        <label class="col-sm-2">اسم البائع</label>
        <div class="col-sm-10">
          <input v-model="customer_form.name" class="form-control " placeholder="ادخل اسم البائع">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2">تليفون</label>
        <div class="col-sm-10">
          <input v-model="customer_form.phone" class="form-control "  placeholder="التليفون">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2">عنوان</label>
        <div class="col-sm-10">
          <input v-model="customer_form.address" class="form-control "  placeholder="ادخال العنوان">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2">رقم بطاقة</label>
        <div class="col-sm-10">
          <input v-model="customer_form.nat_id" class="form-control "  placeholder="ادخال رقم البطاقة">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2">مبلغ المديونية</label>
        <div class="col-sm-10">
          <input v-model="customer_form.debt" :disabled="customer_form.id"
          class="form-control"  placeholder="ادخل المبلغ">
        </div>
      </div>

      <div class="form-group row">
        <label class="col-sm-2">ملاحظات</label>
        <div class="col-sm-10">
          <input v-model="customer_form.notes" class="form-control "  placeholder="ادخال الملاحظات">
        </div>
      </div>
      <p class="text-danger" v-if="! customer_form.id"> سيتم اضافة البياع بمبلغ مديونية يساوي 
        <template v-if="! customer_form.debt"> 0 </template>
        <template v-if="customer_form.debt"> {{customer_form.debt}} </template>
         جنيه</p>

      <button type="submit" class="btn btn-success" :disabled="! valid_form">
        <template v-if="! customer_form.id"> اضافة</template>
        <template v-if="customer_form.id"> حفظ </template>
      </button>
      &nbsp;
      <button type="button" @click="fresh_form" class="btn btn-danger"> الغاء </button>
    </form>
    </div>
  </b-collapse>
  </div>
  <div class=" col-print-12 pr-me p-2" :class="{ 'col-7': ! flags.detailed , 'col-10':  flags.detailed }">
    
    <div class="m-1 pr-hideme">
      <br/>
      <router-link  class="btn btn-primary " :to="{ path : 'customers', query: { refresh: true } }">
        <span class="fa fa-sync-alt"></span>&nbsp;
        تحديث الصفحة
      </router-link>
      <button  class="btn btn-danger mr-2" @click="flags.show_active=false;refresh_all()" v-if="flags.show_active">
      عرض الارشيف
      &nbsp; <span class="fa fa-archive"></span>
      </button>
      <button  class="btn btn-success mr-2" @click="flags.show_active=true;refresh_all()" v-if="! flags.show_active">
        اغلاق الارشيف   &nbsp; <span class="fa fa-external-link-square-alt"></span>
      </button>

      <button v-if="! flags.zm_mode" class="btn btn-primary mr-2" @click="zmMode()">
        <span class="fa fa-print"></span> كشف الزمامات
      </button>

      <button  class="btn btn-primary mr-2" @click="setSelected()" >
        اختيار للطباعة   &nbsp; <span class="fa fa-external-link-square-alt"></span>
      </button>

        <button class="btn btn-printo pr-hideme m-2"  @click="print_co">
          <span class="fa fa-print"></span> طباعة
        </button>

        <button class="btn btn-primary pr-hideme m-2" v-if="flags.detailed === false" @click="flags.detailed= true"> عرض التفاصيل </button>
    </div>
    <div class="pr-hideme" >
      <br>
      <input v-model="search_term" class="form-control "  :placeholder="custom_labels['search_customers']">
    </div>
    <div class="pr-hideme" v-if="false">
      <br>
      <input v-model.lazy="search_placeholder" class="form-control "  
      @keyup.enter="search_term = search_placeholder"
      @focus="sph_focus = true" @blur="sph_focus = false"
      :placeholder="custom_labels['search_customers']">
      <div v-if="sph_focus || search_placeholder" class="m-1">
        
        <button class="btn btn-primary" @click="vue_log(search_placeholder);search_term = search_placeholder">بحث</button> &nbsp;
        <button class="btn btn-danger" @click="search_term = search_placeholder =''">الغاء</button>
      </div>
    </div>
    <br/>
    <div class="pr-hideme" v-if="flags.show_g_than">
     سوف يتم فقط عرض البائعين بمديونية اكبر من {{flags.show_g_than}} جنيه
     <br/>
      <a href="#" @click="show_all_cust">عرض الجميع</a>
     <br/>
    </div>
  <h2 :class="{ 'text-danger': ! flags.show_active }">
    <span v-if="flags.show_active"> {{custom_labels['list']}} </span>
    <span v-if="! flags.show_active"> {{custom_labels['archive']}} </span>
    {{custom_labels['customers']}}
  </h2>
  <h3 v-if="flags.zm_mode">
    {{now_day}} - {{now_hour}}
  </h3>
      <div class="table-responsive m-3">
        <table class="table table-striped table-sm ">
          <thead>
            <tr>
              <th></th>
              <th> كود </th>
              <th>اسم</th>
              <th>مديونية</th>
              <th v-if="app_config.shader_name == 'amn1'">{{'عدد العدايات' | tr_label}}</th>
              <th v-if="false"> calc مديونية</th>
              <th v-if=" flags.zm_mode" width="25%">تحصيل</th>
              <th v-if="false">ملاحظات</th>
              <th v-if="flags.detailed">كراسة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in comp_customers_arr" :key='idx' >
              <td><input class="pr-hideme" :id="item.id" :value="item.id" type="checkbox" v-model="checkedItems" /></td>
              <td>{{item.id}}</td>
              <td>
                <router-link class="nav-link" :to="{name:'customer_details', params: {id: item.id}}">
                {{item.name}}
                </router-link>
              </td>
              <td>{{item.sum_debt | round | toAR }}
                <span class="text-danger pr-hideme" v-if="false && (item.sum_debt - item.debt) < -1 ">{{ ( item.sum_debt - item.debt ) | toAR }}</span>
              </td>
              <td v-if="app_config.shader_name == 'amn1'">
                {{item.pkg_count | toAR }}
              </td>
              
              <td v-if=" flags.zm_mode" >
                <span class="collect-box "></span>
              </td>
              <td v-if="false">{{item.notes}}</td>
              <td v-if="flags.detailed">{{item.side_acc}}</td>

              <td v-if="! flags.zm_mode" class="d-print-none">
                <button class="btn text-danger" @click="archive(item.id)" v-if=" flags.detailed && ! item.deleted_at">
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[item.id]"> أرشفة</template>
                  <template v-if="confirm_step[item.id]"> تأكيد </template>
                </button>
                <button class="btn text-success" @click="archive(item.id, 'RESTORE')" v-if="item.deleted_at">
                  <span class="fa fa-undo "></span> 
                  <template v-if="! confirm_step[item.id]"> استرجاع</template>
                  <template v-if="confirm_step[item.id]"> تأكيد </template>
                </button>
                <button class="btn text-danger" @click="archive(item.id, 'PERMANENT')" v-if="item.deleted_at">
                  <span class="fa fa-undo "></span> 
                  <template v-if="! confirm_step[item.id]"> حذف نهائي</template>
                  <template v-if="confirm_step[item.id]"> تأكيد </template>
                </button>
                <button class="btn text-primary" @click="edit(item.id)" v-if="! item.deleted_at">
                  تعديل
                </button>
                <button class="btn text-primary" 
                @click="initCollect(item);$bvModal.show('modal-collect')" 
                v-if="! item.deleted_at && ! day.stricted">
                  تحصيل
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        <button class="btn btn-primary pr-hideme" v-if="flags.detailed === false" @click="flags.detailed= true"> عرض التفاصيل </button>
        
        <button class="btn btn-printo pr-hideme mr-2"  @click="print_co">
          <span class="fa fa-print"></span> طباعة
        </button>

         &nbsp;
        <button class="btn btn-primary pr-hideme" v-if="flags.detailed !== false" @click="flags.detailed= false"> العودة للتجار </button>

    </div>
    <!-- Nolons Modal -->
<b-modal id="modal-collect"  
 hide-footer hide-header-close hide-backdrop>
  <template slot="modal-title">
    تحصيل من البياع {{collect_dao.customer_name}}
  </template>
  <AlertDay />
  <table class="table table-striped table-sm pr-me">
    <thead>
      <tr>
        <th>مبلغ التحصيل</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="collect_dao">
        <td>{{collect_dao.amount}}</td>
        <td>
          <input v-model="collect_dao.amount" class="form-control"  >
        </td>
      </tr>
    </tbody>
  </table>

  <div class="m-2">
    <button class="btn btn-success pr-hideme" @click="$bvModal.hide('modal-collect');doCollect()" >
      <span class="fa fa-check "></span> &nbsp;
      تحصيل
    </button>
  </div>
</b-modal>
  </section>
</template>

<script >
import { CustomerTransDAO, CustomerDAO, CustomersCtrl} from '../ctrls/CustomersCtrl'
import { moment } from '../main'
import { CashflowDAO, CashflowCtrl } from '../ctrls/CashflowCtrl'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl'
import { MainMixin } from '../mixins/MainMixin'
import AlertDay from '@/components/AlertDay.vue'
// import { remote } from 'electron'
export default {
  name: 'customers',
  data () {
    return {
      customer_form: new CustomerDAO(CustomerDAO.INIT_DAO),
      customersCtrl: new CustomersCtrl(),
      collect_dao: new CashflowDAO(),
      customers_arr: [],
      flags: {
        show_active: true,
        zm_mode: false,
        form_collabsed: true,
        detailed: false,
        show_g_than: false,
        show_sum_debt: false
      },
      confirm_step: [],
      checkedItems: [],
      sph_focus: false,
      search_term: '',
      search_placeholder: '',
      now_day: moment().format('LL'),
      now_hour: moment().format('hh:mm a'),
      sum_debt: 0,
      password: null
    }
  },
  mixins: [MainMixin],
  methods: {
    async show_dialog() {
      //const dialogOptions = {type: 'info', buttons: ['OK', 'Cancel'], message: 'Do it?'}
      //remote.dialog.showMessageBox(dialogOptions, i => console.log(i))
      if(this.shader_configs['F_MMN1_PASS']) {
        this.$bvModal.show("pass-in");
      } else {
        this.flags.show_sum_debt = ! this.flags.show_sum_debt
      }
    },
    async passSubmit(evt){
      evt.preventDefault();
      if(this.shader_configs['F_MMN1_PASS'] == this.password){
        this.flags.show_sum_debt = ! this.flags.show_sum_debt
        this.$bvModal.hide("pass-in");
      }
    },
    async refresh_all() {
      let init_time = new Date().getTime()
      let soft_delete = this.flags.show_active
      if(this.flags.show_g_than)
      this.customers_arr = await new CustomersCtrl().findAll(
        {debt_g_than: this.flags.show_g_than},
        {
          softDelete: soft_delete, 
          orderByDebt: this.app_config.shader_name != 'nada' 
        }
      )
      else {
        await this.show_all_cust()
      }

      this.collect_dao = new CashflowDAO()
      let {sum_debt} = await this.customersCtrl.sumDebt()
      this.sum_debt = sum_debt
      console.log('⌚ Time to refresh_all in ms = ' , new Date().getTime() - init_time)
    },
    async show_all_cust(){
      this.flags.show_g_than = false
      let soft_delete = this.flags.show_active
      this.customers_arr = await this.customersCtrl.findAll({},{softDelete: soft_delete, 
        orderByDebt: this.app_config.shader_name != 'nada' 
      })
    },
    fresh_form(){
      this.customer_form = new CustomerDAO(CustomerDAO.INIT_DAO)
      this.$root.$emit('bv::toggle::collapse', 'collapse_form')
    },
    async zmMode() {
      this.customers_arr = await this.customersCtrl.findAll({},{
        orderByName: this.app_config.shader_name != 'magdy',
        orderByDebt: this.app_config.shader_name == 'magdy'
      })
      this.flags.zm_mode = true
    },
    setSelected(){
      this.customers_arr = this.customers_arr.filter(item => this.checkedItems.includes(item.id))
    },
    async saveCustomer(evt) {
      evt.preventDefault()
      try {
        await this.customersCtrl.save(this.customer_form)
      } catch (error) {
        console.error(error)
        if(error.toString().includes('UNIQUE constraint'))
        this.$bvToast.show('example-toast')
        return
      }
      
      this.customer_form = new CustomerDAO(CustomerDAO.INIT_DAO)
      this.refresh_all()
    },
    async initCollect(customerDAO){
      this.collect_dao.customer_id = customerDAO.id
      this.collect_dao.customer_name = customerDAO.name
    },
    async doCollect(){

      let selectedTrans = await new TransTypesCtrl().findOne({name: 'cust_collecting' , category: 'customer_trans'})
      // create customer trans
      if(selectedTrans) {
        let cashflow_id = null
        if(selectedTrans.map_cashflow){
          // Create cashflow with trans
          let cashflowTrans = await new TransTypesCtrl().findOne({name: selectedTrans.map_cashflow , category: 'cashflow'})
          
          let newCashflow = new CashflowDAO({
            amount: this.collect_dao.amount,
            day: this.$store.state.day.iso,
            customer_id: this.collect_dao.customer_id,
          })

          newCashflow.transType = cashflowTrans
          cashflow_id = await new CashflowCtrl().save(newCashflow)
        }

        let custtransDAO = new CustomerTransDAO()
        custtransDAO.day = this.$store.state.day.iso
        custtransDAO.amount = parseFloat(this.collect_dao.amount)
        custtransDAO.customer_id = this.collect_dao.customer_id
        custtransDAO.cashflow_id = cashflow_id
        custtransDAO.transType = selectedTrans
        await this.customersCtrl.updateDebtByTrans(custtransDAO)
      }
      this.refresh_all()
    },
    async edit(id) {
      let filtered_arr = this.customers_arr.filter( element =>{
        return element.id == id
      })
      this.customer_form = new CustomerDAO(filtered_arr[0])
      // Show form only if collabsed
      if(this.flags.form_collabsed) {
        this.$root.$emit('bv::toggle::collapse', 'collapse_form')
      }
    },
    async archive(id, restore = 'ARCHIVE') {
      if( this.confirm_step[id] ) {
        if(restore === 'RESTORE')
          await this.customersCtrl.resotreById(id)
        else if ( restore === 'PERMANENT'){
          await this.customersCtrl.permenentDeleteById(id)
        }
        else
          await this.customersCtrl.deleteById(id)
        this.confirm_step = []
        this.refresh_all()
      }
      else {
        this.confirm_step = []
        this.confirm_step[id] = true
      }
    },
  },
  async mounted() {
    // Listening to collapses state changes 
    this.$root.$on('bv::collapse::state', (collapseId, show) => {
      if(collapseId == 'collapse_form') this.flags.form_collabsed = ! show
    })
    this.flags.show_g_than = this.shader_configs['F_SHOW_CUST_G_THAN'] ? this.shader_configs['F_SHOW_CUST_G_THAN'] : this.flags.show_g_than
    this.refresh_all()
  },
  computed: {
    comp_customers_arr: function () {
      return this.customers_arr.filter( item => {
        return ((item.deleted_at == null) === this.flags.show_active  && item.name && item.name.includes(this.search_term))
      })      
    },
    valid_form: function() {
      return this.customer_form.name
    },
  },
  components: {
    AlertDay
  },
  watch:{
    'customer_form.name': function(val){
      this.search_term = val
    }
  }
}
</script>
