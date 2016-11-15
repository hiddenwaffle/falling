declare const THREE: any;

// Dimensions of the entire spritesheet:
const SPRITESHEET_WIDTH   = 256;
const SPRITESHEET_HEIGHT  = 512;

// Dimensions of one frame within the spritesheet:
const FRAME_WIDTH   = 48;
const FRAME_HEIGHT  = 72;

class StandeeAnimationTexture {

    private texture: any;

    constructor() {
        this.texture = null;
    }

    preload(callback: () => any) {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', (texture: any) => {
            this.texture = texture;

            // TODO: Allows for texture flipping, when necessary.
            // this.texture.wrapS = THREE.RepeatWrapping;

            this.texture.repeat.set(48/256, 72/512); 
            callback();
        });
    }

    clone(): any {
        return this.texture.clone(); // This is the bane of my existence.
    }

    setTexture(texture: any) {
        this.texture = texture;
    }
}
export const standeeAnimationTexture = new StandeeAnimationTexture();