declare const TWEEN: any;

const FALL_TIME_MS = 1250;

interface FallingBoard {
    calculateHighestColumn(): number;
    removeBottomLine(): void;
    resetAndPlay(): void
}

class FallGuide {
    lastHeight: number;
    tweenedHeight: number;
    elapsed: number;
}

export class FallingSequencer {

    private board: FallingBoard;
    private fallTween: any;
    private fallTweenElapsed: number;
    private fallGuide: FallGuide;

    constructor(board: FallingBoard) {
        this.board = board;
        this.fallTween = null;
        this.fallGuide = new FallGuide();
    }

    resetAndPlay(callback: () => void) {
        this.fallGuide.lastHeight = this.fallGuide.tweenedHeight = this.board.calculateHighestColumn();
        this.fallGuide.elapsed = 0;

        this.fallTween = new TWEEN.Tween(this.fallGuide)
            .to({tweenedHeight: 0}, FALL_TIME_MS)
            .easing(TWEEN.Easing.Linear.None) // Surprisingly, linear is the one that looks most "right".
            .onComplete(() => {
                this.fallTween = null;
                this.board.resetAndPlay();
                callback();
            })
            .start(this.fallGuide.elapsed);
    }

    /**
     * Doing this in two parts because onComplete() can set the tween to null.
     */
    step(elapsed: number) {
        if (this.fallTween != null) {
            this.fallGuide.elapsed += elapsed;
            this.fallTween.update(this.fallGuide.elapsed);
        }

        if (this.fallTween != null) {
            let newHeight = Math.ceil(this.fallGuide.tweenedHeight);
            if  (this.fallGuide.lastHeight > newHeight) {
                let diff = this.fallGuide.lastHeight - newHeight;
                for (let idx = 0; idx < diff; idx++) {
                    this.board.removeBottomLine();
                }
                this.fallGuide.lastHeight = newHeight;
            }
        }
    }
}