declare const THREE: any;
declare const TWEEN: any;

const ASPECT_RATIO = 16/9;

const PAN_TIME_MS = 5500;
const startingFocus = new THREE.Vector3(9, 7.5, 2);
const playingFocus = new THREE.Vector3(6, 6.5, 2);

class PanGuide {
    elapsed: number;
    panFocus = new THREE.Vector3();
}

class CameraWrapper {
    
    readonly camera: any;

    private panTween: any;
    private panGuide: PanGuide;

    constructor() {
        this.camera = new THREE.PerspectiveCamera(60, ASPECT_RATIO, 0.1, 1000);
        this.panTween = null;
        this.panGuide = new PanGuide();
    }

    start() {
        //
    }

    /**
     * Warning: onComplete() can set the tween to null.
     */
    step(elapsed: number) {
        if (this.panTween != null) {
            this.panGuide.elapsed += elapsed;
            this.panTween.update(this.panGuide.elapsed);
            this.camera.lookAt(this.panGuide.panFocus);
        }
    }

    updateRendererSize(renderer: any) {
        let windowAspectRatio = window.innerWidth / window.innerHeight;
        let width: number, height: number;
        if (windowAspectRatio > ASPECT_RATIO) {
            // Too wide; scale off of window height.
            width = Math.floor(window.innerHeight * ASPECT_RATIO);
            height = window.innerHeight;
        } else if (windowAspectRatio <= ASPECT_RATIO) {
            // Too narrow or just right; scale off of window width.
            width = window.innerWidth;
            height = Math.floor(window.innerWidth / ASPECT_RATIO);
        }

        renderer.setSize(width, height);
        // Should be no need to update aspect ratio because it should be constant.
        // this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    lookAtStartingFocus() {
        this.camera.lookAt(startingFocus);
    }

    panToPlayingFocus() {
        this.panGuide.panFocus.x = startingFocus.x;
        this.panGuide.panFocus.y = startingFocus.y;
        this.panGuide.panFocus.z = startingFocus.z;
        this.panGuide.elapsed = 0;
        this.panTween = new TWEEN.Tween(this.panGuide.panFocus)
            .to({x: playingFocus.x, y: playingFocus.y, z: playingFocus.z}, PAN_TIME_MS)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .onComplete(() => {
                this.panTween = null;
                this.camera.lookAt(playingFocus); // TODO: Might not be necessary.
            })
            .start(this.panGuide.elapsed);
    }
}
export const cameraWrapper = new CameraWrapper();