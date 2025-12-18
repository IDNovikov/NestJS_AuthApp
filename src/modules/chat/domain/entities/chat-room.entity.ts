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
    if (this._id === null) {
      throw new Error('ChatRoom not persisted yet');
    }
    return this._id;
  }

  get name() {
    return this._name;
  }

  get members() {
    return this._members;
  }

  get updatedAt() {
    return this._updatedAt;
  }
  get isGroup(): boolean {
    return this._members.length > 2;
  }

  hasUser(userId: number): boolean {
    return this._members.some((m) => m.id === userId);
  }

  editName(newTitle: string): void {
    if (!this.isGroup) {
      throw new Error('Private chat cannot have a title');
    }
    this._name = newTitle;
    this._updatedAt = new Date();
  }

  addUser(member: ChatUser): void {
    if (!this._members.some((m) => m.id === member.id)) {
      this._members.push(member);
    }
    this._updatedAt = new Date();
  }

  removeUser(userId: number): void {
    this._members = this._members.filter((m) => m.id !== userId);
    this._updatedAt = new Date();
  }

  updateMembers(newMembers: ChatUser[]): void {
    const oldIds = new Set(this._members.map((m) => m.id));
    const newIds = new Set(newMembers.map((m) => m.id));

    for (const oldMember of this._members.slice()) {
      if (!newIds.has(oldMember.id)) {
        this.removeUser(oldMember.id);
      }
    }

    if (!this.isGroup) {
      throw new Error('Private chat must have exactly two members');
    }

    for (const m of newMembers) {
      if (!oldIds.has(m.id)) {
        this.addUser(m);
      }
    }
  }

  newUpdate(newMembers: ChatUser[]): void {
    //TODO: Вернуться к этому и изменить логику обновления членов чата
    const oldIds = new Set(this._members.map((m) => m.id));
    const newIds = new Set(newMembers.map((m) => m.id));

    for (const oldMember of this._members) {
      if (!newIds.has(oldMember.id)) {
        this.removeUser(oldMember.id);
      }
    }

    if (!this.isGroup) {
      throw new Error('Private chat must have exactly two members');
    }

    for (const m of newMembers) {
      if (!oldIds.has(m.id)) {
        this.addUser(m);
      }
    }
  }
}
