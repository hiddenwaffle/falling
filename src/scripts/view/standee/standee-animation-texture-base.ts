declare const THREE: any;

// Dimensions of the entire spritesheet:
export const SPRITESHEET_WIDTH   = 256;
export const SPRITESHEET_HEIGHT  = 512;

// Dimensions of one frame within the spritesheet:
export const FRAME_WIDTH   = 48;
export const FRAME_HEIGHT  = 72;

const FILES_TO_PRELOAD = 3;

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

    preload(signalThatOneTextureWasLoaded: (result: boolean) => any): number {
        let textureLoadedHandler = (texture: any) => {
            // Have it show only one frame at a time:
            texture.repeat.set(
                FRAME_WIDTH  / SPRITESHEET_WIDTH,
                FRAME_HEIGHT / SPRITESHEET_HEIGHT
            );
            this.textures.push(texture);
            this.loadedCount++;
            signalThatOneTextureWasLoaded(true);
        };

        let errorHandler = () => {
            signalThatOneTextureWasLoaded(false);
        };

        let textureLoader = new THREE.TextureLoader();
        textureLoader.load('fall-student.png', textureLoadedHandler, undefined, errorHandler);
        textureLoader.load('fall-student2.png', textureLoadedHandler, undefined, errorHandler);
        textureLoader.load('fall-student3.png', textureLoadedHandler, undefined, errorHandler);

        return FILES_TO_PRELOAD;
    }

    newInstance(): StandeeAnimationTextureWrapper {
        let idx = this.getNextTextureIdx();
        let texture = this.textures[idx].clone(); // Cloning textures in the version of ThreeJS that I am currently using will duplicate them :(
        return new StandeeAnimationTextureWrapper(texture);
    }

    private getNextTextureIdx() {
        this.currentTextureIdx++;
        if (this.currentTextureIdx >= FILES_TO_PRELOAD) {
            this.currentTextureIdx = 0;
        }
        return this.currentTextureIdx;
    }
}
export const standeeAnimationTextureBase = new StandeeAnimationTextureBase();