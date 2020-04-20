const payments = require('../../payments')

async function paymentMessageAction (message) {
  try {
    console.log('message received - payment ', message.Body)
    const payment = JSON.parse(message.Body)
    await payments.create(payment)
  } catch (ex) {
    console.error('unable to process message', ex)
  }
}

module.exports = { paymentMessageAction }