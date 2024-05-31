import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as dat from 'dat.gui';

    /*
    +-------------------+                                                                                                     
    |                   |                                                                                                     
    |  EngineService    |                                                                                                     
    |                   |                                                                                                     
    +---------^---------+     
    */

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private cube: THREE.Mesh;
  private frameId: number = null;
  private model!: THREE.Group; // Store the model
  private controls!: OrbitControls;


  public constructor(private ngZone: NgZone) {
  }

  
    /*
    +-----------------------------------------------------------------------------+                                                                                                     
    |                                                                             |                                                                                                     
    |   ngOnDestroy- TBD                                                          |
    |     -checks if frameId is not null,if null it cancels  animationframe
    |     -checks if the renderer is not null,if null it cleans up the renderer 
    |      -sets the canvas to null                 |                                                                                                     
    +---------^---------------------------------------+     
    */

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer != null) {
      this.renderer.dispose();
      this.renderer = null;
      this.canvas = null;
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    /*
    +------------------------------------------------------+                                                                                                     
    |                                                      |                                                                                                     
    | create Renderer                                      |
    |  → pass canvas element reference from HTML document  |
    | - use WebGLRenderer → pass the canvas element        |
    | - Set renderer size → using window object            |                                                                                                     
    |  - for cast shadow ->shadowmap enabled to true                                                   |                                                                                                     
    +---------^--------------------------------------------+     
    */

    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
     this.renderer.shadowMap.enabled = true; 

    // create the scene
    /*
    +-----------------------------------------------------------------+                                                                                                     
    |                                                                 |                                                                                                     
    | Add to Scene                                                    |
    |     - uses threejs.scene → creates a basic scene                |                       
    |     - use PerspectiveCamera → pass window object and Z position |
    |     - use AmbientLight → pass light color and Z position        |
    |      → add to scene  
    |                                                                 |                                                                                                   
    +---------^-------------------------------------------------------+     
    */
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.01, 100
    );
    //this.camera.position.z = 5;
    //this.scene.add(this.camera);
    this.camera.position.set(0, 2, 5);

    //  added axesHelper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
    
