export class ChatMessage {
  constructor(
    private _uid: string,
    private _chatId: number,
    private _authorId: number,
    private _text: string,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _isEdited: boolean = false,
  ) {}

  static createNew(chatId: number, authorId: number, text: string) {
    const now = new Date();
    return new ChatMessage(
      crypto.randomUUID(),
      chatId,
      authorId,
      text.trim(),
      now,
      now,
      false,
    );
  }

  static restore(
    uid: string,
    chatId: number,
    authorId: number,
    text: string,
    createdAt: Date,
    updatedAt: Date,
    isEdited: boolean,
  ) {
    return new ChatMessage(
      uid,
      chatId,
      authorId,
      text.trim(),
      createdAt,
      updatedAt,
      isEdited,
    );
  }

  get text() {
    return this._text;
  }

  get updatedAt() {
    return this._updatedAt;
  }
  get isEdited(): boolean {
    return this._isEdited;
  }
  edit(newText: string) {
    const text = newText.trim();
    if (!text.length) throw new Error('No empty text');
    if (text === this._text) throw new Error('Same text');

    this._text = text;
    this._updatedAt = new Date();
    this._isEdited = true;
  }

  get Message() {
    return {
      uid: this._uid,
      chatId: this._chatId,
      authorId: this._authorId,
      text: this._text,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isEdited: this._isEdited,
    };
  }
}
