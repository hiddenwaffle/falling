declare const THREE: any;

import {StandeeAnimationTextureWrapper, standeeAnimationTextureBase} from './standee-animation-texture-base';

export class StandeeAnimation {
    
    readonly group: any;

    private sprite: any;
    private textureWrapper: StandeeAnimationTextureWrapper;

    constructor() {
        this.group = new THREE.Object3D();

        this.textureWrapper = standeeAnimationTextureBase.newInstance();
        let material = new THREE.SpriteMaterial({map: this.textureWrapper.texture});

        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(1, 1.5); // Adjust aspect ratio for 48 x 72 size frames. 
        this.group.add(this.sprite);
    }

    start() {
        this.sprite.material.color.set(0xaaaaaa); // TODO: Set this elsewhere
    }

    step(elapsed: number) {
        //
    }
}