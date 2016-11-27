declare const THREE: any;

// mtl and obj = 2 files.
const FILES_TO_PRELOAD = 2;

class BuildingPreloader {
    
    private instances: any[];
    private instancesRequested: number;

    constructor() {
        this.instances = [];
        this.instancesRequested = 0;
    }

    preload(signalOneFileLoaded: (success: boolean) => void): number {
        let mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('');
        mtlLoader.load('green-building.mtl', (materials: any) => {
            materials.preload();
            signalOneFileLoaded(true);

            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('');
            objLoader.load('green-building.obj', (obj: any) => {
                this.instances.push(obj);
                signalOneFileLoaded(true);
            }, undefined, () => { signalOneFileLoaded(false); });
        }, undefined, () => { signalOneFileLoaded(false); });

        return FILES_TO_PRELOAD;
    }
    
    getInstance(): any {
        let instance: any;

        if (this.instancesRequested === 0) {
            instance = this.instances[0];
        } else {
            instance = this.instances[0].clone();
            this.instances.push(instance);
        }
        this.instancesRequested++;

        return instance;
    }
}
export const buildingPreloader = new BuildingPreloader();