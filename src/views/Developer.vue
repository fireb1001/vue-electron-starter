<template>
<section class="home p-3">
  <div class="m-3">
    <h1 class="m-1 text-center">نظام وكالة الخضار والفاكهة</h1>
    <h2 class="text-danger"> اصدار رقم {{app_version}}</h2>
    <div v-if="! shader_configs['till_hide']" >
      <h3 class="text-danger" v-if="shader_configs['till_val'] != 'open'">* نسخة تجريبية حتي 
        {{ this.shader_configs['till_val'] * 1000  | arDate}}
      </h3>
      <h3 class="text-success" v-else>* نسخة مرخصة</h3>
    </div>

    <section v-if=" working_db">
      <button class="btn btn-danger btn-lg" @click="remove_db()" >
        <span class="fa fa-database "></span> &nbsp;
        مسح قاعدة البيانات الموجودة
      </button>
    </section>
    <section v-else>
      <h3 >
        تم قراءة ملف نسخة قاعدة بيانات, تاريخ اخر تحديث له
        {{db_file.time_updated}}
      </h3>
      <button :disabled="! db_file.found" class="btn btn-primary btn-lg" @click="import_db()" >
        <span class="fa fa-database "></span> &nbsp;
        استيراد قاعدة البيانات
      </button>
      <pre>
        File: {{db_file.filename}}
        TO: {{ $store.state.app_config.user_data_path }}
      </pre>
      <br/>
      <button v-if="removed_exists" class="btn btn-danger btn-lg" @click="restore_removed()" >
        <span class="fa fa-database "></span> &nbsp;
        استعادة ملف قاعدة البيانات الذي تم حذفه
      </button> &nbsp;
    </section>
     <br/>
      <button class="btn btn-secondary btn-lg" @click="reload_electron()" >
        <span class="fa fa-sync "></span> &nbsp;
        اعادة تشغيل البرنامج
      </button>
       <br/><br/>
      <button class="btn btn-secondary btn-lg" 
      @click="disconnect_db()" >
        <span class="fa fa-bell-slash "></span> &nbsp;
        database disconnect
      </button>

  </div>
  {{app_config.shader_name}}

  <div v-if=" app_config.env.NODE_ENV == 'development' || (logged_in_user && logged_in_user.user_type =='developer')">

    <div>Check if 7z installed {{is_7z_ok}}</div>
    <div>Check if Curl installed {{is_curl_ok}}</div>
    
    <pre>{{ $store.state.app_config }}</pre>
    

      <h5 class="card-title">System printers </h5>
      <p class="card-text">{{printers}}</p>
      <a href="#" @click="checkAll()" class="btn btn-primary">فحص حالة الجهاز</a> 
      <span>&nbsp;</span>
      <a href="#" @click="print_co()" class="btn btn-primary">print</a>
      <span>&nbsp;</span>
      <a href="#" @click="wb_backup()" class="btn btn-primary">wb backup</a>
      <span>&nbsp;</span>
      <a href="#" @click="wb_restore()" class="btn btn-primary">استيراد من الويب</a>
  </div>
</section>
</template>

<script >
import { sync_exec, knex } from '../main'
import { remote, clipboard } from 'electron'
import { MainMixin } from '../mixins/MainMixin'
import { ProductsCtrl } from '../ctrls/ProductsCtrl';
const fs = require('fs')

