import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserIdByToken } from '../utils'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
// import { getUserId } from '../utils';

const logger = createLogger('CreateTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    logger.info(`huii token sent! ${event.headers.Authorization}`);
    // TODO: Implement creating a new TODO item
    const authorization = event.headers.Authorization;
    // const split = authorization.split(' ')
    // const jwtToken = split[1] as string;

    const userId = getUserIdByToken(authorization);

    if (!userId) {
      return {
        statusCode: 403,
        body: 'You are not authorized to do such action'
      }
    }

    const newTodoItem = await createTodo(newTodo, authorization)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newTodoItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
