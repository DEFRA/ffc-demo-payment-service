const dbHelper = require('../../../db-helper')
const scheduleService = require('../../../../app/schedule')

describe('Payment service test', () => {
  beforeEach(async () => {
    await dbHelper.truncate()
  })

  afterAll(async () => {
    await dbHelper.close()
  })

  test('create creates payment schedules', async () => {
    const claim = {
      claimId: 'MINE001'
    }
    const startDate = new Date(2020, 2, 8)
    await scheduleService.createSchedule(claim, startDate)
  })

  test('getById returns payment schedules in descending order by date', async () => {
    const claim = {
      claimId: 'MINE003'
    }
    const startDate = new Date(2020, 3, 7)
    await scheduleService.createSchedule(claim, startDate)
    const result = await scheduleService.getById(claim.claimId)
    expect(result.length).toEqual(6)
    expect(result.every(r => r.claimId === claim.claimId)).toEqual(true)
    expect(result[0].paymentDate).toEqual(new Date(2020, 9, 1))
    expect(result[1].paymentDate).toEqual(new Date(2020, 8, 1))
    expect(result[2].paymentDate).toEqual(new Date(2020, 7, 1))
    expect(result[3].paymentDate).toEqual(new Date(2020, 6, 1))
    expect(result[4].paymentDate).toEqual(new Date(2020, 5, 1))
    expect(result[5].paymentDate).toEqual(new Date(2020, 4, 1))
  })

  test('create does not created schedule if already exists', async () => {
    const claim = {
      claimId: 'MINE003'
    }
    const startDate = new Date(2020, 3, 7)
    await scheduleService.createSchedule(claim, startDate)
    await scheduleService.createSchedule(claim, startDate)
    const result = await scheduleService.getById(claim.claimId)
    expect(result.length).toEqual(6)
    expect(result.every(r => r.claimId === claim.claimId)).toEqual(true)
    expect(result[0].paymentDate).toEqual(new Date(2020, 9, 1))
    expect(result[1].paymentDate).toEqual(new Date(2020, 8, 1))
    expect(result[2].paymentDate).toEqual(new Date(2020, 7, 1))
    expect(result[3].paymentDate).toEqual(new Date(2020, 6, 1))
    expect(result[4].paymentDate).toEqual(new Date(2020, 5, 1))
    expect(result[5].paymentDate).toEqual(new Date(2020, 4, 1))
  })

  test('getAll returns all claims in descending order by date', async () => {
    const claim1 = {
      claimId: 'MINE001'
    }
    const claim2 = {
      claimId: 'MINE002'
    }
    const startDate1 = new Date(2020, 3, 7)
    const startDate2 = new Date(2020, 4, 7)
    await scheduleService.createSchedule(claim1, startDate1)
    await scheduleService.createSchedule(claim2, startDate2)
    const result = await scheduleService.getAll()
    expect(result.length).toEqual(12)
    expect(result[0].paymentDate).toEqual(new Date(2020, 10, 1))
    expect(result[1].paymentDate).toEqual(new Date(2020, 9, 1))
    expect(result[2].paymentDate).toEqual(new Date(2020, 9, 1))
    expect(result[3].paymentDate).toEqual(new Date(2020, 8, 1))
    expect(result[4].paymentDate).toEqual(new Date(2020, 8, 1))
    expect(result[5].paymentDate).toEqual(new Date(2020, 7, 1))
    expect(result[6].paymentDate).toEqual(new Date(2020, 7, 1))
    expect(result[7].paymentDate).toEqual(new Date(2020, 6, 1))
    expect(result[8].paymentDate).toEqual(new Date(2020, 6, 1))
    expect(result[9].paymentDate).toEqual(new Date(2020, 5, 1))
    expect(result[10].paymentDate).toEqual(new Date(2020, 5, 1))
    expect(result[11].paymentDate).toEqual(new Date(2020, 4, 1))
  })
})
