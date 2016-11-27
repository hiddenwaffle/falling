import {standeeAnimationTextureBase} from './view/standee/standee-animation-texture-base';
import {buildingPreloader} from './view/lighting/building-preloader';
import {soundLoader} from './sound/sound-loader';

class Preloader {
    
    private loadingDiv: HTMLDivElement;
    private loadingMessage: HTMLDivElement;
    private loadingError: HTMLDivElement;
    private loadingBar: HTMLProgressElement;

    constructor() {
        this.loadingDiv = <HTMLDivElement> document.getElementById('loading');
        this.loadingMessage = <HTMLDivElement> document.getElementById('loading-message');
        this.loadingError = <HTMLDivElement> document.getElementById('loading-error');
        this.loadingBar = <HTMLProgressElement> document.getElementById('loading-bar');
    }

    preload(signalPreloadingComplete: () => void) {
        let count = 0;
        let total = 0;

        let callWhenFinished = (success: boolean) => {
            if (success) {
                count++;
                this.loadingMessage.textContent = 'Loaded ' + count + ' of ' + total + ' fixtures...';
                if (count >= total) {
                    signalPreloadingComplete();
                }
                this.loadingBar.setAttribute('value', String(count));
            } else {
                this.loadingError.textContent = 'Error loading fixtures. Please reload if you would like to retry.';
            }
        };

        total += standeeAnimationTextureBase.preload((success: boolean) => {
            callWhenFinished(success);
        });

        total += buildingPreloader.preload((success: boolean) => {
            callWhenFinished(success);
        });

        total += soundLoader.preload((success: boolean) => {
            callWhenFinished(success);
        });

        this.loadingBar.setAttribute('max', String(total));
    }
}
export const preloader = new Preloader();