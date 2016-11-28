declare const THREE: any;
declare const TWEEN: any;

import {EventType, eventBus} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';
import {StandeeSpriteWrapper, StandeeAnimationType} from './standee-sprite-wrapper';
import {cameraWrapper} from '../camera-wrapper';

export class Standee {

    readonly npcId: number;

    readonly group: any;
    readonly spriteWrapper: StandeeSpriteWrapper;

    private walkTweenElapsed: number;
    private walkTween: any;

    private facing: any; // Faces in the vector of which way the NPC is walking, was walking before stopping, or was set to.

    constructor(npcId: number) {
        this.npcId = npcId;

        this.group = new THREE.Object3D();
        this.spriteWrapper = new StandeeSpriteWrapper();
        this.group.add(this.spriteWrapper.group);

        this.walkTweenElapsed = 0;
        this.walkTween = null;

        this.facing = new THREE.Vector3();
    }

    start() {
        this.group.position.set(-200, 0, -200);
    }

    step(elapsed: number) {
        this.stepWalk(elapsed);
        this.ensureCorrectAnimation();

        this.spriteWrapper.step(elapsed);
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
        
        // Update direction this standee will be facing when walking.
        this.facing.setX(x - this.group.position.x);
        this.facing.setZ(z - this.group.position.z);
    }

    lookAt(x: number, z: number) {
        this.facing.setX(x - this.group.position.x);
        this.facing.setZ(z - this.group.position.z);
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

    private ensureCorrectAnimation() {
        // let target = this.group.position.clone();
        // target.setY(target.y + 0.5);
        // cameraWrapper.camera.lookAt(target);

        // Angle between two vectors: http://stackoverflow.com/a/21484228
        let worldDirection = cameraWrapper.camera.getWorldDirection();
        let angle = Math.atan2(this.facing.z, this.facing.x) - Math.atan2(worldDirection.z, worldDirection.x);
        if (angle < 0) angle += 2 * Math.PI;
        angle *= (180/Math.PI); // It's my party and I'll use degrees if I want to.

        if (this.walkTween != null) {
            if (angle < 60 || angle >= 300) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.WalkUp);
            } else if (angle >= 60 && angle < 120) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.WalkRight);
            } else if (angle >= 120 && angle < 240) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.WalkDown);
            } else if (angle >= 240 && angle < 300) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.WalkLeft);
            }
        } else {
            if (angle < 60 || angle >= 300) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.StandUp);
            } else if (angle >= 60 && angle < 120) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.StandRight);
            } else if (angle >= 120 && angle < 240) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.StandDown);
            } else if (angle >= 240 && angle < 300) {
                this.spriteWrapper.switchAnimation(StandeeAnimationType.StandLeft);
            }
        }
    }
}