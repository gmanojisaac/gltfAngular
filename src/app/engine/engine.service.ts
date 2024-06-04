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
  private mixer: THREE.AnimationMixer; // Declare the mixer variable
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
 
   |    -use threejs.directionallight -> create directionallight     |                                                                                                     
   |    -use directionallight -> pass color and intensity
   |    -set positions and enable castshadow true
   |    -add to scene
   |   optional (add a DirectionalLightHelper) for DirectionalLight
   |    - add to scene      
   |optional (add a CameraHelper) for DirectionalLight shadow 
   |    - add to scene                                                |                                                                                                   
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
       //this.scene.add(dLightHelper);

       const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
       //this.scene.add(dLightShadowHelper);
   



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

            // fog
      /*    
   +-----------------------------------------------------------------+                                                                                                     
   |                                                                 |                                                                                                     

   |    -use threejs.Fog -> create fog
        - scene first to linear fog
        - then to exponential fog, and 
        -finally changes the renderer's background color to yellow.  |                                                                                                     
                                                                                                                                        
   +---------^-------------------------------------------------------+     
   */


      // fog


    this.scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
    this.scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);
    this.renderer.setClearColor(0xffea00);




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
    this.cube.position.x = 10;
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
    //const gridHelper = new THREE.GridHelper(20);
    //this.scene.add(gridHelper);

    // sphere mesh

         /*
    +---------------------------------------------------------------------+                                                                                                     
    |                                                                     |                                                                                                     
    | Create sphere Mesh                                                  |
    |     - uses sphereGeometry → creates a sphere with  dimensions       |
    |     - use MeshBasicMaterial → pass Material Color  ,  wireframe     |   
    |     - use THREE.Mesh → pass geometry and material to create a mesh 
    |     - set position of sphere
    |      → add to scene 
    |      -> add pivot points                                                |                                                                                                     
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
   this.scene.add(this.sphere);
    //this.scene.add(this.pivot); // Add the pivot to the scene
    

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

    /*const gui = new dat.GUI();
   
    gui.addColor(this.options, 'sphereColor').onChange((e) => {
      (this.sphere.material as THREE.MeshBasicMaterial).color.set(e);
    });
    gui.add(this.options, 'wireframe').onChange((e) => {
      (this.sphere.material as THREE.MeshBasicMaterial).wireframe = e;
    });
    gui.add(this.options, 'speed', 0, 0.1);
    gui.add(this.options, 'angle', 0, 1);
    gui.add(this.options, 'penumbra', 0, 1);
    gui.add(this.options, 'intensity', 0, 1);*/

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
    |      - Update the controls with above changes
    |      - Add the pivot point to the scene                               |                                                                                                     
    |                                                                       |                                                                                                     
    +---------^-------------------------------------------------------------+     
    */

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;
    this.controls.target.set(0, 2, 2);
    this.controls.update();
    //this.scene.add(this.pivot); // Add the pivot point to the scene

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
    |   for model   -set rotation   
    |   -> set pivot points                                       |
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
  // Update the animation mixer
  if (this.mixer) {
    this.mixer.update(0.01);
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
    |     → set scene environment texture  .
    |     ->enable castshadow
    |     ->enable recieving shadow                                                 |
    |  - uses GLTFLoader to load a GLTF model  (frame)                                           |
    |     → gltfmodel once loaded,store it in model                                       |
    |     → add to the scene                                                              |
    |     → set the position of model                                                     |
    |     → set the scale of model                                                        |
    |  → updates updateMatrixWorld to the model                                           |
    |     ->enable castshadow
    |     ->enable recieving shadow  
    |     ->Add the model to the pivot  
          -> uses loader logs the loading progress percentage
          -> uses log console ,if any error occurs

    | - uses GLTFLoader to load a GLTF model  (donkey)                                           |
    |     → gltfmodel once loaded,store it in model                                       |
    |     → add to the scene                                                              |
    |     → set the position of model                                                     |
    |     → set the scale of model                                                        |
    |  → Enable shadow casting for each mesh in the model                                          |
    |     ->enable castshadow
    |     ->enable recieving shadow                                                                             |               
    |     ->Add the model to the pivot                                                                                                    |               
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

      let mixer: THREE.AnimationMixer; // Declare the mixer variable

      loader.load(
        'assets/Donkey.gltf', // Adjust the path to your additional .glb file
        (gltf) => {
          const donkeyModel = gltf.scene;
          // Position, scale, and add the model to the scene
          donkeyModel.position.set(0, 0, 3.5); // Adjust position as needed
          donkeyModel.scale.set(1, 1, 1); // Adjust scale as needed

          mixer = new THREE.AnimationMixer(donkeyModel); // Initialize the mixer
          const clips = gltf.animations;
          clips.forEach(function (clip) {
            //const clip = THREE.AnimationClip.findByName(clips, 'Eating');
            const action = mixer.clipAction(clip);
            action.play(); // Play each animation clip
            
          });


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

 /*
    +-------------------------------------------------------------------------------------+                                                                                                     
    |   traverseMaterials uses                                                                                 |                                                                                                     
    |     ->traverses through all nodes in the given object.                              |
    |     → if a node is a mesh, it retrieves its material                                |
    |     → set the size of the renderer to match the new window dimensions               |                                                                                                     
    |                                                                                     |                                                                                                     
    +---------^---------------------------------------------------------------------------+     
    */




  traverseMaterials(object: THREE.Object3D): void {
    object.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const material = mesh.material as THREE.Material;

        if (Array.isArray(material)) {
          material.forEach(mat => this.setupGui(mat));
        } else {
          //this.setupGui(material);
        }
      }
    });
  }

 /*
    +-------------------------------------------------------------------------------------+                                                                                                     
    |   setupGui                                                                          |                                                                                                     
    |     ->creates a dat.GUI interface for the given material,
    |     ->allowing real-time adjustments to its properties 
    |     ->such as color and wireframe mode.                                                                                                 
    |                                                                                     |                                                                                                     
    +---------^---------------------------------------------------------------------------+     
    */


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

