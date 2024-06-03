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
  private donkeyModel!: THREE.Group; // Store the donkey model
  private pivot: THREE.Object3D; // Pivot point for rotation
  private controls!: OrbitControls;
  private sphere: THREE.Mesh;
  private step = 0; // Step for sphere animation
  private options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.01, // Animation speed for the sphere
    angle: 0.2,
    penumbra: 0,
    intensity: 1
  };
  public constructor(private ngZone: NgZone) {
    this.pivot = new THREE.Object3D(); // Initialize the pivot point
  }

  
    /*
    +-----------------------------------------------------------------------------+                                                                                                     
    |                                                                             |                                                                                                     
    |   ngOnDestroy- TBD                                                          |
    |     -checks if frameId is not null,if null it cancels  animationframe
    |     -checks if the renderer is not null,if null it cleans up the renderer 
    |      -sets the canvas to null                                                                                                                    
    +---------^--------------------------------------------------------------------+     
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
    this.camera.position.set(4, 0, 4);

  
    //  added axesHelper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

  /*  
// ambient light
+-----------------------------------------------------------------+                                                                                                     
|                                                                 |                                                                                                     

|    -use threejs.AmbientLight -> create AmbientLight                                                                                                              
|    -use AmbientLight -> pass color 
|    - add to scene                                                                                                                                             
+---------^-------------------------------------------------------+     
*/


//(Ambient light)
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);


/*
  // directional light
  +-----------------------------------------------------------------+                                                                                                     
   |                                                                 |                                                                                                     
 
   |    -use threejs.directionallight -> create directionallight           |                                                                                                     
   |    -use directionallight -> pass color and intensity
   |    -set positions and enable castshadow true
   |    -add to scene
   |   optional (add a DirectionalLightHelper) for DirectionalLight
   |    - add to scene      
        optional (add a CameraHelper) for DirectionalLight shadow 
   |    - add to scene                                           |                                                                                                   
   +---------^-------------------------------------------------------+     
   */


   
   // (directional light)
      const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
       this.scene.add(directionalLight);
      directionalLight.position.set(-30, 50, 0)
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.bottom = -12
     
      
   //helper for directional light
   
      const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
       this.scene.add(dLightHelper);

       const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
       this.scene.add(dLightShadowHelper);
   



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
*/

    // Cube mesh
    /*
    +------------------------------------------------------------------------------------------------+                                                                                                     
    |                                                                                                |                                                                                                     
    | Create Cube Mesh                                                                               |
    |     - uses BoxGeometry → creates a basic cube with 1,1,1 dimensions                            |
    |     - use MeshBasicMaterial → pass Material Color                                               |   
    |     - use THREE.Mesh → pass geometry and material to create a mesh 
    |     - set position of cube
    |      → add to scene                                                                             |                                                                                                     
    |                       ---> added a texture for cube
    |       uses THREE.js Textureloader -> creates texture
    |       uses a jpg image as a texture(from assets)
    |       if you need different texture in each sides,use this-->
    |   --const boxMultiMaterial = [ new THREE.MeshBasicMaterial({map: textureLoader(image1.jpg)}), 
      repeat for next image                                                                           |                                                                                                     
    +---------^---------------------------------------------------------------------------------------+     
    */

     // Load the texture and apply it to the cube
     const textureLoader = new THREE.TextureLoader();
     const texture = textureLoader.load('assets/pexels.jpg'); // Replace with your JPG image path
     const cubeMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    //const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const material = new THREE.MeshStandardMaterial({
      //color: 0x00ff00
     map:texture
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.x = 0;
    this.cube.position.y = 2;
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
    const planeGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
    //const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
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
    //const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: false});
    const sphereMaterial = new THREE.MeshStandardMaterial({color: 0x0000FF, wireframe: false});
    //const sphereMaterial = new THREE.MeshLambertMaterial({color: 0x0000FF, wireframe: false});
    
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.sphere.position.set(-4, 2, 0); // Initial position
    this.sphere.castShadow = true;
    this.pivot.add(this.sphere); // Add the sphere to the pivot
   //this.scene.add(this.sphere);
    this.scene.add(this.pivot); // Add the pivot to the scene
    

    //added gui

           /*
    +---------------------------------------------------------------------+                                                                                                     
    |                                                                     |                                                                                                     
    | installed dat.gui  ( using command npm install dat.gui)                                                
    |     - A GUI is added to allow real-time color changes of a sphere's
            material via a color picker.
            -use THREE.js MeshBasicMaterial → pass Material Color     
    |     - wireframe(-use THREE.js MeshBasicMaterial → pass wireframe )    
          -speed
          -angle
          -penumbra
          -intensity                                                                                                                                            
    |                                                                     |                                                                                                     
    +---------^-----------------------------------------------------------+     
    */

    const gui = new dat.GUI();
   
    gui.addColor(this.options, 'sphereColor').onChange((e) => {
      (this.sphere.material as THREE.MeshBasicMaterial).color.set(e);
    });
    gui.add(this.options, 'wireframe').onChange((e) => {
      (this.sphere.material as THREE.MeshBasicMaterial).wireframe = e;
    });
    gui.add(this.options, 'speed', 0, 0.1);
    gui.add(this.options, 'angle', 0, 1);
    gui.add(this.options, 'penumbra', 0, 1);
    gui.add(this.options, 'intensity', 0, 1);

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
    this.scene.add(this.pivot); // Add the pivot point to the scene

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
    |    for cube  - Schedule the next frame to be rendered using requestAnimationFrame           |
    |                → set model rotation for y axis                                                   |
    |                → set cube rotation for x & y axis  
    |   for sphere  -set speed and bounce    
    |   for model   -set rotation                                          |
    |   → render the scene from the perspective of the camera.                            |                                                                                                     
    |                                                                                     |                                                                                                     
    +---------^------------- --------------------------------------------------------------+     
    */

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    // Update the step value for the sphere animation
    this.step += this.options.speed;
    // Apply a sine wave function to the sphere's Y position
    this.sphere.position.y = 2 + Math.abs(Math.sin(this.step) * 2);
