declare const THREE: any;
declare const TWEEN: any;

// TODO: Only the 3rd floor from the top and below are visible. Also, see board.ts.
export const FLOOR_COUNT = 17;
export const PANEL_COUNT_PER_FLOOR = 10;

const POINT_LIGHT_COUNT = 4;

class EmissiveIntensity {
    value: number;
}

class LightingGrid {
    
    readonly group: any;
    
    private panels: any[][];
    private pointLights: any[];
    private currentPointLightIdx: number;

    private pulseTween: any;
    private pulseTweenElapsed: number;
    private emissiveIntensity: EmissiveIntensity;

    constructor() {
        this.group = new THREE.Object3D();

        this.panels = [];
        for (let floorIdx = 0; floorIdx < FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (let panelIdx = 0; panelIdx < PANEL_COUNT_PER_FLOOR; panelIdx++) {
                let geometry = new THREE.BoxGeometry(0.6, 0.6, 0.1); // TODO: clone() ?
                let material = new THREE.MeshPhongMaterial({color: 0xf2e9d8});
                let panel = new THREE.Mesh(geometry, material);

                let x = panelIdx;
                let y = floorIdx + 1; // Offset up 1 because ground is y = 0.
                let z = 0;
                panel.position.set(x, y, z);

                this.panels[floorIdx][panelIdx] = panel;
            }
        }

        this.pointLights = [];
        for (let count = 0; count < POINT_LIGHT_COUNT; count++) {
            let pointLight = new THREE.PointLight(0xff00ff, 1.75, 1.25);
// These two lines are for debugging:
// let sphere = new THREE.SphereGeometry( 0.1, 16, 8 );
// pointLight.add( new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffffff})));
            pointLight.position.set(-100, -100, 0.33); // Just get it out of the way for now
            this.pointLights.push(pointLight);
        }

        this.currentPointLightIdx = 0;

        this.pulseTween = null;
        this.pulseTweenElapsed = 0;
        this.emissiveIntensity = new EmissiveIntensity();
    }

    start() {
        // Transform to fit against building.
        this.group.position.set(1.9, 3.8, -1.55);
        this.group.scale.set(0.7, 1.0, 1);

        for (let floor of this.panels) {
            for (let panel of floor) {
                this.group.add(panel);
            }
        }

        for (let pointLight of this.pointLights) {
            this.group.add(pointLight);
        }

        // Make cells appear to pulse.
        this.emissiveIntensity.value = 0.33;
        this.pulseTweenElapsed = 0;
        this.pulseTween = new TWEEN.Tween(this.emissiveIntensity)
            .to({value: 1.0}, 750)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .start(this.pulseTweenElapsed);
    }

    step(elapsed: number) {
        this.stepPulse(elapsed);
    }

    switchRoomLight(floorIdx: number, panelIdx: number, color: number) {
        let panel = this.panels[floorIdx][panelIdx];
        panel.material.emissive.setHex(color);
    }

    sendPointLightTo(floorIdx: number, panelIdx: number, color: number) {
        let pointLight = this.getNextPointLight();
        pointLight.color.setHex(color);

        let x = panelIdx;
        let y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        let z = 0.33;
        pointLight.position.set(x, y, z);
    }

    private getNextPointLight() {
        let pointLight = this.pointLights[this.currentPointLightIdx];
        this.currentPointLightIdx++;
        if (this.currentPointLightIdx >= POINT_LIGHT_COUNT) {
            this.currentPointLightIdx = 0;
        }
        return pointLight;
    }

    private stepPulse(elapsed: number) {
        if (this.pulseTween != null) {
            this.pulseTweenElapsed += elapsed;
            this.pulseTween.update(this.pulseTweenElapsed);
        }
        
        for (let floor of this.panels) {
            for (let panel of floor) {
                panel.material.emissiveIntensity = this.emissiveIntensity.value;
            }
        }
    }
}
export const lightingGrid = new LightingGrid();