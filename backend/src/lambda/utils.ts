import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import { createLogger } from "../utils/logger";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */

const logger = createLogger('Auth');

export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization: string = event?.headers?.Authorization
  const split: string[] = authorization?.split(' ');
  var jwtToken: string = '';
  if (typeof split !== 'undefined') {
    jwtToken = split[1]
  } else {
    logger.info(`Bad token sent! ${jwtToken}`, jwtToken);
  }

  return parseUserId(jwtToken)
}

export function getUserIdByToken(jwtToken: string): string {
  const split = jwtToken.split(' ')
  const token = split[1]
  return parseUserId(token);
}