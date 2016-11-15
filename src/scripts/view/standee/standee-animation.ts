declare const THREE: any;

import {standeeAnimationTexture} from './standee-animation-texture';

export class StandeeAnimation {
    
    readonly group: any;

    private sprite: any;
    private texture: any;

    constructor() {
        this.group = new THREE.Object3D();
        this.texture = standeeAnimationTexture.clone();
        let material = new THREE.SpriteMaterial({map: this.texture});
        this.sprite = new THREE.Sprite(material);
        this.group.add(this.sprite);
        
        // TODO: Change lighting for when close to streetlamps
        this.sprite.material.color.set(0xaaaaaa);
    }

    start() {
        //
    }

    step(elapsed: number) {
        //
    }
}