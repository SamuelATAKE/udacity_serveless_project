// import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { TodoAccess } from './todosAcess';

// const XAWS = AWSXRay.captureAWS(AWS)
const todoAccess = new TodoAccess()

// TODO: Implement the fileStogare logic
export async function getPresignedUrl(
    todoImageId: string): Promise<any> {

    return await todoAccess.createAttachmentPresignedUrl(todoImageId);
}