<template>
  <section class="supllier-details">
    <section class="supp-head m-3">

      <button class="btn btn-primary pr-hideme" @click="$router.go(-1)">العودة</button>
      <h2 class="d-inline-block mr-3 ">ملف العميل : {{supplier.name}}</h2> 
      <br>
      <div class="pr-mt-2"></div>
      <table class="table table-bordered mt-1 pr-hideme">
        <tr>
          <th>تليفون العميل</th>
          <td>{{supplier.phone}}</td>

          <th>عنوان العميل</th>
          <td>{{supplier.address}}</td>
        </tr>
        <tr>
          <th>ملاحظات</th>
          <td>{{supplier.notes}}</td>

        </tr>
      </table>
    </section>
    <section class="row">
      <div class="col-5 pr-hideme">

    <div v-if=" shader_configs['shader_name'] == 'mmn1'">
        <div class="m-2" v-if="supplier.box_count">
          <h4>لديه {{supplier.box_count}} عداية</h4>
        </div>
        <button 
        v-if="shader_configs['shader_name'] != 'nada'"
        v-b-toggle.collapse_boxes class=" btn btn-success m-2" >
          <span class="fa fa-box"></span> &nbsp; 
        اضافة /تخفيض عدايات
        </button>
      <b-collapse id="collapse_boxes" style="padding:25px;" class="pr-hideme">
        <div class="entry-form">
          <form  @submit="addToBoxCount">
          <b-form-group label=" الحركة">
            <b-form-radio-group  v-model="add_box_count.type">
              <b-form-radio value="+">اضافة </b-form-radio>
              <b-form-radio value="-"> تخفيض</b-form-radio>
            </b-form-radio-group>
          </b-form-group>

          <div class="form-group row">
            <label  class="col-sm-2">عدد العدايات</label>
            <div class="col-sm-10">
              <input v-model="add_box_count.amount" class="form-control "  placeholder="ادخل العدد">
            </div>
          </div>

          <button type="submit" class="btn btn-success" >
            <span v-if="add_box_count.type == '+'">اضافة</span>
            <span v-else>تخفيض</span>
          </button>

          <button type="button" class="btn btn-danger mr-1"  v-b-toggle.collapse_boxes >  اغلاق</button>
          </form>
        </div>
      </b-collapse>
    </div>

    <div >
        <div class="m-2" >
          <h4>عدد {{packaging.count}} عداية في حساب المخزن بمبلغ {{packaging.amount}}</h4>
        </div>
        <button 
        v-b-toggle.collapse_packaging class=" btn btn-success m-2" >
          <span class="fa fa-box"></span> &nbsp; 
        رد / سحب عدايات
        </button>
      <b-collapse id="collapse_packaging" style="padding:25px;" class="pr-hideme">
        <div class="entry-form">
          <form  @submit="addToPackaging">
          <b-form-group label=" الحركة">
            <b-form-radio-group  v-model="packaging_form.type">
              <b-form-radio value="-"> سحب </b-form-radio>
              <b-form-radio value="+"> رد </b-form-radio>
            </b-form-radio-group>
          </b-form-group>

          <div class="form-group row">
            <label  class="col-sm-2">عدد العدايات</label>
            <div class="col-sm-10">
              <input v-model="packaging_form.count" class="form-control "  placeholder="ادخل العدد">
            </div>
          </div>
          <div class="form-group row">
            سوف يتم 
            &nbsp;
            <span v-if="packaging_form.type == '+'"> اضافة </span>
            <span v-else> خصم </span> &nbsp;
            عدايات بمبلغ 
            {{ +packaging_form.count * +shader_configs['pkg_price'] }} ج علي المخزن
          </div>
          <button type="submit" class="btn btn-success" >
            <span v-if="packaging_form.type == '+'">رد</span>
            <span v-else>سحب</span>
          </button>

          <button type="button" class="btn btn-danger mr-1"  v-b-toggle.collapse_packaging >  اغلاق</button>
          </form>
        </div>
      </b-collapse>
    </div>

    <div v-if="shader_configs['shader_name'] == 'mmn1'">
      <br/>
        <div class="m-2" @click="flags.show_side_acc = !flags.show_side_acc">
          <h6>
            <span v-if="flags.show_side_acc">اخفاء</span>
            <span v-if="! flags.show_side_acc">عرض</span>
           كراسة </h6>
        </div>
      <div class="m-2" v-if="flags.show_side_acc">
        <div class="m-2" v-if="supplier.side_acc">
          <h4>حساب كراسة {{supplier.side_acc}} </h4>
        </div>
        <button v-b-toggle.collapse_side_acc class=" btn btn-success m-2" >
          <span class="fa fa-box"></span> &nbsp; 
        اضافة /تخفيض علي حساب الكراسة
        </button>
      </div>
    </div>
    
      <b-collapse id="collapse_side_acc" style="padding:25px;" class="pr-hideme">
        <div class="entry-form">
          <form  @submit="addToSideAcc">
          <b-form-group label=" الحركة">
            <b-form-radio-group  v-model="side_acc.type">
              <b-form-radio value="+">اضافة </b-form-radio>
              <b-form-radio value="-"> تخفيض</b-form-radio>
            </b-form-radio-group>
          </b-form-group>

          <div class="form-group row">
            <label  class="col-sm-2">المبلغ</label>
            <div class="col-sm-10">
              <input v-model="side_acc.amount" class="form-control "  placeholder="ادخل المبلغ">
            </div>
          </div>

          <button type="submit" class="btn btn-success" >
            <span v-if="side_acc.type == '+'">اضافة</span>
            <span v-else>تخفيض</span>
          </button>

          <button type="button" class="btn btn-danger mr-1"  v-b-toggle.collapse_side_acc >  اغلاق</button>
          </form>
        </div>
      </b-collapse>

      <br/>
        <router-link class="btn btn-primary m-2" :to="{name:'supp_recp_details', params: {supplier_id: supplier.id}}">
         فواتير اليوم
        </router-link>
        <br/>
        
        <button 
        v-b-toggle.collapse_closer
        v-if="shader_configs['shader_name'] == 'nada'"
        class=" btn btn-danger m-2" >
          <span class="fa fa-table"></span> &nbsp; 
        تصفية سنوية
        </button>

        <br/>

      <b-collapse id="collapse_closer" style="padding:25px;" class="pr-hideme">
        <div class="entry-form">
          <form  @submit="yeralyCloser">

          <div class="form-group row">
            <label  class="col-sm-2">التصفية لعام</label>
            <div class="col-sm-10">
              <input v-model="yearly_closer.year" class="form-control "  placeholder="ادخل العام">
            </div>
          </div>

          <div
            class="p-1 m-1 alerty" 
          >
            سوف يتم تصفية حساب العميل {{supplier.name}} لعام {{yearly_closer.year}}
            <br/>
            سوف يتم انشاء حساب جديد للعميل باجمالي رصيد
            {{ parseFloat(supp_trans_sums.total_debt) - parseFloat(supp_recps_sums.total_rasd) | round}}
          </div>

          <button type="submit" class="btn btn-danger" >
            <span>تصفية</span>
          </button>

          <button type="button" class="btn btn-danger mr-1"  v-b-toggle.collapse_closer >  اغلاق</button>
          </form>
        </div>
      </b-collapse>

        <router-link class="btn btn-primary m-2" :to="{name:'supp_inc_details', params: {supplier_id: supplier.id}}">
         تفاصيل الزرع 
        </router-link>
        <br/>

        <button v-b-toggle.collapse_pay class=" btn btn-success m-2" >
          <span class="fa fa-money-bill-wave"></span> &nbsp; 
        اضافة فواتير سابقة / دفعات / تحصيلات
        </button>
        <!-- Element to collapse  <div class="m-2"></div>-->
      <b-collapse id="collapse_pay" style="padding:25px;" class="pr-hideme">
        <div class="entry-form">
          <AlertDay/>
        <form  @submit="addPayments">
          <b-form-group label="نوع الحركة">
            <b-form-radio-group  v-model="trans_form.trans_type">
              <b-form-radio value="supp_init_payment">رصيد </b-form-radio>
              <b-form-radio value="supp_pre_payment">دفعة سابقة</b-form-radio>
              <b-form-radio value="supp_pre_recp">فاتورة سابقة</b-form-radio>
              <b-form-radio value="supp_collect">تحصيل</b-form-radio>
              <b-form-radio value="supp_payment">دفعة اليوم</b-form-radio>
              <!--
              <b-form-radio value="supp_recp_expenses">مصروف فاتورة</b-form-radio>
              -->
            </b-form-radio-group>
          </b-form-group>

          <div class="form-group row">
            <label  class="col-sm-2">المبلغ</label>
            <div class="col-sm-10">
              <input v-model="trans_form.amount" class="form-control "  placeholder="ادخل المبلغ">
            </div>
          </div>
          <div class="form-group row" v-if="trans_form.trans_type === 'supp_pre_payment' || trans_form.trans_type === 'supp_pre_recp'">
            <label  class="col-sm-2">تاريخ</label>
            <div class="col-sm-10">
              <datetime v-model="trans_form.day" :auto="true" class="datetime" min-datetime="2018-01-01"></datetime>
            </div>
          </div>
          <div class="form-group row" >
            <label  class="col-sm-2">ملاحظات</label>
            <div class="col-sm-10">
              <input v-model="trans_form.notes" class="form-control " placeholder="ادخال الملاحظات">
            </div>
          </div>     
          <div class="form-group row" v-if=" trans_form.trans_type == 'supp_pre_recp'">
            <label  class="col-sm-2">عدد الطرود</label>
            <div class="col-sm-10">
              <input v-model="trans_form.count" class="form-control " placeholder="ادخال العدد">
            </div>
          </div>     
          <div class="form-group row" v-if=" trans_form.trans_type == 'supp_pre_recp'">
            <label  class="col-sm-2">الاصناف</label>
            <div class="col-sm-10">
              <input v-model="trans_form.products" class="form-control " placeholder=" ادخال اسماء الاصناف">
            </div>
          </div>     

          <button type="submit" class="btn btn-success" :disabled="! valid_payments_form ">
            <span v-if="trans_form.trans_type === 'supp_pre_payment' 
            || trans_form.trans_type === 'supp_payment' 
            || trans_form.trans_type === 'supp_init_payment' 
            || trans_form.trans_type === 'supp_recp_expenses'">اضافة دفعة</span>
            <span v-if="trans_form.trans_type === 'supp_pre_recp' ">اضافة الفاتورة</span>
            <span v-if=" trans_form.trans_type == 'supp_collect'">تحصيل مبلغ</span>
          </button>
          <button type="button" class="btn btn-danger mr-1"  v-b-toggle.collapse_pay >  اغلاق</button>
        </form>
        </div>
      </b-collapse>

    </div>
    <div class="col-7 table-responsive" >
      <h3 class="m-3">سجل دفعات العميل </h3>
        <table class="table table-striped pr-me">
          <thead>
            <tr>
              <th>م </th>
              <th>التاريخ</th>
              <th>الحركة</th>
              <th>المبلغ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(payment, idx) in supplier_trans" >
            <tr :key='idx' v-if="true || payment.trans_type == 'supp_payment'" :class="{'text-danger':payment.sum =='-' }">
              <th>{{idx +1 | toAR }} </th>
              <td>{{payment.day | arDate }}</td>
              <td>
                {{payment.trans_type | tr_label('trans_types')}}
                <span v-if="payment.notes">- {{payment.notes}} </span>
              </td>
              <td>
                <span v-if="payment.sum=='-'">( {{payment.amount | toAR}} )</span>
                <span v-else> {{payment.amount | toAR}} </span>
              </td>
              <td>
                <button  v-if="payment.id"
                :disabled="day.stricted || closed_days[payment.day]"
                class="btn text-danger pr-hideme" @click="removeTrans(payment)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step[payment.id]"> حذف </template>
                  <template v-if="confirm_step[payment.id]"> تأكيد </template>
                </button>
              </td>
              <!--
              <td>{{payment.balance_after | toAR}}</td>
              -->
            </tr>
            </template>
            <tr>
              <td></td>
              <td></td>
              <td>رصيد العميل الحالي</td>
              <td>
                <b>{{supp_trans_sums.total_debt | toAR}}</b>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
      </section>
        <div class="text-center">
          <button class="btn btn-printo pr-hideme" @click="pr_short_togg(true);print_co();">
            <span class="fa fa-print"></span>  طباعة كشف
          </button>
        </div>
      
      <div :class="{'pr-hideme':pr_short_mode}">
        <h3 class="m-3">سجل فواتير العميل </h3>
        <table class="table table-striped ">
          <thead>
            <tr>
              <th>م </th>
              <th>صافي </th>
              <th>عدد </th>
              <th>الاصناف</th>
              <th>التاريخ</th>
              <th>فاتورة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(receipt, idx) in supplier_receipts" :key='idx' >
              <th>{{idx +1 | toAR }}</th>
              <td>
                {{receipt.net_value | ceil5(app_config.shader_name) | round | toAR}}
              </td>
              <td>{{receipt.total_count | toAR}}</td>
              <td width="35%">{{receipt.products_arr | productsFilter }}</td>
              <td>{{receipt.day | arDate}}</td>
              <td>
                <span v-if="receipt.recp_paid == 1">رصد</span> 
                <span v-if="receipt.recp_paid == 2">صرف</span> 
                <span v-if="receipt.printed"> - {{'printed' | tr_label }} </span>
                <br>
          <router-link class="nav-link pr-hideme" :to="{name:'supp_recp_details', params: {supplier_id: receipt.supplier_id, day: receipt.day}}">
          عرض  
          </router-link>
              </td>
              <td> 
                <button v-if="shader_configs['shader_name'] == 'nada'" 
                class="btn text-danger" @click="removeRecp(receipt)" >
                  <span class="fa fa-archive "></span> 
                  <template v-if="! confirm_step_recp[receipt.id]"> حذف الفاتورة</template>
                  <template v-if="confirm_step_recp[receipt.id]"> تأكيد </template>
                </button>
              </td>

            </tr>
          </tbody>
        </table>
        </div>
        <div class="m-3">اجمالي فواتير الرصد فقط = <b>{{ supp_recps_sums.total_rasd | ceil5(app_config.shader_name) | round | toAR}}</b> </div>
        <div class="text-center">
          <button class="btn btn-printo pr-hideme"  @click="pr_short_togg(false);print_co();">
            <span class="fa fa-print"></span> طباعة
          </button>
        </div>

  </section>
