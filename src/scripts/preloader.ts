import {standeeAnimationTextureBase} from './view/standee/standee-animation-texture-base';

class Preloader {
    
    preload(callback: () => any) {
        standeeAnimationTextureBase.preload(callback);
        // TODO: Going to have a parallelism mechanism after adding more to this.
    }
}
export const preloader = new Preloader();