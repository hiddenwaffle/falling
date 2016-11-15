declare const THREE: any;
declare const TWEEN: any;

import {EventType, eventBus} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';
import {StandeeAnimation} from './standee-animation';

export class Standee {

    readonly npcId: number;

    readonly group: any;
    readonly animation: StandeeAnimation;

    private walkTweenElapsed: number;
    private walkTween: any;

    constructor(npcId: number) {
        this.npcId = npcId;

        this.group = new THREE.Object3D();
        this.animation = new StandeeAnimation();
        this.group.add(this.animation.group);

        this.walkTweenElapsed = 0;
        this.walkTween = null;
    }

    start() {
        this.group.position.set(-200, 0, -200);
    }

    step(elapsed: number) {
        this.stepWalk(elapsed);

        this.animation.step(elapsed);
    }

    /**
     * Immediately set standee on given position.
     */
    moveTo(x: number, z: number) {
        this.group.position.set(x, 0, z);
    }

    /**
     * Set standee in motion towards given position.
     * Speed dimension is 1 unit/sec.
     */
    walkTo(x: number, z: number, speed: number) {
        // Calculate how long it would take, given the speed requested.
        let vector = new THREE.Vector3(x, 0, z).sub(this.group.position);
        let distance = vector.length();
        let time = (distance / speed) * 1000;

        // Delegate to tween.js. Pass in closures as callbacks because otherwise 'this' will refer
        // to the position object, when executing stopWalk().
        this.walkTweenElapsed = 0;
        this.walkTween = new TWEEN.Tween(this.group.position)
            .to({x: x, z: z}, time)
            .onComplete(() => { this.stopWalk(); })
            .start(this.walkTweenElapsed);
    }

    private stepWalk(elapsed: number) {
        if (this.walkTween != null) {
            this.walkTweenElapsed += elapsed;
            this.walkTween.update(this.walkTweenElapsed);
        }
    }

    private stopWalk() {
        this.walkTweenElapsed = 0;
        this.walkTween = null;
        
        eventBus.fire(new StandeeMovementEndedEvent(
            this.npcId,
            this.group.position.x,
            this.group.position.z)
        );
    }
}