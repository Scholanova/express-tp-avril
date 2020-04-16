module.exports = {
  development: {
    username: 'postgres',
    password: 'admin',
    database: 'scholanova_express_3_development',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: (msg) => console.log('[DATABASE]', msg)
  },
  test: {
    username: 'postgres',
    password: 'admin',
    database: 'scholanova_express_3_test',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: 'postgres',
    password: 'admin',
    database: 'scholanova_express_3_production',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: (msg) => console.log('[DATABASE]', msg)
  }
}
