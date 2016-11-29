/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>

declare const Howler: any;

import {EventType, eventBus} from '../event/event-bus';
import {GameStateType, gameState} from '../game-state';
import {GameStateChangedEvent} from '../event/game-state-changed-event';
import {
    TIME_UNTIL_EVERYONE_ON_SCREEN,
    AMBIENCE_NIGHT,
    MUSIC_OPENING,
    MUSIC_MAIN,
    MUSIC_MAIN_VOX,
    STUDENTS_TALKING
} from '../domain/constants';

const SOUND_KEY = '129083190-falling-sound';

class SoundManager {

    private soundToggleSection: HTMLDivElement;
    private soundToggleElement: HTMLInputElement;

    private howls: Map<string, any>; // any = Howl

    private crowdNoiseElapsed: number;

    constructor() {
        this.soundToggleSection = <HTMLDivElement> document.getElementById('sound-toggle-section');

        this.soundToggleElement = <HTMLInputElement> document.getElementById('sound-toggle');
        this.soundToggleElement.onclick = () => {
            this.updateSoundSetting(!this.soundToggleElement.checked);
        };

        this.howls = new Map<string, any>();

        this.crowdNoiseElapsed = 0;
    }

    /**
     * Should occur before preloading so the player sees the right option immediately.
     */
    attach() {
        this.updateSoundSetting();
    }

    start() {
        eventBus.register(EventType.GameStateChangedType, (event: GameStateChangedEvent) => {
            switch (event.gameStateType) {
                case GameStateType.Intro:
                    this.cueIntroSounds();
                    break;
                case GameStateType.Playing:
                    this.cuePlayingSounds();
                    break;
            }
        });
    }

    step(elapsed: number) {
        // Increase the crowd volume based on how long it has been playing, up to a little less than halfway.
        let studentsTalkingHowl = this.howls.get(STUDENTS_TALKING);
        if (studentsTalkingHowl != null) {
            if (studentsTalkingHowl.playing()) {
                this.crowdNoiseElapsed += elapsed;
                let volume = (this.crowdNoiseElapsed / TIME_UNTIL_EVERYONE_ON_SCREEN) * 0.4;
                if (volume > 0.4) {
                    volume = 0.4;
                }
                studentsTalkingHowl.volume(volume); // Seems... ok... to call this repeatedly...
            }
        }
    }

    cacheHowl(key: string, value: any) { // any = Howl
        this.howls.set(key, value);
    }

    /**
     * Part 2 is done off the main execution path, in case the user has client-side storage turned off.
     */    
    private updateSoundSetting(mute?: boolean) {
        // Part 1: Update Howler
        if (mute == null) {
            // Default to sound on, in case the second part fails.
            this.soundToggleElement.checked = true;
        } else {
            let soundValue: string;
            if (mute) {
                soundValue = 'off';
            } else {
                soundValue = 'on';
            }
            Howler.mute(mute);            
        }

        // Part 2: Update session storage
        setTimeout(() => {
            this.soundToggleElement.removeAttribute('disabled');
            if (mute == null) {
                let soundValue = sessionStorage.getItem(SOUND_KEY);
                if (soundValue === 'off') {
                    this.soundToggleElement.checked = false;
                    Howler.mute(true);
                }
            } else {
                let soundValue: string;
                if (mute) {
                    soundValue = 'off';
                } else {
                    soundValue = 'on';
                }
                sessionStorage.setItem(SOUND_KEY, soundValue);
            }
        }, 0);
    }

    private cueIntroSounds() {
        let ambienceNightHowl = this.howls.get(AMBIENCE_NIGHT);
        ambienceNightHowl.loop(true);
        ambienceNightHowl.play();

        let musicOpeningHowl = this.howls.get(MUSIC_OPENING);
        musicOpeningHowl.loop(true);
        musicOpeningHowl.play();
    }

    /**
     * Once loaded, have the main music play after the intro music completes its current loop.
     * Also have the students talking start to play.
     */
    private cuePlayingSounds() {
        let musicMainHowl = this.howls.get(MUSIC_MAIN);
        let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);
        if (musicMainHowl != null && musicMainHowlVox != null) {
            let musicOpeningHowl = this.howls.get(MUSIC_OPENING);
            musicOpeningHowl.loop(false);
            musicOpeningHowl.once('end', () => {
                musicOpeningHowl.unload();
                this.chainMusicMain();

                // Also start the students talking.
                this.cueStudentsTalkingSounds();
            });
        } else {
            // Not loaded yet, try again in a second.
            setTimeout(() => this.cuePlayingSounds(), 1000);
        }
    }

    /**
     * Start this at a zero volume and gradually increase to about half volume.
     */
    private cueStudentsTalkingSounds() {
        let studentsTalkingHowl = this.howls.get(STUDENTS_TALKING);
        if (studentsTalkingHowl != null) {
            studentsTalkingHowl.loop(true);
            studentsTalkingHowl.play();
        } else {
            // Not loaded yet, try again in a second.
            setTimeout(() => this.cueStudentsTalkingSounds(), 1000);
        }
    }

    private chainMusicMain() {
        let musicMainHowl = this.howls.get(MUSIC_MAIN);
        musicMainHowl.play();
        musicMainHowl.once('end', () => this.chainMusicMainVox());
    }

    private chainMusicMainVox() {
        let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);
        musicMainHowlVox.play();
        musicMainHowlVox.once('end', () => this.chainMusicMain());
    }
}
export const soundManager = new SoundManager();