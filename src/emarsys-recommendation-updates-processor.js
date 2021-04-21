/* eslint-disable camelcase */

const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION
})

const dynamoDBTableName = process.env.DYANMO_DB_TABLE_NAME

const parseFromJSON = stringifiedJSON => {
  try {
    return JSON.parse(stringifiedJSON)
  } catch (error) {
    console.error(`Message could not be parsed due to error: ${error}`)
    throw error
  }
}

const convertToDynamoDbRequestItems = EmarsysRecommendationUpdateEvents => {
  return EmarsysRecommendationUpdateEvents.map(({
    user_id,
    email_hash,
    predict_user_id,
    predict_secret,
    event_type
  }) => {
    switch (event_type) {
      case 'add':
        return {
          PutRequest: {
            Item: {
              user_id,
              email_hash,
              predict_user_id,
              predict_secret
            }
          }
        }
      case 'delete':
        return {
          DeleteRequest: {
            Key: {
              email_hash,
              user_id
            }
          }
        }
      default:
        throw new Error(`Unknown event type: ${event_type}`)
    }
  })
}

const batchWriteOrDeleteSubscribers = async EmarsysRecommendationUpdateEvents => {
  const dynamoDbRequestItems = convertToDynamoDbRequestItems(EmarsysRecommendationUpdateEvents)

  return dynamoDB.batchWrite({
    RequestItems: {
      [dynamoDBTableName]: dynamoDbRequestItems
    }
  }).promise()
}

exports.handler = async ({ Records: records = [] } = {}) => {
  console.info(`Starting to process ${records.length} emarsys-recommendation-updates...`)

  const EmarsysRecommendationUpdateEvents = records.map(({ body }) => {
    const {
      user_id,
      payload: {
        event_type,
        email_hash,
        predict_user_id,
        predict_secret
      } = {}
    } = parseFromJSON(body)

    return {
      user_id,
      event_type,
      email_hash,
      predict_user_id,
      predict_secret
    }
  })

  try {
    await batchWriteOrDeleteSubscribers(EmarsysRecommendationUpdateEvents)
  } catch (error) {
    console.error(`Processing emarsys recommmendation update events failed due to error: ${error}`)
    throw error
  }

  console.info(`Finished processing ${records.length} emarsys recommendation updates!`)
}
