export enum EventType {
    ActiveShapeChangedEventType,
    ActiveShapeEndedEventType,
    BoardFilledEventType,
    CellChangeEventType,
    NpcMovementChangedEventType,
    NpcPlacedEventType,
    NpcStateChagedEventType,
    PlayerMovementEventType,
    RowsFilledEventType,
    StandeeMovementEndedEventType
}

export abstract class AbstractEvent {
    abstract getType():EventType
}

export interface EventHandler<T extends AbstractEvent> {
    (event: T):void;
}

class EventBus {

    private handlersByType:Map<EventType, EventHandler<AbstractEvent>[]>;

    constructor() {
        this.handlersByType = new Map<EventType, EventHandler<AbstractEvent>[]>();
    }

    register(type:EventType, handler:EventHandler<AbstractEvent>) {
        if (!type) {
            // TODO: something
        }

        if (!handler) {
            // TODO: something
        }

        let handlers:EventHandler<AbstractEvent>[] = this.handlersByType.get(type);
        if (handlers === undefined) {
            handlers = [];
            this.handlersByType.set(type, handlers);
        }
        handlers.push(handler);

        // TODO: Return a function that can be called to unregister the handler
    }
    
    // TODO: unregister(). And remove the map key if zero handlers left for it.
    
    // TODO: Prevent infinite fire()?
    fire(event:AbstractEvent) {
        let handlers = this.handlersByType.get(event.getType());
        if (handlers !== undefined) {
            for (let handler of handlers) {
                handler(event);
            }
        }
    }
}
export const eventBus = new EventBus();