/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

declare const THREE: any;

import {cameraWrapper} from '../camera-wrapper';
import {
    SPRITESHEET_WIDTH,
    SPRITESHEET_HEIGHT,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    StandeeAnimationTextureWrapper,
    standeeAnimationTextureBase}
from './standee-animation-texture-base';

const STANDARD_DELAY = 225;
const WALK_UP_OR_DOWN_DELAY = Math.floor(STANDARD_DELAY * (2/3)); // Because up/down walk cycles have more frames. 

const scratchVector1: any = new THREE.Vector3();
const scratchVector2: any = new THREE.Vector3();

class StandeeAnimationFrame {

    readonly row: number;
    readonly col: number;

    constructor(row: number, col: number) {
        this.row = row; 
        this.col = col;
    }
}

export const enum StandeeAnimationType {
    StandUp,
    StandDown,
    StandLeft,
    StandRight,
    WalkUp,
    WalkDown,
    WalkLeft,
    WalkRight,
    CheerUp,
    PanicUp,
    PanicDown
}

class StandeeAnimation {
    
    readonly type: StandeeAnimationType;
    readonly next: StandeeAnimationType; // Probably not going to be used for this game

    readonly frames: StandeeAnimationFrame[];
    readonly delays: number[];
    private currentFrameIdx: number;
    private currentFrameTimeElapsed: number;

    private finished: boolean;

    constructor(type: StandeeAnimationType, next?: StandeeAnimationType) {
        this.type = type;
        if (next) {
            this.next = next;
        } else {
            this.next = type;
        }

        this.frames = [];
        this.delays = [];
        this.currentFrameIdx = 0;
        this.currentFrameTimeElapsed = 0;

        this.finished = false;
    }

    push(frame: StandeeAnimationFrame, delay = STANDARD_DELAY) {
        this.frames.push(frame);
        this.delays.push(delay);
    }

    step(elapsed: number) {
        this.currentFrameTimeElapsed += elapsed;
        if (this.currentFrameTimeElapsed >= this.delays[this.currentFrameIdx]) {
            this.currentFrameTimeElapsed = 0;
            this.currentFrameIdx++;
            if (this.currentFrameIdx >= this.frames.length) {
                this.currentFrameIdx = 0; // Shouldn't be used anymore, but prevent out-of-bounds anyway.
                this.finished = true;
            }
        }
    }

    isFinished(): boolean {
        return this.finished;
    }

    getCurrentFrame(): StandeeAnimationFrame {
        return this.frames[this.currentFrameIdx];
    }
}

export class StandeeSpriteWrapper {
    
    readonly group: any;
    private sprite: any;
    private textureWrapper: StandeeAnimationTextureWrapper;

    private currentAnimation: StandeeAnimation;

    constructor() {
        this.group = new THREE.Object3D();

        // Initialize ThreeJS objects: 
        this.textureWrapper = standeeAnimationTextureBase.newInstance();
        let material = new THREE.SpriteMaterial({map: this.textureWrapper.texture});
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(1, 1.5); // Adjust aspect ratio for 48 x 72 size frames. 
        this.group.add(this.sprite);

        // Initialize default animation to standing facing down:
        this.currentAnimation = createStandDown();
    }

    start() {
        // TODO: Set this elsewhere
    }

    step(elapsed: number) {
        this.adjustLighting(elapsed);
        this.stepAnimation(elapsed);
    }
    
    /**
     * Only switches if the given animation is different from the current one.
     */
    switchAnimation(type: StandeeAnimationType) {
        let animation = determineAnimation(type);
        if (this.currentAnimation.type !== animation.type) {
            this.currentAnimation = animation;
        } 
    }

    private adjustLighting(elapsed: number) {
        // TODO: Not yet sure if I'll need to use the elapsed variable here.
        // TODO: Move magic numbers into same equations as the NPC
        this.sprite.getWorldPosition(scratchVector1);
        cameraWrapper.camera.getWorldPosition(scratchVector2);
        let distanceSquared: number = scratchVector1.distanceToSquared(scratchVector2);
        let value = 1.0 - (Math.min(1.0, distanceSquared / 225));
        this.sprite.material.color.setRGB(value, value, value);
    }

    private stepAnimation(elapsed: number) {
        if (this.currentAnimation == null) {
            return;
        }

        this.currentAnimation.step(elapsed);
        if (this.currentAnimation.isFinished()) {
            this.currentAnimation = determineAnimation(this.currentAnimation.next);
        }
        let frame = this.currentAnimation.getCurrentFrame();

        // Convert frame coordinates to texture coordinates and set the current one
        let xpct = (frame.col * FRAME_WIDTH) / SPRITESHEET_WIDTH;
        let ypct = (((SPRITESHEET_HEIGHT / FRAME_HEIGHT) - 1 - frame.row) * FRAME_HEIGHT) / SPRITESHEET_HEIGHT;
        this.textureWrapper.texture.offset.set(xpct, ypct);
    }
}

