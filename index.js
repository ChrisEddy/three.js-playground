// Planets are 1:1000
// Distances are 1:100,000

let pause_spin_global = false;
let pause_orbit_global = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 150000);

const dolly = new THREE.Group();
scene.add(dolly);
dolly.add(camera);

camera.position.x = -1000;
camera.position.z = -2000;
camera.position.y = 2000;

const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);


// three.js render stats
const rendererStats	= new THREEx.RendererStats();
rendererStats.domElement.style.position	= 'absolute';
rendererStats.domElement.style.left	= '0px';
rendererStats.domElement.style.bottom	= '0px';
document.body.appendChild( rendererStats.domElement );

// FPS stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

//RAM stats
const statsRAM = new Stats();
statsRAM.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
statsRAM.domElement.style.position	= 'absolute';
statsRAM.domElement.style.left	= '0px';
statsRAM.domElement.style.top	= '50px';
document.body.appendChild( statsRAM.dom );

//Miliseconds to render frame stats
const statsMili = new Stats();
statsMili.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
statsMili.domElement.style.position	= 'absolute';
statsMili.domElement.style.left	= '0px';
statsMili.domElement.style.top	= '100px';
document.body.appendChild( statsMili.dom );

const controls = new THREE.OrbitControls( camera );

// VR support

if(navigator.getVRDisplays){
  console.log("VR displays detected");
  renderer.vr.enabled = true;
  document.body.appendChild(
    WEBVR.createButton(renderer, {frameOfReferenceType: "head-model"})
  );
  dolly.position.set(2000, 500, 2500);
}
else{
  console.log("No VR displays detected");
  controls.minDistance = 1000;
  controls.maxDistance = 70000;
  controls.update();
  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// dat GUI

window.onload = function() {

  const FizzyText = function() {
    this.music = false;
    this.pause_orbit = false;
    this.pause_spin = false;
  };

  const gui = new dat.GUI();

  const text = new FizzyText();

  const musicController = gui.add(text, 'music', false);
  const pause_orbitController = gui.add(text, 'pause_orbit', false);
  const pause_spinController = gui.add(text, 'pause_spin', false);

  musicController.onChange(function(value) {
    if(value){
      backgroundMusic.play();
    }
    else{
      backgroundMusic.pause();
    }
  });

  pause_orbitController.onChange(function(value) {
    if(value){
      pause_orbit_global = true;
    }
    else{
      pause_orbit_global = false;
    }
  });

  pause_spinController.onChange(function(value) {
    if(value){
      pause_spin_global = true;
    }
    else{
      pause_spin_global = false;
    }
  });

};

// Music

// instantiate a listener
const audioListener = new THREE.AudioListener();

// add the listener to the camera
camera.add(audioListener);

// instantiate audio object
const backgroundMusic = new THREE.Audio(audioListener);

// add the audio object to the scene
scene.add(backgroundMusic);

// instantiate a loader
const loader = new THREE.AudioLoader();

// load a resource
loader.load(
  // resource URL
  'Resonance.mp3',

  // onLoad callback
  function ( audioBuffer ) {
    // set the audio object buffer to the loaded object
    backgroundMusic.setBuffer( audioBuffer );
    backgroundMusic.setLoop( true );
    backgroundMusic.setVolume( 0.5 );
    // play the audio
    // backgroundMusic.play();
  },

  // onProgress callback
  function ( xhr ) {
    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
  },

  // onError callback
  function ( err ) {
    console.log( 'An error happened' );
    console(err.stack)
  }
);

// create starbox

const imagePrefix = "images/2kstars/";
const directions  = ["GalaxyTex_PositiveX", "GalaxyTex_NegativeX", "GalaxyTex_PositiveY",
  "GalaxyTex_NegativeY", "GalaxyTex_PositiveZ", "GalaxyTex_NegativeZ"];
const imageSuffix = ".png";

let materialArray = [];
for (let i = 0; i < 6; i++)
  materialArray.push( new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
    side: THREE.FrontSide
  }));
const starMaterial = new THREE.MeshFaceMaterial( materialArray );
const starGeometry = new THREE.CubeGeometry(120000, 120000, -120000);
const starbox = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starbox);

starbox.rotation.x = THREE.Math.degToRad(63);

starbox.position.set(
  camera.position.x,
  camera.position.y,
  camera.position.z
);

// create center point that isnt tied to the sun, because orbit mechanics

const centerMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const centerGeometry = new THREE.SphereGeometry(1, 1, 1);
const center = new THREE.Mesh(centerGeometry, centerMaterial);
scene.add(center);
center.position.set(0,0,0);

// Create Sun

const sunTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_sun.jpg' );
const sunMaterial = new THREE.MeshBasicMaterial( { map: sunTexture } );

const sunGeometry = new THREE.SphereGeometry(695, 60, 60);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add pointlight to sun

const light = new THREE.PointLight(0xffffff, 1.5, 1.5e5, 0);
light.position.set( 10, 10, 10 );
light.castShadow = true;
scene.add( light );

light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 80000;

// create mercury

const mercuryTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_mercury.jpg' );
const mercuryMaterial = new THREE.MeshStandardMaterial( { map: mercuryTexture, metalness: 0.0, roughness: 1.0 } );

const mercuryGeometry = new THREE.SphereGeometry(49, 20, 20);
const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
mercury.castShadow = mercury.receiveShadow = true;
scene.add(mercury);
mercury.position.x = 580 + 695;

// Orbit mercury around the sun
const mercuryPivot = new THREE.Object3D();
center.add(mercuryPivot);
mercuryPivot.add(mercury);

// create venus

const venusTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_venus_surface.jpg' );
const venusMaterial = new THREE.MeshStandardMaterial( { map: venusTexture, metalness: 0.0, roughness: 1.0 } );

const venusGeometry = new THREE.SphereGeometry(121, 30, 30);
const venus = new THREE.Mesh(venusGeometry, venusMaterial);
venus.castShadow = venus.receiveShadow = true;
scene.add(venus);
venus.position.x = 1082 + 695;

// Orbit venus around the sun
const venusPivot = new THREE.Object3D();
center.add(venusPivot);
venusPivot.add(venus);

// Create Earth

var earthRoughTex = new THREE.TextureLoader().load("./images/earth-rough.png");
const earthTexture = new THREE.TextureLoader().load( './images/earthbumpmap.jpg' );
const earthMaterial = new THREE.MeshStandardMaterial( { map: earthTexture } );

earthMaterial.roughnessMap = earthRoughTex;

const earthGeometry = new THREE.SphereGeometry(127, 30, 30);
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.x = 1496 + 695;
earth.castShadow = earth.receiveShadow = true;
earth.material.metalness = 0.1;
scene.add(earth);
// Orbit Earth around the sun

const earthPivot = new THREE.Object3D();
center.add(earthPivot);
earthPivot.add(earth);

// Create the Moon

const moonTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_moon.jpg' );
const moonMaterial = new THREE.MeshStandardMaterial( { map: moonTexture, metalness: 0.0, roughness: 1.0 } );

const moonGeometry = new THREE.SphereGeometry(35, 20, 20);
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.castShadow = moon.receiveShadow = true;
scene.add(moon);
moon.position.x = 200;

// Orbit moon around earth

const moonPivot = new THREE.Object3D();
earth.add(moonPivot);
moonPivot.add(moon);

// Create mars

const marsTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_mars.jpg' );
const marsMaterial = new THREE.MeshStandardMaterial( { map: marsTexture, metalness: 0.0, roughness: 1.0 } );

const marsGeometry = new THREE.SphereGeometry(68, 30, 30);
const mars = new THREE.Mesh(marsGeometry, marsMaterial);
mars.castShadow = mars.receiveShadow = true;
scene.add(mars);
mars.position.x = 2279 + 695;

// Orbit mars around the sun
const marsPivot = new THREE.Object3D();
center.add(marsPivot);
marsPivot.add(mars);

// Create jupiter

const jupiterTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_jupiter.jpg' );
const jupiterMaterial = new THREE.MeshStandardMaterial( { map: jupiterTexture, metalness: 0.0, roughness: 1.0 } );

const jupiterGeometry = new THREE.SphereGeometry(1398, 40, 40);
const jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
jupiter.castShadow = jupiter.receiveShadow = true;
scene.add(jupiter);
jupiter.position.x = 7785 + 695;

// Orbit Jupiter around the sun

const jupiterPivot = new THREE.Object3D();
center.add(jupiterPivot);
jupiterPivot.add(jupiter);

// create saturn

const saturnTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_saturn.jpg' );
const saturnMaterial = new THREE.MeshStandardMaterial( { map: saturnTexture, metalness: 0.0, roughness: 1.0 } );

const saturnGeometry = new THREE.SphereGeometry(1164, 50, 50);
const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
saturn.castShadow = saturn.receiveShadow = true;
scene.add(saturn);
saturn.position.x = 14330 + 695;

// Orbit saturn around the sun
const saturnPivot = new THREE.Object3D();
center.add(saturnPivot);
saturnPivot.add(saturn);

// create uranus

const uranusTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_uranus.jpg' );
const uranusMaterial = new THREE.MeshStandardMaterial( { map: uranusTexture, metalness: 0.0, roughness: 1.0 } );

