import {preloader} from './preloader';
import {model} from './model/model';
import {view} from './view/view';
import {controller} from './controller/controller';
import {soundManager} from './sound/sound-manager';
import {GameStateType, gameState} from './game-state';

document.addEventListener('DOMContentLoaded', (event: any) => {
    gameState.setCurrent(GameStateType.Initializing);
    soundManager.attach();
    preloader.preload(() => {
        main();
    });
});

function main() {

    // Startup in reverse MVC order to ensure that event bus handlers in the
    // controller and view receive (any) start events from model.start().
    soundManager.start();
    controller.start();
    view.start();
    model.start();
    
    gameState.setCurrent(GameStateType.Intro);

    let step = () => {
        requestAnimationFrame(step);

        let elapsed = calculateElapsed();
        controller.step(elapsed);
        view.step(elapsed);
        model.step(elapsed);
        soundManager.step(elapsed);
    };
    step();
}

let lastStep = Date.now();
function calculateElapsed() {
    let now = Date.now();
    let elapsed = now - lastStep;
    if (elapsed > 100) {
        elapsed = 100; // enforce speed limit
    }
    lastStep = now;
    return elapsed;
}