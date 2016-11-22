declare const THREE: any;
declare const TWEEN: any;

import {Building} from './building';
import {JunkRowCurtain} from './junk-row-curtain';
import {HpPanels} from './hp-panels';
import {HpOrientation} from '../../domain/hp-orientation';
import {RowClearDirection} from '../../domain/row-clear-direction';

// TODO: Only the 3rd floor from the top and below are visible. Also, see board.ts.
export const FLOOR_COUNT = 17;
export const PANEL_COUNT_PER_FLOOR = 10;

const ACTIVE_SHAPE_LIGHT_COUNT = 4;
const PANEL_SIZE = 0.7;

class EmissiveIntensity {
    value: number;
}

export class LightingGrid {
    
    readonly group: any;

    private rowClearDirection: RowClearDirection;

    private panelGroup: any;
    private building: Building;
    private junkRowCurtain: JunkRowCurtain;
    private hpPanels: HpPanels;

    private panels: any[][];
    
    private shapeLights: any[];
    private currentShapeLightIdx: number;
    private highlighter: any;

    private pulseTween: any;
    private pulseTweenElapsed: number;
    private emissiveIntensity: EmissiveIntensity;

    constructor(rowClearDirection: RowClearDirection) {
        this.group = new THREE.Object3D();

        this.rowClearDirection = rowClearDirection;
        
        this.panelGroup = new THREE.Object3D();
        this.building = new Building();
        this.junkRowCurtain = new JunkRowCurtain();
        this.hpPanels = new HpPanels();

        this.panels = [];
        for (let floorIdx = 0; floorIdx < FLOOR_COUNT; floorIdx++) {
            this.panels[floorIdx] = [];
            for (let panelIdx = 0; panelIdx < PANEL_COUNT_PER_FLOOR; panelIdx++) {
                let geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE); // TODO: clone() ?
                let material = new THREE.MeshPhongMaterial({emissiveIntensity: 1.0});
                let panel = new THREE.Mesh(geometry, material);
                panel.visible = false;

                let x = panelIdx;
                let y = floorIdx + 1; // Offset up 1 because ground is y = 0.
                let z = 0;
                panel.position.set(x, y, z);

                this.panels[floorIdx][panelIdx] = panel;
            }
        }

        this.shapeLights = [];
        for (let count = 0; count < ACTIVE_SHAPE_LIGHT_COUNT; count++) {
            let geometry = new THREE.PlaneGeometry(PANEL_SIZE, PANEL_SIZE);
            let material = new THREE.MeshPhongMaterial({emissiveIntensity: 1.0});
            let shapeLight = new THREE.Mesh(geometry, material);
            this.shapeLights.push(shapeLight);
        }
        this.currentShapeLightIdx = 0;

        this.highlighter = new THREE.PointLight(0xff00ff, 3.5, 3);

        this.pulseTween = null;
        this.pulseTweenElapsed = 0;
        this.emissiveIntensity = new EmissiveIntensity();
    }

    start(hpOrientation: HpOrientation) {
        this.group.add(this.building.group);
        this.group.add(this.junkRowCurtain.group);
        this.group.add(this.hpPanels.group);
        this.group.add(this.panelGroup);

        this.building.start();
        this.junkRowCurtain.start();
        this.hpPanels.start(hpOrientation);

        for (let floor of this.panels) {
            for (let panel of floor) {
                this.panelGroup.add(panel);
            }
        }

        for (let shapeLight of this.shapeLights) {
            this.panelGroup.add(shapeLight);
        }

        this.panelGroup.add(this.highlighter);

        // Transform to fit against building.
        this.panelGroup.position.set(1.85, 3.8, -1.55);
        this.panelGroup.scale.set(0.7, 1.0, 1);

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
        this.hpPanels.step(elapsed);
    }

    switchRoomOff(floorIdx: number, panelIdx: number) {
        let panel = this.panels[floorIdx][panelIdx];
        panel.visible = false;
    }

    switchRoomOn(floorIdx: number, panelIdx: number, color: number) {
        let panel = this.panels[floorIdx][panelIdx];
        panel.visible = true;
        panel.material.color.setHex(color);
        panel.material.emissive.setHex(color);
    }

    sendActiveShapeLightTo(floorIdx: number, panelIdx: number, color: number) {
        let shapeLight = this.getNextShapeLight();
        shapeLight.material.color.setHex(color);
        shapeLight.material.emissive.setHex(color);

        // Do not light if higher than the highest *visible* floor.
        if (floorIdx >= FLOOR_COUNT) {
            shapeLight.visible = false;
        } else {
            shapeLight.visible = true;
        }

        let x = panelIdx;
        let y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        let z = 0;
        shapeLight.position.set(x, y, z);
    }

    getActiveShapeLightPosition() {
        return this.highlighter.position;
    }

    sendHighlighterTo(floorIdx: number, panelIdx: number, color: number) {
        // Do not light if higher than the highest *visible* floor.
        if (floorIdx >= FLOOR_COUNT) {
            this.highlighter.visible = false;
        } else {
            this.highlighter.visible = true;
            this.highlighter.color.setHex(color);            
        }

        let x = panelIdx;
        let y = floorIdx + 1; // Offset up 1 because ground is y = 0.
        let z = 0;
        this.highlighter.position.set(x, y, z);
    }

    updateHp(hp: number) {
        this.hpPanels.updateHp(hp);
    }

    startJunkRowCurtainAnimation(rowCount: number) {
        this.junkRowCurtain.startAnimation(rowCount);
    }

    private getNextShapeLight() {
        let shapeLight = this.shapeLights[this.currentShapeLightIdx];
        this.currentShapeLightIdx++;
        if (this.currentShapeLightIdx >= ACTIVE_SHAPE_LIGHT_COUNT) {
            this.currentShapeLightIdx = 0;
        }
        return shapeLight;
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