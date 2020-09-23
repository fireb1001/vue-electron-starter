<template>
  <section class="products row">
    <div class="col-5 d-print-none">
    <br/>
    <div>
  <!-- Using modifiers -->
  <button v-b-toggle.collapse_form class="btn btn-primary m-1">ادخال صنف جديد
    &nbsp; <span class="fa fa-apple-alt"></span>
  </button>

  <!-- Element to collapse -->
  <b-collapse id="collapse_form" style="padding:25px;">
    <div class="entry-form">
    <form  @submit="SaveProduct">
      <div class="form-group row">
        <label  class="col-sm-2">اسم الصنف</label>
        <div class="col-sm-10">
          <input v-model="product_form.name" class="form-control "  placeholder="ادخل اسم الصنف">
        </div>
      </div>
      <div class="form-group row">
        <label  class="col-sm-2">بياعة الصنف</label>
        <div class="col-sm-10">
          <input v-model="product_form.product_sell_comm" class="form-control "  placeholder="ادخل مبلغ بياعة الصنف">
        </div>
      </div>

      <div class="form-group row" v-if="shader_configs['product_rahn']">
        <label  class="col-sm-2">رهن الصنف</label>
        <div class="col-sm-10">
          <input v-model="product_form.product_rahn" class="form-control "  placeholder="ادخل مبلغ رهن الصنف">
        </div>
      </div>

      <div class="form-group row" v-if="app_config.shader_name != 'nada'">
        <label  class="col-sm-2">خصم من الوزن</label>
        <div class="col-sm-10">
          <input v-model="product_form.weight_deduct" class="form-control "  placeholder="ادخل الوزن المخصوم من العبوة">
        </div>
      </div>


      <div class="form-group row" v-if="app_config.shader_name == 'amn1'">
        <label  class="col-sm-2">  مشال الصنف</label>
        <div class="col-sm-10">
          <input v-model="product_form.cust_mashal" class="form-control "  placeholder="مشال الصنف">
        </div>
      </div>


      <div class="form-group row"  v-if="false">
        <label  class="col-sm-2">لون الصنف</label>
        <div class="col-sm-10">
          <select v-model="product_form.notes" class="form-control ">
            <option value=""></option>
            <option value="red">احمر</option>
            <option value="green">اخضر</option>
          </select>
        </div>
      </div>

      <button type="submit" class="btn btn-success" 
      :disabled="! product_form.name || ! product_form.product_sell_comm">حفظ</button>
    </form>
    </div>
  </b-collapse>
</div>
</div>

  <div class="col-7 p-3 col-print-10 pr-me">
    <div class="m-1">
      <br/>
      <button  class="btn btn-danger " @click="flags.show_active=false;refresh_all()" v-if="flags.show_active">
        عرض الارشيف
        &nbsp; <span class="fa fa-archive"></span>
      </button>
      <button  class="btn btn-success " @click="flags.show_active=true;refresh_all()" v-if="! flags.show_active">
        اغلاق الارشيف   &nbsp; <span class="fa fa-external-link-square-alt"></span>
      </button>
    </div>
    <div class="pr-hideme" >
      <br>
      <input v-model="search_term" class="form-control "  :placeholder="custom_labels['search_products']">
    </div>
    <br/>
    <h2 :class="{ 'text-danger': ! flags.show_active }">
      <span v-if="flags.show_active"> ادارة </span>
      <span v-if="! flags.show_active"> ارشيف </span>
     الاصناف 
    </h2>
      <div class="table-responsive">
        <table class="table table-striped table-sm">
          <thead>
            <tr>
              <th> كود </th>
              <th>اسم الصنف</th>
              <th>بياعة </th>
              <th v-if="shader_configs['product_rahn']">رهن </th>
              <th v-if="app_config.shader_name != 'nada'">خصم وزن</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in comp_products_arr" :key='idx' >
              <td>{{item.id}}</td>
              <td>{{item.name}}</td>
              <td>{{item.product_sell_comm}}</td>
              <td v-if="shader_configs['product_rahn']">
                {{item.product_rahn}}
              </td>
              <td v-if="app_config.shader_name != 'nada'">{{item.weight_deduct}}</td>
              <td>{{item.notes}}</td>
              <td class="d-print-none">
                <button class="btn text-danger" @click="archive(item.id)" v-if="! item.deleted_at">
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>

          <button class="btn btn-printo pr-hideme" @click="vue_window.print()">
            <span class="fa fa-print"></span> طباعة 
          </button>
  </div>
</section>
</template>

<script>
import { MyStoreMutations } from '../main'
import { ProductDAO, ProductsCtrl} from '../ctrls/ProductsCtrl'
import { MainMixin } from '../mixins/MainMixin';
export default {
  name: 'products',
  data() {
    return {
      all_products: [],
      confirm_step: [],
      productsCtrl: new ProductsCtrl(),
      flags: {show_active: true, form_collabsed: true},
      search_term: '',
      product_form: new ProductDAO({name: '' , product_sell_comm: this.$store.state.shader_configs.product_sell_comm}),
    }
  },
  mixins: [MainMixin],
  methods: {
    async SaveProduct(evt){
      evt.preventDefault()
      try {
        await this.productsCtrl.save(this.product_form)
      } catch (error) {
        this.$bvToast.show('example-toast')
        return
      }
      
      this.product_form = new ProductDAO({name: '' , product_sell_comm: this.$store.state.shader_configs.product_sell_comm})
      this.search_term = ''
      this.refresh_all()
    },
    async refresh_all() {
      // Save Active products
      let products_arr = await new ProductsCtrl().getProductsArr()
      this.$store.commit(MyStoreMutations.setProductsArr, products_arr)

      let soft_delete = this.flags.show_active ? true : false;
      this.all_products = await this.productsCtrl.findAll({},{softDelete: soft_delete})
    },
    async archive(id, restore = 'ARCHIVE') {
      if( this.confirm_step[id] ) {
        if(restore === 'RESTORE')
          await this.productsCtrl.resotreById(id)
        else if ( restore === 'PERMANENT')
          await this.productsCtrl.permenentDeleteById(id)
        else
          await this.productsCtrl.deleteById(id)
        this.confirm_step = []
        this.refresh_all()
      }
      else {
        this.confirm_step = []
        this.confirm_step[id] = true
      }
    },
    async edit(id) {
      let comp_products_arr = this.all_products.filter( element =>{
        return element.id == id
      })
      this.product_form = new ProductDAO(comp_products_arr[0])
      // Show form only if collabsed
      if(this.flags.form_collabsed) {
        this.$root.$emit('bv::toggle::collapse', 'collapse_form')
      }
    },
  },
  async mounted() {
    this.$root.$on('bv::collapse::state', (collapseId, show) => {
      if(collapseId == 'collapse_form') this.flags.form_collabsed = ! show
    })
    this.refresh_all()
  },
  computed: {
    comp_products_arr: function () {
      return this.all_products.filter( item => {
        return ((item.deleted_at == null) === this.flags.show_active  && item.name.includes(this.search_term))
      })
    }
  },
  watch:{
    'product_form.name': function(val){
      this.search_term = val
    }
  }
}
</script>
