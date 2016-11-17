declare const THREE: any;

// Dimensions of the entire spritesheet:
export const SPRITESHEET_WIDTH   = 256;
export const SPRITESHEET_HEIGHT  = 512;

// Dimensions of one frame within the spritesheet:
export const FRAME_WIDTH   = 48;
export const FRAME_HEIGHT  = 72;

export class StandeeAnimationTextureWrapper {

    readonly texture: any;

    constructor(texture: any) {
        this.texture = texture;
    }
}

class StandeeAnimationTextureBase {

    private texture: any;

    constructor() {
        this.texture = null;
    }

    preload(callback: () => any) {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', (texture: any) => {
            this.texture = texture;

            // Allows for texture flipping, when necessary.
            // NOTE: To do so, set repeat.x *= -1 and offset.x *= -1.
            this.texture.wrapS = THREE.RepeatWrapping;

            // Have it show only one frame at a time:
            this.texture.repeat.set(
                FRAME_WIDTH  / SPRITESHEET_WIDTH,
                FRAME_HEIGHT / SPRITESHEET_HEIGHT
            );

            callback();
        });
    }

    newInstance(): StandeeAnimationTextureWrapper {
        // return this.texture.clone(); // This is the bane of my existence.
        let texture = this.texture.clone();
        return new StandeeAnimationTextureWrapper(texture);
    }

    setTexture(texture: any) {
        this.texture = texture;
    }
}
export const standeeAnimationTextureBase = new StandeeAnimationTextureBase();