/*
    // soft white light(Ambient light)

    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

/*


  // directional light
  +-----------------------------------------------------------------+                                                                                                     
   |                                                                 |                                                                                                     
 
   |    -use threejs.directionallight -> create castshadow           |                                                                                                     
   |    -use directionallight -> pass color and intensity
   |    -set positions and enable castshadow true
   |    -add to scene
   |   optional (add a helper camera ) for shadow
   |    -optional (set the size of camera)
   |    - add to scene                                                |                                                                                                   
   +---------^-------------------------------------------------------+     
   */

  /*
   const directionalLight = new THREE.DirectionalLight(0xFFFFFF , 1);
    directionalLight.position.set(20, 20, 20);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    directionalLight.shadow.camera.top += 25
    directionalLight.shadow.camera.bottom += 25
    directionalLight.shadow.camera.left += 25
    directionalLight.shadow.camera.right += 25

    // Helper for directional light

    this.scene.add( new THREE.CameraHelper(directionalLight.shadow.camera) );


      // SpotLight

      /*
   +-----------------------------------------------------------------+                                                                                                     
   |                                                                 |                                                                                                     

   |    -use threejs.SpotLight -> create spotlight 
        -add to scene          |                                                                                                     

   |    -set positions and enable castshadow true
        - set angle
   |    -add to scene
   |   optional - use threejs.SpotLighthelper -> create spotlighthelper) for spotlight
   | 
   |    - add to scene                                                                                                                                                 
   +---------^-------------------------------------------------------+     
   */

   /*
      const spotlight = new THREE.SpotLight(0xFFFFFF);
      this.scene.add(spotlight);
      spotlight.position.set(-100, 100, 0);
      spotlight.castShadow = true;
      spotlight.angle = 0.2;

      // Helper for spot light

      const sLightHelper = new THREE.SpotLightHelper(spotlight);
      this.scene.add(sLightHelper);



    // Cube mesh
    /*
    +---------------------------------------------------------------------+                                                                                                     
    |                                                                     |                                                                                                     
    | Create Cube Mesh                                                    |
    |     - uses BoxGeometry → creates a basic cube with 1,1,1 dimensions |
    |     - use MeshBasicMaterial → pass Material Color                   |   
    |     - use THREE.Mesh → pass geometry and material to create a mesh 
    |     - set position of cube
    |      → add to scene                                                 |                                                                                                     
    |                                                                     |                                                                                                     
    +---------^-----------------------------------------------------------+     
    */

    
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.x = 0;
    this.cube.position.y = 0;
     this.cube.position.z = 0;
     this.cube.receiveShadow = true;
     this.cube.castShadow = true;
     this.scene.add(this.cube); 
    

      // Plane mesh

        /*
    +---------------------------------------------------------------------+                                                                                                     
    |                                                                     |                                                                                                     
    | Create plane Mesh                                                    |
    |     - uses planeGeometry → creates a plane with 20 , 20 dimensions |
    |     - use MeshBasicMaterial → pass Material Color  .double side view |   
    |     - use THREE.Mesh → pass geometry and material to create a mesh 
    |     - set position of plane
          - set rotation of plane 
          - set recieve shadow to be true 
          -added a grid helper
    |      → add to scene                                                 |                                                                                                     
    |                                                                     |                                                                                                     
    +---------^-----------------------------------------------------------+     
    */
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    //const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = - Math.PI / 2; // Rotate the plane to be horizontal
    //plane.position.y = -1;
    plane.receiveShadow = true;
    this.scene.add(plane);

    // helper for grid
    const gridHelper = new THREE.GridHelper(20);
    this.scene.add(gridHelper);

    // sphere mesh

         /*
    +---------------------------------------------------------------------+                                                                                                     
    |                                                                     |                                                                                                     
    | Create sphere Mesh                                                  |
    |     - uses sphereGeometry → creates a sphere with  dimensions       |
    |     - use MeshBasicMaterial → pass Material Color  ,  wireframe     |   
    |     - use THREE.Mesh → pass geometry and material to create a mesh 
    |     - set position of sphere
    |      → add to scene                                                 |                                                                                                     
    |                                                                     |                                                                                                     
    +---------^-----------------------------------------------------------+     
    */

    const sphereGeometry = new THREE.SphereGeometry(2);
    const sphereMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF, wireframe: false});
    //const sphereMaterial = new THREE.MeshStandardMaterial({color: 0x0000FF, wireframe: true});
    //const sphereMaterial = new THREE.MeshLambertMaterial({color: 0x0000FF, wireframe: true});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene.add(sphere);
    sphere.position.set(-4,4,0);

    //added gui

           /*
    +---------------------------------------------------------------------+                                                                                                     
    |                                                                     |                                                                                                     
    | installed dat.gui  ( using command npm install dat.gui)                                                
    |     - A GUI is added to allow real-time color changes of a sphere's
            material via a color picker.      
    |     - wireframe                                                                                                                                                 
    |                                                                     |                                                                                                     
    +---------^-----------------------------------------------------------+     
    */

    const gui = new dat.GUI();
    const options = {
    sphereColor: '#ffea00',
    wireframe: false,
      };
    gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e);
    });
    
    gui.add(options, 'wireframe').onChange(function (e) {
      sphere.material.wireframe = e;
    });
    
    

    //Create Controls

    /*
    +-----------------------------------------------------------------------+                                                                                                     
    |                                                                       |                                                                                                     
    | Create Orbit controls                                                 |
    |     - uses OrbitControls → creates a basic mouse control              |
    |     - Pass previously created camera and domElement from renderer     |   
    |     - use minDistance / maxDistance  → pass values                    |
    |     - use target.set → pass values for the focus point of the controls|
    |         -the .object orbits around this                               |
    |      - Update the controls with above changes                         |                                                                                                     
    |                                                                       |                                                                                                     
    +---------^-------------------------------------------------------------+     
    */

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 5;
    this.controls.maxDistance = 10;
    this.controls.target.set(0, 2, 2);
    this.controls.update();

  }
   

  
  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
