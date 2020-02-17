<template>
  <section class="supp-receipts-details m-3" style="line-height: 1;">
  <section class="data-play pr-hideme" v-if="! receipt_d_mode">

    <router-link class="mr-3 btn btn-primary d-print-none pr-hideme" :to="{name:'supplier_details', params: {id: supplier.id}}">
        <span class="fa fa-file-import"></span> &nbsp;   ملف العميل
    </router-link>
    <br>
    <h1>شاشة فواتير {{supplier.name}} لليوم</h1>
    <hr>
    <section class="row ">
      <div class=" col-5 " >
        <h3>اجماليات وارد يوم {{recp_day | arDate }}</h3>
        <table class="table table-striped table-sm pr-me">
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف</th>
              <th>عدد الطرود</th>
              <th>متبقي</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(incom, idx) in inc_headers" :key='idx' :class="{'text-danger':incom.diff > 0}">
              <td></td>
              <td>{{incom.product_name}}</td>
              <td>{{incom.inc_count}}</td>
              <td>{{incom.diff}} </td>
            </tr>
          </tbody>
        </table>
        <hr>
        <div class="row detailed" v-b-modal.modal-nolons>
          <div class="col-6">
            <span class="btn text-primary">
            اجمالي نوالين اليوم
            </span>
          </div>
          <div class="col-6 btn text-primary">
            <span >
            {{ total_nolon | round2 }}
            </span>
            <span class="fa fa-table"></span>
            عرض 
          </div>
        </div>

        <div v-if="app_config.shader_name  != 'magdy'" class="row detailed" v-b-modal.modal-expenses>
          <div class="col-6">
            <span class="btn text-primary">
            {{ 'recp_expenses' | tr_label }}
            </span>
          </div>
          <div class="col-6 btn text-primary">
            <span >
            {{ recp_expenses | round2 }}
            </span>
            <span class="fa fa-table"></span>
            عرض 
          </div>
        </div>
      </div>
      <div class=" col-7" >
        <h3>اجماليات البيع من وارد اليوم </h3>
        <table class="table table-striped table-sm pr-me">
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف</th>
              <th>عدد الطرود</th>
              <th>اجمالي الوزن</th>
              <th> سعر الكيلو
                (بيع)
              </th>
              <th>المبلغ</th>
            </tr>
          </thead>
          <draggable :list="outgoings_sums" :sort="false" 
          :group="{ name: 'outsums', pull: 'clone', put: false }" tag="tbody" :clone="clone">
            <tr v-for="(item, idx) in outgoings_sums" :key='idx'>
              <td></td>
              <td>{{item.product_name}}</td>
              <td>{{item.sum_count}}</td>
              <td>{{item.sum_weight}}</td>
              <td>{{item.kg_price | round2}}</td>
              <td>{{item.sum_weight * item.kg_price | round2}}</td>
            </tr>
            <tr>
              <td></td>
              <th>الاجمالي</th>
              <td></td>
              <td></td>
              <td></td>
              <td><b class="border-top border-primary"></b></td>
            </tr>
          </draggable>
        </table>
    <button  class="btn btn-primary" @click="addReceipt(1)" v-if="! show_receipts[1]" :disabled="app_config.shader_name == 'amn1' && total_diff > 0">
      انشاء فاتورة   &nbsp; <span class="fa fa-external-link-square-alt"></span>
    </button>
      </div>
    </section>
    <hr>

    <section class="row ">
      <div class=" receipt col-4 p-3 "  v-if="show_receipts[1]">
        <h3 :class="{'text-danger': ! recp_1.id}">فاتورة 1 
            {{'recp_status_'+ recp_1.recp_paid | tr_label }}
            <span v-if="recp_1.printed"> - تم طباعتها    </span>
            <span v-if="! recp_1.id">( لم يتم الحفظ )</span>
        </h3>
        <h5 v-if="recp_1.recp_paid == 2 && recp_1.cashflow_day">
          تم الصرف بتاريخ {{recp_1.cashflow_day | arDate}}
        </h5>
        <draggable
          class="drag-area list-group"
          :list="recp_1.details"
          group="outsums"
          @change="recp_changed"
        >
          <div
            class="list-group-item"
            v-for="(element, idx) in recp_1.details"
            :key="idx"
          >
            {{ element.product_name }} عدد {{ element.count }} 
            وزن {{ element.weight }}
            بسعر {{ element.kg_price }} 
            <span class="fa fa-minus-circle" @click="remove_from_list(recp_1.details, idx)"
            style="color:red;float: left;"></span>
          </div>
        </draggable>
        <hr>
        <div class="row-detail">
          <label> عمولة الفاتورة</label>
          <span> {{recp_1.recp_comm | default0}} -<label> نسبة العمولة </label> ({{recp_1.comm_rate | default0}} % )</span>
        </div>
        <div class="row-detail">
          <label> النولون</label>
          <span> {{recp_1.total_nolon | default0}} </span>
        </div>
        <div class="row-detail" v-if="recp_1.recp_expenses">
          <label> {{ 'recp_expenses' | tr_label }}</label>
          <span> {{recp_1.recp_expenses | default0}} </span>
        </div>
        <div class="row-detail" v-if="recp_1.recp_deducts">
          <label> خصم الفاتورة</label>
          <span> {{recp_1.recp_deducts | default0}} </span>
        </div>
        <div class="row-detail">
          <label> وهبة الفاتورة</label>
          <span> {{recp_1.recp_given | round2}} </span>
        </div>
        <div class="row-detail" v-if="app_config.shader_name != 'nada' ">
          <label> مبالغ اخري</label>
          <span> {{recp_1.recp_others | round2}} </span>
        </div>
        <hr>
        <div class="row-detail">
          <label> صافي الفاتورة</label>
          <span> {{recp_1.net_value | round2}} </span>
        </div>
        <hr>
        <AlertDay />
        <button  class="btn btn-success" v-b-modal.modal-recp @click="modal_recp = recp_1;receipt_d_mode = true;vue_log(recp_1)"> <span class="fa fa-edit"></span>
        تعديل / عرض  
        </button>&nbsp;
        <button  class="btn btn-primary" v-if="! recp_1.recp_paid" @click="setRecpPaid(recp_1, 1)">
          <span class="fa fa-money-check"></span>
        رصد    
        </button>&nbsp;
        <button  
        :disabled="day.stricted"
        class="btn btn-primary" v-if=" recp_1.recp_paid != 2" @click="setRecpPaid(recp_1, 2)">
          <span class="fa fa-money-bill"></span>
          <span v-if="day.stricted"> لا يمكن </span>
        صرف    
        </button> &nbsp;

      </div>

      <div class="receipt col-4 p-3" v-if="show_receipts[2]">
        <h3 :class="{'text-danger': ! recp_2.id}">فاتورة 2 
          {{'recp_status_'+ recp_2.recp_paid | tr_label }}
          <span v-if="recp_2.printed"> - تم طباعتها    </span>
          <span v-if="! recp_2.id">( لم يتم الحفظ )</span>
        </h3>
        <draggable
          class="drag-area list-group " 
          :list="recp_2.details"
          group="outsums"
        >
          <div
            class="list-group-item"
            v-for="(element, idx) in recp_2.details"
            :key="idx"
          >
          
            {{ element.product_name }} عدد {{ element.count }} 
            وزن {{ element.weight }}
            بسعر {{ element.kg_price }} 
            
            <span class="fa fa-minus-circle" @click="remove_from_list(recp_2.details, idx)"
            style="color:red;float: left;"></span>
          </div>
        </draggable>
        <hr>
        <div class="row-detail" v-if="recp_2.total_nolon">
          <label> النولون</label>
          <span> {{recp_2.total_nolon | default0}} </span>
        </div>
        <div class="row-detail" v-if="recp_2.recp_expenses">
          <label> {{ 'recp_expenses' | tr_label }}</label>
          <span> {{recp_2.recp_expenses | default0}} </span>
        </div>
        <div class="row-detail">
          <label> عمولة الفاتورة</label>
          <span> {{recp_2.recp_comm | default0}} -<label> نسبة العمولة </label> ({{recp_2.comm_rate | default0}} % )</span>
        </div>
        <div class="row-detail">
          <label> وهبة الفاتورة</label>
          <span> {{recp_2.recp_given | round2}} </span>
        </div>
        <div class="row-detail">
          <label> مبالغ اخري</label>
          <span> {{recp_2.recp_others | round2}} </span>
        </div>
        <hr>
        <div class="row-detail">
          <label> صافي الفاتورة</label>
          <span> {{recp_2.net_value | round2}} </span>
        </div>
        <hr>
        <button  class="btn btn-success" v-b-modal.modal-recp @click="modal_recp = recp_2;receipt_d_mode = true"> <span class="fa fa-edit"></span>
         تعديل / عرض 
        </button>&nbsp;
        <button  class="btn btn-primary" v-if="! recp_2.recp_paid" @click="setRecpPaid(recp_2, 1)">
          <span class="fa fa-money-check"></span>
        رصد    
        </button>&nbsp;
        <button  class="btn btn-primary" 
        :disabled="day.stricted"
        v-if="recp_2.recp_paid != 2" @click="setRecpPaid(recp_2, 2)">
          <span class="fa fa-money-bill"></span>
          <span v-if="day.stricted"> لا يمكن </span>
        صرف   
        </button> &nbsp;

      </div>

      <div class="receipt col-4 p-1 pb-3"  v-if="show_receipts[3]">
        <h3 :class="{'text-danger': ! recp_3.id}">فاتورة 3 {{'recp_status_'+ recp_3.recp_paid | tr_label }}
          <span class="pr-hideme" v-if="recp_3.printed">
            - تم طباعتها
          </span>
          <span v-if="! recp_3.id">( لم يتم الحفظ )</span>
        </h3>
        <draggable
          class="drag-area list-group " 
          :list="recp_3.details"
          group="outsums"
        >
          <div
            class="list-group-item"
            v-for="(element, idx) in recp_3.details"
            :key="idx"
          >
          
            {{ element.product_name }} عدد {{ element.count }} 
            وزن {{ element.weight }}
            بسعر {{ element.kg_price }} 
            
            <span class="fa fa-minus-circle" @click="remove_from_list(recp_3.details, idx)"
            style="color:red;float: left;"></span>
          </div>
        </draggable>
        <hr>
        <div class="row-detail" v-if="recp_3.total_nolon">
          <label> النولون</label>
          <span> {{recp_3.total_nolon | default0}} </span>
        </div>
        <div class="row-detail" v-if="recp_3.recp_expenses">
          <label> {{ 'recp_expenses' | tr_label }}</label>
          <span> {{recp_3.recp_expenses | default0}} </span>
        </div>
        <div class="row-detail">
          <label> عمولة الفاتورة</label>
          <span> {{recp_3.recp_comm | default0}} -<label> نسبة العمولة </label> ({{recp_3.comm_rate | default0}} % )</span>
        </div>
        <div class="row-detail">
          <label> وهبة الفاتورة</label>
          <span> {{recp_3.recp_given | round2}} </span>
        </div>
        <div class="row-detail">
          <label> مبالغ اخري</label>
          <span> {{recp_3.recp_others | round2}} </span>
        </div>
        <hr>
        <div class="row-detail">
          <label> صافي الفاتورة</label>
          <span> {{recp_3.net_value | round2}} </span>
        </div>
        <hr>
        <button  class="btn btn-success" v-b-modal.modal-recp @click="modal_recp = recp_3; receipt_d_mode = true"> <span class="fa fa-edit"></span>
         تعديل / عرض 
        </button>&nbsp;
        <button  class="btn btn-primary" v-if="! recp_3.recp_paid" @click="setRecpPaid(recp_3, 1)">
          <span class="fa fa-money-check"></span>
        رصد    
        </button>&nbsp;
        <button  class="btn btn-primary" v-if="recp_3.recp_paid != 2" @click="setRecpPaid(recp_3, 2)">
          <span class="fa fa-money-bill"></span>
        صرف   
        </button> &nbsp;
      </div>

      <!-- end recps -->

      <button 
       class="btn btn-primary" @click="addReceipt(2)"
       v-if="! day.stricted && show_receipts[1] && ! show_receipts[2]">
      اضافة فاتورة   &nbsp; <span class="fa fa-external-link-square-alt"></span>
      <br/>
        2
      </button>
      <button  class="btn btn-primary" @click="addReceipt(3)" v-if="show_receipts[2] && ! show_receipts[3]">
      اضافة فاتورة   &nbsp; <span class="fa fa-external-link-square-alt"></span>
      <br/>
        3
      </button> 
    </section>

    <hr>

    <!-- Check Rest Items -->
    <div>
      <div v-for="(incom, idx) in inc_headers" :key='idx' class="text-danger" >
        <span v-if="incom.sold_count != incom.recp_in_count "> <span class="fa fa-error"></span> &nbsp;
        صنف {{incom.product_name}} تم بيع {{incom.sold_count | default0 }} طرد  - تم انشاء فواتير بعدد {{incom.recp_in_count | default0}} طرد
        </span>
      </div>
    </div>

    <div class="mt-3" >
      <button  class="btn btn-primary" @click="saveAll()"> <span class="fa fa-save"></span> &nbsp;
      حفظ الفواتير   
      </button> &nbsp;
      <button  
      :disabled="app_config.shader_name == 'amn1' && total_diff > 0"
      class="btn btn-danger" @click="redoReceipt()"> <span class="fa fa-undo"></span> &nbsp;
      اعادة انشاء فاتورة   
      </button> &nbsp;
      <button  class="btn btn-danger" @click="removeAll()"> <span class="fa fa-trash-alt"></span> 
      حذف الفواتير   
      </button>

    </div>
  </section>

