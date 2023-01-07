import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

// import { getUserId } from '../utils'
import { getUserId } from '../utils'
import { deleteTodo } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const authorization = event.headers.Authorization;
    const userId = getUserId(event);
    if (!userId) {
      return {
        statusCode: 403,
        body: 'You are not authorized to do such action'
      }
    }

    const deletedTodo = deleteTodo(todoId, authorization);
    if(!deletedTodo) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Problème lors de la suppression'
        })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(deletedTodo)
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
