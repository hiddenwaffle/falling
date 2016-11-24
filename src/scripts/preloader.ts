import {standeeAnimationTextureBase} from './view/standee/standee-animation-texture-base';
import {buildingPreloader} from './view/lighting/building-preloader';

const TOTAL_TO_PRELOAD = 2;

class Preloader {
    
    private callback: () => void;
    private count: number;

    constructor() {
        this.callback = null;
        this.count = 0;
    }

    preload(callback: () => void) {
        this.callback = callback;

        standeeAnimationTextureBase.preload(() => {
            this.checkIfFinished();
        });

        buildingPreloader.preload(() => {
            this.checkIfFinished();
        });
    }

    private checkIfFinished() {
        this.count++;
        console.log('Preloaded ' + this.count + ' of ' + TOTAL_TO_PRELOAD);

        if (this.count >= TOTAL_TO_PRELOAD) {
            this.callback();
        }
    }
}
export const preloader = new Preloader();