export abstract class ChatEventsPort {
  constructor() {}

  abstract publishMessageEdited(event: any): Promise<void>;

  abstract publishMessageSent(event: any): Promise<void>;
}
// domain знает только абстракции:
// где хранится — не важно (Postgres, Mongo, in-memory)
// как рассылаются события — не важно (socket.io, Kafka и т.п.)
