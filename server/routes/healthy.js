const databaseService = require('../services/database-service')

const SERVICE_UNAVAILABLE = 503
const OK = 200

module.exports = {
  method: 'GET',
  path: '/healthy',
  options: {
    handler: async (request, h) => {
      try {
        if (await databaseService.isConnected()) {
          return h.response('ok').code(OK)
        }
        return h.response('service unavailable').code(SERVICE_UNAVAILABLE)
      } catch (ex) {
        console.error('error running healthy check', ex)
        return h.response(`error running healthy check: ${ex.message}`).code(SERVICE_UNAVAILABLE)
      }
    }
  }
}
