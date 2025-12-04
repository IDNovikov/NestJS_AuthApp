import { ChatMessage } from './chat-message.entity';
import { ChatUser } from './chat-user.entity';

export class Chat {
  constructor(
    private _id: number,
    private _name: string | null,
    private _members: ChatUser[],
    private _messages: ChatMessage[],
  ) {}

  static createNew(
    id: number,
    members: ChatUser[],
    messages: ChatMessage[],
    name?: string | null,
  ): Chat {
    if (members.length > 2) throw new Error('Group must have name');
    return new Chat(id, name ?? null, members, messages);
  }

  static restore(
    id: number,
    name: string | null,
    members: ChatUser[],
    messages: ChatMessage[],
  ): Chat {
    return new Chat(id, name ?? null, members, messages);
  }
  get Chat() {
    return {
      id: this._id,
      name: this._name,
      members: this._members,
      messages: this._messages,
    };
  }

  hasUser(userId: number): boolean {
    return this._members.some((m) => m.ChatUser.id === userId);
  }
}
