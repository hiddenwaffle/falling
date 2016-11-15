declare const THREE: any;

class StandeeAnimationTexture {

    private texture: any;

    constructor() {
        this.texture = null;
    }

    preload(callback: () => any) {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.load('crono.png', (texture: any) => {
            this.texture = texture;

            callback();
        });
    }

    clone(): any {
        return this.texture.clone(); // This is the bane of my existence.
    }

    setTexture(texture: any) {
        this.texture = texture;
    }
}
export const standeeAnimationTexture = new StandeeAnimationTexture();