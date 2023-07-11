import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Lut } from "three/addons/math/Lut.js";

import Stats from "three/addons/libs/stats.module.js";

// ============================================================================
// Helper functions
// ============================================================================

// Convert a JS position object to threejs.
function positionToVector(position) {
  return new THREE.Vector3(position.x, position.y, position.z);
}

// Given a geometry object, fit the camera to the center of it, such that the
// whole object can be seen.
function fitSceneInCamera(camera, controls, detectorGeometry) {
  const offset = 1.5; // Padding factor.

  // Get the bounding box of the detector geometry.
  // This should be the group for best results.
  let boundingBox = new THREE.Box3().setFromObject(detectorGeometry);

  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());

  // Get the maximum dimension of the bounding box...
  const maxDim = Math.max(size.x, size.y, size.z);
  const cameraFOV = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs((maxDim / 4) * Math.tan(cameraFOV * 2));

  // Zoom out a bit, according to the padding factor...
  cameraZ *= offset;
  camera.position.z = cameraZ;

  // Apply limits to the camera...
  const minZ = boundingBox.min.z;
  const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;
  camera.far = cameraToFarEdge * 3;

  // Update the camera with this new zoom position.
  camera.updateProjectionMatrix();

  // And if required, update the controls.
  if (controls) {
    controls.target = center;
    controls.maxDistance = cameraToFarEdge;
    controls.saveState();
  } else {
    camera.lookAt(center);
  }
}

// Build up a map between a property name and a property for
// each sort of hit (3D, 2D).
//
// This should mean that any property can be easily drawn without
// needing to worry about the specific location of a property.
function getHitProperties(hits) {

  const hitPropMaps = new Map();

  hitPropMaps.set("3D", new Map());
  hitPropMaps.set("2D", new Map());

  // Every hit should have an energy property, but there is
  // then two additional cases where a hit can be grouped:
  //  - If a hit is labelled.
  //  - If a hit has a property map associated.
  hits.forEach((hit) => {
    hitPropMaps.get(hit.type).set(hit, new Map([["energy", hit.energy]]));

    if (Object.hasOwn(hit, "label")) {
      hitPropMaps.get(hit.type).get(hit).set(hit.label, 1.0);
    }

    if (Object.hasOwn(hit, "properties")) {
      hit.properties.forEach((prop) => {
        const key = Object.keys(prop)[0];
        const value = Object.values(prop)[0];

        hitPropMaps.get(hit.label).get(hit).set(key, value);
      });
    }
  });

  return hitPropMaps;
}

// ============================================================================
// Rendering Functions
// ============================================================================

// Given a box based detector volume, draw its wireframe.
function drawBoxVolume(group, material, box) {
  const boxGeometry = new THREE.BoxGeometry(box.xWidth, box.yWidth, box.zWidth);
  const boxEdges = new THREE.EdgesGeometry(boxGeometry);
  const boxLines = new THREE.LineSegments(boxEdges, material);

  boxLines.position.set(box.x, box.y, box.z);
  boxLines.updateMatrixWorld();

  group.add(boxLines);
}

