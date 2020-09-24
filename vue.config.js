module.exports = {
    pluginOptions: {
      electronBuilder: {
        builderOptions: {
          // options placed here will be merged with default configuration and passed to electron-builder
          icon: 'src/assets/app_new.ico',
          extraResources: ['./assets/**/*'],// removed './db/**/*',
          extraFiles: ['./progs/**/*']
        }
      }
    },

    configureWebpack:  {
        externals: {
          //sqlite3: 'sqlite3',
          //'mysql': 'mysql',
          'mariasql': 'mariasql',
          'mssql': 'mssql',
          'oracle': 'oracle',
          'strong-oracle': 'strong-oracle',
          'oracledb': 'oracledb',
          'pg': 'pg',
          'pg-query-stream': 'pg-query-stream',
        },
    }

}