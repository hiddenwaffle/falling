declare const THREE: any;

// TODO: Only the 3rd floor from the top and below are visible, so 20 rows by 10 panels.
export const FLOOR_COUNT = 20;
export const PANEL_COUNT_PER_FLOOR = 10;
const POINT_LIGHT_COUNT = 4;

class LightingGrid {
    
    private group: any;
    private panels: any[][];
    private pointLights: any[];
    private currentPointLightIdx: number;

    constructor() {
        this.group = new THREE.Object3D();

        this.panels = [];
        for (let floorIdx = 0; floorIdx < FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (let panelIdx = 0; panelIdx < PANEL_COUNT_PER_FLOOR; panelIdx++) {
                let geometry = new THREE.BoxGeometry(0.6, 0.6, 0.2); // TODO: clone() ?
                let material = new THREE.MeshPhongMaterial({color: 0xf2e9d8});
                let panel = new THREE.Mesh(geometry, material);
                panel.position.set(panelIdx, floorIdx, 0);
                this.panels[floorIdx][panelIdx] = panel;
            }
        }

        this.pointLights = [];
        for (let count = 0; count < POINT_LIGHT_COUNT; count++) {
            let pointLight = new THREE.PointLight(0xff00ff, 1.25, 1.25);
// These two lines are for debugging:
// let sphere = new THREE.SphereGeometry( 0.1, 16, 8 );
// pointLight.add( new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({color: 0xffffff})));
            pointLight.position.set(-100, -100, 0.33); // Just get it out of the way for now
            this.pointLights.push(pointLight);
        }

        this.currentPointLightIdx = 0;
    }

    start() {
        for (let floor of this.panels) {
            for (let panel of floor) {
                this.group.add(panel);
            }
        }

        for (let pointLight of this.pointLights) {
            this.group.add(pointLight);
        }
    }

    step(elapsed: number) {
        // for (let floor of this.cubes) {
        //     for (let glass of floor) {
        //         glass.rotation.x += 0.01;
        //         glass.rotation.y += 0.01;
        //     }
        // }
    }

    switchRoomLight(floorIdx: number, panelIdx: number, color: number) {
        let panel = this.panels[floorIdx][panelIdx];
        panel.material.emissive.setHex(color);
    }

    sendBrightLightTo(floorIdx: number, panelIdx: number, color: number) {
        let pointLight = this.getNextPointLight();
        pointLight.color.setHex(color);
        pointLight.position.set(panelIdx, floorIdx, 0.33);
    }

    getGroup(): any {
        return this.group;
    }

    private getNextPointLight() {
        let pointLight = this.pointLights[this.currentPointLightIdx];
        this.currentPointLightIdx++;
        if (this.currentPointLightIdx >= POINT_LIGHT_COUNT) {
            this.currentPointLightIdx = 0;
        }
        return pointLight;
    }
}
export const lightingGrid = new LightingGrid();