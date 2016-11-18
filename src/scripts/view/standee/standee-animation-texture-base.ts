declare const THREE: any;

// Dimensions of the entire spritesheet:
export const SPRITESHEET_WIDTH   = 256;
export const SPRITESHEET_HEIGHT  = 512;

// Dimensions of one frame within the spritesheet:
export const FRAME_WIDTH   = 48;
export const FRAME_HEIGHT  = 72;

const TOTAL_DIFFERENT_TEXTURES = 3;

export class StandeeAnimationTextureWrapper {

    readonly texture: any;

    constructor(texture: any) {
        this.texture = texture;
    }
}

class StandeeAnimationTextureBase {

    private textures: any[];
    private loadedCount: number;
    private currentTextureIdx: number;

    constructor() {
        this.textures = [];
        this.loadedCount = 0;
        this.currentTextureIdx = 0;
    }

    preload(callback: () => any) {
        let textureLoadedHandler = (texture: any) => {
            // Have it show only one frame at a time:
            texture.repeat.set(
                FRAME_WIDTH  / SPRITESHEET_WIDTH,
                FRAME_HEIGHT / SPRITESHEET_HEIGHT
            );
            this.textures.push(texture);
            this.loadedCount++;
            if (this.loadedCount >= TOTAL_DIFFERENT_TEXTURES) {
                callback();
            }
        }

        let textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', textureLoadedHandler);
        textureLoader.load('fall-student2.png', textureLoadedHandler);
        textureLoader.load('fall-student3.png', textureLoadedHandler);
    }

    newInstance(): StandeeAnimationTextureWrapper {
        let idx = this.getNextTextureIdx();
        let texture = this.textures[idx].clone(); // Cloning textures in the version of ThreeJS that I am currently using will duplicate them :(
        return new StandeeAnimationTextureWrapper(texture);
    }

    private getNextTextureIdx() {
        this.currentTextureIdx++;
        if (this.currentTextureIdx >= TOTAL_DIFFERENT_TEXTURES) {
            this.currentTextureIdx = 0;
        }
        return this.currentTextureIdx;
    }
}
export const standeeAnimationTextureBase = new StandeeAnimationTextureBase();