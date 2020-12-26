<template>
  <section class="receipts bg-receipts minh90 p-3">

    <div class="pr-hideme">
      <h3 class="text-danger fa fa-eraser larger"
      @click="search_term = ''" v-if="search_term"></h3>
      <input v-model="search_term" class="form-control" :placeholder="custom_labels['search_suppliers']">
      <br/>
    </div>

    <h1> فواتير العملاء - معاملات اليوم</h1>
<!--
<router-link  v-for="(supplier, idx) in today_suppliers_arr" 
:to="{name:'supplier_details', params: {id: supplier.id}}"  :key="idx" 
class="btn btn-lg btn-primary m-1 btn-block" :class="{'btn-danger':suppliers_headers_arr[supplier.id] > 0}">
  <span class="fa fa-receipt"></span> &nbsp; 
  عرض فواتير العميل - {{supplier.name}} 
  <span v-if="suppliers_headers_arr[supplier.id] > 0">
  - متبقي {{suppliers_headers_arr[supplier.id]}} طرد
  </span>
</router-link>
-->
<div v-if="not_created_recps.length > 0" class="alerty m-2">
  يوجد عدد
  {{not_created_recps.length}}
   لفواتير لم يتم انشاءها 
  <span 
  @click="show_not_yet = true"
style="
    font-weight: bold;
    color: #391dd6;
">عرض</span>
</div>

  <template v-if="show_not_yet">
      <div class="row" 
    v-for="(row, idx) in not_created_recps" :key="idx">

      <div class="col-5 btn btn-lg m-2 btn-block text-primary d-print-none pr-hideme">
        <router-link  :to="{name:'supplier_details', params: {id: row.supplier_id}}">
          ملف : {{row.supplier_name}}
        </router-link>
        <div v-if="row.day != day.iso" class="text-danger">وارد {{row.day | arDate }} </div> 
      </div>

      <router-link class="btn btn-danger col-5 m-1 btn btn-lg d-print-none pr-hideme "  
        :to="{name:'supp_recp_full', params: {supplier_id: row.supplier_id, day: row.day}}">
        <span class="fa fa-cash-register"></span>
        <span>
          انشاء
          فاتورة 
        </span>
      </router-link>
      <router-link class="nav-link " :to="{name:'supp_recp_details', params: {supplier_id: row.supplier_id, day: row.day}}">
        تفاصيل اليوم
      </router-link>
    </div>
  </template>

  <template >
    <div class="row" 
    v-for="(row, idx) in fltrd_today_suppliers_arr" :key="idx">

      <div class="col-5 btn btn-lg m-2 btn-block text-primary d-print-none pr-hideme">
        <router-link  :to="{name:'supplier_details', params: {id: row.supplier_id}}">
          ملف : {{row.supplier_name}}
        </router-link>
        <div v-if="row.day != day.iso" class="text-danger">وارد {{row.day | arDate }} </div> 
      </div>

      <div class="text-danger col-5 m-1 btn btn-lg d-print-none pr-hideme " v-if="row.sum_diff">
        يتبقي {{row.sum_diff}} طرد
      </div>
      <router-link class="btn col-5 m-1 btn btn-lg d-print-none pr-hideme "  v-else
        :class="{ 
          'btn-danger': !singleRecp(row.concat_recp_paid) ||  singleRecp(row.concat_recp_paid) == 0 ,
          'btn-primary': singleRecp(row.concat_recp_paid) == 1,
          'btn-success': singleRecp(row.concat_recp_paid) == 2
        }"
        :to="{name:'supp_recp_full', params: {supplier_id: row.supplier_id, day: row.day}}">
        <span class="fa fa-cash-register"></span>
        <span>
          فاتورة 
          <span v-if="singleRecp(row.concat_recp_paid) > 0">
            {{'recp_status_'+ singleRecp(row.concat_recp_paid) | tr_label }}
          </span>
          <span v-if="singleRecp(row.concat_recp_paid) === null">*</span>
           <span v-if="row.concat_printed"> - {{'printed' | tr_label }} </span>
        </span>
      </router-link>
      <router-link class="nav-link " :to="{name:'supp_recp_details', params: {supplier_id: row.supplier_id, day: row.day}}">
        تفاصيل اليوم
      </router-link>
    </div>
    </template>

  <table class="table table-striped table-sm pr-me-l" >
    <thead>
      <tr>
        <th>اسم العميل</th>
        <th>الاصناف </th>
        <th> نوالين </th>
        <th>عدد </th>
        <th>تم بيع</th>
        <th> متبقي</th>
        <th> فواتير</th>
        <th>بعدد </th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(row, idx) in fltrd_today_suppliers_arr">
      <tr :key='idx' v-if="app_config.shader_name != 'nada' || row.day == day.iso">
        <td>
          <router-link class="nav-link " :to="{name:'supplier_details', params: {id: row.supplier_id}}">
            {{row.supplier_name}}
          </router-link>
        </td>

        <!--
          <td v-html="$options.filters.productsFilter(item.products_arr,'<br/> , ')"></td>
        <td> 
          <span class="text-danger" v-if="item.total_current_rest">{{item.total_current_rest}}</span>
        </td>
        -->
        <td width="25%">{{row.products_concat}}</td>
        <td>{{row.total_nolon}}</td>
        <td>{{row.sum_inc_count}}</td>
        <td>{{row.sum_sold_count}}</td>
        <td :class="{'text-danger': row.sum_diff}">
          <b>{{row.sum_diff}}</b>
        </td>
        <td>
      <router-link class="btn m-1 btn btn-lg d-print-none pr-hideme " 
        v-if=" ! row.sum_diff"
        :class="{ 
          'btn-danger': !singleRecp(row.concat_recp_paid) ||  singleRecp(row.concat_recp_paid) == 0 ,
          'btn-primary': singleRecp(row.concat_recp_paid) == 1,
          'btn-success': singleRecp(row.concat_recp_paid) == 2
        }"
        :to="{name:'supp_recp_full', params: {supplier_id: row.supplier_id, day: row.day}}">
        <span class="fa fa-cash-register"></span>
        <span>
          <span v-if="singleRecp(row.concat_recp_paid) === null"> انشاء </span>
          فاتورة 
          <span v-if="singleRecp(row.concat_recp_paid) > 0">
            {{'recp_status_'+ singleRecp(row.concat_recp_paid) | tr_label }}
          </span>
          
           <span v-if="row.concat_printed"> - {{'printed' | tr_label }} </span>
        </span>
      </router-link>
        <template v-if="false">
          <span v-for="(recp_paid, index) in receiptsSepStatus(row.concat_recp_paid)" :key="index">
            فاتورة {{'recp_status_'+ recp_paid | tr_label }} 
            <span v-if="row.concat_printed"> - {{'printed' | tr_label }} </span>
            <span v-if="index+1 != receiptsSepStatus(row.concat_recp_paid).length">, <br/></span>
          </span>
          </template>
        </td>
        <td>{{row.sum_recp_count}}</td>
        <td>
          <div v-if="row.day != day.iso" class="text-danger">وارد {{row.day | arDate }} </div> 
          <router-link class="nav-link " :to="{name:'supp_recp_details', params: {supplier_id: row.supplier_id, day: row.day}}">
          تفاصيل اليوم
          </router-link>
          <router-link class="nav-link " 
          v-if="false"
          :to="{name:'supp_recp_full', params: {supplier_id: row.supplier_id, day: row.day}}">
          انشاء فاتورة
          </router-link>
        </td>
      </tr>
      </template>
    </tbody>
  </table>
  </section>
