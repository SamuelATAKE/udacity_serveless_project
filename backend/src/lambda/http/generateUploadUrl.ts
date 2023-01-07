import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { createAttachmentPresignedUrl, getAllTodos, updateTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

// const bucketName = process.env.ATTACHMENT_S3_BUCKET

const logger = createLogger('GenerateUpload');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const authorization = event.headers.Authorization;

    const userId = getUserId(event);
    if (!userId) {
      return {
        statusCode: 403,
        body: 'You are not authorized to do such action'
      }
    }

    const presignedUrl = await createAttachmentPresignedUrl(todoId);

    const todos = await getAllTodos();

    var todo: TodoItem;

    todos.forEach(element => {
      if (element.todoId === todoId) {
        todo = element;
      }
    });
    logger.info(`The presigned url: ${presignedUrl}`);
    logger.info(`The todo is: ${JSON.stringify(todo)}`);
    
    var jsonTodo = {
      "done": false,
      "dueDate": null,
      "name": null,
      "attachmentUrl": null
    }

    const rTodo: UpdateTodoRequest = JSON.parse(JSON.stringify(jsonTodo));
    logger.info(`The todo upd: ${JSON.stringify(rTodo)}`);
    rTodo.done = todo.done;
    rTodo.dueDate = todo.dueDate;
    rTodo.name = todo.name;
    rTodo.attachmentUrl = presignedUrl.split('?')[0];

    logger.info(`The todo is updating`);

    const updatedTodo = await updateTodo(rTodo, todoId, authorization);

    logger.info(`The todo is: ${JSON.stringify(updatedTodo)}`);
    if (!updatedTodo) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Erreur lors de la mise à jour!'
        })
      }
    }
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({
    //     uploadUrl: `https://${bucketName}.s3.amazonaws.com/${presignedUrl.Etag}`
    //   })
    // }
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: presignedUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
