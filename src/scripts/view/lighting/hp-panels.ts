declare const THREE: any;

import {PANEL_COUNT_PER_FLOOR} from './lighting-grid';
import {HpOrientation} from '../hp-orientation';

export class HpPanels {

    readonly group: any;

    private panels: any[];
    private hpOrientation: HpOrientation;

    constructor() {
        this.group = new THREE.Object3D();
        
        this.panels = [];
        for (let idx = 0; idx < PANEL_COUNT_PER_FLOOR; idx++) {
            let geometry = new THREE.PlaneGeometry(0.6, 0.6);
            let material = new THREE.MeshPhongMaterial();
            let panel = new THREE.Mesh(geometry, material);
            let x = idx;
            let y = 0;
            let z = 0;
            panel.position.set(x, y, z);
            panel.visible = false;

            // TODO: Make this pulse at all?
            panel.material.emissive.setHex(0xffffff);
            panel.material.emissiveIntensity = 0.25;

            this.panels.push(panel);
        }
    }

    start(hpOrientation: HpOrientation) {
        this.hpOrientation = hpOrientation;

        for (let panel of this.panels) {
            this.group.add(panel);
        }

        // Transform to fit against building.
        this.group.position.set(1.85, 3.55, -1.5);
        this.group.scale.set(0.7, 1.9, 1);

        this.updateHp(PANEL_COUNT_PER_FLOOR);
    }

    step(elapsed: number) {
        //
    }

    /**
     * HP bar can go from right-to-left or left-to-right, like a fighting game HP bar.
     */
    updateHp(hp: number) {
        if (hp > PANEL_COUNT_PER_FLOOR) {
            hp = PANEL_COUNT_PER_FLOOR;
        }

        for (let idx = 0; idx < this.panels.length; idx++) {
            let panel = this.panels[idx];
            if (this.hpOrientation === HpOrientation.DecreasesRightToLeft) {
                if (idx < hp) {
                    panel.visible = true;
                } else {
                    panel.visible = false;
                }
            } else {
                if (idx >= PANEL_COUNT_PER_FLOOR - hp) {
                    panel.visible = true;
                } else {
                    panel.visible = false;
                }
            }
        }

        // TODO: Handle update to HP = full as different from HP < full.
    }
}