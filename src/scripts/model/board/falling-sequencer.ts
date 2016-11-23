interface FallingBoard {
    removeBottomLine(): void;
    resetAndPlay(): void
}

const STEP_DELAY = 100;

export class FallingSequencer {

    private finished: boolean;    
    private board: FallingBoard;
    private currentStepTimeLeft: number;

    constructor(board: FallingBoard) {
        this.finished = true;
        this.board = board;
        this.currentStepTimeLeft = STEP_DELAY;
    }

    resetAndPlay() {
        this.finished = false;
        this.currentStepTimeLeft = STEP_DELAY;
    }

    step(elapsed: number) {
        if (this.finished === false) {
            this.currentStepTimeLeft -= elapsed;
            if (this.currentStepTimeLeft <= 0) {
                this.currentStepTimeLeft = 0;
                if (this.board.removeBottomLine()) {
                    this.finished = true;
                    this.board.resetAndPlay();
                }
            }
        }
    }
}