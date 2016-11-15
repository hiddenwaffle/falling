declare const THREE: any;

import {world} from './world/world';
import {lightingGrid} from './lighting/lighting-grid';
import {switchboard} from './lighting/switchboard';
import {standeeManager} from './standee/standee-manager';

class View {

    private scene: any;
    private camera: any;
    private renderer: any;

    private sprite: any;
    private texture: any;
    private row: number;
    private col: number;
    private ttl: number;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        // this.renderer.sortObjects = false; // FIXME: I'm not sure why I'm able to comment this out now...
    }

    start() {
        this.doStart();

        world.start();
        lightingGrid.start();
        switchboard.start();
        standeeManager.start();
    }

    step(elapsed: number) {
        world.step(elapsed);
        lightingGrid.step(elapsed);
        switchboard.step(elapsed);
        standeeManager.step(elapsed);

        // FIXME: I'm not really sure why it is sorting these correctly without this:
        // for (let obj of standeeManager.group.children) {
        //     let distance = this.camera.position.distanceTo(obj.position);
        //     obj.renderOrder = distance * -1;
        // }
        
        this.ttl -= elapsed;
        if (this.ttl <= 0) {
            this.ttl = 250;

            this.col++;
            if (this.col >= 3) { // 3 images + 2 blank padding
                this.col = 0;
                this.row++;
                if (this.row >= 5) { // 5 images + 2 blank padding
                    this.row = 0;
                }
            }

            // Using percentages:
            // let x = 0 + (this.col / 5);       // Adjust for spritesheet, 5 columns from left.
            // let y = 1 - ((this.row + 1) / 7); // Adjust for spritesheet, 7 rows from bottom.
            // this.texture.offset.set(x, y);

            // Using pixels:
            let x = 48 * this.col;
            let y = 512 - ((this.row + 1) * 72);
            let xpct = x / 256;
            let ypct = y / 512;
            this.texture.offset.set(xpct, ypct);
        }

        // let x = 1/5;
        // let y = 1 - (5/7);
        // this.texture.offset.set(x, y);

        this.renderer.render(this.scene, this.camera);
    }

    private doStart() {
        this.scene.add(world.group);
        this.scene.add(standeeManager.group);
        this.scene.add(lightingGrid.group);

        // TODO: Temporary for debugging?
        this.scene.add(new THREE.AmbientLight(0x404040));

        this.camera.position.set(-3, 0.75, 15); // A little higher than eye-level with the NPCs.
        this.camera.lookAt(new THREE.Vector3(4, 9, 0));

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });

        let textureLoader = new THREE.TextureLoader();
        this.texture = textureLoader.load('fall-student.png', () => {
            // this.texture.wrapS = THREE.RepeatWrapping; // Allows for texture flipping, when necessary.
            this.texture.repeat.set(48/256, 72/512); 
            // this.texture.offset.set(0 + 0/5, 1 - 1/7);

            let material = new THREE.SpriteMaterial({map: this.texture}); // FIXME: Why isn't depthWrite = true needed anymore?
            this.sprite = new THREE.Sprite(material);
            this.sprite.scale.set(5, 7, 1); // Adjusted for spritesheet rows = 7, cols = 5.
            this.sprite.position.set(5, 6.75, 3);
            this.scene.add(this.sprite);

            this.row = 0;
            this.col = 0;
            this.ttl = 100;

            for (let i = 0; i < 1000; i++) {
                // let clonedTexture = this.texture;

                // let clonedTexture = this.texture.clone();
                // clonedTexture.needsUpdate = true;

                let clonedTexture = this.texture.clone();
                clonedTexture.__webglTexture = this.texture.__webglTexture;
                clonedTexture.__webglInit = true;
            
                clonedTexture.wrapS = THREE.RepeatWrapping;
                clonedTexture.wrapT = THREE.RepeatWrapping;
                clonedTexture.repeat.set(0.5 + Math.random(), 0.5 + Math.random());
                let geometry = new THREE.BoxGeometry(1, 1, 1);
                let material = new THREE.MeshBasicMaterial({
                    map: clonedTexture,
                    side: THREE.DoubleSide
                });
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.x = Math.random() * 20 - 5; 
                mesh.position.y = Math.random() * 20 - 5; 
                mesh.position.z = Math.random() * 20 - 5; 
                this.scene.add(mesh);
                console.log("Texture count: " + this.renderer.info.memory.textures);
            }
        });
    }
}
export const view = new View();
