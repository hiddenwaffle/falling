declare const THREE: any;

// Dimensions of the entire spritesheet:
const SPRITESHEET_WIDTH   = 256;
const SPRITESHEET_HEIGHT  = 512;

// Dimensions of one frame within the spritesheet:
const FRAME_WIDTH   = 48;
const FRAME_HEIGHT  = 72;

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

            // Set the default frame to the upper-left corner
            // TODO: Necessary? Might remove this after animations get defined.
            this.texture.offset.set(
                (0 * (SPRITESHEET_WIDTH  - FRAME_WIDTH )) / SPRITESHEET_WIDTH,
                (1 * (SPRITESHEET_HEIGHT - FRAME_HEIGHT)) / SPRITESHEET_HEIGHT
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