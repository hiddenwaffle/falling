declare const Howl: any;

import {soundManager} from './sound-manager';

// 1) Ambience - Night
// 2) Music - Opening
const FILES_TO_PRELOAD = 2;

class SoundLoader {

    preload(signalOneFileLoaded: (success: boolean) => void): number {
        let ambienceNight = new Howl({
            src: ['ambience-night.m4a'],
            loop: true
        });
        ambienceNight.once('load', () => {
            signalOneFileLoaded(true);
        });
        ambienceNight.once('loaderror', () => {
            signalOneFileLoaded(false);
        });

        let musicOpening = new Howl({
            src: ['music-opening.m4a'],
            loop: true
        });
        musicOpening.once('load', () => {
            signalOneFileLoaded(true);
        });
        musicOpening.once('loaderror', () => {
            signalOneFileLoaded(false);
        });

        return FILES_TO_PRELOAD;
    }
}
export const soundLoader = new SoundLoader();