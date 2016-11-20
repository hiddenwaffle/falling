import {MAX_COLS, Board} from './board/board';
import {Ai} from './ai/ai';
import {npcManager} from './npc/npc-manager';
import {eventBus, EventType} from '../event/event-bus';
import {PlayerType} from '../domain/player-type';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerMovementEvent} from '../event/player-movement-event';
import {RowsFilledEvent} from '../event/rows-filled-event';
import {BoardFilledEvent} from '../event/board-filled-event';
import {HpChangedEvent} from '../event/hp-changed-event';
import {ShapeFactory} from './board/shape-factory';

const MAX_HP = MAX_COLS; // HP corresponds to the number of long windows on the second floor of the physical building.
const TEMP_DELAY_MS = 500;

class Model {
    private humanBoard: Board;
    private humanHitPoints: number;

    private aiBoard: Board;
    private aiHitPoints: number;

    private ai: Ai;

    private msTillGravityTick: number;

    constructor() {
        let humanShapeFactory = new ShapeFactory();
        this.humanBoard = new Board(PlayerType.Human, humanShapeFactory, eventBus);
        this.humanHitPoints = MAX_HP;

        let aiShapeFactory = new ShapeFactory();
        this.aiBoard = new Board(PlayerType.Ai, aiShapeFactory, eventBus);
        this.aiHitPoints = MAX_HP;
        
        this.ai = new Ai(this.aiBoard);

        this.msTillGravityTick = TEMP_DELAY_MS;
    }

    start() {
        eventBus.register(EventType.PlayerMovementEventType, (event: PlayerMovementEvent) => {
            this.handlePlayerMovement(event);
        });

        eventBus.register(EventType.RowsFilledEventType, (event: RowsFilledEvent) => {
            this.handleRowsFilledEvent(event);
        });

        eventBus.register(EventType.BoardFilledEventType, (event: BoardFilledEvent) => {
            this.handleBoardFilledEvent(event);
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
        this.stepBoards(elapsed);
        this.ai.step(elapsed);
        npcManager.step(elapsed);
    }

    private stepBoards(elapsed: number) {
        this.msTillGravityTick -= elapsed;
        if (this.msTillGravityTick <= 0) {
            this.msTillGravityTick = TEMP_DELAY_MS;
            this.humanBoard.step();
            this.aiBoard.step();
        }
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
                board.step(); // prevent any other keystrokes till next tick
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

    private handleBoardFilledEvent(event: BoardFilledEvent) {
        let hp: number;
        if (event.playerType === PlayerType.Human) {
            hp = (this.humanHitPoints -= 1);
        } else {
            hp = (this.aiHitPoints -= 1);
        }
        eventBus.fire(new HpChangedEvent(hp, event.playerType));

        // TODO: See if one of the players has run out of HP.
    }
}
export const model = new Model();