function determineAnimation(type: StandeeAnimationType): StandeeAnimation {
    let animation: StandeeAnimation;
    switch (type) {
        case StandeeAnimationType.StandUp:
            animation = createStandUp();
            break;
        case StandeeAnimationType.WalkUp:
            animation = createWalkUp();
            break;
        case StandeeAnimationType.StandDown:
            animation = createStandDown();
            break;
        case StandeeAnimationType.WalkDown:
            animation = createWalkDown();
            break;
        case StandeeAnimationType.StandLeft:
            animation = createStandLeft();
            break;
        case StandeeAnimationType.WalkLeft:
            animation = createWalkLeft();
            break;
        case StandeeAnimationType.StandRight:
            animation = createStandRight();
            break;
        case StandeeAnimationType.WalkRight:
            animation = createWalkRight();
            break;
        case StandeeAnimationType.CheerUp:
            animation = createCheerUp();
            break;
        case StandeeAnimationType.PanicUp:
            animation = createPanicUp();
            break;
        case StandeeAnimationType.PanicDown:
            animation = createPanicDown();
            break;
        default:
            console.log('Should not get here');
    }
    return animation;
}

// Standing Up
let standUpFrame1       = new StandeeAnimationFrame(2, 0);

function createStandUp(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.StandUp);
    animation.push(standUpFrame1);
    return animation;
}

// Walking Up
let walkUpFrame1        = new StandeeAnimationFrame(2, 0);
let walkUpFrame2        = new StandeeAnimationFrame(2, 1);
let walkUpFrame3        = new StandeeAnimationFrame(2, 2);
let walkUpFrame4        = new StandeeAnimationFrame(3, 3);
let walkUpFrame5        = new StandeeAnimationFrame(4, 3);
let walkUpFrame6        = new StandeeAnimationFrame(5, 3);

function createWalkUp(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.WalkUp);
    animation.push(walkUpFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkUpFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
}

// Standing Down
let standDownFrame1     = new StandeeAnimationFrame(0, 0);

function createStandDown(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.StandDown);
    animation.push(standDownFrame1);
    return animation;
}

// Walking Down
let walkDownFrame1      = new StandeeAnimationFrame(0, 0);
let walkDownFrame2      = new StandeeAnimationFrame(0, 1);
let walkDownFrame3      = new StandeeAnimationFrame(0, 2);
let walkDownFrame4      = new StandeeAnimationFrame(0, 3);
let walkDownFrame5      = new StandeeAnimationFrame(1, 3);
let walkDownFrame6      = new StandeeAnimationFrame(2, 3);

function createWalkDown(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.WalkDown);
    animation.push(walkDownFrame1, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame2, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame3, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame4, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame5, WALK_UP_OR_DOWN_DELAY);
    animation.push(walkDownFrame6, WALK_UP_OR_DOWN_DELAY);
    return animation;
}

// Standing Left
let standLeftFrame1     = new StandeeAnimationFrame(1, 1);

function createStandLeft(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.StandLeft);
    animation.push(standLeftFrame1);
    return animation;
}

// Walking Left
let walkLeftFrame1      = new StandeeAnimationFrame(1, 1);
let walkLeftFrame2      = new StandeeAnimationFrame(1, 0);
let walkLeftFrame3      = new StandeeAnimationFrame(1, 1);
let walkLeftFrame4      = new StandeeAnimationFrame(1, 2);

function createWalkLeft(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.WalkLeft);
    animation.push(walkLeftFrame1);
    animation.push(walkLeftFrame2);
    animation.push(walkLeftFrame3);
    animation.push(walkLeftFrame4);
    return animation;
}

// Standing Right
let standRightFrame1    = new StandeeAnimationFrame(1, 4);

function createStandRight(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.StandRight);
    animation.push(standRightFrame1);
    return animation;
}

// Walking Right
let walkRightFrame1     = new StandeeAnimationFrame(1, 4);
let walkRightFrame2     = new StandeeAnimationFrame(2, 4);
let walkRightFrame3     = new StandeeAnimationFrame(1, 4);
let walkRightFrame4     = new StandeeAnimationFrame(0, 4);

function createWalkRight(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.WalkRight);
    animation.push(walkRightFrame1);
    animation.push(walkRightFrame2);
    animation.push(walkRightFrame3);
    animation.push(walkRightFrame4);
    return animation;
}

// Cheer Up
let cheerUpFrame1       = new StandeeAnimationFrame(2, 0);
let cheerUpFrame2       = new StandeeAnimationFrame(3, 0);
let cheerUpFrame3       = new StandeeAnimationFrame(3, 1);
let cheerUpFrame4       = new StandeeAnimationFrame(3, 0);

function createCheerUp(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.CheerUp);
    animation.push(cheerUpFrame1);
    animation.push(cheerUpFrame2);
    animation.push(cheerUpFrame3);
    animation.push(cheerUpFrame4);
    return animation;
}

// Panic Up
let panicUpFrame1       = new StandeeAnimationFrame(2, 0);
let panicUpFrame2       = new StandeeAnimationFrame(3, 2);
let panicUpFrame3       = new StandeeAnimationFrame(4, 0);
let panicUpFrame4       = new StandeeAnimationFrame(3, 2);

function createPanicUp(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.PanicUp);
    animation.push(panicUpFrame1);
    animation.push(panicUpFrame2);
    animation.push(panicUpFrame3);
    animation.push(panicUpFrame4);
    return animation;
}

// Panic Down
let panicDownFrame1     = new StandeeAnimationFrame(0, 0);
let panicDownFrame2     = new StandeeAnimationFrame(4, 1);
let panicDownFrame3     = new StandeeAnimationFrame(4, 2);
let panicDownFrame4     = new StandeeAnimationFrame(4, 1);

function createPanicDown(): StandeeAnimation {
    let animation = new StandeeAnimation(StandeeAnimationType.PanicDown);
    animation.push(panicDownFrame1);
    animation.push(panicDownFrame2);
    animation.push(panicDownFrame3);
    animation.push(panicDownFrame4);
    return animation;
}