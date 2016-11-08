import {model} from './model/model';
import {view} from './view/view';
import {controller} from './controller/controller';

let lastStep = Date.now();

/**
 * Startup in reverse MVC order to ensure that event bus handlers in the
 * controller and view receive (any) start events from model.start().
 */
(function main() {
    controller.start();
    view.start();
    model.start();

    let step = () => {
        requestAnimationFrame(step);

        let elapsed = calculateElapsed();
        controller.step(elapsed);
        view.step(elapsed);
        model.step(elapsed);
    };
    step();
})();

function calculateElapsed() {
    let now = Date.now();
    let elapsed = now - lastStep;
    if (elapsed > 100) {
        elapsed = 100; // enforce speed limit
    }
    lastStep = now;
    return elapsed;
}