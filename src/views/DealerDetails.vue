<template>
  <section class="row m-2">
    <div class="col-5 pr-hideme">
      <h3>{{ dealer.name }}</h3>
      <hr>
      <button 
      :disabled="day.stricted"
      v-b-toggle.collapse_pay class=" btn btn-success m-2" >
        <span class="fa fa-money-bill-wave"></span> &nbsp; 
       صرف / تحصيل
      </button>
        <!-- Element to collapse  <div class="m-2"></div>-->
      <b-collapse id="collapse_pay" style="padding:25px;" class="pr-hideme">
        <div class="entry-form">
          <AlertDay/>
        <form  @submit="addPayment">
          <b-form-group label="نوع الحركة">
            <b-form-radio-group  v-model="trans_form.trans_type">
              <b-form-radio value="dealer_pay">صرف  </b-form-radio>
              <b-form-radio value="dealer_collect">تحصيل</b-form-radio>
            </b-form-radio-group>
          </b-form-group>

          <div class="form-group row">
            <label  class="col-sm-2">المبلغ</label>
            <div class="col-sm-10">
              <input v-model="trans_form.amount" class="form-control "  placeholder="ادخل المبلغ">
            </div>
          </div>
          <div class="form-group row" >
            <label  class="col-sm-2">ملاحظات</label>
            <div class="col-sm-10">
              <input v-model="trans_form.notes" class="form-control " placeholder="ادخال الملاحظات">
            </div>
          </div>     
          <div class="form-group row" v-if="false">
            <label  class="col-sm-2">عدد الطرود</label>
            <div class="col-sm-10">
              <input v-model="trans_form.count" class="form-control " placeholder="ادخال العدد">
            </div>
          </div>     

          <button type="submit" class="btn btn-success" :disabled="! valid_form ">
            <span v-if="trans_form.trans_type === 'dealer_pay'">صرف</span>
            <span v-else>تحصيل </span>
          </button>
          <button type="button" class="btn btn-danger mr-1"  v-b-toggle.collapse_pay >  اغلاق</button>
        </form>
        </div>
      </b-collapse>

      <div v-if=" shader_configs['shader_name'] == 'amn1'">
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
    </div>
    <div class="col-7 table-responsive" >
      <div>
        <button class="btn btn-printo pr-hideme" 
          @click="print_co();">
          <span class="fa fa-print"></span> طباعة
        </button>
      </div>
      <h3 class="m-3">سجل المعاملات </h3>
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
            <template v-for="(payment, idx) in dealer_trans" >
            <tr :key='idx' :class="{'text-danger':payment.sum =='-' }">
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
                <button  v-if="payment.id && ! day.stricted  &&  ! closed_days[payment.day]" 
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
              <td>الرصيد الحالي</td>
              <td>
                <b v-if="dealer_sums.total_debt < 0" class="text-danger">
                  له ({{ Math.abs(dealer_sums.total_debt) | toAR}})
                </b>
                <b v-else>عليه {{ dealer_sums.total_debt | toAR}}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  </section>
</template>

<script>
import { Settings } from 'luxon'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl';
import { CashflowDAO, CashflowCtrl } from '../ctrls/CashflowCtrl';
import { MainMixin } from '../mixins/MainMixin';
import AlertDay from '@/components/AlertDay.vue'
import { DealersCtrl, DealerDAO, DealerTransDAO } from '../ctrls/DealersCtrl';
import { PackagingCtrl, PackagingDAO } from '../ctrls/PackagingCtrl';

Settings.defaultLocale = 'ar'
Settings.defaultZoneName = 'UTC'

export default {
  name: 'dealer-details',
  data(){
    return {
      dealer: new DealerDAO(DealerDAO.INIT_DAO),
      dealer_trans: [],
      dealer_id: this.$route.params.id,
      store_day: this.$store.state.day,
      confirm_step_recp: [],
      confirm_step: [],
      dealersCtrl: new DealersCtrl(),
      trans_form: {trans_type: 'dealer_pay'},
      packaging: {count: 0, amount: 0},
      packaging_form:{amount:0, type:'+'},
    }
  },
  components:{
    AlertDay
  },
  mixins: [MainMixin],
  methods: {
    async refresh_all(){
      let {dao, trans} = await this.dealersCtrl.getDealerDetails(this.dealer_id)
      this.dealer = dao
      this.dealer_trans = trans
      this.packaging = await new PackagingCtrl().getPersonSum({dealer_id: this.dealer_id})
    },
    async addToPackaging(evt) {
      evt.preventDefault()
      console.log(this.packaging_form)
      await new PackagingCtrl().save(new PackagingDAO({
        count: this.packaging_form.count,
        amount: +this.packaging_form.count * +this.shader_configs['pkg_price'],
        sum: this.packaging_form.type,
        dealer_id: this.dealer.id,
        notes: this.packaging_form.type == '+' ? 'رد ' : 'سحب ',
        day: this.day.iso
      }))

      this.packaging_form = {count : 0 , type : '+'}
      this.$root.$emit('bv::toggle::collapse', 'collapse_packaging')
      await this.refresh_all()
    },
      async removeTrans(trans) {
      if( this.confirm_step[trans.id] ) {
        this.discard_success = await this.dealersCtrl.removeDealerTrans(trans.id)
        this.confirm_step = []
        this.refresh_all()
      }
      else {
        this.confirm_step = []
        this.confirm_step[trans.id] = true
      }
    },
    async addPayment(evt) {
      evt.preventDefault()
      this.trans_form.day = this.store_day.iso;
      let transTypesCtrl = new TransTypesCtrl()
      let selectedTrans = await transTypesCtrl.findOne({
        name: this.trans_form.trans_type ,
        category: 'dealer_trans'
      })
      console.log(selectedTrans)
      if(selectedTrans) {
        let cashflow_id = null
        if(selectedTrans.map_cashflow){
          // Create cashflow with trans
          let cashflowTrans = await transTypesCtrl.findOne({
            name: selectedTrans.map_cashflow ,
            category: 'cashflow'
          })

          let newCashflow = new CashflowDAO({
            amount: this.trans_form.amount,
            day: this.trans_form.day,
            dealer_id: this.dealer_id,
            notes: this.trans_form.notes
          })

          newCashflow.transType = cashflowTrans
          cashflow_id = await new CashflowCtrl().save(newCashflow)
        }

        let transDAO = new DealerTransDAO(this.trans_form)
        transDAO.dealer_id = this.dealer_id
        transDAO.cashflow_id = cashflow_id
        transDAO.transType = selectedTrans
        await this.dealersCtrl.updateBalanceByTrans(transDAO)
      }
      
      this.trans_form = {}
      this.$root.$emit('bv::toggle::collapse', 'collapse_pay')
      this.refresh_all()
    }
  },
  mounted() {
    this.refresh_all()
  },
  computed: {
    dealer_sums: function() {
      let dealer_sums = {total_debt: 0 }
      this.dealer_trans.forEach(trans => {

        dealer_sums.total_debt += parseFloat(trans.amount)

      })
      return dealer_sums
    },
    valid_form: function() {
      if(this.trans_form.trans_type && this.trans_form.amount && parseFloat(this.trans_form.amount)) {
        return true
      }
      return false
    }
  }
}
</script>

<style>

</style>