export default {
  name: 'home',
  data() {
    return {
      is_7z_ok: null,
      is_curl_ok: null,
      removed_exists: false,
      printers: [],
      working_db: false,
      db_file:{found: false, time_updated: null, filename:null},
      app_version: remote.app.getVersion(),
    }
  },
  mixins: [MainMixin],
  components: {
  },
  async mounted() {
    console.log(this.shader_configs);
    try {
      /*
      let [result] = await knexraw('PRAGMA integrity_check;')
      console.log("integrity_check : ",result)
      */
      await new ProductsCtrl().findAll()
      this.working_db = true
    } catch (error) {
      console.error("mounted error for Developer")
      let if_exists_outp = await sync_exec(`IF exist ${this.$store.state.app_config.user_data_path}\\db\\shaderlite.db echo file_exists`)
      if(if_exists_outp.stdout.includes('file_exists')){
        this.removed_exists = true
      }

      const fs = require('fs');
      const moment = require('moment')
      moment.locale('ar')
      let lastModifiedDay = ''
      fs.readdir('D:\\00_db', async (err, files) => {
        files.forEach(file => {
          let fileday = (file.split(/-(.+)/)[1]) ? file.split(/-(.+)/)[1].split('.')[0] : null
          if(fileday > lastModifiedDay) {
            lastModifiedDay = fileday

            this.db_file.filename = file
            this.db_file.found = true

            let {mtimeMs} = fs.statSync('D:\\00_db'+ '\\'+ this.db_file.filename)
            this.db_file.time_updated = moment(mtimeMs).format('LLL')
          }
        })
      })
    }
  },
  methods: {

    async wb_backup(){
      // await knex.destroy()
      await sync_exec(`copy ${this.$store.state.app_config.user_data_path}\\db\\shaderlite.db D:\\00_db\\shaderlite.db`)
      await sync_exec(`C:\\PROGRA~1\\7-Zip\\7z a D:\\00_db\\shaderlite.7z D:\\00_db\\shaderlite.db`)
      // const {stdout} = await sync_exec(`curl -F "file=@D:\\00_db\\shaderlite.7z" https://file.io/?expires=1y `)
      const AUTH_TOKEN = 'c5e170c709000a78ef8fce5354e0854e01a6bd88' // fireb1001
      const upload_rel_url = `https://uploads.github.com/repos/fireb1001/shaderlite/releases/22823084/assets`
        + `?name=shaderlite-${this.$store.state.app_config.shader_name}-${Date.now()}.7z`
      const Z_FILE = 'D:\\00_db\\shaderlite.7z'
      let cmd = `curl -H "Authorization: token ${AUTH_TOKEN}" -H "Content-Type: application/x-7z-compressed" --data-binary @${Z_FILE}  "${upload_rel_url}" `;
      console.log(cmd)
      const {stdout} = await sync_exec(cmd)
      console.log(JSON.parse(stdout))
      clipboard.writeText(JSON.parse(stdout).browser_download_url)
      window.alert('تم نسخ رابط قاعدة البيانات '+ JSON.parse(stdout).browser_download_url)
    },
    async wb_restore(){
      // await knex.destroy()
      let url = clipboard.readText()
      // use redirect -L option to follow redirect link and direct the output
      await sync_exec(`curl -L ${url} --output ${this.$store.state.app_config.user_data_path}\\db\\shaderlite.7z`)
      this.reload_electron()
      
    },
    async import_db(){
      await sync_exec(`IF not exist ${this.$store.state.app_config.user_data_path}\\db mkdir ${this.$store.state.app_config.user_data_path}\\db NUL`)
      await sync_exec(`copy D:\\00_db\\${this.db_file.filename} ${this.$store.state.app_config.user_data_path}\\db\\shaderlite.db`)
      if(window.confirm(' تم استيراد قاعدة البيانات بنجاح, سيتم اعادة تشغيل البرنامج')){
        this.reload_electron()
      }
    },
    async remove_db(){
      if(window.confirm('هل انت متأكد من مسح قاعدة البيانات الحالية')){
        await knex.destroy()
        await sync_exec(`del ${this.$store.state.app_config.user_data_path}\\db\\_shaderlite.db`)
        let output = await sync_exec(`rename ${this.$store.state.app_config.user_data_path}\\db\\shaderlite.db _shaderlite.db `)
        console.log('output', output)
        this.reload_electron()
      }
    },
    async restore_removed(){
      await knex.destroy()
      let remove = await sync_exec(`del ${this.$store.state.app_config.user_data_path}\\db\\shaderlite.db`)
      console.log(remove)
      let output = await sync_exec(`rename ${this.$store.state.app_config.user_data_path}\\db\\_shaderlite.db shaderlite.db `)
      console.log(output)
      this.reload_electron()
    },
    reload_electron(){
      remote.getCurrentWindow().reload();
    },
    disconnect_db(){
      knex.destroy()
    },
    async checkAll(){
      
      //var exec = require('child_process').exec
      try {
        let out = await sync_exec('C:\\PROGRA~1\\7-Zip\\7z -h ');
        // check 7z valid
        console.log(out.stdout);
        this.is_7z_ok = true;

        try {
          out = await sync_exec('curl -h ');
          this.is_curl_ok = true
        } catch (error) {
          console.error(error)
        }
        // check 7z valid
        console.log(out.stdout);
        const contents = remote.getCurrentWebContents()
        this.printers = contents.getPrinters()
        contents.print()
        // contents.printToPDF(options, callback)
        contents.printToPDF({/*pageSize:"A5"*/}, (error, data) => {
          if (error) throw error
          fs.writeFile('D:/tmp/print.pdf', data, (error) => {
            if (error) throw error
            console.log('Write PDF successfully.')
          })
        })
      } catch (error) {
        this.is_7z_ok = false
        console.error("7z Error: ", error)
      }
    }
  }
}
</script>
