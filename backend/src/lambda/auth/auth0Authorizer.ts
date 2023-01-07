import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
// import * as AWS from 'aws-sdk'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-3qaldrpo2ab3xsa0.us.auth0.com/.well-known/jwks.json';

const jwksUrl = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJekw4+TYxPOGOMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi0zcWFsZHJwbzJhYjN4c2EwLnVzLmF1dGgwLmNvbTAeFw0yMjEyMjEx
NzE1MTVaFw0zNjA4MjkxNzE1MTVaMCwxKjAoBgNVBAMTIWRldi0zcWFsZHJwbzJh
YjN4c2EwLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAM1TEd48eBtQPB3sHQx0PG5NGYc+SL88oEyw6y7Iq7JmH9i+5c/BiXQATAxQ
c2g66V3ZOLEGeqJRUl3Sxs0PLX+kuekSfQi6iee7/R6PfbZ/wfLONsqIWvs3Bgxh
4jgAlQT25npRA4ihDycRG8nhawwRjJQhqMoh7WopxQlZId4/gylBTEpbqSTXrI8J
gD2UXCAp/YldvMhKvVUvvEo/ziBUe/D/yAcz7fI+vbqBNEwVoT7Ik679JKsy3hA+
OpLkRQpXenHxAUYpxcuitbF/k4sYf0UAtaM3DFLbL86cu9wL6hIFVkrxUp90Gv20
GVLmJ9ll8JtFv4jXwgFalspc5tMCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQU2Hk8fJDd9UlpLCC9YX7cgAsKGTgwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBdvhvG4G9D1LQWCLlVx9HsZObYVih6MGX62WGR7dxI
UjMzvDF0zQpwsHGoPJciubHaJ6/fr/Qcc2pKAjq8IVRG65XvfSdH/jS/UXOeaWiR
1Ddo/xAHkH2fJfzdgQFcvj3SH0e5silB9ahEfqcCptLr5qX+dKJP7TqQMfZfz6ha
V85yEsC2jlGK6VVFDqcG16hNrJJK8fc+aiLvYZG44SFCeQcAYKP1UgK22Dfaf2Pk
kv8HIw+zcpgJr0v2Oi9FKHt4gSQVUwF2xP3n+derqAC5NwLlQ4/PdsZvqBbljY2x
zN0GKsLSD9QHh0XF6Ncf2bcZMh8x45FsCNRYwIYm4h9f
-----END CERTIFICATE-----`;

// const secretId = process.env.AUTH_0_SECRET_ID
// const secretField = process.env.AUTH_0_SECRET_FIELD

// const client = new AWS.SecretsManager();

// let cachedSecret: string;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info(`Authorizing a user ${event.authorizationToken}`, event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info(`User was authorized`, jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: JwtPayload = decode(token, { json: true }) as JwtPayload
  
  // const secretObject: any = await getSecret();
  // const secret = secretObject[secretField]
  // logger.info(`The secret is: ${secret}`);
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  // var vf = verify(token, jwksUrl, { algorithms: ['RS256'] }) as JwtPayload;
  // logger.info(`Verifying vf: ${JSON.stringify(vf)}`);
  return verify(token, jwksUrl, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]
  logger.info(`The token is: ${token}`);

  return token
}

// async function getSecret() {
//   if(cachedSecret) return cachedSecret;

//   const data = await client.getSecretValue({
//     SecretId: secretId
//   }).promise();

//   cachedSecret = data.SecretString;

//   return JSON.parse(cachedSecret);
// }

