export type DomainEvent =
  | { type: "AvailabilityIncreased"; eventId: number; slotId: number; qty: number; at: Date }
  | { type: "SubscriptionTriggered"; subscriptionId: number; eventId: number; at: Date };

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
}
