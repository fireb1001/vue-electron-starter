<template>
  <section class="incoming-resalah-form">

  <form  class="p-4">
    <div class="form-group row">
      <label class="col-sm-2">التاريخ</label>
      <div class="col-sm-10">
        <input v-model="incomings_data.day" class="form-control" disabled>
      </div>
    </div>

    <div class="form-group row">
      <label  class="col-sm-2">العميل</label>
      <div class="col-sm-10">
        <!--
        <select v-model="incomings_data.supplier_id" class="form-control"  >
        <option v-for="(supplier, idx) in active_suppliers" :key='idx' :value='supplier.id'>
          {{supplier.name}}
        </option>
      </select>
      --> 
        <v-select class="vselect-styler"  dir="rtl"
        ref="supplierSelect"
        :options="active_suppliers" label="name" 
        :reduce="supplier => supplier.id"
        @search="new_supplier"
        v-model="incomings_data.supplier_id"
        :key="incomings_data.supplier_id" >
          <div slot="no-options">لا يوجد نتائج بحث <span class="text-primary" @click="new_supplier('new')">انشاء جديد</span> </div>
          
        </v-select>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-sm-2">الاصناف</label>
      <div class="col-sm-10">
        <div class="product-row p-1" v-for="(product, index) in incomings_data.products_arr" :key='index' >
          <span :class="{'text-danger': product.found }" > عدد {{product.count}} - {{products_arr[product.id]}}  </span>
           <div class="text-danger" v-if="product.found"> ( تم تسجيل نفس الوارد اليوم بنفس العدد ) </div>
        </div>
      </div>
    </div>

    <div class="form-group row">
      <div class="col-sm-1"></div>
      <div class="col-sm-11 ">
        <div class="row product_area p-2">
          <label class="col-sm-2">الصنف</label>
          <div class="col-sm-7">
            <!--
            <select v-model="product_data.id" class="form-control" placeholder="اختار الصنف">
              <option v-for="(product, index) in all_products" :key='index' :value='index'>
                {{product}}
              </option>
            </select>
            -->
            <v-select class="vselect-styler" dir="rtl"
            ref='productSelect'
            :reduce="product => product.id"
            :options="all_products" label="product_name"
            @search="new_product"
            v-model="product_data.id"
            :key="product_data.id">
              <div slot="no-options">لا يوجد نتائج <span class="text-primary" @click="new_product('new')"> منتج جديد </span> </div>
            </v-select>
          </div>
          <div class="col-sm-3">
            <input v-model="product_data.count" class="form-control" placeholder=" العدد">
          </div>
          <div class="p-4">
            <button type="button" class="btn btn-primary" 
            :disabled="! valid_product" @click="add_product" >اضافة الصنف</button>
            &nbsp;
            <button type="button" @click="product_data= {};$refs.productSelect.clearSelection()" class="btn btn-danger"> الغاء </button>
          </div>
        </div>
      </div>
    </div>

    <div class="form-group row">
      <label class="col-sm-2">نولون</label>
      <div class="col-sm-10">
        <input v-model="incomings_data.nolon" class="form-control">
      </div>
    </div>

    <div class="form-group row" v-if="app_config.shader_name != 'mmn1'">
      <label class="col-sm-2">{{'given' | tr_label}}</label>
      <div class="col-sm-10">
        <input v-model="incomings_data.given" class="form-control">
      </div>
    </div>

    <div class="form-group row" v-if="shader_configs['F_RECP_EXPENSES_INC']">
      <label class="col-sm-2">{{'recp_expenses' | tr_label}}</label>
      <div class="col-sm-10">
        <input v-model="incomings_data.recp_expenses" class="form-control">
      </div>
    </div>
    <!-- prevent enter to supmit -->
    <button type="button" @click="saveIncomings" class="btn btn-success" :disabled="! valid_form">حفظ</button>
    &nbsp;
    <button type="button" @click="fresh_form" class="btn btn-danger"> الغاء </button>
    
  </form>
  </section>
</template>

<script >
import { SuppliersCtrl, SupplierDAO } from '../ctrls/SuppliersCtrl';
import { IncomingsCtrl,IncomingsData } from '../ctrls/IncomingsCtrl'
import { MainMixin } from '../mixins/MainMixin'
import { ProductsCtrl, ProductDAO } from '../ctrls/ProductsCtrl';
import { MyStoreMutations, knex } from '../main'
import { CashflowCtrl, CashflowDAO } from '../ctrls/CashflowCtrl';

