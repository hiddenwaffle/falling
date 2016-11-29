import {EventType, AbstractEvent} from './event-bus';
import {GameStateType} from '../game-state';

export class GameStateChanged extends AbstractEvent {

    readonly gameStateType: GameStateType;

    constructor(type: GameStateType) {
        super();
        this.gameStateType = type;
    }

    getType() {
        return EventType.GameStateChangedType;
    }
}