</template>

<script>
import { Settings, DateTime } from 'luxon'
import { SupplierDAO, SuppliersCtrl, SupplierTransDAO } from '../ctrls/SuppliersCtrl'
import { ReceiptsCtrl, ReceiptDAO } from '../ctrls/ReceiptsCtrl'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl';
import { CashflowDAO, CashflowCtrl } from '../ctrls/CashflowCtrl';
import { MainMixin } from '../mixins/MainMixin';
import AlertDay from '@/components/AlertDay.vue'
import { PackagingCtrl, PackagingDAO } from '../ctrls/PackagingCtrl';

Settings.defaultLocale = 'ar'
Settings.defaultZoneName = 'UTC'

export default {
  name: 'supllier-details',
  data(){
    return {
      supplier: new SupplierDAO(SupplierDAO.INIT_DAO),
      supplier_trans: [],
      supplier_receipts: [],
      supplier_id: this.$route.params.id,
      store_day: this.$store.state.day,
      confirm_step_recp: [],
      confirm_step: [],
      flags: {show_side_acc: false},
      add_box_count:{amount:0, type:'+'},
      packaging: {count: 0, amount: 0},
      packaging_form:{amount:0, type:'+'},
      side_acc:{amount:0, type:'+'},
      suppliersCtrl: new SuppliersCtrl(),
      trans_form: {trans_type: 'supp_payment'},
      yearly_closer: {year: new Date().getFullYear()},
      pr_short_mode: false
    }
  },
  components:{
    AlertDay
  },
  mixins: [MainMixin],
  methods: {
    async refresh_all(){
      let {dao, trans} = await this.suppliersCtrl.getSupplierDetails(this.supplier_id)
      console.log(trans)
      this.supplier = dao
      this.supplier_trans = trans
      this.supplier_receipts = await new ReceiptsCtrl().findAll({supplier_id: this.supplier.id})
      this.packaging = await new PackagingCtrl().getPersonSum({supplier_id: this.supplier.id})
    },
    async yeralyCloser(evt) {
      evt.preventDefault();
      let net_acc = parseFloat(this.supp_trans_sums.total_debt) - parseFloat(this.supp_recps_sums.total_rasd)
      console.log(this.yearly_closer.year, net_acc)
      let newSupp = { ...this.supplier }
      newSupp.balance = net_acc
      delete newSupp.id
      this.supplier.name += ' ' +this.yearly_closer.year
      await this.suppliersCtrl.save(this.supplier)
      await this.suppliersCtrl.deleteById(this.supplier_id)
      await this.suppliersCtrl.save(new SupplierDAO(newSupp))
      this.$router.push("suppliers");
    },
    async pr_short_togg(flag){
      this.pr_short_mode = flag;
    },
    async removeRecp(recp) {
      console.log(recp)
      if( this.confirm_step_recp[recp.id] ) {
        await new ReceiptsCtrl().deleteById(recp.id)
        this.refresh_all()
      }
      else {
        this.confirm_step_recp = []
        this.confirm_step_recp[recp.id] = true
      }
    },
    async removeTrans(trans) {
      if( this.confirm_step[trans.id] ) {
        this.discard_success = await this.suppliersCtrl.removeSupplierTrans(trans.id)
        this.confirm_step = []
        this.refresh_all()
      }
      else {
        this.confirm_step = []
        this.confirm_step[trans.id] = true
      }
    },
    async addToBoxCount(evt){
      evt.preventDefault()
      console.log(this.add_box_count)
      let old_count = this.supplier.box_count ? parseInt(this.supplier.box_count) : 0
      let amount = parseInt(this.add_box_count.amount);
      this.supplier.box_count = this.add_box_count.type == '-' ? old_count - amount : old_count + amount
      console.log(this.supplier)
      await this.suppliersCtrl.save(this.supplier)
      this.add_box_count = {amount : 0 , type : '+'}
      this.$root.$emit('bv::toggle::collapse', 'collapse_boxes')
      await this.refresh_all()
    },
    async addToPackaging(evt) {
      evt.preventDefault()
      console.log(this.packaging_form)
      await new PackagingCtrl().save(new PackagingDAO({
        count: this.packaging_form.count,
        amount: +this.packaging_form.count * +this.shader_configs['pkg_price'],
        sum: this.packaging_form.type,
        supplier_id: this.supplier.id,
        day: this.day.iso
      }))

      this.packaging_form = {count : 0 , type : '+'}
      this.$root.$emit('bv::toggle::collapse', 'collapse_packaging')
      await this.refresh_all()
    },
    async addToSideAcc(evt){
      evt.preventDefault()
      console.log(this.side_acc)
      let old_side_acc = this.supplier.side_acc ? parseFloat(this.supplier.side_acc) : 0
      let amount = parseFloat(this.side_acc.amount);
      this.supplier.side_acc = this.side_acc.type == '-' ? old_side_acc - amount : old_side_acc + amount
      await this.suppliersCtrl.save(this.supplier)
      this.side_acc = {amount : 0 , type : '+'}
      this.$root.$emit('bv::toggle::collapse', 'collapse_side_acc')
      await this.refresh_all()
    },
    async addPayments(evt){
      evt.preventDefault()

      if(this.trans_form.day) {
        this.trans_form.day = DateTime.fromISO(this.trans_form.day).toISODate()
      }
      else {
        this.trans_form.day = this.store_day.iso
      }
      let transTypesCtrl = new TransTypesCtrl()
      let selectedTrans = await transTypesCtrl.findOne({name: this.trans_form.trans_type , category: 'supplier_trans'})
      
      if(selectedTrans) {
        let cashflow_id = null
        if(selectedTrans.map_cashflow){
          // Create cashflow with trans
          let cashflowTrans = await transTypesCtrl.findOne({name: selectedTrans.map_cashflow , category: 'cashflow'})

          let newCashflow = new CashflowDAO({
            amount: this.trans_form.amount,
            day: this.trans_form.day,
            supplier_id: this.supplier_id,
          })

          newCashflow.transType = cashflowTrans
          cashflow_id = await new CashflowCtrl().save(newCashflow)
        }

        let suppTransDAO = new SupplierTransDAO(this.trans_form)
        suppTransDAO.supplier_id = this.supplier_id
        suppTransDAO.cashflow_id = cashflow_id
        suppTransDAO.transType = selectedTrans
        await this.suppliersCtrl.updateBalanceByTrans(suppTransDAO)
      }


      /*
      if(this.trans_form.sum === '+' ) {
        this.trans_form.amount = parseFloat(this.trans_form.amount)
        let cashflowDAO = new CashflowDAO(CashflowDAO.SUPP_COLLECT_DAO)
        cashflowDAO.amount = this.trans_form.amount
        cashflowDAO.day = this.store_day.iso
        this.trans_form.day = this.store_day.iso
        cashflowDAO.actor_id = this.supplier.id
        cashflowDAO.actor_name = this.supplier.name

        this.trans_form.cashflow_id = await CashflowDB.addNew(cashflowDAO)
      }
      else if ( this.trans_form.sum === '--') {

        let cashflowDAO = new CashflowDAO(CashflowDAO.SUPP_PAY_DAO)
        cashflowDAO.amount = parseFloat( this.trans_form.amount )
        this.trans_form.amount = - parseFloat(this.trans_form.amount)
        cashflowDAO.day = this.store_day.iso
        this.trans_form.day = this.store_day.iso
        cashflowDAO.actor_id = this.supplier.id
        cashflowDAO.actor_name = this.supplier.name

        this.trans_form.cashflow_id = await CashflowDB.addNew(cashflowDAO)
      }
      else if ( this.trans_form.sum === '-r') {
        
        let cashflowDAO = new CashflowDAO(CashflowDAO.OUT_RECEIPT_DAO)
        cashflowDAO.amount = parseFloat( this.trans_form.amount )
        this.trans_form.amount = - parseFloat(this.trans_form.amount)
        cashflowDAO.day = this.store_day.iso
        this.trans_form.day = this.store_day.iso
        cashflowDAO.actor_id = this.supplier.id
        cashflowDAO.actor_name = this.supplier.name

        this.trans_form.cashflow_id = await CashflowDB.addNew(cashflowDAO)
      }
      else if (this.trans_form.sum === 'supp_pre_recp') {
        console.log(this.trans_form)
        let recp = new ReceiptDAO()
        recp.day = this.trans_form.day
        recp.total_count = parseInt(this.trans_form.count)
        recp.products_arr = this.trans_form.products
        recp.net_value = this.trans_form.amount
        recp.supplier_id = this.supplier.id
        recp.supplier_name = this.supplier.name
        recp.recp_paid = 1
        // await ReceiptsDB.addNew(recp)
      }
      else {
        this.trans_form.amount = parseFloat(this.trans_form.amount)
      }
      */
        
      if (this.trans_form.trans_type == 'supp_pre_recp') {
        let recp = new ReceiptDAO({
          day: this.trans_form.day,
          total_count: parseInt(this.trans_form.count),
          products_arr: this.trans_form.products,
          net_value: this.trans_form.amount,
          supplier_id: this.supplier_id,
          recp_paid: 1
        })
        console.log(recp)
        await new ReceiptsCtrl().save(recp)
      }
      
      this.trans_form = {}
      this.$root.$emit('bv::toggle::collapse', 'collapse_pay')
      this.refresh_all()
    },
  },
  mounted() {
    this.refresh_all()
  },
  computed: {
    supp_recps_sums: function() {
      let supp_recps_sums = {total_rasd: 0 }
      this.supplier_receipts.forEach(item =>{
        if(item.recp_paid == 1)
          supp_recps_sums.total_rasd += parseFloat(item.net_value)
      })
      // this.receipt.sale_value = sum
      return supp_recps_sums
    },
    supp_trans_sums: function() {
      let supp_trans_sums = {total_debt: 0 }
      this.supplier_trans.forEach(trans => {

        supp_trans_sums.total_debt += parseFloat(trans.amount)

      })
      return supp_trans_sums
    },
    valid_payments_form: function() {

      if(this.trans_form.trans_type && this.trans_form.amount && parseFloat(this.trans_form.amount)) {
        if(this.trans_form.trans_type == 'supp_pre_payment' && ! this.trans_form.day)
          return false
        else 
          return true
      }
      return false

    }
  }
}
</script>
