import {
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GetChatsDTO } from '../../application/dto/get-chats.dto';
import { GetMessagesDto } from '../../application/dto/get-messages.dto';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { CreateChatDTO } from '../dto/create-Chat.dto';

export class ChatSwagger {
  // Chats

  static GetMyChats = [
    ApiOperation({ summary: 'Get user chats (cursor pagination)' }),
    ApiOkResponse({
      description: 'List of chat rooms',
      schema: {
        example: [
          {
            id: 10,
            name: 'General chat',
            members: [
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
            ],
            createdAt: '2025-11-18T12:45:30.032Z',
            updatedAt: '2025-11-18T12:45:30.032Z',
          },
        ],
      },
    }),
  ];

  static AdminGetUserChats = [
    ApiOperation({ summary: 'Get user chats (cursor pagination) ADMIN ONLY' }),
    ApiQuery({
      type: GetChatsDTO,
      required: false,
      description: 'Cursor pagination params',
    }),
    ApiOkResponse({
      description: 'List of chat rooms',
      schema: {
        example: [
          {
            id: 10,
            name: 'General chat',
            members: [
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
            ],
            createdAt: '2025-11-18T12:45:30.032Z',
            updatedAt: '2025-11-18T12:45:30.032Z',
          },
        ],
      },
    }),
  ];

  static CreateChat = [
    ApiOperation({ summary: 'Create new chat' }),
    ApiBody({
      type: CreateChatDTO,
      examples: {
        example: {
          summary: 'Create group chat',
          value: {
            name: 'Backend team',
            members: [
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
            ],
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Created chat room',
      schema: {
        example: {
          id: 15,
          name: 'Backend team',
          members: [
            {
              id: 'userId:number',
              userName: 'string',
              userImage: 'string',
            },
            {
              id: 'userId:number',
              userName: 'string',
              userImage: 'string',
            },
          ],
          createdAt: '2025-11-18T13:00:00.100Z',
          updatedAt: '2025-11-18T13:00:00.100Z',
        },
      },
    }),
  ];

  static UpdateChat = [
    ApiOperation({ summary: 'Update chat data' }),
    ApiParam({
      name: 'chatId',
      example: 15,
      description: 'Chat ID',
    }),
    ApiBody({
      type: CreateChatDTO,
      examples: {
        example: {
          summary: 'Rename chat',
          value: {
            name: 'Updated chat name',
            members: [
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
              {
                id: 'userId:number',
                userName: 'string',
                userImage: 'string',
              },
            ],
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Updated chat room',
      schema: {
        example: {
          id: 15,
          name: 'Updated chat name',
          members: [
            {
              id: 'userId:number',
              userName: 'string',
              userImage: 'string',
            },
            {
              id: 'userId:number',
              userName: 'string',
              userImage: 'string',
            },
          ],
          createdAt: '2025-11-18T13:00:00.100Z',
          updatedAt: '2025-11-18T13:10:00.500Z',
        },
      },
    }),
  ];

  // Messages

  static GetMessages = [
    ApiOperation({ summary: 'Get chat messages (cursor pagination)' }),
    ApiParam({
      name: 'chatId',
      example: 15,
      description: 'Chat ID',
    }),
    ApiQuery({
      type: GetMessagesDto,
      required: false,
      description: 'Cursor pagination params',
    }),
    ApiOkResponse({
      description: 'Chat messages with cursor',
      schema: {
        example: {
          messages: [
            {
              id: 100,
              chatId: 15,
              authorId: 1,
              text: 'Hello world',
              createdAt: '2025-11-18T13:15:00.000Z',
              updatedAt: '2025-11-18T13:15:00.000Z',
            },
          ],
          nextCursor: 'eyJpZCI6MTAwfQ==',
        },
      },
    }),
  ];
  static AdminGetMessages = [
    ApiOperation({
      summary: 'Get chat messages (cursor pagination) ADMIN ONLY',
    }),
    ApiParam({
      name: 'userId',
      example: 15,
      description: 'User ID',
    }),
    ApiParam({
      name: 'chatId',
      example: 15,
      description: 'Chat ID',
    }),
    ApiQuery({
      type: GetMessagesDto,
      required: false,
      description: 'Cursor pagination params',
    }),
    ApiOkResponse({
      description: 'Chat messages with cursor',
      schema: {
        example: {
          messages: [
            {
              id: 100,
              chatId: 15,
              authorId: 1,
              text: 'Hello world',
              createdAt: '2025-11-18T13:15:00.000Z',
              updatedAt: '2025-11-18T13:15:00.000Z',
            },
          ],
          nextCursor: 'eyJpZCI6MTAwfQ==',
        },
      },
    }),
  ];
  static SendMessage = [
    ApiOperation({ summary: 'Send message to chat' }),
    ApiParam({
      name: 'chatId',
      example: 15,
      description: 'Chat ID',
    }),
    ApiBody({
      type: SendMessageDto,
      examples: {
        example: {
          summary: 'Send text message',
          value: {
            text: 'Hello everyone!',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Created chat message',
      schema: {
        example: {
          id: 'b67cdafc-7e42-4038-834f-dae03545050a',
          chatId: 15,
          authorId: 1,
          text: 'Hello everyone!',
          createdAt: '2025-11-18T13:20:00.000Z',
          updatedAt: '2025-11-18T13:20:00.000Z',
        },
      },
    }),
  ];

  static EditMessage = [
    ApiOperation({ summary: 'Edit chat message' }),
    ApiOkResponse({
      description: 'Updated chat message',
      schema: {
        example: {
          id: 101,
          chatId: 15,
          authorId: 1,
          text: 'Updated message text',
          createdAt: '2025-11-18T13:20:00.000Z',
          updatedAt: '2025-11-18T13:25:00.500Z',
        },
      },
    }),
  ];
}
