import { TodoAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';
import { getUserIdByToken } from '../lambda/utils';
import { getPresignedUrl } from './attachmentUtils'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todoAccess = new TodoAccess()

const logger = createLogger('todo')

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('All todos sent');
    return await todoAccess.getAllTodos(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = getUserIdByToken(jwtToken);

    logger.info('New todo created', itemId);

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        attachmentUrl: createTodoRequest.attachmentUrl ?? null,
        done: false
    })
}

export async function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    jwtToken: string
): Promise<TodoUpdate> {
    logger.info('Todo updated ', todoId);
    const userId = getUserIdByToken(jwtToken);
    return await todoAccess.updateTodo(updateTodoRequest, todoId, userId)
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
): Promise<any> {
    logger.info('Todo deleted ', todoId);

    const userId = getUserIdByToken(jwtToken);
    return await todoAccess.deleteTodo(todoId, userId);
}

export async function createAttachmentPresignedUrl(
    todoImageId: string): Promise<any> {
    logger.info('Attachment presigned url created ', todoImageId);
    var url = await getPresignedUrl(todoImageId);
    logger.info(`The pre-signed url: ${url}`);
    return url;
}