/*
    +-------------------------------------------------------------------------------------+                                                                                                     
    |                                                                                     |                                                                                                     
    | Trigger Change Detection Cycles                                                     |
    |    - Run the rendering loop outside Angular’s change detection mechanism.           |
    |   → Ensures the rendering starts once the document is fully loaded                  |      
    |   → adds an event listener to execute the this.render(DOM content has fully loaded) |
    |   → adds an event listener to execute the this.resize() the window is resized.      |                                                                                                     
    |                                                                                     |                                                                                                     
    +---------^---------------------------------------------------------------------------+     
    */
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

/*
    +-------------------------------------------------------------------------------------+                                                                                                     
    |                                                                                     |                                                                                                     
    | Schedule Frames                                                                     |
    |      - Schedule the next frame to be rendered using requestAnimationFrame           |
    |   → set model rotation for y axis                                                   |
    |   → set cube rotation for x & y axis                                                |
    |   → render the scene from the perspective of the camera.                            |                                                                                                     
    |                                                                                     |                                                                                                     
    +---------^---------------------------------------------------------------------------+     
    */

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
        // Rotate the model if it is loaded
        if (this.model) {
          this.model.rotation.y += 0.01; // Adjust the rotation speed as needed
        }

    
    this.renderer.render(this.scene, this.camera);
  }

  /*
    +-------------------------------------------------------------------------------------+                                                                                                     
    |                                                                                     |                                                                                                     
    | Resize Renderer                                                                     |
    |      - Update the camera aspect ratio from the window object width and Height       |
    |     → updates the camera's projection matrix                                        |
    |     → set the size of the renderer to match the new window dimensions               |                                                                                                     
    |                                                                                     |                                                                                                     
    +---------^---------------------------------------------------------------------------+     
    */
  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /*
    +-------------------------------------------------------------------------------------+                                                                                                     
    |                                                                                     |                                                                                                     
    | Load Model HDR and GLTF                                                             |
    |  - Uses RGBELoader to load an HDR texture from the assets                           |
    |     → configure texture mapping --> uses THREE.EquirectangularReflectionMapping     |
    |     → set scene background texture                                                  |
    |     → set scene environment texture                                                 |
    |  - uses GLTFLoader to load a GLTF model                                             |
    |     → gltfmodel once loaded,store it in model                                       |
    |     → add to the scene                                                              |
    |     → set the position of model                                                     |
    |     → set the scale of model                                                        |
    |  → updates updateMatrixWorld to the model                                           |
    |                                                                                     |               
    |                                                                                     |                                                                                                     
    +---------^---------------------------------------------------------------------------+     
    */

  public loadModel(): void {

    new RGBELoader()
    .setPath('assets/')
    .load('quarry_01_1k.hdr', texture => {
      console.log
      texture.mapping = THREE.EquirectangularReflectionMapping;
     this.scene.background = texture;
     this.scene.environment = texture;
    });

    const loader = new GLTFLoader();
    loader.load(
      'assets/frame.glb', // Adjust the path to your .glb file
      (gltf) => {
        this.model = gltf.scene; // Store the model
        
       //this.scene.add(gltf.scene);

        this.model.position.set(4, 4, 4);
        //this.model.rotation.set(Math.PI / 4, Math.PI / 4, 0);
        this.model.scale.set(4, 4, 4);

        // Update the model's world matrix
       this.model.updateMatrixWorld(true);
       this.scene.add(this.model);
        
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('An error happened', error);
      }
    );
  }

}
