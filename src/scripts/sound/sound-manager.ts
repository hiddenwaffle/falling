declare const Howler: any;

import {EventType, eventBus} from '../event/event-bus';
import {GameStateChangedEvent} from '../event/game-state-changed-event';

const SOUND_KEY = '129083190-falling-sound';

class SoundManager {

    private soundToggleSection: HTMLDivElement;
    private soundToggleElement: HTMLInputElement;

    constructor() {
        this.soundToggleSection = <HTMLDivElement> document.getElementById('sound-toggle-section');

        this.soundToggleElement = <HTMLInputElement> document.getElementById('sound-toggle');
        this.soundToggleElement.onclick = () => {
            this.updateSoundSetting(!this.soundToggleElement.checked);
        };
    }

    /**
     * Should occur before preloading so the player sees the right option immediately.
     */
    attach() {
        this.updateSoundSetting();
    }

    start() {
        eventBus.register(EventType.GameStateChangedType, (event: GameStateChangedEvent) => {
            console.log('game state changed');
            // TODO: If Intro, start intro music and ambience loops
            // TODO: If Playing, switch from intro to main loop asap, start chatter at lowest volume
        });
    }

    step(elapsed: number) {
        //
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
}
export const soundManager = new SoundManager();