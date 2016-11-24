declare const THREE: any;

class BuildingPreloader {
    
    private instances: any[];
    private instancesRequested: number;

    constructor() {
        this.instances = [];
        this.instancesRequested = 0;
    }

    preload(callback: () => void) {
        let mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath('');
        mtlLoader.load('green-building.mtl', (materials: any) => {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('');
            objLoader.load('green-building.obj', (obj: any) => {
                this.instances.push(obj);
                callback();
            }, () => { }, () => { console.log('error while loading :(') });
        });
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