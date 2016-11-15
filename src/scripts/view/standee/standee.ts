declare const THREE: any;
declare const TWEEN: any;

import {EventType, eventBus} from '../../event/event-bus';
import {StandeeMovementEndedEvent} from '../../event/standee-movement-ended-event';

export class Standee {

    readonly sprite: any;
    readonly npcId: number;

    private tween: any;

    constructor(npcId: number) {
        this.npcId = npcId;
        
        // TODO: Delete this temporary code
        let textureLoader = new THREE.TextureLoader();
        let texture = textureLoader.load('crono.png');
        // texture.minFilter = THREE.LinearMipMapFilter;
        // texture.magFilter = THREE.NearestFilter;
        let material = new THREE.SpriteMaterial({map: texture}); // FIXME: Why isn't this needed - depthWrite: true
        this.sprite = new THREE.Sprite(material);

        // this.walkOrigin = new THREE.Vector3();
        // this.walkVector = new THREE.Vector3();
        // this.walkTtl = 0;
        // this.walkTime = 0;
        this.tween = null;
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
        let walkVector = new THREE.Vector3(x, 0, z).sub(this.sprite.position);

        // Calculate how long it would take, given the speed requested.
        let distance = walkVector.length();
        let time = (distance / speed) * 1000;

        this.tween = new TWEEN.Tween(this.sprite.position)
            .to({x: x, z: z}, time)
            .onComplete(() => { this.stopWalk(); }) // Pass in closure because otherwise 'this' will refer to the position object, when executing stopWalk().
            .start();
    }

    private stepWalk(elapsed: number) {
        // this.tween.update(elapsed);
        TWEEN.update();
    }

    private stopWalk() {
        eventBus.fire(new StandeeMovementEndedEvent(
            this.npcId,
            this.sprite.position.x,
            this.sprite.position.z)
        );
    }
}