// Draw an array of 3D hits to the screen, utilising an InstancedMesh for
// performance.
//
// Optionally, colour the hits based on some property value.
function drawHits(
  group,
  material,
  hits,
  hitPropMap,
  useColour = false,
  colourProp = "",
  hitSize = 3
) {

  if (hits.length == 0)
    return;

  const hitGeometry = new THREE.BoxGeometry(hitSize, hitSize, hitSize);
  const hitMesh = new THREE.InstancedMesh(hitGeometry, material, hits.length);

  const dummyObject = new THREE.Object3D();
  const energyLut = new Lut("rainbow", 512);

  const properties = new Map();
  hits.forEach((hit, index) => {
    if (!hitPropMap.has(hit)) {
      return;
    }

    if (!hitPropMap.get(hit).has(colourProp)) {
      return;
    }

    properties.set(index, hitPropMap.get(hit).get(colourProp));
  });

  let usingColour =
    useColour &&
    properties.size > 0 &&
    [...properties.values()][0].constructor == Number;
  const usingProperties = properties.size > 0;

  if (usingColour) {
    let minColourValue = Infinity;
    let maxColourValue = Number.NEGATIVE_INFINITY;
    properties.forEach((value, _) => {
      if (value < minColourValue) minColourValue = value;
      if (value > maxColourValue) maxColourValue = value;
    });
    energyLut.setMax(maxColourValue);

    if (maxColourValue == minColourValue)
        usingColour = false;
  }

  hits.forEach(function (hit, index) {
    dummyObject.position.set(hit.x, hit.y, hit.z);
    dummyObject.updateMatrix();

    if (usingProperties && ! properties.has(index)) {
      return;
    }

    hitMesh.setMatrixAt(index, dummyObject.matrix);

    if (usingColour) {
      hitMesh.setColorAt(index, energyLut.getColor(properties.get(index)));
    } else {
      hitMesh.setColorAt(index, new THREE.Color("gray"));
    }
  });

  hitMesh.instanceMatrix.needsUpdate = true;
  hitMesh.instanceColor.needsUpdate = true;

  group.add(hitMesh);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update();
}

// ============================================================================
// GUI Functions
// ============================================================================

function hitsToggle(hits, hitGroupMap, hitPropMap, toggleTarget) {

  if (toggleTarget === "None") {
    hitGroupMap.forEach((group) => (group.visible = false));
    return;
  }

  // If it does exist, then just toggle its visibility.
  if (hitGroupMap.has(toggleTarget) === true) {
    const threeDHitGroup = hitGroupMap.get(toggleTarget);
    threeDHitGroup.visible = !threeDHitGroup.visible;

    return;
  }

  // Otherwise, we need to make a new group, populate it and store it for later.
  const newGroup = new THREE.Group();
  scene.add(newGroup);
  drawHits(newGroup, materialHit, hits, hitPropMap, true, toggleTarget);
  hitGroupMap.set(toggleTarget, newGroup);

  return;
}

// Mock enum for the default button classes.
const DefaultButtonID = {
    None: "None",
    All: "All"
}

// Given a drop down,
function populateDropdown(className, hitPropMap, onClick = (_) => {}) {

  const dropDown = document.getElementById(`${className}_dropdown`);
  const entries = new Set();

  // Add the default "None" option.
  entries.add(DefaultButtonID.None);

  if (hitPropMap.size != 0)
    entries.add(DefaultButtonID.All);

  hitPropMap.forEach((properties, _) => {
      properties.forEach((_, propString) => entries.add(propString));
  });

  entries.forEach((entry) => {
    const newButton = document.createElement("button");
    newButton.innerText = entry;
    newButton.id = `${className}_${entry}`
    newButton.addEventListener("click", () => onClick(entry));
    dropDown.appendChild(newButton);
  });

  return;
}

// Toggle active state of a given button.
//
// If that button is the "None" button, we should also
// toggle the state of every other button in that dropdown.
// Similarly, if its not that none button, toggle the none
// button off.
function toggleButton(className, ID) {
  const button = document.getElementById(`${className}_${ID}`);

  let isActive = button.style.color === "white";

  if (isActive) {
    button.style.color = "green";
    isActive = false;
  } else {
    button.style.color = "white";
    isActive = true;
  }

  if (ID == DefaultButtonID.None && isActive) {
    const dropDown = document.getElementById(`${className}_dropdown`);

    Array.from(dropDown.childNodes).filter((elem) =>
      elem.nodeName != "#text" && elem != button && elem.tagName.toLowerCase() === "button"
    ).forEach((elem) => {
      elem.style.color = "green";
    });
  } else if (ID != DefaultButtonID.None && isActive) {
    const button = document.getElementById(`${className}_${DefaultButtonID.None}`);
    button.style.color = "green";
  }
}