<!-- Nolons Modal -->
<b-modal id="modal-nolons"  
 hide-footer hide-header-close hide-backdrop>
  <template slot="modal-title">
    عرض نوالين اليوم للفلاح
  </template>
  <table class="table table-striped table-sm pr-me">
    <thead>
      <tr>
        <th>المبلغ</th>
        <th>الصنف الوارد</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, idx) in today_nolons" :key='idx'>
        <td>{{item.amount}}</td>
        <td><span v-if="item.d_product"> - {{ item.d_product | productsFilter }}</span></td>
        <td>
          <input v-model="item.amount" class="form-control"  >
        </td>
      </tr>
    </tbody>
  </table>

  <div class="m-2">
    <button class="btn btn-success pr-hideme" 
    :disabled="day.stricted"
    @click="$bvModal.hide('modal-nolons');saveNolons()" >
      <span class="fa fa-check "></span> &nbsp;
      حفظ
    </button>
  </div>
</b-modal>

<!-- expenses Modal -->
<b-modal id="modal-expenses"  
 hide-footer hide-header-close hide-backdrop>
  <template slot="modal-title">
    عرض خصم من فواتير اليوم للفلاح
  </template>
  <table class="table table-striped table-sm pr-me">
    <thead>
      <tr>
        <th>المبلغ</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="recp_expenses_dao">
        <td>{{recp_expenses_dao.amount}}</td>
        <td>
          <input v-model="recp_expenses_dao.amount" class="form-control"  >
        </td>
      </tr>
    </tbody>
  </table>

  <div class="m-2">
    <button class="btn btn-success pr-hideme"
    :disabled="day.stricted"
     @click="$bvModal.hide('modal-expenses');saveExpenses()" >
      <span class="fa fa-check "></span> &nbsp;
      حفظ
    </button>
  </div>