</template>

<script >
import { InoutHeadCtrl } from '../ctrls/InoutHeadCtrl'
import { MainMixin } from '../mixins/MainMixin'

export default {
  name: 'suppliers-receipts',
  data () {
    return {
      today_suppliers_arr: [],
      not_created_recps: [],
      show_not_yet: false
    }
  },
  mixins: [MainMixin],
  methods: {
    async refresh_all() {
      /*
      this.suppliers_headers_arr = await IncomingsHeaderDB.getDailySuppliers({day: this.store_day.iso})
      let ids = Object.keys(this.suppliers_headers_arr)
      this.suppliers_arr = await SuppliersDB.getAll(ids)
      */
      this.today_suppliers_arr = await new InoutHeadCtrl().findDailySuppliers({day: this.$store.state.day.iso});
      this.not_created_recps = await new InoutHeadCtrl().findNotCreatedRecps();
      console.log(this.not_created_recps);
    },
    receiptsSepStatus(concat_recp_paid) {
      if(concat_recp_paid)
        return concat_recp_paid.split(',')
      else
        return []
    },
    singleRecp(concat_recp_paid) {
      if(concat_recp_paid) {
        let [first] = concat_recp_paid.split(',')
        return first
      }
      else
        return null
    }
  },
  components: {
  },
  computed: {
    fltrd_today_suppliers_arr: function(){
      return this.today_suppliers_arr.filter( item => {
        // console.log(item)
        return (item.supplier_name && item.supplier_name.includes(this.search_term))
      })
    }
  },
  mounted() {
    this.refresh_all()
  }
}
</script>