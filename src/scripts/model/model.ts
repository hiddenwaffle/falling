import {board} from './board';

class Model {
    
    start() {
        board.start();
        board.beginNewGame(); // TODO: Instead, start game when player hits a key first.
    }

    step(elapsed: number) {
        board.step(elapsed);
    }
}
export const model = new Model();