import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

const bucketName = process.env.ATTACHMENT_S3_BUCKET
// const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: 'CreatedAtIndex',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ExpressionAttributeNames: {
        '#u': 'userId'
      },
      KeyConditionExpression: '#u = :userId'
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todo: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
    if (todo.attachmentUrl) {
      await this.docClient.update({
        TableName: this.todosTable,
        Key: { 'todoId': todoId, 'userId': userId },
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          // ':done': todo.done
          ':attachmentUrl': todo.attachmentUrl
        },
        ExpressionAttributeNames: {
          "#n": "name",
          "#dd": "dueDate",
          // "#d": "done"
          '#url': "attachmentUrl"
        },
        UpdateExpression: 'set #n = :name, #dd = :dueDate, #url = :attachmentUrl'
      }).promise()
    } else {
      await this.docClient.update({
        TableName: this.todosTable,
        Key: { 'todoId': todoId, 'userId': userId },
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        },
        ExpressionAttributeNames: {
          "#n": "name",
          "#dd": "dueDate",
          "#d": "done"
        },
        UpdateExpression: 'set #n = :name, #dd = :dueDate, #d = :done'
      }).promise()
    }


    return todo
  }

  async deleteTodo(id: string, userId: string): Promise<any> {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: { 'todoId': id, 'userId': userId }
    }).promise()

    return id
  }

  async createAttachmentPresignedUrl(todoImageId: string): Promise<any> {
    logger.info('getting the signed url');
    // return await s3.getSignedUrl('putObject', {
    //   Bucket: bucketName,
    //   Key: todoImageId,
    //   Expires: urlExpiration
    // })
    // return await s3.putObject({
    //   Bucket: bucketName,
    //   Key: todoImageId,
    //   Body: JSON.stringify({createdAt: Date.now()}),
    //   ContentType: 'application/json',
    //   ContentEncoding: 'gzip'
    // }).promise();
    return await s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoImageId
    });
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient();
}

