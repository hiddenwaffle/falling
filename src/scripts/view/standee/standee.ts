declare const THREE: any;

import {EventType, eventBus} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';

export class Standee {

    readonly sprite: any;
    readonly npcId: number;

    private walkOrigin: any;    // Where the walk started.
    private walkVector: any;    // Where the walk ends, relative to where it started.
    private walkTtl: number;    // How many ms it should take to get from start to end.
    private walkTime: number;   // How many ms has passed since it started moving.

    constructor(npcId: number) {
        this.npcId = npcId;
        
        // TODO: Delete this temporary code
        let textureLoader = new THREE.TextureLoader();
        let texture = textureLoader.load('crono.png');
        // TODO: Could set nearest neighbor on texture here, but undecided.
        let material = new THREE.SpriteMaterial({map: texture}); // FIXME: Why isn't this needed - depthWrite: true
        this.sprite = new THREE.Sprite(material);

        this.walkOrigin = new THREE.Vector3();
        this.walkVector = new THREE.Vector3();
        this.walkTtl = 0;
        this.walkTime = 0;
    }

    start() {
        this.sprite.position.set(-200, 0, -200);
    }

    step(elapsed: number) {
        this.stepWalk(elapsed);

        // TODO: Change lighting for when close to streetlamps
        this.sprite.material.color.set(0xaaaaaa);
    }

    /**
     * Immediately set standee on given position.
     */
    moveTo(x: number, z: number) {
        this.sprite.position.set(x, 0, z);
    }

    /**
     * Set standee in motion towards given position.
     * Speed dimension is 1 unit/sec.
     */
    walkTo(x: number, z: number, speed: number) {
        this.walkOrigin = this.sprite.position.clone();
        this.walkVector = new THREE.Vector3(x, 0, z).sub(this.walkOrigin);

        // Calculate how long it would take, given the speed requested.
        let distance = this.walkVector.length();
        let ttl = (distance / speed) * 1000;
        this.walkTtl = ttl;

        this.walkTime = 0;
    }

    private stepWalk(elapsed: number) {
        if (this.walkTtl > 0) {
            this.walkTime += elapsed;

            let walkFinished = false;
            if (this.walkTime >= this.walkTtl) {
                this.walkTime = this.walkTtl;
                walkFinished = true;
            }

            let pctDone = this.walkTime / this.walkTtl;
            let delta = this.walkVector.clone().multiplyScalar(pctDone);
            let newPosition = this.walkOrigin.clone().add(delta);
            this.sprite.position.copy(newPosition);

            if (walkFinished) {
                this.stopWalk();
            }
        }
    }

    private stopWalk() {
        this.walkTtl = 0;
        this.walkTime = 0;

        eventBus.fire(new StandeeMovementEndedEvent(
            this.npcId,
            this.sprite.position.x,
            this.sprite.position.z)
        );
    }
}