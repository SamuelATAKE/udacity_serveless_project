import { decode } from 'jsonwebtoken'
import { createLogger } from '../utils/logger';

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
const logger = createLogger('Auth');

export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  if(!decodedJwt) {
    logger.info('Error while decoding token', jwtToken);
    return null;
  }
  return decodedJwt.sub
}
