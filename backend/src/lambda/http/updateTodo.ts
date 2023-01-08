import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('UpdateTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info(`The body ${event.body}`);
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    logger.info(`The body ${event.body}`);
    const authorization = event.headers.Authorization;

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const userId = getUserId(event);
    if (!userId) {
      return {
        statusCode: 403,
        body: 'You are not authorized to do such action'
      }
    }
    logger.info(`the todoId: ${todoId}`);
    const updatedTodoItem = await updateTodo(updatedTodo, todoId, authorization);

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: updatedTodoItem
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
