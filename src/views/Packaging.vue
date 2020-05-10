<template>
  <section class="template m-3 row">
    
    <div class="col-5 d-print-none">
      <button class="btn btn-success" 
        v-b-toggle.collapse_cash >حركات المخزن </button>
    <br/>
    <br/>
      <b-collapse id="collapse_cash" class="m-1">
        <div class="entry-form">
        <form  @submit="addPkgTrans">
          <div class="form-group row"> 
            <label class="col-sm-2" >نوع الحركة</label>
            <div class="col-sm-10">
            <select class="form-control " v-model="pkg_form.type">
              <!--
              <option  value="add" >شراء عدايات</option>
              -->
              <option  value="minus" >  اهلاك </option>
            </select>
            </div>
          </div>

          <div class="form-group row">
            <label  class="col-sm-2">عدد الطرود</label>
            <div class="col-sm-10">
              <input v-model="pkg_form.count" class="form-control "  placeholder="ادخل عدد الطرود ">
            </div>
          </div>
          <div class="form-group row">
           سوف يتم 
            &nbsp;
            <span v-if="pkg_form.type == '-'"> اهلاك </span>
            عدايات بمبلغ 
            {{ +pkg_form.count * +shader_configs['pkg_price'] }} ج علي المخزن
          </div>

          <div class="form-group row">
            <label  class="col-sm-2">ملاحظات</label>
            <div class="col-sm-10">
              <input v-model="pkg_form.notes" class="form-control " placeholder="ادخال الملاحظات">
            </div>
          </div>     

          <button type="submit" class="btn btn-success" :disabled="! pkg_form.count || ! pkg_form.type" >حفظ الحركة</button>
          &nbsp;
          <button type="button" @click="refresh_all()" class="btn btn-danger"> الغاء </button>
        </form>
        </div>
      </b-collapse>
    </div>

    <div class=" col-print-12 pr-me p-2 col-7">
      <div class="form-group row">
        <label  class="col-sm-2">  عرض </label>
        <div class="col-sm-10">
          <select v-model="show_flag" class="form-control"  >
            <option value="">
              الكل
            </option>

            <option value="suppliers">
              فلاحين فقط
            </option>

            <option value="customers">
              تجار فقط
            </option>
          </select>
        </div>
      </div>

      <div class="table-responsive m-3">
        <table class="table table-striped table-sm ">
          <thead>
            <tr>
              <th>#</th>
              
              <th></th>
              <th>العدد</th>
              <!--
              <th>المبلغ</th>
              -->
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in pkg_trans" :key='idx' >
              <template v-if="! show_flag 
              || ( show_flag == 'customers' && item.customer_id )
              || ( show_flag == 'suppliers' && item.supplier_id )
              ">
              <td>{{item.id}}</td>
              
              <td>
                {{item.notes}}
                {{item.supplier_name}}
                {{item.customer_name}}
                {{item.dealer_name}}
              </td>
              <td>
                <span v-if="item.count > 0">+</span>{{item.count}}
              </td>
              <!--
              <td>
                <span v-if="item.count > 0">+</span>{{item.amount}}
              </td>
              -->
              <td>
                <button class="btn text-danger" @click="deleteTrans(item.id)" v-if="item.id" >
                  <span class="fa fa-trash "></span> 
                  <template v-if="! confirm_step[item.id]"> حذف </template>
                  <template v-if="confirm_step[item.id]"> تأكيد </template>
                </button>
              </td>
              </template>
            </tr>
            <tr v-if="! show_flag">
              <td></td>
              <td>اجمالي</td>
              <th>{{ sum_totals.sum_count }}</th>
              <!--
              <th>{{ sum_totals.sum_amount }}</th>
              -->
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
<script>
import { MainMixin } from '../mixins/MainMixin'
import { PackagingCtrl, PackagingDAO} from '../ctrls/PackagingCtrl'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl'
import { CashflowDAO, CashflowCtrl } from '../ctrls/CashflowCtrl'
export default {
  name: 'packaging',
  data() {
    return {
      pkg_trans: [],
      confirm_step: [],
      pkg_form: {
        type:'',
        count:0,
        notes:'',
        amount: 0
      },
      show_flag: ''
    }
  },
  mixins:[MainMixin],
  methods: {
    async addPkgTrans(evt) {
      evt.preventDefault()
      let sum = '+';
      let notes = this.pkg_form.notes;

      let amount = +this.pkg_form.count * +this.shader_configs['pkg_price']
      if(this.pkg_form.type == 'add') {
        sum = '+';
        notes += ' شراء عدايات '
      }
      if(this.pkg_form.type == 'minus') {
        sum = '-';
        notes += ' اهلاك '
      }

      // Add pkg_destruct trans
      let selectedTrans = await new TransTypesCtrl().findOne({
        name: this.pkg_form.type == 'minus' ? 'pkg_destruct' : '' ,
        category: 'packaging'
      });
      let cashflow_id = null;
      if(selectedTrans && selectedTrans.map_cashflow) {
        // Create cashflow with trans
        let splt = selectedTrans.map_cashflow.split(',');
        let cashflowTrans = await new TransTypesCtrl().findOne({name: splt[0] , category: 'cashflow'})
        
        let newCashflow = new CashflowDAO({
          amount: amount,
          day: this.$store.state.day.iso,
        })

        newCashflow.transType = cashflowTrans
        let cashflowCtrl = new CashflowCtrl()
        cashflow_id = await cashflowCtrl.save(newCashflow)

        if( splt[1] ) {
          let cashflowTrans = await new TransTypesCtrl().findOne({name: splt[1] , category: 'cashflow'});
          let newCashflow = new CashflowDAO({
            amount: amount,
            day: this.$store.state.day.iso,
          });

          newCashflow.transType = cashflowTrans
          await new CashflowCtrl().save(newCashflow);
        }
      }
      
      await new PackagingCtrl().save(new PackagingDAO({
        count: this.pkg_form.count,
        amount: amount,
        day: this.day.iso,
        sum,
        notes,
        cashflow_id
      }))

      await this.refresh_all();
    },
    async deleteTrans(id){
      if( this.confirm_step[id] ) {
        await new PackagingCtrl().deleteById(id);
        await this.refresh_all();
      }
      else {
        this.confirm_step = []
        this.confirm_step[id] = true
      }
    },
    async refresh_all(){
      // Get sum before today
      this.pkg_trans = []
      let [init_stock] = await new PackagingCtrl().getInitStock({day: this.day.iso});
      this.pkg_trans.push(new PackagingDAO({count: init_stock.count,amount: init_stock.amount, notes: 'رصيد'}))
      let today_trans = await new PackagingCtrl().findAll({day: this.day.iso}, 'id');
      this.pkg_trans.push(...today_trans);
      console.log(this.pkg_trans)
    }
  },
  async mounted() {
    this.refresh_all()
  },
    computed: {
    sum_totals: function() {
      let sum_totals = {
        sum_count: 0,
        sum_amount: 0,
      }
      this.pkg_trans.forEach(one => {
        if(one.count)
          sum_totals.sum_count += +one.count 
        if(one.amount )
          sum_totals.sum_amount += +one.amount 
      })
      console.log(sum_totals)
      return sum_totals
    },
  }
}
</script>

