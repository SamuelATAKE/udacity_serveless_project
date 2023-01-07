import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// import { getUserId } from '../utils'
import { getAllTodos } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
// import { parseUserId } from '../../auth/utils'
import { getUserIdByToken } from '../utils'

// import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
// import { getUserId } from '../utils';

const logger = createLogger('GetTodo');

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Event", event);
    // Write your code here
    // logger.info(`huii token sent! ${event.headers.Authorization}`);
    const authorization = event.headers.Authorization;
    // const split: string[] = authorization?.split(' ');
    // var jwtToken: string = getUserIdByToken(authorization);

    logger.info(`This is the token sent! ${authorization}`);
    // if (typeof split !== 'undefined') {
    //   jwtToken = split[1]
    // } else {
    //   logger.info(`Bad token sent! ${jwtToken}`, jwtToken);
    // }

    const userId = getUserIdByToken(authorization);

    if (!userId) {
      return {
        statusCode: 403,
        body: 'You are not authorized to do such action'
      }
    }
    logger.info('In todos stuff');
    const todos = await getAllTodos(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
