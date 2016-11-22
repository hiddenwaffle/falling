declare const THREE: any;
declare const TWEEN: any;

import {PANEL_COUNT_PER_FLOOR} from '../../domain/constants';
import {RowClearDirection} from '../../domain/row-clear-direction';

const CURTAIN_WIDTH = PANEL_COUNT_PER_FLOOR;

class CurtainVertexPosition {
    x = 0;
    elapsed = 0;
}

/**
 * Some notes on vertices within the mesh without modifications:
 * Vertices 1 and 3 should have x = -CURTAIN_WIDTH / 2
 * Vertices 0 and 2 should have x =  CURTAIN_WIDTH / 2
 * 
 * Example statements:
 * console.log('vertices 1 and 3 x: ' + this.curtain.geometry.vertices[1].x, this.curtain.geometry.vertices[3].x);
 * console.log('vertices 0 and 2 x: ' + this.curtain.geometry.vertices[0].x, this.curtain.geometry.vertices[2].x);
 * console.log('---');
 */
export class JunkRowCurtain {

    readonly group: any;

    private readonly rowClearDirection: RowClearDirection;

    private curtain: any;
    private curtainVertexPosition: CurtainVertexPosition;
    private pullCurtainTween: any;

    constructor(rowClearDirection: RowClearDirection) {
        this.group = new THREE.Object3D();

        this.rowClearDirection = rowClearDirection;

        let geometry = new THREE.PlaneGeometry(CURTAIN_WIDTH, 1);
        let material = new THREE.MeshPhongMaterial({color: 0x101030}); // Midnight Blue
        this.curtain = new THREE.Mesh(geometry, material);

        this.curtainVertexPosition = new CurtainVertexPosition();
        this.pullCurtainTween = null;
    }

    start() {
        this.group.add(this.curtain);

        // Transform group to fit against building.
        this.group.position.set(5.0, 4.75, -1.451);
        this.group.scale.set(0.7, 1.0, 1);

        this.curtain.visible = false;
    }

    step(elapsed: number) {
        if (this.pullCurtainTween != null) {
            this.curtainVertexPosition.elapsed += elapsed;
            this.pullCurtainTween.update(this.curtainVertexPosition.elapsed);
        }
    }

    startAnimation(rowCount: number) {
        // Prevent multiple animations at the same time.
        if (this.pullCurtainTween != null) {
            return;
        }

        this.dropCurtain(rowCount);

        let xend: number;
        if (this.rowClearDirection === RowClearDirection.LeftToRight) {
            this.curtainVertexPosition.x = -CURTAIN_WIDTH / 2;
            xend = CURTAIN_WIDTH / 2;
        } else {
            this.curtainVertexPosition.x =  CURTAIN_WIDTH / 2;
            xend = -CURTAIN_WIDTH / 2;
        }
        this.curtainVertexPosition.elapsed = 0;

        this.pullCurtainTween = new TWEEN.Tween(this.curtainVertexPosition)
            .to({x: xend}, 333)
            .easing(TWEEN.Easing.Quartic.InOut)
            .onUpdate(() => {
                let idx1: number, idx2: number;
                if (this.rowClearDirection === RowClearDirection.LeftToRight) {
                    idx1 = 0;
                    idx2 = 2;
                } else {
                    idx1 = 1;
                    idx2 = 3;
                }
                this.curtain.geometry.vertices[idx1].x = this.curtainVertexPosition.x;
                this.curtain.geometry.vertices[idx2].x = this.curtainVertexPosition.x;
                this.curtain.geometry.verticesNeedUpdate = true;
            })
            .onComplete(() => { this.completeAnimation(); })
            .start(this.curtainVertexPosition.elapsed);
    }

    /**
     * Position and scale the curtain so that it covers X floors at the bottom.
     */
    private dropCurtain(rowCount: number) {
        // See note at top about why these are where they are.
        this.curtain.geometry.vertices[0].x = -CURTAIN_WIDTH / 2;
        this.curtain.geometry.vertices[1].x =  CURTAIN_WIDTH / 2;
        this.curtain.geometry.vertices[2].x = -CURTAIN_WIDTH / 2;
        this.curtain.geometry.vertices[3].x =  CURTAIN_WIDTH / 2;
        this.curtain.geometry.verticesNeedUpdate = true;

        if (rowCount === 1) {
            this.curtain.position.set(0, 0, 0);
            this.curtain.scale.set(1, 1, 1);
        } else if (rowCount === 2) {
            this.curtain.position.set(0, 0.5, 0);
            this.curtain.scale.set(1, 2, 1);
        } else if (rowCount === 3) {
            this.curtain.position.set(0, 1, 0);
            this.curtain.scale.set(1, 3, 1);
        } else if (rowCount === 4) {
            this.curtain.position.set(0, 1.5, 0);
            this.curtain.scale.set(1, 4, 1);
        }

        this.curtain.visible = true;
    }

    private completeAnimation() {
        this.curtain.visible = false;
        this.pullCurtainTween = null;
    }
}