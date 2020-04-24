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
              <option  value="add" >شراء عدايات</option>
              <option  value="minus" >  اهلاك </option>
            </select>
            </div>
          </div>

          <div class="form-group row">
            <label  class="col-sm-2">عدد الطرود</label>
            <div class="col-sm-10">
              <input v-model="pkg_form.amount" class="form-control "  placeholder="ادخل عدد الطرود ">
            </div>
          </div>

          <div class="form-group row">
            <label  class="col-sm-2">ملاحظات</label>
            <div class="col-sm-10">
              <input v-model="pkg_form.notes" class="form-control " placeholder="ادخال الملاحظات">
            </div>
          </div>     

          <button type="submit" class="btn btn-success" :disabled="! pkg_form.amount || ! pkg_form.type" >حفظ الحركة</button>
          &nbsp;
          <button type="button" @click="refresh_all()" class="btn btn-danger"> الغاء </button>
        </form>
        </div>
      </b-collapse>
    </div>

    <div class=" col-print-12 pr-me p-2 col-7">
      <div class="table-responsive m-3">
        <table class="table table-striped table-sm ">
          <thead>
            <tr>
              <th>#</th>
              
              <th></th>
              <th>العدد</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in pkg_trans" :key='idx' >
              <td>{{item.id}}</td>
              
              <td>
                {{item.notes}}
                {{item.supplier_name}}
                {{item.customer_name}}
                {{item.dealer_name}}
              </td>
              <td>{{item.amount }}</td>
              <td>
                <button class="btn text-danger" @click="deleteTrans(item.id)" v-if="item.id" >
                  <span class="fa fa-trash "></span> 
                  <template v-if="! confirm_step[item.id]"> حذف </template>
                  <template v-if="confirm_step[item.id]"> تأكيد </template>
                </button>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>اجمالي</td>
              <td>{{ sum_totals.sum_amount }}</td>
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
export default {
  name: 'packaging',
  data() {
    return {
      pkg_trans: [],
      confirm_step: [],
      pkg_form: {
        type:'',
        amount:0,
        notes:''
      },
    }
  },
  mixins:[MainMixin],
  methods: {
    async addPkgTrans(evt) {
      evt.preventDefault()
      let sum = '+';
      let notes = this.pkg_form.notes;
      if(this.pkg_form.type == 'add') {
        sum = '+';
        notes += ' شراء عدايات '
      }
      if(this.pkg_form.type == 'minus') {
        sum = '-';
        notes += ' اهلاك '
      }
      console.log(this.pkg_form)
      await new PackagingCtrl().save(new PackagingDAO({
        amount: this.pkg_form.amount,
        day: this.day.iso,
        sum,
        notes
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
      this.pkg_trans.push(new PackagingDAO({amount: init_stock.amount, notes: 'رصيد'}))
      let today_trans = await new PackagingCtrl().findAll({day: this.day.iso});
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
        sum_amount: 0,
      }
      this.pkg_trans.forEach(one => {
        sum_totals.sum_amount += one.amount 
      })
      return sum_totals
    },
  }
}
</script>