</b-modal>

<!-- modal_recp Modal <b-modal id="modal-recp" size="xl" class="col-print-12" hide-header
 hide-footer hide-header-close hide-backdrop>-->
<section v-if="modal_recp.serial && receipt_d_mode">
<template>
  <p class="recp-header pr-only" v-if="shader_configs['recp_header'] && ! shader_configs['recp_header'].includes('.png')" v-html="shader_configs['recp_header']"></p>
  <img class=" pr-only" v-if="shader_configs['recp_header'] && shader_configs['recp_header'].includes('.png')"
  :src="require(`@/assets/${shader_configs['recp_header']}`)" 
   style="width: 100%;margin: -25px auto;margin-top: -75px;"/>
</template>
<h4 class="text-center"> فاتورة 
  <span class="pr-hideme">
    ({{modal_recp.serial}})
  </span>

</h4>
<div style="display: grid;grid-template-columns: auto auto;">
  <div >
    <h4 style="
        font-size: 1.5em;
        margin: .5em;
    ">
      تحريراً في {{recp_day | arDate(app_config.shader_name) }}
    </h4>
    <h4 style="
        margin: .5em;margin-top: -.5em;
    ">
      <span style="font-size: .7em;">اسم العميل/ </span> 
      <span style="font-size: 1.1em;">{{supplier.name}}</span>
    </h4>
  </div>
  <div  v-if=" shader_configs['F_SHOW_DEBT_RECP']">
    <h3 class="text-center" > {{'curr_supp_debt' | tr_label}} : {{curr_debt | round | toAR}}</h3>
  </div>
