const { DefaultAzureCredential } = require('@azure/identity')
const { development, production, test } = require('./constants').environments

function isProd () {
  return process.env.NODE_ENV === production
}

const hooks = {
  beforeConnect: async (cfg) => {
    if (isProd()) {
      const credential = new DefaultAzureCredential()
      console.log('### Credential ###')
      console.log(credential)
      console.log('### End of Credential ###')
      const accessToken = await credential.getToken('https://ossrdbms-aad.database.windows.net')
      console.log('### Access Token ###')
      console.log(accessToken.token)
      console.log('### End of Access Token ###')
      cfg.password = accessToken.token
    }
  }
}

const retry = {
  backoffBase: 500,
  backoffExponent: 1.1,
  match: [/SequelizeConnectionError/],
  max: 10,
  name: 'connection',
  timeout: 60000
}

const dbConfig = {
  database: process.env.POSTGRES_DB || 'ffc_demo_payment_service',
  dialect: 'postgres',
  hooks,
  host: process.env.POSTGRES_HOST || 'ffc-demo-payment-postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  logging: process.env.POSTGRES_LOGGING || false,
  retry,
  schema: process.env.POSTGRES_SCHEMA_NAME || 'public',
  username: process.env.POSTGRES_USERNAME
}

const config = {}
config[development] = dbConfig
config[production] = dbConfig
config[test] = dbConfig

module.exports = config
