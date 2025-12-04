import { ChatUser } from './chat-user.entity';

interface IDBChatRoom {
  id: number;
  name: string | null;
  members: { id: number; userName: string; userImage: string | null }[];
  createdAt: Date;
  updatedAt: Date;
}
export class ChatRoom {
  private constructor(
    private _id: number | null,
    private _name: string | null,
    private _members: ChatUser[],
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static createNew(members: ChatUser[], title?: string | null): ChatRoom {
    const now = new Date();
    return new ChatRoom(null, title ?? null, members, now, now);
  }

  static restore(props: IDBChatRoom): ChatRoom {
    const members = props.members.map((m) =>
      ChatUser.restore(m.id, m.userName, m.userImage),
    );

    return new ChatRoom(
      props.id,
      props.name,
      members,
      props.createdAt,
      props.updatedAt,
    );
  }
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get members() {
    return this._members;
  }

  get createdAt() {
    return this._createdAt;
  }
  get isGroup(): boolean {
    return this._members.length > 2;
  }

  hasUser(userId: number): boolean {
    return this._members.some((m) => m.ChatUser.id === userId);
  }

  editName(newTitle: string): void {
    if (!this.isGroup) {
      throw new Error('Private chat cannot have a title');
    }
    this._name = newTitle;
  }

  addUser(member: ChatUser): void {
    if (!this._members.some((m) => m.ChatUser.id === member.ChatUser.id)) {
      this._members.push(member);
    }
  }

  removeUser(userId: number): void {
    this._members = this._members.filter((m) => m.ChatUser.id !== userId);
  }
}