/*
const gui = new dat.GUI();

const options = {
'Main' : 0x2F3130,
'Main light' : 0x0A0A0A,
'Hooves' : 0x0F0B0D,
'Hair' : 0x0A0A0A,
'Muzzle' : 0X020202
'Eye white' : 0XBEBEBE
}

const assetLoader = new GLTFLoader();
assetLoader.load(fileUrl.href, function(gltf) {
const model = gltf.scene;
scene.add(model);
console.log(model.getObjectByName('Cube_1'));

 gui.addColor(options, 'Main ').onChange(function(e) {
model.getObjectByName('Cube_1').material.color.setHex(e);
});

 gui.addColor(options, 'Main light').onChange(function(e) {
model.getObjectByName('Cube_2').material.color.setHex(e);
});
 gui.addColor(options, 'Hooves').onChange(function(e) {
model.getObjectByName('Cube_3').material.color.setHex(e);
});
 gui.addColor(options, 'Hair').onChange(function(e) {
model.getObjectByName('Cube_4').material.color.setHex(e);
});
 gui.addColor(options, 'Muzzle').onChange(function(e) {
model.getObjectByName('Cube_5').material.color.setHex(e);
});
 gui.addColor(options, 'Eye white').onChange(function(e) {
model.getObjectByName('Cube_6').material.color.setHex(e);
});
*/

/*
+--------------------------------------------------------------------------------------------+
|   Setup Three.js scene  
|                    -> Initialize the Three.js scene, camera, and renderer.     
+---------------------------------------------------------------------------------------------+
        |
        v
+----------------------------------------------------------------------------------+
|   Load models  
|             -> Load the necessary 3D models for the animation.   
+----------------------------------------------------------------------------------+
        |
        v
+-------------------------------------------------------------------------------------+
|   Set up animations 
|                 -> Prepare the animations for the loaded models.
+-------------------------------------------------------------------------------------+
        |
        v
+-----------------------------------------------------------------------------------+
|   Create animationmixer   
|               ->  Create an instance of THREE.AnimationMixer to control the animations.    
+-----------------------------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------------------------+
|   Add animation actions 
|                    ->  Add the animation actions to the mixer.   
+---------------------------------------------------------------------------------+
        |
        v
+----------------------------------------------------------------------------------+
|   Play animations  
|                -> Start playing the animations using the mixer.
+----------------------------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------------------------+
|   Update animation mixer  
|                -> Update the animation mixer within the animation loop.    
+---------------------------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------------------------+
|   Render scene   
|            -> Render the scene using the Three.js renderer.   
+---------------------------------------------------------------------------------+
*/


//detailed block diagram of animated system

