import {standeeAnimationTexture} from './view/standee/standee-animation-texture';

class Preloader {
    
    preload(callback: () => any) {
        standeeAnimationTexture.preload(callback);
        // TODO: Going to have a parallelism mechanism after adding more to this.
    }
}
export const preloader = new Preloader();