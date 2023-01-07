import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
    hosts: [esHost],
    connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {

    for (const record of event.Records) {
        console.log('Processing record', JSON.stringify(record))

        if (record.eventName !== 'INSERT') {
            continue;
        }

        const newItem = record.dynamodb.NewImage

        const todoId = newItem.todoId.S

        const body = {
            todoId: newItem.todoId.S,
            userId: newItem.userId.S,
            attachmentUrl: newItem.attachmentUrl.S,
            name: newItem.name.S,
            dueDate: newItem.dueDate.S,
            done: newItem.done.S
        }

        await es.index({
            index: 'images-index',
            type: 'images',
            id: todoId,
            body
        })

    }
}