export default {
  name: 'IncomingResalahForm',
  data () {
    return {
      incomings_data: new IncomingsData({day: this.$store.state.day.iso }),
      active_suppliers: [],
      supplier_search: '',
      product_search: '',
      supplier_incomings: [],
      incomingsCtrl: new IncomingsCtrl(),
      cashflowCtrl: new CashflowCtrl(),
      all_products: [],
      product_data: {id: 0 , count: null}
    }
  },
  mixins: [MainMixin],
  methods: {
    async saveIncomings(evt){
      evt.preventDefault()
      // let ids =
      // console.log(this.incomings_data)

      let till_val = this.shader_configs['till_val'] ? parseInt(this.shader_configs['till_val']) : null
      const moment = require('moment')
      // disable prev years
      if(moment(this.incomings_data.day).unix() < moment("2019-10-10").unix()) {
        alert('! -')
        return
      }
      else if(till_val && till_val < moment(this.incomings_data.day).unix()) {
        alert('! +')
        return
      }
      else {
        let day_incs = await this.incomingsCtrl.findAll({day: this.day.iso})
        let cashflow_rasid = await this.cashflowCtrl.findAll({day: this.day.iso,state: 'inc_collect', notes: 'عهده'})
        
        moment.locale('en')
        let isoyesterDay = moment(moment(this.day.iso).subtract(1, 'days')).format('YYYY-MM-DD')
        moment.locale('ar')
        let netcashYesterday = await this.cashflowCtrl.getNetCash({day: isoyesterDay})
        // init net_cash & close yesterday
        if(
          this.shader_configs['shader_name'] != 'nada' && 
          day_incs.length == 0 && 
          cashflow_rasid.length == 0 && 
          netcashYesterday >  0
        ) {
          await this.cashflowCtrl.save(new CashflowDAO({
            amount: netcashYesterday,
            state: 'inc_collect',
            notes: 'عهده',
            sum: '+',
            d_product: 'a',
            day: this.day.iso
          }));
          if(this.shader_configs['F_STRICT_MODE']) {
            // INSERT INTO daily_close ("day", "closed", "net_cash") VALUES ('2020-02-01', 'true', '2000.0');
            try {
              await knex.raw(`INSERT INTO daily_close ("day", "closed", "net_cash") 
              VALUES ('${isoyesterDay}', 'true', ${parseFloat(netcashYesterday)});`)
            } catch (error) {
              console.error(error)
            }

          }
        }
        await this.incomingsCtrl.saveIncomingsData(this.incomings_data)
      }
        
      this.fresh_form()
      this.$emit('saved')

    },
    async new_supplier(search ) {
      this.supplier_search = (search && search != 'new') ? search : this.supplier_search
      if(search == 'new') {
        console.log(this.supplier_search)
        let newsupplier_id = await new SuppliersCtrl().save(new SupplierDAO({name: this.supplier_search }))
        this.active_suppliers = await new SuppliersCtrl().findAll({},{softDelete: true})
        this.incomings_data.supplier_id = newsupplier_id
        //this.$refs.supplierSelect.search = this.supplier_search
      }
    },
    async new_product(search) {
      this.product_search = (search && search != 'new') ? search : this.product_search
      if(search == 'new') {
        console.log(this.product_search)
        let product_id = await new ProductsCtrl().save(new ProductDAO({name: this.product_search ,
        product_sell_comm: this.shader_configs['product_sell_comm'] 
        }))
        let products_arr = await new ProductsCtrl().getProductsArr()
        this.$store.commit(MyStoreMutations.setProductsArr, products_arr)
        this.all_products.push({id: product_id, product_name: this.product_search })
        this.product_data.id = product_id
      }
    },
    add_product() {
      if(this.product_data.id && parseInt(this.product_data.count) > 0 )
        this.incomings_data.products_arr.push(this.product_data)

      this.product_data = {id: 0 , count: null}
      this.$refs.productSelect.clearSelection()
    },
    fresh_form() {
      this.incomings_data = new IncomingsData({day: this.$store.state.day.iso })
      this.product_data = {id: 0 , count: null}
      this.$refs.productSelect.clearSelection()
      this.$refs.supplierSelect.clearSelection()
      this.$refs.supplierSelect.search = null
    }
  },
  async mounted () {
    // console.log(this.$store.state.products_arr)
    
    this.active_suppliers = await new SuppliersCtrl().findAll({},{softDelete: true})

    let all_products = await new ProductsCtrl().findAll({},{softDelete: true})
    this.all_products = all_products.map (product => { 
      return {id: product.id, product_name: product.name, color: product.notes}
    })
    this.fresh_form()
  },
  computed: {
    valid_form: function() {
      return this.incomings_data.supplier_id && this.incomings_data.products_arr.length > 0 && 
      ( ! this.product_data.id && ! this.product_data.count)
    },
    valid_product: function() {
      return this.product_data.id && this.product_data.count
    }
  },
  watch: {
    incomings_data : {
      /**@param {IncomingsData} newData */
      handler: async function(newData) {
        if(newData.supplier_id){
          this.supplier_incomings = await new IncomingsCtrl().findAll({supplier_id: newData.supplier_id,
          day: this.day.iso})
        }
      },
      deep: true
    },
    'incomings_data.products_arr' :{
      handler: function(newArr) {
        newArr.forEach( product => {
          let found = this.supplier_incomings.filter( item => {
            return item.product_id == product.id && item.count == product.count
          })
          product.found = (found.length > 0 )? true : false;
          console.log(product)
        }) 
      },
      deep: true
    }
  }
}
</script>

<style >
.product_area {
  border: 3px dashed cadetblue;
  border-radius: 15px;
}
.product-row {
  font-weight: bold;
  font-size: 1.2em;
  border-bottom: 2px dashed cadetblue;
}
.product-row:last-child {
  border-bottom: none;
}
</style>