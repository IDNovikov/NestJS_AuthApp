export class ChatRoom {
  private constructor(
    private id: number | null,
    private _name: string | null,
    private _usersId: number[],
  ) {}

  static createNew(usersId: number[], title?: string): ChatRoom {
    return new ChatRoom(null, title ?? null, usersId);
  }

  static restore(id: number, name: string | null, usersId: number[]): ChatRoom {
    return new ChatRoom(id, name, usersId);
  }

  get isGroup(): boolean {
    return this._usersId.length > 2;
  }

  get title(): string | null {
    return this._name;
  }

  get usersId(): readonly number[] {
    return this._usersId;
  }

  hasUser(userId: number): boolean {
    return this._usersId.includes(userId);
  }

  editName(newTitle: string): void {
    if (!this.isGroup) {
      throw new Error('Private chat cannot have a title');
    }
    this._name = newTitle;
  }

  addUser(userId: number): void {
    if (!this._usersId.includes(userId)) {
      this._usersId.push(userId);
    }
  }

  removeUser(userId: number): void {
    const index = this._usersId.indexOf(userId);
    if (index !== -1) {
      this._usersId.splice(index, 1);
    }
  }

  toObject() {
    return { id: this.id, name: this._name, usersId: this._usersId };
  }
}
