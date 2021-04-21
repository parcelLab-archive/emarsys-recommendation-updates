const { handler } = require('../src/emarsys-recommendation-updates-processor')
const dynamodb = require('aws-sdk/clients/dynamodb')

const deleteSqsEvent = require('../events/delete-event-sqs.json')
const addSqsEvent = require('../events/add-event-sqs.json')
const unknownSqsEvent = require('../events/unknown-event-sqs.json')
const allSqsEvents = require('../events/all-events-sqs.json')

describe('emarsys-recommendation-updates-processor.handler', () => {
  let batchWriteSpy

  beforeEach(() => {
    batchWriteSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'batchWrite')
  })

  afterEach(() => {
    batchWriteSpy.mockRestore()
  })

  describe('add event', () => {
    it('should execute without throwing error if DynamoDB write was processed without errors', async () => {
      batchWriteSpy.mockReturnValue({
        promise: () => Promise.resolve()
      })

      await expect(handler(addSqsEvent)).resolves.toBe()

      expect(batchWriteSpy).toHaveBeenCalledWith({
        RequestItems: {
          'emarsys-recommendation-updates-test': [{
            PutRequest: {
              Item: {
                email_hash: 'bdee58fd24f4592bf3395476a4426259c453ba429494d79332e5c8284b1e5401',
                user_id: 1,
                predict_user_id: '1140fdbb9daead74',
                predict_secret: '456caba52cdb2'
              }
            }
          }]
        }
      })
    })

    it('should throw error if DynamoDB add was unsuccesful', async () => {
      batchWriteSpy.mockReturnValue({
        promise: () => Promise.reject(new Error())
      })

      await expect(handler(addSqsEvent)).rejects.toThrow()
    })
  })

  describe('delete event', () => {
    it('should execute without throwing error if DynamoDB delete was processed without errors', async () => {
      batchWriteSpy.mockReturnValue({
        promise: () => Promise.resolve()
      })

      await expect(handler(deleteSqsEvent)).resolves.toBe()

      expect(batchWriteSpy).toHaveBeenCalledWith({
        RequestItems: {
          'emarsys-recommendation-updates-test': [{
            DeleteRequest: {
              Key: {
                email_hash: 'bdee58fd24f4592bf3395476a4426259c453ba429494d79332e5c8284b1e5401',
                user_id: 1
              }
            }
          }]
        }
      })
    })

    it('should throw error if DynamoDB delete was unsuccesful', async () => {
      batchWriteSpy.mockReturnValue({
        promise: () => Promise.reject(new Error())
      })

      await expect(handler(deleteSqsEvent)).rejects.toThrow()
    })
  })

  describe('unknown event', () => {
    it('should throw error if event is unknown', async () => {
      await expect(handler(unknownSqsEvent)).rejects.toThrow()
    })
  })

  describe('all events', () => {
    it('should execute without throwing error if DynamoDB write was processed without errors', async () => {
      batchWriteSpy.mockReturnValue({
        promise: () => Promise.resolve()
      })

      await expect(handler(allSqsEvents)).resolves.toBe()

      expect(batchWriteSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          RequestItems: {
            'emarsys-recommendation-updates-test': expect.arrayContaining([{
              PutRequest: {
                Item: {
                  email_hash: 'bdee58fd24f4592bf3395476a4426259c453ba429494d79332e5c8284b1e5401',
                  user_id: 1,
                  predict_user_id: '1140fdbb9daead74',
                  predict_secret: '456caba52cdb2'
                }
              }
            }, {
              DeleteRequest: {
                Key: {
                  email_hash: 'bdee58fd24f4592bf3395476a4426259c453ba429494d79332e5c8284b1e5401',
                  user_id: 3
                }
              }
            }])
          }
        })
      )
    })

    it('should throw error if DynamoDB add was unsuccesful', async () => {
      batchWriteSpy.mockReturnValue({
        promise: () => Promise.reject(new Error())
      })

      await expect(handler(allSqsEvents)).rejects.toThrow()
    })
  })
})