</div>

<img style="margin-top: -450px;float: right;margin-right: 30px;" width="170" class="pr-only"
v-if="app_config.shader_name != 'magdy' && ! shader_configs['recp_header'].includes('.png')"
src='https://i.imgur.com/Ie2KPRE.jpg?1' />
<img style="margin-top: -450px;float: left;margin-left: 30px;" width="170" class="pr-only"
v-if="app_config.shader_name != 'magdy' && ! shader_configs['recp_header'].includes('.png')"
src='https://i.imgur.com/Ie2KPRE.jpg?1' />

<h3 
class="text-center" style="margin-top: -1.5rem;" 
v-if="app_config.shader_name == 'magdy'" >
 حساب سابق : {{ day_balance_was | toAR }}
</h3>
  <div class="table-responsive p-2 m-2" style="border: 2px solid #79ace0; border-radius: 12px;" > 
      <table class="table table-bordered table-sm pr-me-xx" >
        <thead>
          <tr>
            <th>الاجمالي</th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}">عدد </th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}"> الوزن</th>
            <th> </th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}" >سعر 
            </th>
            <th :class="{ 'lrbrdr': app_config.shader_name == 'amn1'}" >الصنف</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in modal_recp.details" 
          :key='idx' 
          
          >
            <td>
              {{item.kg_price *  item.weight | round2 | toAR }}
            </td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" v-model="item.count" class="form-control"  >
              <span v-else>{{item.count | toAR }}</span>
            </td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" v-model="item.weight" class="form-control"  >
              <span v-else>{{item.weight | toAR }}</span>
            </td>
            <td>X</td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" v-model="item.kg_price" class="form-control"  >
              <span v-else> {{item.kg_price | toAR(true) }}</span>
            </td>
            <td >{{item.product_name}} </td>
            <td>
              <span class="fa fa-minus-circle pr-hideme" @click="remove_from_list(modal_recp.details, idx)"
              style="color:red;float: left;"></span>
            </td>
          </tr>
          <tr>
            <td ><b class="border-top border-primary">{{modal_recp.sale_value | round2 | toAR }} </b></td>
            <td >
              <b v-if="modal_recp.details.length && modal_recp.details.length > 1"
              class="border-top border-primary">
                {{ counts.total_count | toAR }}
                </b>
            </td>
            <td colspan="5" class="noborder"></td>
          </tr>
          </tbody>
          </table>
    <div v-if="modal_recp.recp_paid < 1">
      <div v-for="(incom, idx) in inc_headers" :key='idx' class="text-danger" >
        <span v-if="incom.sold_count != incom.recp_in_count "> <span class="fa fa-error"></span> &nbsp;
        صنف {{incom.product_name}} تم بيع {{incom.sold_count | default0 }} طرد  - تم انشاء فواتير بعدد {{incom.recp_in_count | default0}} طرد
        فقط
        <span class="text-primary"
        @click="newRecpDetial(incom)"> اضافة {{parseInt(incom.sold_count) - parseInt(incom.recp_in_count) }}</span>
        </span>
        <br/>
      </div>
    </div>
        <table class="table table-sm pr-me-xx" >
        <tbody>
          <tr class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              :class="{'font-small': app_config.shader_name == 'magdy'}"
              v-model="modal_recp.comm_rate" class="form-control"  >
            </td>
            <td></td>
            <th>
              <span class="pr-hideme">
                
               </span>
            </th>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_comm | round2 | toAR(true) }} )</td>
            <th  :class="{ 'bbordered': app_config.shader_name == 'amn1'}" >عمولة</th>
          </tr>
          <tr v-if="modal_recp.total_nolon" class="noborder">
            <td colspan="7" class="noborder"></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}"><b >( {{modal_recp.total_nolon | round2 | toAR(true) }} )</b></td>
            <td  :class="{ 'bbordered': app_config.shader_name == 'amn1'}">نولون</td>
          </tr>
          <tr v-if="modal_recp.recp_expenses" class="noborder">
            <td colspan="7" class="noborder" ></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}"><b >( {{modal_recp.recp_expenses | round2 | toAR }} )</b></td>
            <td  :class="{ 'bbordered': app_config.shader_name == 'amn1'}">{{ 'recp_expenses' | tr_label }}</td>
          </tr>

          <tr v-if="app_config.shader_name != 'nada' && app_config.shader_name != 'amn1'" class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_deducts" class="form-control" placeholder="ادخل مبلغ الخصم" >
            </td>
            <td></td>
            <td></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_deducts | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">خصم</th>
          </tr>

          <tr class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_given" class="form-control"  >
            </td>
            <td></td>
            <td></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_given | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">
              {{'recp_given' | tr_label}}
            </th>
          </tr>

          <tr v-if="app_config.shader_name != 'nada'" class="noborder">
            <td colspan="4" class="noborder"></td>
            <td >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_others" class="form-control"  >
            </td>
            <td></td>
            <td></td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_others | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">
              {{'recp_others' | tr_label}}
            </th>
          </tr>
          <tr v-if="app_config.shader_name != 'nada'" >
            <td colspan="4" class="noborder"></td>
            <td >
            </td>
            <td></td>
            <td></td>
            <td class="text-danger" :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{ modal_recp.recp_comm +
               modal_recp.total_nolon +
               modal_recp.recp_expenses + 
               modal_recp.recp_deducts + 
               modal_recp.recp_given +
               modal_recp.recp_others | toAR(true)  }})</td>
            <th  :class="{ 'bbordered': app_config.shader_name == 'amn1'}">
              {{'total_disc' | tr_label}}
            </th>
          </tr>
          <tr v-if="app_config.shader_name != 'amn1'">
            <td colspan="2" class="noborder"></td>
            <td class="noborder">صافي الفاتورة</td>
            <td >
              <b class="border-top border-primary" >
                {{modal_recp.net_value | ceil5(app_config.shader_name) | round | toAR }}
              </b>
            </td>
          </tr>
          <tr v-if="app_config.shader_name == 'amn1'">
            <td >
              <b class="border-top border-primary" >
                {{modal_recp.net_value + modal_recp.recp_deducts | round | toAR }}
              </b>
            </td>
            <td class="noborder">اجمالي الفاتورة</td>

          </tr>
          <tr v-if="app_config.shader_name == 'amn1'" class="noborder">
            <td v-if="! print_mode && ! modal_recp.recp_paid" >
              <input v-if="! print_mode && ! modal_recp.recp_paid" 
              onClick="this.select();"
              v-model="modal_recp.recp_deducts" class="form-control" placeholder="ادخل مبلغ الخصم" >
            </td>
            <td :class="{ 'bbordered': app_config.shader_name == 'amn1'}">( {{modal_recp.recp_deducts | round2 | toAR(true) }} )</td>
            <th :class="{ 'bbordered': app_config.shader_name == 'amn1'}">خصم</th>
          </tr>
          <tr v-if="app_config.shader_name == 'amn1'">
            <td >
              <b class="border-top border-primary" >
                {{modal_recp.net_value | round | toAR }}
              </b>
            </td>
            <td class="noborder">صافي الفاتورة</td>

          </tr>
        </tbody>
      </table>

      <div class="m-2 pr-hideme">
          <button class="btn btn-success pr-hideme" 
          v-if="! modal_recp.id || modal_recp.recp_paid == 0"
          @click="saveAll();" >
            <span class="fa fa-check "></span> &nbsp;
            حفظ 
          </button>

          &nbsp;
          <button class="btn btn-primary pr-hideme" 
          :disabled="day.stricted"
          v-if="modal_recp.id && modal_recp.recp_paid != 2"
          @click="setRecpPaid(modal_recp, 2)" >
            <span class="fa fa-money-bill "></span> &nbsp;
            <span v-if="day.stricted"> لا يمكن </span>
            صرف
          </button>
          &nbsp;
          <button class="btn btn-printo pr-hideme" 
            @click="modal_recp.printed = 1 ;print_mode=true;saveAll();print_co()">
            <span class="fa fa-print"></span> طباعة
          </button>

          &nbsp;
          <button class="btn btn-danger pr-hideme" 
          @click="print_mode=false;$bvModal.hide('modal-recp');receipt_d_mode= false;">
          <span class="fa fa-sign-out-alt "></span> &nbsp; اغلاق
          </button>

          &nbsp;
          <button class="btn btn-primary pr-hideme" v-if="modal_recp.id &&  modal_recp.recp_paid != 1 && modal_recp.recp_paid != 2"
          @click="setRecpPaid(modal_recp, 1)" >
            <span class="fa fa-money-bill "></span> &nbsp;
            رصد
          </button>
      </div>

  </div>
      <div class="row">
        <p class="col-9 text-danger pr-me" v-if="app_config.shader_name != 'magdy'">
          * خالص بيد حامله ولا تلغي أي شيكات أو ايصالات امانة
        </p>
        <span class="col-2">
         ف
        {{modal_recp.recp_paid}}
        (م {{modal_recp.serial}})
        </span>
      </div>
      </section>
      <!--</b-modal> -->

  </section>