const uranusGeometry = new THREE.SphereGeometry(507, 40, 40);
const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
uranus.castShadow = uranus.receiveShadow = true;
scene.add(uranus);
uranus.position.x = 28700 + 695;

// Orbit uranus around the sun
const uranusPivot = new THREE.Object3D();
center.add(uranusPivot);
uranusPivot.add(uranus);

// create neptune

const neptuneTexture = new THREE.TextureLoader().load( './images/2kbodies/2k_neptune.jpg' );
const neptuneMaterial = new THREE.MeshStandardMaterial( { map: neptuneTexture, metalness: 0.0, roughness: 1.0 } );

const neptuneGeometry = new THREE.SphereGeometry(492, 50, 50);
const neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
neptune.castShadow = neptune.receiveShadow = true;
scene.add(neptune);
neptune.position.x = 44950 + 695;

// Orbit neptune around the sun
const neptunePivot = new THREE.Object3D();
center.add(neptunePivot);
neptunePivot.add(neptune);


const spinPlanets = function () {
  sun.rotation.y += 0.0001;
  mercury.rotation.y -= 0.0002;
  venus.rotation.y -= 0.0003;
  earth.rotation.y += 0.0004;
  moon.rotation.y -= 0.0002;
  mars.rotation.y += 0.0002;
  jupiter.rotation.y += 0.0005;
  saturn.rotation.y -= 0.0003;
  uranus.rotation.y += 0.0003;
  neptune.rotation.y -= 0.0003;
};

const orbitPlanets = function () {
  mercuryPivot.rotation.y += 0.0003;
  venusPivot.rotation.y -= 0.0001;
  earthPivot.rotation.y += 0.00015;
  moonPivot.rotation.y += 0.003;
  marsPivot.rotation.y -= 0.0002;
  jupiterPivot.rotation.y += 0.0001;
  saturnPivot.rotation.y -= 0.0003;
  uranusPivot.rotation.y += 0.0002;
  neptunePivot.rotation.y -= 0.0004;
};


const controllerMaterial = new THREE.MeshBasicMaterial( { color: 'red' } );
const controllerGeometry = new THREE.SphereGeometry(0.5, 0.5, 0.5);
const controller = new THREE.Mesh(controllerGeometry, controllerMaterial);
scene.add(controller);

const clock = new THREE.Clock();
var delta;

function update() {
  stats.begin();
  statsMili.begin();
  statsRAM.begin();
  delta = clock.getDelta();

  if(!pause_orbit_global){
    orbitPlanets();
  }
  if(!pause_spin_global){
    spinPlanets();
  }
  const state = {
    lastButtons: {},
    lastAxes: {}
  };
  Array.prototype.forEach.call(navigator.getGamepads(), function (activePad, padIndex) {
    if(activePad) {
      // Process buttons and axes for the Gear VR touch panel
      activePad.buttons.forEach(function (gamepadButton, buttonIndex) {
        var cameraForward = camera.getWorldDirection(new THREE.Vector3());
        var cameraSpeed = 0;
        if (buttonIndex === 0 && gamepadButton.pressed) {
          // Handle tap
          console.log('tap');
          cameraSpeed = 600;
        }
        if (buttonIndex === 1 && gamepadButton.pressed && !state.lastButtons[buttonIndex]) {
          // Handle trigger
          console.log('lmao1');
          cameraSpeed = -600;
        }
        dolly.translateOnAxis(cameraForward, cameraSpeed * delta);
        state.lastButtons[buttonIndex] = gamepadButton.pressed;
      });

      activePad.axes.forEach(function (axisValue, axisIndex) {
        if (axisIndex === 0 && axisValue < 0 && state.lastAxes[axisIndex] >= 0) {
          // Handle swipe right
          console.log('right')
        } else if (axisIndex === 0 && axisValue > 0 && state.lastAxes[axisIndex] <= 0) {
          // Handle swipe left
          console.log('left')
        } else if (axisIndex === 1 && axisValue < 0 && state.lastAxes[axisIndex] >= 0) {
          // Handle swipe up
          console.log('up')
        } else if (axisIndex === 1 && axisValue > 0 && state.lastAxes[axisIndex] <= 0) {
          // Handle swipe down
          console.log('down')
        }
        state.lastAxes[axisIndex] = axisValue;
      });
    } else {
      // This is a connected Bluetooth gamepad which you may want to support in your VR experience
    }
  });
  if(!navigator.getVRDisplays){
    controls.update();
  }
  rendererStats.update(renderer);
  renderer.render(scene, camera);
  statsRAM.end();
  statsMili.end();
  stats.end();
}

renderer.setAnimationLoop(update);

