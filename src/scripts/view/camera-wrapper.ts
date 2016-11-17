declare const THREE: any;

class CameraWrapper {
    
    readonly camera: any;

    constructor() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    }
}
export const cameraWrapper = new CameraWrapper();