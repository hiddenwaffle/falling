import {Board} from './board/board';
import {npcManager} from './npc/npc-manager';
import {eventBus, EventType} from '../event/event-bus';
import {Player} from '../domain/player';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerMovementEvent} from '../event/player-movement-event';

class Model {
    
    private humanBoard: Board;
    private aiBoard: Board;

    constructor() {
        this.humanBoard = new Board(Player.Human);
        this.aiBoard = new Board(Player.Ai);
    }

    start() {
        eventBus.register(EventType.PlayerMovementEventType, (event: PlayerMovementEvent) => {
            this.handlePlayerMovement(event.movement);
        });

        this.humanBoard.start();
        this.aiBoard.start();
        npcManager.start();

        // TODO: Instead, start game when player hits a key first.
        this.humanBoard.beginNewGame();
        this.aiBoard.beginNewGame();
    }

    step(elapsed: number) {
        this.humanBoard.step(elapsed);
        this.aiBoard.step(elapsed);
        npcManager.step(elapsed);
    }

    private handlePlayerMovement(movement: PlayerMovement) {
        switch (movement) {
            case PlayerMovement.Left:
                this.humanBoard.moveShapeLeft();
                break;
            case PlayerMovement.Right:
                this.humanBoard.moveShapeRight();
                break;
            case PlayerMovement.Down:
                this.humanBoard.moveShapeDown();
                break;
            case PlayerMovement.Drop:
                this.humanBoard.moveShapeDownAllTheWay();
                this.humanBoard.stepNow(); // prevent any other keystrokes till next tick
                break;
            case PlayerMovement.RotateClockwise:
                this.humanBoard.rotateShapeClockwise();
                break;
            default:
                console.log('unhandled movement');
                break;
        }
    }
}
export const model = new Model();