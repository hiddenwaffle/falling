declare const THREE: any;
declare const TWEEN: any;

import {Building} from './building';
import {Curtain} from './curtain';
import {HpPanels} from './hp-panels';
import {HpOrientation} from '../../domain/hp-orientation';
import {RowClearDirection} from '../../domain/row-clear-direction';
import {CurtainDirection} from './curtain';
import {PANEL_COUNT_PER_FLOOR} from '../../domain/constants';

// TODO: Only the 3rd floor from the top and below are visible. Also, see board.ts.
export const FLOOR_COUNT = 17;

const ACTIVE_SHAPE_LIGHT_COUNT = 4;
const PANEL_SIZE = 0.7;

class EmissiveIntensity {
    value: number;
}

export class LightingGrid {
    
    readonly group: any;

    private panelGroup: any;
    private building: Building;

    private rowClearDirection: RowClearDirection
    private rowClearCurtain: Curtain;
    private junkRowCurtain: Curtain;
    
    private hpPanels: HpPanels;

    private panels: any[][];
    
    private shapeLights: any[];
    private currentShapeLightIdx: number;
    private highlighter: any;

    private pulseTween: any;
    private pulseTweenElapsed: number;
    private emissiveIntensity: EmissiveIntensity;

    constructor(hpOrientation: HpOrientation, rowClearDirection: RowClearDirection) {
        this.group = new THREE.Object3D();

        this.panelGroup = new THREE.Object3D();
        this.building = new Building();

        this.rowClearDirection = rowClearDirection;
        this.rowClearCurtain = new Curtain();
        this.junkRowCurtain = new Curtain();

        this.hpPanels = new HpPanels(hpOrientation);

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

    start() {
        this.group.add(this.building.group);
        this.group.add(this.rowClearCurtain.group);
        this.group.add(this.junkRowCurtain.group);
        this.group.add(this.hpPanels.group);
        this.group.add(this.panelGroup);

        this.building.start();
        this.rowClearCurtain.start();
        this.junkRowCurtain.start();
        this.hpPanels.start();

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
        this.rowClearCurtain.step(elapsed);
        this.junkRowCurtain.step(elapsed);
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

    startRowClearingAnimation(floorIdxs: number[], callback: () => void) {
        let curtainDirection: CurtainDirection;
        if (this.rowClearDirection === RowClearDirection.LeftToRight) {
            curtainDirection = CurtainDirection.OpenLeftToRight;
        } else {
            curtainDirection = CurtainDirection.OpenRightToLeft;
        }

        this.rowClearCurtain.startAnimation(floorIdxs, curtainDirection, callback);
    }

    startJunkRowCurtainAnimation(floorCount: number) {
        if (floorCount > 4) {
            floorCount = 4;
        } else if (floorCount < 0) {
            floorCount = 0;
        }
        let floorIdxs = [0, 1, 2, 3].slice(0, floorCount);

        let curtainDirection: CurtainDirection;
        if (this.rowClearDirection === RowClearDirection.LeftToRight) {
            curtainDirection = CurtainDirection.CloseRightToLeft;
        } else {
            curtainDirection = CurtainDirection.CloseLeftToRight;
        }

        this.junkRowCurtain.startAnimation(floorIdxs, curtainDirection);
    }

    hideShapeLightsAndHighlighter() {
        for (let shapeLight of this.shapeLights) {
            shapeLight.visible = false;
        }
        this.highlighter.visible = false;
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