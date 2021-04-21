<!-- # opt-in-subscriber-updates-processor

[![opt-in-subscriber-updates-processor Pipeline Status](https://badge.parcellab.com/pipeline/opt-in-subscriber-updates-processor-pipeline/status?label=📃%20opt-in-subscriber-updates-processor)](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/opt-in-subscriber-updates-processor-pipeline/view?region=eu-central-1)
[![Deployed opt-in-subscriber-updates-processor Commit](https://badge.parcellab.com/pipeline/opt-in-subscriber-updates-processor-pipeline/commit/id?label=📃%20opt-in-subscriber-updates-processor)](https://badge.parcellab.com/pipeline/opt-in-subscriber-updates-processor-pipeline/commit/url) -->

## What does it do?

Processes opt-in messages subscriber updates from `emarsys-recommendation-updates` SQS and updates `EmarsysReommendaions` DynamoDB Table

Expects SQS messages with the following SQS `body` attribute:

```javascript
{
  "user_id": Number,
  "payload": {
    "event_type": String, // one of ['add', 'delete'],
    "email_hash": String, // SHA256 hash of email address of customer
    // required for 'add*' events only ! - the product recommendation will be presented to the customers in our communication
    "predictSecret": String, 
    "predictUserID": String
  }
}
```

Updates `EmarsysRecommendations` DynamoDB table that uses `event_type` and `user_id` as the primary key.
Moves unprocessable SQS messages to `emarsys-recommendation-updates-failed` deadletter SQS queue after 3 unssucessful receives.

### Event Types

* `add` - adds or overwrites subscriber entry without letting the entry expire automatically
* `delete` - delete subscriber

## How do I run it locally ?

This Lambda application is using [AWS SAM](https://aws.amazon.com/serverless/sam/) to configure, bootstrap and deploy the whole SQS->Lambda->DynamoDB infrastructure (see `./template.yml`).

To run this locally you will need to have the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed and Docker (if you want to invoke the Lambda locally)

```bash
# Build Lambdas with AWS SAM
sam build
# Invoke Lambda with example event (see ./events/* for other test events)
# Note: The event will be running against the actual production DynamoDB
sam local invoke --event events/add-event-sqs.json
```

## How do I run the automated tests ?

All automated tests are placed in `./__tests__` and are executed with Jest.

```bash
npm test
```

<!-- ## How do I deploy it?

Push your changes to `master` and they will be automatically deployed 
via the [opt-in-subscriber-updates-processor-pipeline](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/opt-in-subscriber-updates-processor-pipeline/view?region=eu-central-1) -->
