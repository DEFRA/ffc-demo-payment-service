describe('Pact Verification', () => {
  const { Verifier } = require('@pact-foundation/pact')
  const mockScheduleRepository = require('../unit/server/repository/schedule-repository.mock')
  const path = require('path')

  let createServer
  let server

  beforeAll(async () => {
    jest.mock('../../server/repository/schedule-repository', () => mockScheduleRepository)
    createServer = require('../../server')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.start()
  })

  test('validates the expectations of ffc-demo-payment-web', () => {
    const opts = {
      providerBaseUrl: 'http://localhost:3004',
      provider: 'ffc-demo-payment-service',
      pactUrls: [
        path.resolve(__dirname, './pact/ffc-demo-payment-web-ffc-demo-payment-service.json')
      ]
    }

    return new Verifier(opts).verifyProvider()
  })

  afterEach(async () => {
    await server.stop()
  })
})
