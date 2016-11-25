declare const Howler: any;

const SOUND_KEY = '129083190-falling-sound';

class SoundManager {

    private soundToggleElement: HTMLInputElement;

    constructor() {
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
    }

    step(elapsed: number) {
        //
    }

    /**
     * Done off the main execution path in case the user has client-side storage turned off,
     * to prevent any sort of native exception, if those still exist these days.
     */    
    private updateSoundSetting(mute?: boolean) {
        setTimeout(() => {
            if (mute == null) {
                let soundValue = sessionStorage.getItem(SOUND_KEY);
                mute = soundValue === 'off';
                this.soundToggleElement.checked = !mute;
            } else {
                let soundValue: string;
                if (mute) {
                    soundValue = 'off';
                } else {
                    soundValue = 'on';
                }
                sessionStorage.setItem(SOUND_KEY, soundValue);
            }
            Howler.mute(mute);
        }, 1);
    }
}
export const soundManager = new SoundManager();