// Swap to 2D controls.
function setupTwoDControls(controls) {
    controls.screenSpacePanning = true;
    controls.enableRotate = false;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: NULL
    };

    controls.update();
}

// Swap to 3D controls.
function setupThreeDControls(controls) {
    controls.screenSpacePanning = true;
    controls.enableRotate = true;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
    };

    controls.update();
}


// ============================================================================
// HepEVD
// ============================================================================

// First, do the initial threejs setup.
// That is the scene/camera/renderer/controls, and some basic properties of each.
// Once complete, add to the actual web page.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1e6
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const stats = new Stats();
renderer.setSize(window.innerWidth, window.innerHeight);

if (document.body.className === "lighttheme") renderer.setClearColor("white");
else renderer.setClearColor("black");

renderer.alpha = true;
renderer.antialias = false;
document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom);

// Then, setup some basic materials and data structures the rest of the renderer can use.
const materialLine = new THREE.LineBasicMaterial({ color: "gray" });
const materialGeometry = new THREE.LineBasicMaterial({ color: "darkred" });
const materialHit = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
});

const detectorGeometryGroup = new THREE.Group();
scene.add(detectorGeometryGroup);

// Hits are stored in multiple groups, such that they can be toggled independently.
const hitGroupMap = new Map();
hitGroupMap.set("3D", new Map());
hitGroupMap.set("2D", new Map());

// Default hit groups for the "All" case.
const threeDHitGroup = new THREE.Group();
scene.add(threeDHitGroup);
hitGroupMap.get("3D").set(DefaultButtonID.All, threeDHitGroup);

const twoDHitGroup = new THREE.Group();
scene.add(twoDHitGroup);
hitGroupMap.get("2D").set(DefaultButtonID.All, twoDHitGroup);

// Finally, start pulling in data about the event.
const detectorGeometry = await fetch("geometry").then((response) =>
  response.json()
);
const hits = await fetch("hits").then((response) => response.json());
const twoDHits = hits.filter((hit) => hit.type.includes("2D"));
const threeDHits = hits.filter((hit) => hit.type === "3D");
const hitPropMaps = getHitProperties(hits);

// Time to start the actual rendering.
detectorGeometry
  .filter((volume) => volume.type === "box")
  .forEach((box) =>
    drawBoxVolume(detectorGeometryGroup, materialGeometry, box)
  );

// Prefer drawing 3D hits, but draw 2D if only option.
if (threeDHits.length != 0) {
 drawHits(threeDHitGroup, materialHit, threeDHits, hitPropMaps.get("3D"));
} else {
 drawHits(twoDHitGroup, materialHit, twoDHits, hitPropMaps.get("2D"));
}

// Populate the UI properly.
// This includes functions that the GUI uses, and filling in the various dropdowns.

// First, setup all the button on click events.
let toggleHits3D = (toggleTarget) => {
  hitsToggle(threeDHits, hitGroupMap.get("3D"), hitPropMaps.get("3D"), toggleTarget);
  toggleButton("threeD", toggleTarget);
};
let toggleHits2D = (toggleTarget) => {
  hitsToggle(twoDHits, hitGroupMap.get("2D"), hitPropMaps.get("2D"), toggleTarget);
  toggleButton("twoD", toggleTarget);
};

populateDropdown("threeD", hitPropMaps.get("3D"), toggleHits3D);
populateDropdown("twoD", hitPropMaps.get("2D"), toggleHits2D);

// Toggle on the default rendering.
const defaultRenderClass = threeDHits.length != 0 ? "threeD" : "twoD";
toggleButton(defaultRenderClass, DefaultButtonID.All);

// Start the final rendering of the event.

// Irient the camera to the middle of the scene.
fitSceneInCamera(camera, controls, detectorGeometryGroup);

// Finally, animate the scene!
animate();

// Once run once, we can disable these to help with performance.
// Noting is animated in our scene, so not needed.
scene.matrixAutoUpdate = false;
scene.autoUpdate = false;
