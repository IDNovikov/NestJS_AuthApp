export class ChatUser {
  constructor(
    private _id: number,
    private _userName: string,
    private _userImage: string | null,
  ) {}

  static createNew(
    id: number,
    userName: string,
    userImage?: string | null,
  ): ChatUser {
    return new ChatUser(id, userName, userImage ?? null);
  }

  static restore(id: number, userName: string, userImage?: string | null) {
    return new ChatUser(id, userName, userImage ?? null);
  }
  get ChatUser() {
    return {
      id: this._id,
      userName: this._userName,
      userImage: this._userImage,
    };
  }
}