/*
+----------------------------------------------------------------------------------+
|  Animation System   
            -> The top-level component that manages the entire animation process.
            -> It coordinates the interaction between the different components to 
            ensure smooth and efficient animation.

+----------------------------------------------------------------------------------+
       |
       v
+-----------------------------------------------------------------------------------+
|  Animation Clips(AnimationClip)
                    -> Contain the animation data for specific objects or characters.
                    -> Each clip represents a single animation, such as a walk cycle 
                    or a jump animation.
                    -> Clips are used to store and manage the animation data, 
                    making it easier to reuse and combine animations.
+-----------------------------------------------------------------------------------+
       |
       v
+-----------------------------------------------------------------------------------+
|  Animation Mixer(AnimationMixer)
                      -> Manages the playback and blending of multiple animation clips.
                      -> It takes in multiple animation clips and blends them together 
                      to create a seamless animation.
                      -> mixer ensures that the animations are played back in the correct
                       order and at the correct speed.
+------------------------------------------------------------------------------------+
       |
       v
+------------------------------------------------------------------------------------+
|  Animation Actions(AnimationAction)
                 -> Represent individual animations that can be played, paused, or blended.
                 -> Actions are used to control the playback of animations, allowing you to
                  start, stop, or pause an animation at specific points.
  uses blendmode -> Actions can also be used to blend between different animations, creating 
                  a smooth transition between them. 
+------------------------------------------------------------------------------------+
       |
       v
+-------------------------------------------------------------------------------------+
|  Animation Object Group(AnimationObjectGroup)
                -> Groups related objects together for animation purposes.
                -> This allows you to manage multiple objects as a single unit, 
                  making it easier to animate them together.
                -> Object groups can be used to animate multiple objects simultaneously, 
                  creating a more realistic and immersive experience.
+--------------------------------------------------------------------------------------+
       |
       v
+--------------------------------------------------------------------------------------------------+
|  Keyframe Tracks(KeyframeTrack)
              -> Groups related objects together for animation purposes.
              -> Keyframes are specific points in time where the animation data is stored.
              -> Keyframe tracks are used to store the animation data for a specific animation clip

    A Keyframe Track consists of two main components:
        Times: This is an array of time values that define when the keyframes occur.
        Values: This is an array of values that define the animation data for each keyframe.
+--------------------------------------------------------------------------------------------------+
       |
       v
+-----------------------------------------------------------------------------------------------------+


 // The different subclasses of KeyframeTrack in Three.js are used to handle different types of animated values.

+------------------------------------------------------------------------------------------------------+  
-> BooleanKeyframeTrack: 
              -> This subclass is used for animating boolean values,
                  such as whether an object is visible or not.
              -> It can be used to create animations that toggle the visibility or enabled state of objects.
    Constructor -> The BooleanKeyframeTrack constructor takes three parameters: name, times, and values.
                -> "name" is the name of the property being animated (e.g., .visible).
                -> "times" is an array of time values that define when the keyframes occur.
                -> "values" is an array of boolean values that define the animation data.
    Limitations  -> The BooleanKeyframeTrack class does not support animating boolean values that are not
                   true or false.
                -> This is because boolean values are either true or false, and there is no need for animating 
                  other values.
    Workarounds -> To animate other types of values, you can use other types of keyframe tracks, such as NumberKey
                 frameTrack or VectorKeyframeTrack.
+-------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------+
 -> ColorKeyframeTrack: This subclass is used for animating color values,
                                       such as the color of an object.
+---------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------+
-> NumberKeyframeTrack: This subclass is used for animating numerical values,
                                      such as the position or scale of an object.
+---------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------+
-> QuaternionKeyframeTrack: 
                        -> This subclass is used for animating quaternion values,
                            such as the rotation of an object.
                        -> It accepts an array of keyframe times and values, and an optional interpolation type.
                        ->The class provides methods for setting and getting the keyframe values, 
                           as well as for interpolating between them.
      limitations   -> The QuaternionKeyframeTrack class does not support animating quaternions that span
                     more than 180 degrees.
                    -> This is because quaternions are not designed to handle rotations that exceed 180 degrees.
      Workarounds   -> To animate quaternions that span more than 180 degrees, you can use a combination 
                        of quaternions and Euler angles.
                    -> Alternatively, you can use the setFromAxisAngle method to set the quaternion values directly.
+-------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------+
-> StringKeyframeTrack:
                   -> This subclass is used for animating string values, 
                      such as the text displayed on an object.
                   -> It can be used to create animations that change the text or label of an object over time.
    Constructor  -> The StringKeyframeTrack constructor takes three parameters: name, times, and values.
                 -> "name" is the name of the property being animated (e.g., .text).
                 -> "times" is an array of time values that define when the keyframes occur.
                 -> "values" is an array of string values that define the animation data.
    Limitations  -> The StringKeyframeTrack class does not support animating string values that are not valid strings.
                 -> This is because the class is designed to work with string values and does not support other types of values.
    Workarounds  -> To animate other types of values, you can use other types of keyframe tracks, such as 
                    NumberKeyframeTrack or VectorKeyframeTrack.
+--------------------------------------------------------------------------------------------------------------+                                     

+------------------------------------------------------------------------------------------------------+
-> VectorKeyframeTrack:
                     ->  This subclass is used for animating vector values,
                          such as the position or direction of an object.
                     -> It can be used to create complex animations by defining keyframes for 
                        the object's position, scale, or rotation.
        constructor -> The VectorKeyframeTrack constructor takes three parameters: name, times, and values.
               -> "name" is the name of the property being animated (e.g., .position).
               -> "times" is an array of time values that define when the keyframes occur.
               -> "values" is an array of vector values that define the animation data.
      Limitations  -> The VectorKeyframeTrack class does not support animating vectors that span more 
                      than 180 degrees
                  -> This is because quaternions are not designed to handle rotations that exceed 180 degrees.
      Workarounds  -> To animate quaternions that span more than 180 degrees, you can use a combination of 
                      quaternions and Euler angles.
                   -> Alternatively, you can use the setFromAxisAngle method to set the quaternion values directly.
+------------------------------------------------------------------------------------------------------+
       |
       v
+---------------------------+
|  Rendering 
+---------------------------+
       |
       v
+---------------+
|  Display     |
+---------------+

*/