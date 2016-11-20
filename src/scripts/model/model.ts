import {Board} from './board/board';
import {Ai} from './ai/ai';
import {npcManager} from './npc/npc-manager';
import {eventBus, EventType} from '../event/event-bus';
import {PlayerType} from '../domain/player-type';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerMovementEvent} from '../event/player-movement-event';
import {RowsFilledEvent} from '../event/rows-filled-event';

class Model {
    private humanBoard: Board;
    private aiBoard: Board;
    private ai: Ai;

    constructor() {
        this.humanBoard = new Board(PlayerType.Human);
        this.aiBoard = new Board(PlayerType.Ai);
        this.ai = new Ai(this.aiBoard);
    }

    start() {
        eventBus.register(EventType.PlayerMovementEventType, (event: PlayerMovementEvent) => {
            this.handlePlayerMovement(event);
        });

        eventBus.register(EventType.RowsFilledEventType, (event: RowsFilledEvent) => {
            this.handleRowsFilledEvent(event);
        });

        this.humanBoard.start();
        this.aiBoard.start();
        this.ai.start();
        npcManager.start();

        // TODO: Instead, start game when player hits a key first.
        this.humanBoard.resetBoard();
        this.aiBoard.resetBoard();
    }

    step(elapsed: number) {
        this.humanBoard.step(elapsed);
        this.ai.step(elapsed);
        this.aiBoard.step(elapsed);
        npcManager.step(elapsed);
    }

    private handlePlayerMovement(event: PlayerMovementEvent) {
        let board = this.determineBoardFor(event.playerType);

        switch (event.movement) {
            case PlayerMovement.Left:
                board.moveShapeLeft();
                break;
            case PlayerMovement.Right:
                board.moveShapeRight();
                break;
            case PlayerMovement.Down:
                board.moveShapeDown();
                break;
            case PlayerMovement.Drop:
                board.moveShapeDownAllTheWay();
                board.stepNow(); // prevent any other keystrokes till next tick
                break;
            case PlayerMovement.RotateClockwise:
                board.rotateShapeClockwise();
                break;
            default:
                console.log('unhandled movement');
                break;
        }
    }

    /**
     * Transfer the filled rows to be junk rows on the opposite player's board.
     */
    private handleRowsFilledEvent(event: RowsFilledEvent) {
        let board = this.determineBoardForOppositeOf(event.playerType);
        board.addJunkRows(event.totalFilled);
    }

    /**
     * Returns the human's board if given the human's type, or AI's board if given the AI. 
     */
    private determineBoardFor(playerType: PlayerType): Board {
        if (playerType === PlayerType.Human) {
            return this.humanBoard;
        } else {
            return this.aiBoard;
        }
    }

    /**
     * If this method is given "Human", it will return the AI's board, and vice versa.
     */
    private determineBoardForOppositeOf(playerType: PlayerType): Board {
        if (playerType === PlayerType.Human) {
            return this.aiBoard;
        } else {
            return this.humanBoard;
        }
    }
}
export const model = new Model();