/*
  
        // Rotate the model if it is loaded
        if (this.model) {
         this.model.rotation.y += 0.01; // Adjust the rotation speed as needed
        }
       */
        if (this.model) {

          this.pivot.rotation.y += 0.01; // Rotate the pivot point
    
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
      // Load the environment texture
      new RGBELoader()
        .setPath('assets/')
        .load('quarry_01_1k.hdr', texture => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          this.scene.background = texture;
          this.scene.environment = texture;
        });
    
      // Load the existing model
      const loader = new GLTFLoader();
      loader.load(
        'assets/frame.glb',
        (gltf) => {

          this.model = gltf.scene;
          this.model.position.set(4, 4, 4);
          this.model.scale.set(4, 4, 4);
          this.model.updateMatrixWorld(true);

            // Enable shadow casting for each mesh in the model
          this.model.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;  // Enable shadow casting
          node.receiveShadow = true;  // Enable shadow receiving if needed
        }
      });
          this.scene.add(this.model);
          this.pivot.add(this.model); // Add the model to the pivot
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.error('An error happened', error);
        }
      );
    
      // Load the additional model (donkey.gltf)
      loader.load(
        'assets/Donkey.gltf', // Adjust the path to your additional .glb file
        (gltf) => {
          const donkeyModel = gltf.scene;
          // Position, scale, and add the model to the scene
          donkeyModel.position.set(0, 0, 3.5); // Adjust position as needed
          donkeyModel.scale.set(1, 1, 1); // Adjust scale as needed

             // Enable shadow casting for each mesh in the donkey model
            donkeyModel.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;  // Enable shadow casting
          node.receiveShadow = true;  // Enable shadow receiving if needed
        }
      });

      this.scene.add(donkeyModel);
        
      this.traverseMaterials(donkeyModel);
    });
  }

  traverseMaterials(object: THREE.Object3D): void {
    object.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const material = mesh.material as THREE.Material;

        if (Array.isArray(material)) {
          material.forEach(mat => this.setupGui(mat));
        } else {
          this.setupGui(material);
        }
      }
    });
  }

  setupGui(material: THREE.Material): void {
    const gui = new dat.GUI();
    const materialFolder = gui.addFolder('Material Properties');

    if ((material as THREE.MeshBasicMaterial).color) {
      materialFolder.addColor((material as THREE.MeshBasicMaterial), 'color').onChange((colorValue) => {
        (material as THREE.MeshBasicMaterial).color.set(colorValue);
      });
    }

    materialFolder.add(material, 'wireframe');

    materialFolder.open();
  }
}