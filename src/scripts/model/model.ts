import {playingActivity} from './playing-activity';

interface Activity {
    start(): void;
    step(elapsed: number): void;
}

class Model {

    start() {
        playingActivity.start();
    }

    step(elapsed: number) {
        playingActivity.step(elapsed);
    }
}
export const model = new Model();