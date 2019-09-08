import { remote } from 'electron'
import { mapState } from 'vuex'
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
      'shader_configs',
      'custom_labels',
      'products_arr'
    ])
  },
  methods: {
    print_co(){
      const contents = remote.getCurrentWebContents()
      contents.print({silent: true })
    },
  }
}