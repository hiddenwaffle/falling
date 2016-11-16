/// <reference path='../../../../node_modules/typescript/lib/lib.es6.d.ts'/>

declare const THREE: any;

import {
    SPRITESHEET_WIDTH,
    SPRITESHEET_HEIGHT,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    StandeeAnimationTextureWrapper,
    standeeAnimationTextureBase}
from './standee-animation-texture-base';

const STANDARD_DELAY = 100; // TODO: Perhaps have some randomness combined with this?

class StandeeAnimationFrame {

    readonly row: number;
    readonly col: number;
    readonly flipped: boolean;

    constructor(row: number, col: number, flipped = false) {
        this.row = row; 
        this.col = col;
        this.flipped = flipped;
    }
}

enum StandeeAnimationType {
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
    
    readonly frames: StandeeAnimationFrame[];
    readonly delays: number[];
    readonly next: StandeeAnimationType;

    private currentFrameIdx: number;
    private currentFrameTimeElapsed: number;

    private finished: boolean;

    constructor(next: StandeeAnimationType) {
        this.frames = [];
        this.delays = [];
        this.next = next;

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
        this.sprite.material.color.set(0xaaaaaa); // TODO: Set this elsewhere
    }

    step(elapsed: number) {
        this.stepCurrentFrame(elapsed);
    }

    private stepCurrentFrame(elapsed: number) {
        this.currentAnimation.step(elapsed);
        if (this.currentAnimation.isFinished()) {
            this.currentAnimation = determineAnimation(this.currentAnimation.next);
        }
        let frame = this.currentAnimation.getCurrentFrame();

        // Convert frame coordinates to texture coordinates and set the current one
        // TODO: Use flipped flag
        let xpct = (frame.col * FRAME_WIDTH) / SPRITESHEET_WIDTH;
        let ypct = (((Math.floor(SPRITESHEET_HEIGHT / FRAME_HEIGHT)) - 1 - frame.row) * FRAME_HEIGHT) / SPRITESHEET_HEIGHT;
        this.textureWrapper.texture.offset.set(xpct, ypct);
    }
}

function determineAnimation(type: StandeeAnimationType): StandeeAnimation {
    let animation: StandeeAnimation;
    switch (type) {
        case StandeeAnimationType.StandDown:
            animation = createStandDown();
            break;
        default:
            console.log('Should not get here');
    }
    return animation;
}

// Standing Up
let standUpFrame1       = new StandeeAnimationFrame(2, 0);

// Walking Up
let walkUpFrame1        = new StandeeAnimationFrame(2, 0);
let walkUpFrame2        = new StandeeAnimationFrame(2, 1);
let walkUpFrame3        = new StandeeAnimationFrame(2, 2);
let walkUpFrame4        = new StandeeAnimationFrame(2, 0, true);
let walkUpFrame5        = new StandeeAnimationFrame(2, 1, true);
let walkUpFrame6        = new StandeeAnimationFrame(2, 2, true);

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
let walkDownFrame4      = new StandeeAnimationFrame(0, 0, true);
let walkDownFrame5      = new StandeeAnimationFrame(0, 1, true);
let walkDownFrame6      = new StandeeAnimationFrame(0, 2, true);

// Standing Left
let standLeftFrame1     = new StandeeAnimationFrame(1, 1);

// Walking Left
let walkLeftFrame1      = new StandeeAnimationFrame(1, 1);
let walkLeftFrame2      = new StandeeAnimationFrame(1, 0);
let walkLeftFrame3      = new StandeeAnimationFrame(1, 1);
let walkLeftFrame4      = new StandeeAnimationFrame(1, 2);

// Standing Right
let standRightFrame1    = new StandeeAnimationFrame(1, 1, true);

// Walking Right
let walkRightFrame1     = new StandeeAnimationFrame(1, 1, true);
let walkRightFrame2     = new StandeeAnimationFrame(1, 0, true);
let walkRightFrame3     = new StandeeAnimationFrame(1, 1, true);
let walkRightFrame4     = new StandeeAnimationFrame(1, 2, true);

// Cheer Up
let cheerUpFrame1       = new StandeeAnimationFrame(2, 0);
let cheerUpFrame2       = new StandeeAnimationFrame(3, 0);
let cheerUpFrame3       = new StandeeAnimationFrame(3, 1);
let cheerUpFrame4       = new StandeeAnimationFrame(3, 0);

// Panic Up
let panicUpFrame1       = new StandeeAnimationFrame(2, 0);
let panicUpFrame2       = new StandeeAnimationFrame(3, 2);
let panicUpFrame3       = new StandeeAnimationFrame(4, 0);
let panicUpFrame4       = new StandeeAnimationFrame(3, 2);