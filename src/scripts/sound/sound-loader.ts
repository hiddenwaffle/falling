declare const Howl: any;

import {soundManager} from './sound-manager';

import {
    AMBIENCE_NIGHT,
    MUSIC_OPENING,
    MUSIC_MAIN,
    MUSIC_MAIN_VOX,
    STUDENTS_TALKING,
    CHEERING,
    CLAPPING
} from '../domain/constants';

// 1) Ambience - Night
// 2) Music - Opening
const FILES_TO_PRELOAD = 2;

class SoundLoader {

    preload(signalOneFileLoaded: (success: boolean) => void): number {
        {
            let ambienceNightHowl = new Howl({
                src: ['ambience-night.m4a'],
                volume: 0.33
            });
            ambienceNightHowl.once('load', () => {
                soundManager.cacheHowl(AMBIENCE_NIGHT, ambienceNightHowl);
                signalOneFileLoaded(true);
            });
            ambienceNightHowl.once('loaderror', () => {
                signalOneFileLoaded(false);
            });
        }

        {
            let musicOpeningHowl = new Howl({
                src: ['music-opening.m4a'],
                volume: 0.5
            });
            musicOpeningHowl.once('load', () => {
                soundManager.cacheHowl(MUSIC_OPENING, musicOpeningHowl);
                signalOneFileLoaded(true);
            });
            musicOpeningHowl.once('loaderror', () => {
                signalOneFileLoaded(false);
            });
        }

        return FILES_TO_PRELOAD;
    }

    deferredLoad() {
        {
            let musicMainHowl = new Howl({
                src: ['music-main.m4a'],
                volume: 0.7
            });
            musicMainHowl.once('load', () => {
                soundManager.cacheHowl(MUSIC_MAIN, musicMainHowl);
            });
        }

        {
            let musicMainVoxHowl = new Howl({
                src: ['music-main-vox.m4a'],
                volume: 0.7
            });
            musicMainVoxHowl.once('load', () => {
                soundManager.cacheHowl(MUSIC_MAIN_VOX, musicMainVoxHowl);
            });
        }

        {
            let studentsTalkingHowl = new Howl({
                src: ['students-talking.m4a'],
                volume: 0.0
            });
            studentsTalkingHowl.once('load', () => {
                soundManager.cacheHowl(STUDENTS_TALKING, studentsTalkingHowl);
            });
        }

        {
            let cheeringHowl = new Howl({
                src: ['cheering.m4a'],
                volume: 0.0
            });
            cheeringHowl.once('load', () => {
                soundManager.cacheHowl(CHEERING, cheeringHowl);
            });
        }

        {
            let clappingHowl = new Howl({
                src: ['clapping.m4a'],
                volume: 0.0
            });
            clappingHowl.once('load', () => {
                soundManager.cacheHowl(CLAPPING, clappingHowl);
            });
        }
    }
}
export const soundLoader = new SoundLoader();