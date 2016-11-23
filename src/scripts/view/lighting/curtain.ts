declare const THREE: any;
declare const TWEEN: any;

import {PANEL_COUNT_PER_FLOOR} from '../../domain/constants';

const MAX_CURTAIN_COUNT = 4;
const CURTAIN_WIDTH = PANEL_COUNT_PER_FLOOR;
const CURTAIN_MOVE_TIME = 333;

class CurtainVertexPosition {
    x = 0;
    elapsed = 0;
}

export enum CurtainDirection {
    OpenLeftToRight,
    OpenRightToLeft,
    CloseLeftToRight,
    CloseRightToLeft
}

/**
 * Some notes on vertices within each curtain mesh without modifications:
 * Vertices 1 and 3 should rest at x = -CURTAIN_WIDTH / 2 (house left)
 * Vertices 0 and 2 should rest at x =  CURTAIN_WIDTH / 2 (house right)
 * 
 * Example statements:
 * console.log('vertices 1 and 3 x: ' + curtain.geometry.vertices[1].x, curtain.geometry.vertices[3].x);
 * console.log('vertices 0 and 2 x: ' + curtain.geometry.vertices[0].x, curtain.geometry.vertices[2].x);
 * console.log('---');
 */
export class Curtain {

    readonly group: any;
    readonly curtains: any[];

    private curtainVertexPosition: CurtainVertexPosition;
    private curtainTween: any;

    constructor() {
        this.group = new THREE.Object3D();
        this.curtains = [];

        for (let idx = 0; idx < MAX_CURTAIN_COUNT; idx++) {
            let geometry = new THREE.PlaneGeometry(CURTAIN_WIDTH, 1);
            let material = new THREE.MeshPhongMaterial({color: 0x101030}); // Midnight Blue
            let curtain = new THREE.Mesh(geometry, material);
            this.curtains.push(curtain);
        }

        this.curtainVertexPosition = new CurtainVertexPosition();
        this.curtainTween = null;
    }

    start() {
        for (let curtain of this.curtains) {
            this.group.add(curtain);
        }

        // Transform group to fit against building.
        this.group.position.set(5.0, 4.75, -1.451);
        this.group.scale.set(0.7, 1.0, 1);

        this.group.visible = false;
    }

    step(elapsed: number) {
        if (this.curtainTween != null) {
            this.curtainVertexPosition.elapsed += elapsed;
            this.curtainTween.update(this.curtainVertexPosition.elapsed);
        }
    }

    startAnimation(floorIdxs: number[], direction: CurtainDirection) {
        // Prevent multiple animations at the same time.
        if (this.curtainTween != null) {
            return;
        }

        this.dropCurtain(floorIdxs);

        let xend: number;
        if (direction === CurtainDirection.CloseLeftToRight) {
            this.curtainVertexPosition.x = -CURTAIN_WIDTH / 2;
            xend = CURTAIN_WIDTH / 2;
        } else {
            this.curtainVertexPosition.x =  CURTAIN_WIDTH / 2;
            xend = -CURTAIN_WIDTH / 2;
        }
        this.curtainVertexPosition.elapsed = 0;

        this.curtainTween = new TWEEN.Tween(this.curtainVertexPosition)
            .to({x: xend}, CURTAIN_MOVE_TIME)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(() => {
                let idx1: number, idx2: number;
                if (direction === CurtainDirection.CloseLeftToRight) {
                    idx1 = 0;
                    idx2 = 2;
                } else {
                    idx1 = 1;
                    idx2 = 3;
                }
                for (let curtain of this.curtains) {
                    curtain.geometry.vertices[idx1].x = this.curtainVertexPosition.x;
                    curtain.geometry.vertices[idx2].x = this.curtainVertexPosition.x;
                    curtain.geometry.verticesNeedUpdate = true;
                }
            })
            .onComplete(() => { this.completeAnimation(); })
            .start(this.curtainVertexPosition.elapsed);
    }

    /**
     * Make the requested number of curtains visible.
     * Position them on the requested floors.
     */
    private dropCurtain(floorIdxs: number[]) {
        for (let curtain of this.curtains) {
            curtain.visible = false;
        }

        for (let idx = 0; idx < floorIdxs.length; idx++) {
            let floorIdx = floorIdxs[idx];
            let curtain = this.curtains[idx];

            curtain.position.set(0, floorIdx, 0);

            // See note at top about why these are where they are.
            curtain.geometry.vertices[0].x = -CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[1].x =  CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[2].x = -CURTAIN_WIDTH / 2;
            curtain.geometry.vertices[3].x =  CURTAIN_WIDTH / 2;
            curtain.geometry.verticesNeedUpdate = true;
            
            curtain.visible = true;
        }

        this.group.visible = true;
    }

    private completeAnimation() {
        this.group.visible = false;
        this.curtainTween = null;
    }
}