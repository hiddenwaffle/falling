declare const Howl: any;

import {soundManager} from './sound-manager';

// 1) Ambience - Night
// 2) Music - Opening
const TOTAL_TO_PRELOAD = 2;

class SoundLoader {

    preloadCompleteCallback: () => void;
    preloadCount: number;

    constructor() {
        this.preloadCompleteCallback = null;
        this.preloadCount = 0;
    }

    preload(preloadCompleteCallback: () => void) {
        this.preloadCompleteCallback = preloadCompleteCallback;

        let ambienceNight = new Howl({
            src: ['ambience-night.m4a'],
            autoplay: true,
            loop: true
        });
        ambienceNight.once('load', () => this.preloadCheckIfFinished());

        let musicOpening = new Howl({
            src: ['music-opening.m4a'],
            autoplay: true,
            loop: true
        });
        musicOpening.once('load', () => this.preloadCheckIfFinished());
    }

    private preloadCheckIfFinished() {
        this.preloadCount++;

        if (this.preloadCount >= TOTAL_TO_PRELOAD) {
            this.preloadCompleteCallback();
        }
    }
}
export const soundLoader = new SoundLoader();