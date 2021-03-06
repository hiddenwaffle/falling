/// <reference path='../../../node_modules/typescript/lib/lib.es6.d.ts'/>

declare const Howler: any;

import {EventType, eventBus} from '../event/event-bus';
import {BoardFilledEvent} from '../event/board-filled-event';
import {GameStateType, gameState} from '../game-state';
import {GameStateChangedEvent} from '../event/game-state-changed-event';
import {
    TIME_UNTIL_EVERYONE_ON_SCREEN,
    AMBIENCE_NIGHT,
    MUSIC_OPENING,
    MUSIC_MAIN,
    MUSIC_MAIN_VOX,
    STUDENTS_TALKING,
    CHEERING,
    CLAPPING
} from '../domain/constants';
import {PlayerType} from '../domain/player-type';

const SOUND_KEY = '129083190-falling-sound';

const MUSIC_FADE_OUT_TIME_MS = 15 * 1000;

class SoundManager {

    private soundToggleSection: HTMLDivElement;
    private soundToggleElement: HTMLInputElement;

    private howls: Map<string, any>; // any = Howl

    private crowdNoiseElapsed: number;
    private crowdVolume: number;

    private musicEndingTtl: number;
    private musicVolume: number;

    constructor() {
        this.soundToggleSection = <HTMLDivElement> document.getElementById('sound-toggle-section');

        this.soundToggleElement = <HTMLInputElement> document.getElementById('sound-toggle');
        this.soundToggleElement.onclick = () => {
            this.updateSoundSetting(!this.soundToggleElement.checked);
        };

        this.howls = new Map<string, any>();

        this.crowdNoiseElapsed = 0;
        this.crowdVolume = 0;

        this.musicEndingTtl = MUSIC_FADE_OUT_TIME_MS;
        this.musicVolume = 0;
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
                case GameStateType.Ended:
                    this.fadeOutSounds();
                    break;
            }
        });

        eventBus.register(EventType.BoardFilledEventType, (event: BoardFilledEvent) => {
            if (gameState.getCurrent() === GameStateType.Playing) {
                this.playBoardFilledReaction(event.playerType);
            }
        });
    }

    step(elapsed: number) {
        if (gameState.getCurrent() === GameStateType.Playing) {
            // Increase the crowd volume based on how long it has been playing, up to a little less than halfway.
            let studentsTalkingHowl = this.howls.get(STUDENTS_TALKING);
            if (studentsTalkingHowl != null) {
                if (studentsTalkingHowl.playing()) {
                    this.crowdNoiseElapsed += elapsed;
                    this.crowdVolume = (this.crowdNoiseElapsed / (TIME_UNTIL_EVERYONE_ON_SCREEN/2)) * 0.4;
                    if (this.crowdVolume > 0.4) {
                        this.crowdVolume = 0.4;
                    }
                    studentsTalkingHowl.volume(this.crowdVolume); // Seems... ok... to call this repeatedly...
                }
            }

            // Main music volume is constant
            this.musicVolume = 0.7;

        } else if (gameState.getCurrent() === GameStateType.Ended) {
            this.musicEndingTtl -= elapsed;
            if (this.musicEndingTtl < 0) {
                this.musicEndingTtl = 0;
            }
            this.musicVolume = (this.musicEndingTtl / MUSIC_FADE_OUT_TIME_MS) * 0.7; // 0.7 is from constant seen above
            
            let musicMainHowl = this.howls.get(MUSIC_MAIN);
            if (musicMainHowl != null) {
                musicMainHowl.volume(this.musicVolume);
            }
            
            let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);
            if (musicMainHowlVox != null) {
                musicMainHowlVox.volume(this.musicVolume);
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
        let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);

        musicMainHowl.volume(this.musicVolume);
        musicMainHowl.play();
        musicMainHowl.once('end', () => this.chainMusicMainVox());
    }

    private chainMusicMainVox() {
        let musicMainHowl = this.howls.get(MUSIC_MAIN);
        let musicMainHowlVox = this.howls.get(MUSIC_MAIN_VOX);

        musicMainHowlVox.volume(this.musicVolume);
        musicMainHowlVox.play();
        musicMainHowlVox.once('end', () => this.chainMusicMain());
    }

    private playBoardFilledReaction(playerType: PlayerType) {
        // Note: Scaling volume here to number of NPCs in play.

        const maxVolume = 0.9;

        if (playerType === PlayerType.Ai) {
            // Cheering for AI's board falling.
            let cheeringHowl = this.howls.get(CHEERING);
            if (cheeringHowl != null) {
                let volume = (this.crowdNoiseElapsed / (TIME_UNTIL_EVERYONE_ON_SCREEN/2)) * maxVolume;
                if (volume > maxVolume) {
                    volume = maxVolume;
                }
                cheeringHowl.volume(volume);
                cheeringHowl.play();
            }
        } else {
            // Clapping for Human's board falling.
            let clappingHowl = this.howls.get(CLAPPING);
            if (clappingHowl != null) {
                let volume = (this.crowdNoiseElapsed / (TIME_UNTIL_EVERYONE_ON_SCREEN/2)) * maxVolume;
                if (volume > maxVolume) {
                    volume = maxVolume;
                }
                clappingHowl.volume(volume);
                clappingHowl.play();
            }
        }
    }

    /**
     * Quick hack just to get it done.
     */
    private fadeOutSounds() {
        let studentsTalkingHowl = this.howls.get(STUDENTS_TALKING);
        if (studentsTalkingHowl != null) {
            studentsTalkingHowl.fade(this.crowdVolume, 0.0, 30 * 1000);
        }
    }
}
export const soundManager = new SoundManager();