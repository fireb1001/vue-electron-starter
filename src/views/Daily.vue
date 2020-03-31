<template>
  <section class="daily m-3">
    <h2>تغيير اليوم</h2>

    <datetime 
    v-model="luxon_date" 
    @input="change_luxon_date" 
    :auto="true" 
    class="datetime" 
    min-datetime="2019-10-31"
    :max-datetime="max_datetime">
    </datetime>
  </section>
</template>

<script >

import { Settings, DateTime } from 'luxon'
import { MainMixin } from '../mixins/MainMixin'

Settings.defaultLocale = 'ar'
Settings.defaultZoneName = 'UTC'

export default {
  name: 'daily',
  data () {
    return {
      luxon_date: '',
      max_datetime: ''
    }
  },
  methods: {
    async change_luxon_date(date){
      await this.change_day(date)
    }
  },
  mounted () {
    if(this.$store.state.shader_configs && this.$store.state.shader_configs['till_val']) {
      console.log(this.$store.state.shader_configs['till_val'])
      let day = DateTime.fromMillis(parseInt(this.$store.state.shader_configs['till_val']) * 1000)
      this.max_datetime = day.toISODate()
    }
    // this.luxon_date = DateTime.fromISO(this.$store.state.day.iso).toString()
  },
  mixins:[MainMixin],
  components: {
  }
}
</script>

<style scoped >
h2 {
  margin: 0 0 1em;
  border-bottom: solid 1px #ddd;
}
</style>