</template>

<script >
import { InoutHeadCtrl } from '../ctrls/InoutHeadCtrl'
import { CashflowCtrl, CashflowDAO } from '../ctrls/CashflowCtrl'
import { ReceiptDAO, ReceiptsCtrl } from '../ctrls/ReceiptsCtrl'
import { OutgoingsCtrl } from '../ctrls/OutgoingsCtrl'
import { SupplierDAO, SuppliersCtrl } from '../ctrls/SuppliersCtrl'
import draggable  from 'vuedraggable'
import { MainMixin } from '../mixins/MainMixin'
import { TransTypesCtrl } from '../ctrls/TransTypesCtrl'
import {knex} from '../main'
import AlertDay from '@/components/AlertDay.vue'

const { ipcRenderer } = require('electron')

export default {
  name: 'supp-receipts-details',
  data () {
    return {
      recp_day: this.$route.params.day ? this.$route.params.day: this.$store.state.day.iso,
      receipt_d_mode: false,
      show_receipts: {1: false, 2: false, 3: false},
      supplier_id: this.$route.params.supplier_id,
      supplier: new SupplierDAO(),
      inoutHeadCtrl: new InoutHeadCtrl(),
      outgoingsCtrl: new OutgoingsCtrl(),
      receiptsCtrl: new ReceiptsCtrl(),
      cashflowCtrl: new CashflowCtrl(),
      outgoings_sums:[],
      total_nolon: 0,
      recp_expenses: 0,
      recp_expenses_dao: new CashflowDAO({}),
      recp_deducts: 0,
      inc_headers: [],
      today_nolons: [],
      recp_in_sums: {},
      recp_init_comm_rate: this.$store.state.shader_configs['init_recp_comm'] ? parseFloat(this.$store.state.shader_configs['init_recp_comm']) : 0 ,
      recp_init_recp_given: this.$store.state.shader_configs['init_recp_given'] ? parseFloat(this.$store.state.shader_configs['init_recp_given']) : 0 ,
      recp_1: new ReceiptDAO({}),
      recp_2: new ReceiptDAO({}),
      recp_3: new ReceiptDAO({}),
      modal_recp: {},
      day_balance_was: 0,
      curr_debt: 0,
      print_mode: false,
    }
  },
  mixins: [MainMixin],
  methods: {
    async refresh_all(){
      let calc_balance_was = await knex.raw(`select sum(amount) as balance_was from supplier_trans where supplier_id = ${this.supplier_id} and day < '${this.recp_day}'`);
      if(calc_balance_was && calc_balance_was[0] && calc_balance_was[0].balance_was){
        this.day_balance_was = parseFloat(calc_balance_was[0].balance_was)
      }
      let calc_debt = await knex.raw(`select sum(amount) as curr_debt from supplier_trans where supplier_id = ${this.supplier_id}`);

      if(calc_debt && calc_debt[0] && calc_debt[0].curr_debt ){
        this.curr_debt = parseFloat(calc_debt[0].curr_debt)
      }
      this.recp_1 = new ReceiptDAO({serial: 1, recp_given: this.recp_init_recp_given, comm_rate: this.recp_init_comm_rate, ...ReceiptDAO.INIT_DAO})
      this.recp_2 = new ReceiptDAO({serial: 2, comm_rate: this.recp_init_comm_rate, ...ReceiptDAO.INIT_DAO})
      this.recp_3 = new ReceiptDAO({serial: 3, comm_rate: this.recp_init_comm_rate, ...ReceiptDAO.INIT_DAO})

      this.show_receipts= {1: false, 2: false, 3: false}
      this.total_nolon = await this.cashflowCtrl.getSupplierNolons({supplier_id: this.supplier_id, day: this.recp_day})
      // TODO ظبط
      this.recp_expenses_dao = await this.cashflowCtrl.getSupplierRecpExpenses({supplier_id: this.supplier_id, day: this.recp_day})
      this.recp_expenses_dao = this.recp_expenses_dao ? this.recp_expenses_dao : new CashflowDAO({
        state: 'supp_recp_expenses',
        sum: '-',
        amount: 0
      })
      this.recp_expenses = this.recp_expenses_dao.amount 
      this.outgoings_sums = await this.outgoingsCtrl.findSuppDaySums({supplier_id: this.supplier_id, day: this.recp_day})
      this.inc_headers = await this.inoutHeadCtrl.findAll({supplier_id: this.supplier_id, day: this.recp_day})
      let receipts = await this.receiptsCtrl.findAll({supplier_id: this.supplier_id, day: this.recp_day})
      receipts.forEach(receipt => {
        this['recp_'+ receipt.serial] = receipt
        console.log(receipt)
        //this['recp_'+ receipt.serial].details = JSON.parse(receipt.details)
        this.show_receipts[receipt.serial] = true        
      })

      this.today_nolons = await this.cashflowCtrl.findAll({supplier_id: this.supplier_id, day: this.recp_day, state: 'nolon'})
      if(! this.today_nolons.length) {
        this.today_nolons.push(new CashflowDAO({
          state: 'nolon',
          sum: '-',
          supplier_id: this.supplier.id,
          day: this.recp_day,
          amount: 0
        }))
      }
    },
    async recp_changed(){

    },
    async redoReceipt(){
      await this.removeAll()
      await this.addReceipt(1)
    },
    async removeAll(){
      if(this.recp_1.id){
        await this.receiptsCtrl.deleteById(this.recp_1.id)
        await this.cashflowCtrl.rawDelete({receipt_id: this.recp_1.id})
      }
      if(this.recp_2.id){
        await this.receiptsCtrl.deleteById(this.recp_2.id)
        await this.cashflowCtrl.rawDelete({receipt_id: this.recp_2.id})
      }
      if(this.recp_3.id){
        await this.receiptsCtrl.deleteById(this.recp_3.id)
        await this.cashflowCtrl.rawDelete({receipt_id: this.recp_3.id})
      }
        
      // TODO delete also تاريخ الصرف
      // ياخي قحا
      /*
      await this.cashflowCtrl.rawDelete({
        day: this.recp_day,
        supplier_id: this.supplier_id,
        state: 'recp_paid'
      })
      */
      await this.refresh_all()
    },
    async setRecpPaid( receipt, recp_paid ) {
      receipt.recp_paid = recp_paid
      
      if(recp_paid == 2 ){
        let cashflow_id ;
        let cashflowDAO = new CashflowDAO({
          day: this.day.iso,
          supplier_id: this.supplier_id,
          amount: receipt.net_value,
          d_product: receipt.products_arr,
          receipt_id: receipt.id,
          income_day: receipt.day
        })
        let transType = await new TransTypesCtrl().findOne({name: 'recp_paid', category: 'cashflow'})
        cashflowDAO.transType = transType
        cashflow_id = await this.cashflowCtrl.save(cashflowDAO)
        if(cashflow_id) {
          receipt.cashflow_id = cashflow_id;
          await this.saveAll()
        } else {
          // Error
          window.alert('لم يتم صرف الفاتورة يوجد خطأ')
        }
      } else {
        this.saveAll()
      }
    },
    async saveAll(){

      if(this.recp_1.details.length > 0){
        let receipt = new ReceiptDAO({
          ...this.recp_1,
          day: this.recp_day,
          supplier_id: this.supplier_id,
        })
        await this.receiptsCtrl.save(receipt)
      } else if (this.recp_1.id) {
        await this.receiptsCtrl.deleteById(this.recp_1.id)
      }

      if(this.recp_2.details.length > 0){
        let receipt = new ReceiptDAO({
          ...this.recp_2,
          day: this.recp_day,
          supplier_id: this.supplier_id,
        })
        await this.receiptsCtrl.save(receipt)
      } else if (this.recp_2.id) {
        await this.receiptsCtrl.deleteById(this.recp_2.id)
      }

      if(this.recp_3.details.length > 0){
        let receipt = new ReceiptDAO({
          ...this.recp_3,
          day: this.recp_day,
          supplier_id: this.supplier_id,
        })
        await this.receiptsCtrl.save(receipt)
      } else if (this.recp_3.id) {
        await this.receiptsCtrl.deleteById(this.recp_3.id)
      }

      await this.refresh_all()

      if(this.modal_recp.serial && this.receipt_d_mode) {
        this.modal_recp = this['recp_'+ this.modal_recp.serial]
      }
    },
    async saveNolons(){
      let [only_one_nolon] = this.today_nolons;
      await this.cashflowCtrl.save(only_one_nolon);
      this.refresh_all()
    },
    async saveExpenses(){
      this.recp_expenses_dao.day =  this.$store.state.day.iso
      this.recp_expenses_dao.income_day =  this.recp_day
      this.recp_expenses_dao.supplier_id = this.supplier_id
      await this.cashflowCtrl.save(this.recp_expenses_dao)
      this.refresh_all()
    },
    async addReceipt(num){
      this.show_receipts[num] = true
      if(num == 1) {
        let all = this.outgoings_sums.map( dao => this.clone(dao))
        this.recp_1.details = all
        this.recp_1.total_nolon = this.total_nolon
        this.recp_1.balance_was = this.supplier.balance
        this.recp_1.recp_expenses = this.recp_expenses
        this.recp_1.recp_deducts = this.recp_1.recp_deducts? this.recp_1.recp_deducts : this.recp_deducts
        // console.log(this.recp_1)
        this.modal_recp = this['recp_'+ num]
        this.$bvModal.show('modal-recp')
        this.receipt_d_mode = true
      }
    },
    async newRecpDetial(incom) {
      console.log(incom)
      this.modal_recp.details.push({
        supplier_id: this.supplier.id,
        receipt_id: this.modal_recp.id,
        day: this.modal_recp.day,
        count: parseInt(incom.sold_count) - parseInt(incom.recp_in_count),
        product_id: incom.product_id,
        product_name: incom.product_name,
      })
    },
    async watchit(){
      this.inc_headers = await this.inoutHeadCtrl.findAll({supplier_id: this.supplier_id, day: this.recp_day})

      this.recp_1.total_count = 0
      this.recp_1.details.forEach( item => {        
        let index = this.inc_headers.findIndex( _ => _.product_id === item.product_id )
        if(index >= 0){
          //console.log(this.inc_headers[index].recp_in_count , item.count)
          this.inc_headers[index].recp_in_count = this.inc_headers[index].recp_in_count ? parseInt(this.inc_headers[index].recp_in_count) : 0
          this.inc_headers[index].recp_in_count = this.inc_headers[index].recp_in_count + parseInt(item.count)
          //console.log(this.inc_headers[index].recp_in_count , item.count)
        }
        this.recp_1.total_count += parseInt(item.count)
      })

      this.recp_2.total_count = 0
      this.recp_2.details.forEach( item => {        
        let index = this.inc_headers.findIndex( _ => _.product_id === item.product_id )
        if(index >= 0){
          this.inc_headers[index].recp_in_count = this.inc_headers[index].recp_in_count ? parseInt(this.inc_headers[index].recp_in_count) : 0
          this.inc_headers[index].recp_in_count = this.inc_headers[index].recp_in_count + parseInt(item.count)
        }
        this.recp_2.total_count += parseInt(item.count)
      })
      
      this.recp_3.total_count = 0
      this.recp_3.details.forEach( item => {        
        let index = this.inc_headers.findIndex( _ => _.product_id === item.product_id )
        if(index >= 0){
          this.inc_headers[index].recp_in_count = this.inc_headers[index].recp_in_count ? parseInt(this.inc_headers[index].recp_in_count) : 0
          this.inc_headers[index].recp_in_count = this.inc_headers[index].recp_in_count + parseInt(item.count)
        }
        this.recp_3.total_count += parseInt(item.count)
      })
    },
    /**@param {Array} list */
    remove_from_list(list, id) {
      list.splice(id, 1)
    },
    /**@param {OutgoingDAO} dao*/
    clone(dao){
      // Custom clone to return a new Element
      return {
          count: dao.sum_count,
          product_name: dao.product_name,
          product_id:  dao.product_id,
          kg_price: dao.kg_price,
          weight: dao.sum_weight,
          sell_comm: dao.sell_comm
      }
    },
    /**@param {ReceiptDAO} dao*/
    calc_receipt(dao) {
      let sale_value = 0
      let total_count = 0
      dao.details.forEach(item => {
        sale_value += parseFloat(item.weight) * parseFloat(item.kg_price)
        total_count += parseInt(item.count)
      })

      dao.sale_value = sale_value
      // TODO INIT VALUES
      dao.comm_rate = dao.comm_rate ? dao.comm_rate : 0
      dao.recp_comm = Math.round(( dao.comm_rate / 100 ) * sale_value * 100) / 100
      dao.recp_expenses = dao.recp_expenses ? dao.recp_expenses : 0
      dao.recp_deducts = dao.recp_deducts ? dao.recp_deducts : 0
      dao.recp_given = dao.recp_given ? dao.recp_given : 0 
      if(this.shader_configs['init_mashal'])
        dao.recp_others = dao.recp_others ? dao.recp_others 
        : Math.round( total_count * parseFloat(this.shader_configs['init_mashal']))
      else
        dao.recp_others = dao.recp_others ? dao.recp_others : 0
      dao.total_nolon = dao.total_nolon ? dao.total_nolon : 0
      dao.net_value = sale_value - dao.recp_comm - dao.recp_given -  dao.recp_others - dao.recp_expenses - dao.recp_deducts -  dao.total_nolon
    }
  },
  async mounted(){
    //console.log('shader_configs', this.$store.state.shader_configs)
    
    ipcRenderer.on('shortcut_pressed',(event, message)=>{
      console.log(message)
    })
    this.supplier = await new SuppliersCtrl().findById(this.supplier_id)
    if(this.app_config.shader_name == 'amn1' && this.supplier.address){
      try {
        if(JSON.parse(this.supplier.address) && JSON.parse(this.supplier.address).comm_rate)
        this.recp_init_comm_rate = parseFloat(JSON.parse(this.supplier.address).comm_rate)
        console.log(parseFloat(JSON.parse(this.supplier.address).comm_rate))
      } catch (err) {
        console.log(err)
      }
    }
    this.refresh_all()
  },
  computed: {
    counts: function() {
      let counts = { total_count: 0}
      this.modal_recp.details.forEach( item => {
        counts.total_count += parseInt(item.count)
      })
      return counts
    },
    total_diff: function() {
      let total_diff = 0
      this.inc_headers.forEach(one => {
        total_diff += one.diff
      });
      return total_diff;
    }
  },
  watch: {
    modal_recp: {
      /**@param {ReceiptDAO} dao*/
      handler: async function(dao) {
        this.calc_receipt(dao)
      },
      deep: true
    },
    recp_1: {
      handler: async function(dao){ this.calc_receipt(dao) },
      deep: true
    },
    recp_2: {
      handler: async function(dao){ this.calc_receipt(dao) },
      deep: true
    },
    recp_3: {
      handler: async function(dao){ this.calc_receipt(dao) },
      deep: true
    },
    'recp_1.details':{
      handler: async function(){ this.watchit() },
      deep: true
    },
    'recp_2.details':{
      handler: async function(){ this.watchit() },
      deep: true
    },
    'recp_3.details':{
      handler: async function(){ this.watchit() },
      deep: true
    },
  },
  components: {
    draggable,
    AlertDay
  },
}
</script>

<style >
.font-small {
  font-size: x-small
}
.receipt {
  background-color: #cee;
  border-radius: 10px;
}
.drag-area{
  min-height: 4em;
  border: #2f92d8 1px dashed;
  border-radius: 10px;
  padding: 12px;
}
.row-detail label{
  font-weight: bold;
}
@media print {
  .modal-xl {
    margin: 0 !important;
    width: 100%;
    max-width: 100%;
  }
}
</style>
