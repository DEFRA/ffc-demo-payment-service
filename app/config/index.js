const Joi = require('joi')
const mqConfig = require('./mq-config')
const eventConfig = require('./event-config')
const dbConfig = require('./database-config')
const { development, production, test } = require('./constants').environments

// Define config schema
const schema = Joi.object({
  port: Joi.number().default(3004),
  env: Joi.string().valid(development, test, production).default(development)
})

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the Joi validated value
const value = result.value

// Add some helper props
value.isDev = value.env === development
value.isProd = value.env === production

value.scheduleSubscription = mqConfig.scheduleSubscription
value.paymentSubscription = mqConfig.paymentSubscription

value.dbConfig = dbConfig
value.eventConfig = eventConfig

module.exports = value
