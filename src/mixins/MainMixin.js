import { remote } from 'electron'
import { mapState } from 'vuex'
import { moment, knex, selectRaw } from '../main.js'
import { Settings, DateTime } from 'luxon'

Settings.defaultLocale = 'ar'
Settings.defaultZoneName = 'UTC'

const { clipboard } = require('electron')

export const MainMixin = {
  data(){
    return {
      clipboard: clipboard,
      search_term: ''
    }
  },
  computed : {
    ...mapState([
      'day',
      'logged_in_user',
      'app_config',
      'shader_configs',
      'custom_labels',
      'products_arr',
      'closed_days'
    ])
  },
  methods: {
    async print_co(){
      const contents = remote.getCurrentWebContents()
      let silent = this.$store.state.shader_configs['silent_print'] ? this.$store.state.shader_configs['silent_print'] : false ; 
      // override silent
      silent = this.$store.state.app_config.env.NODE_ENV == 'development' ? false : silent ; 
      contents.print({silent: silent })
    },
    async change_day(date) {
      let dateTime = DateTime.fromISO(date)
      let iso = dateTime.toISODate()
      let old_day = this.$store.state.day.should_be
      let [stricted] = await selectRaw(`select closed from daily_close where day = '${iso}'`);
      console.log('%c Mo2Log stricted ', 'background: #bada55',  stricted);
      if(dateTime.valueOf()) {
        this.$store.commit('setDay' ,{
          ts: dateTime.valueOf(),
          iso: iso,
          d_week: dateTime.toLocaleString({ weekday: 'long'}),
          arab: moment(dateTime.toISODate()).format('LL'),
          should_be: old_day,
          stricted: stricted && stricted.closed == 'true' ? true : false
        })
      }
      // get all stricted days
      let all = await selectRaw(`select day,closed from daily_close`);
      let assos = all.reduce((a,b)=>{
        a[b.day]= b.closed == 'true'
        return a;
      },{})
      this.$store.commit('setClosedDays' , assos )
    }
  }
}