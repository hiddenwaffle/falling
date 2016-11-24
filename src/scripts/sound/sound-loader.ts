declare const Howl: any;

const TOTAL_TO_PRELOAD = 1;

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
            loop: true
        });
        ambienceNight.on('load', () => this.preloadCheckIfFinished());
    }

    private preloadCheckIfFinished() {
        this.preloadCount++;

        if (this.preloadCount >= TOTAL_TO_PRELOAD) {
            this.preloadCompleteCallback();
        }
    }
}
export const soundLoader = new SoundLoader();