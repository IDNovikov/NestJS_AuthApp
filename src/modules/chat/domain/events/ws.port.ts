export abstract class ChatEventsPort {
  constructor() {}

  abstract publishMessageEdited(event: any): Promise<void>;

  abstract publishMessageSent(event: any): Promise<void>;
}
