import {GameStateType, gameState} from '../game-state';
import {Board} from './board/board';
import {Ai} from './ai/ai';
import {npcManager} from './npc/npc-manager';
import {eventBus, EventType} from '../event/event-bus';
import {PlayerType} from '../domain/player-type';
import {PlayerMovement} from '../domain/player-movement';
import {PlayerMovementEvent} from '../event/player-movement-event';
import {ActiveShapeChangedEvent} from '../event/active-shape-changed-event';
import {RowsFilledEvent} from '../event/rows-filled-event';
import {RowsClearAnimationCompletedEvent} from '../event/rows-clear-animation-completed-event';
import {BoardFilledEvent} from '../event/board-filled-event';
import {HpChangedEvent} from '../event/hp-changed-event';
import {ShapeFactory} from './board/shape-factory';
import {FallingSequencer} from './board/falling-sequencer';
import {FallingSequencerEvent} from '../event/falling-sequencer-event';
import {vitals} from './vitals';

class PlayingActivity {
    private humanBoard: Board;
    private humanFallingSequencer: FallingSequencer;

    private aiBoard: Board;
    private aiFallingSequencer: FallingSequencer;

    private ai: Ai;

    constructor() {
        let humanShapeFactory = new ShapeFactory();
        this.humanBoard = new Board(PlayerType.Human, humanShapeFactory, eventBus);
        this.humanFallingSequencer = new FallingSequencer(this.humanBoard);

        let aiShapeFactory = new ShapeFactory();
        this.aiBoard = new Board(PlayerType.Ai, aiShapeFactory, eventBus);
        this.aiFallingSequencer = new FallingSequencer(this.aiBoard);

        this.ai = new Ai(this.aiBoard);
    }

    start() {
        eventBus.register(EventType.PlayerMovementEventType, (event: PlayerMovementEvent) => {
            this.handlePlayerMovement(event);
        });

        eventBus.register(EventType.RowsFilledEventType, (event: RowsFilledEvent) => {
            this.handleRowsFilledEvent(event);
        });

        eventBus.register(EventType.RowsClearAnimationCompletedEventType, (event: RowsClearAnimationCompletedEvent) => {
            this.handleRowClearAnimationCompletedEvent(event);
        });

        eventBus.register(EventType.BoardFilledEventType, (event: BoardFilledEvent) => {
            this.handleBoardFilledEvent(event);
        });

        eventBus.register(EventType.ActiveShapeChangedEventType, (event: ActiveShapeChangedEvent) => {
            this.handleActiveShapeChangedEvent(event);
        });
        
        this.ai.start();
        npcManager.start();

        // TODO: Instead of here, start game when player hits a key first.
        this.humanBoard.resetAndPlay();
        this.aiBoard.resetAndPlay();
    }

    step(elapsed: number) {
        this.humanBoard.step(elapsed);
        this.humanFallingSequencer.step(elapsed);

        this.aiBoard.step(elapsed);
        this.aiFallingSequencer.step(elapsed);

        this.ai.step(elapsed);

        npcManager.step(elapsed);

        return GameStateType.Playing;
    }

    /**
     * Called by IntroActivity.
     */
    generateRandomWhiteCells() {
        this.humanBoard.generateRandomWhiteCells();
        this.aiBoard.generateRandomWhiteCells();
    }

    /**
     * Called by IntroActivity.
     */
    clearWhiteCell(): boolean {
        let result1 = this.humanBoard.clearOneWhiteCell();
        let result2 = this.aiBoard.clearOneWhiteCell();
        return (result1 || result2)
    }

    clearBoards() {
        this.aiBoard.resetAndPlay(false);
        this.humanBoard.resetAndPlay(false);
    }

    displayEnding() {
        if (vitals.aiHitPoints <= 0) {
            this.humanBoard.displayWin();
        } else if (vitals.humanHitPoints <= 0) {
            this.aiBoard.displayWin();
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
                if (board.moveShapeDownAllTheWay()) {       // Check that we are in a position to move the shape down before executing the next line. 
                    board.handleEndOfCurrentPieceTasks();   // Prevents any other keystrokes affecting the shape after it hits the bottom.
                }
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
        board.addJunkRows(event.filledRowIdxs.length);
    }

    private handleRowClearAnimationCompletedEvent(event: RowsClearAnimationCompletedEvent) {
        let board = this.determineBoardFor(event.playerType);
        board.handleAnyFilledLinesPart2();
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
        let board: Board;
        let fallingSequencer: FallingSequencer;
        let hp: number;

        if (event.playerType === PlayerType.Human) {
            board = this.humanBoard;
            fallingSequencer = this.humanFallingSequencer;
            hp = (vitals.humanHitPoints -= 2);
        } else {
            board = this.aiBoard;
            fallingSequencer = this.aiFallingSequencer;
            hp = (vitals.aiHitPoints -= 2);
        }

        eventBus.fire(new HpChangedEvent(hp, event.playerType, true));
        // TODO: See if one of the players has run out of HP, somewhere if not here.

        eventBus.fire(new FallingSequencerEvent(event.playerType));
        fallingSequencer.resetAndPlay(() => {
            this.checkForEndOfGame();
        });
    }

    private handleActiveShapeChangedEvent(event: ActiveShapeChangedEvent) {
        if (event.starting === true && event.playerType === PlayerType.Ai) {
            this.ai.strategize();
        } else {
            // Nothing currently for the human's board to be doing at this time.
        }
    }

    private checkForEndOfGame() {
        if (vitals.aiHitPoints <= 0 || vitals.humanHitPoints <= 0) {
            gameState.setCurrent(GameStateType.Ended);
        }
    }
}
export const playingActivity = new PlayingActivity();