//
// Rendering State
//

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { fitSceneInCamera, setupControls } from "./camera_and_controls.js";
import { BUTTON_ID, HIT_CONFIG } from "./constants.js";
import { getHitTypes, getHitProperties, getMCColouring } from "./helpers.js";
import { drawHits } from "./hits.js";
import { drawBox } from "./rendering.js";
import { drawRings } from "./markers.js";
import {
  enableMCToggle,
  isButtonActive,
  populateTypeToggle,
  populateDropdown,
  populateMarkerToggle,
  toggleButton,
  updateUI,
} from "./ui.js";

/**
 * Represents the state of the rendering process, including the scene, camera,
 * detector geometry, and hit groups.
 */
export class RenderState {
  // Setup some basics, the scenes, camera, detector and hit groups.
  constructor(name, camera, renderer, hits, mcHits, markers, geometry) {
    this.name = name;
    this.hitDim = name;

    // THREE.js Setup...
    this.scene = new THREE.Scene();
    this.camera = camera;
    this.controls = new OrbitControls(this.camera, renderer.domElement);

    // Setup various groups for rendering into...
    this.detGeoGroup = new THREE.Group();
    this.hitGroup = new THREE.Group();
    this.mcHitGroup = new THREE.Group();
    this.markerGroup = new THREE.Group();

    this.scene.add(this.detGeoGroup);
    this.scene.add(this.hitGroup);
    this.scene.add(this.mcHitGroup);
    this.scene.add(this.markerGroup);

    // Data Setup, first the top level static arrays...
    this.detectorGeometry = geometry;
    this.hits = hits;
    this.mcHits = mcHits;
    this.markers = markers;

    // The generated property lists...
    this.hitProperties = getHitProperties(this.hits);
    this.hitTypes = getHitTypes(this.hits);

    // Finally, setup the dynamic bits, the state that will change.
    this.uiSetup = false;

    this.activeHits = this.hits;
    this.activeMC = this.mcHits;
    this.activeHitColours = [];
    this.activeMarkers = [];

    this.activeHitProps = new Set([BUTTON_ID.All]);
    this.activeHitTypes = new Set();
    this.activeMarkerTypes = new Set();

    this.otherRenderer = undefined;
  }

  /**
   * Returns the number of hits in the current state.
   * @returns {number} The number of hits.
   */
  get hitSize() {
    return this.hits.length;
  }

  /**
   * Returns a boolean indicating whether the scene is currently visible.
   * @returns {boolean} Whether the scene is visible.
   */
  get visible() {
    return this.scene.visible;
  }

  /**
   * Renders the detector geometry for the current state. Currently only renders
   * box geometry.
   */
  renderGeometry() {
    this.detGeoGroup.clear();

    // For now, just render the box geometry and nothing else.
    const boxVolumes = this.detectorGeometry.filter(
      (volume) => volume.type === "box",
    );
    boxVolumes.forEach((box) =>
      drawBox(this.hitDim, this.detGeoGroup, this.hits, box),
    );

    this.detGeoGroup.matrixAutoUpdate = false;
    this.detGeoGroup.matrixWorldAutoUpdate = false;
  }

  /**
   * Renders the hits for the current state, based on the active hit types and properties.
   * Clears the hit group and then draws the hits with the active hit colours.
   */
  renderHits() {
    this.hitGroup.clear();

    drawHits(
      this.hitGroup,
      this.activeHits,
      this.activeHitColours,
      HIT_CONFIG[this.hitDim],
    );

    this.hitGroup.matrixAutoUpdate = false;
    this.hitGroup.matrixWorldAutoUpdate = false;
  }

  /**
   * Renders the MC hits for the current state, based on the active hit types and properties.
   * Clears the hit group and then draws the hits with the active hit colours.
   */
  renderMCHits() {
    this.mcHitGroup.clear();

    const mcColours = getMCColouring(this.activeMC);

    drawHits(
      this.mcHitGroup,
      this.activeMC,
      mcColours,
      HIT_CONFIG[this.hitDim],
    );

    this.mcHitGroup.matrixAutoUpdate = false;
    this.mcHitGroup.matrixWorldAutoUpdate = false;
  }

  /**
   * Renders the current markers for the state.
   * Clears the hit group and then draws the hits with the active hit colours.
   */
  renderMarkers() {
    this.markerGroup.clear();

    drawRings(
      this.activeMarkers.filter((marker) => marker.marker === "ring"),
      this.markerGroup,
    );

    this.markerGroup.matrixAutoUpdate = false;
    this.markerGroup.matrixWorldAutoUpdate = false;
  }

  /**
   * Updates the active hits and hit colours based on the current active hit
   * type and properties.
   */
  #updateHitArrays() {
    const newHits = new Set();
    const newMCHits = [];
    const newHitColours = [];

    // First, do the actual hits...
    this.hits.forEach((hit) => {
      if (this.activeHitTypes.size > 0 && !this.activeHitTypes.has(hit.type))
        return;
      Array.from(this.activeHitProps)
        .reverse()
        .forEach((property) => {
          if (!this.hitProperties.get(hit).has(property)) return;
          if (newHits.has(hit)) return;

          newHits.add(hit);
          newHitColours.push(this.hitProperties.get(hit).get(property));
        });
    });

    // Then repeat for the MC hits, but skip the hit properties bit.
    this.mcHits.forEach((hit) => {
      if (this.activeHitTypes.size > 0 && !this.activeHitTypes.has(hit.type))
        return;
      newMCHits.push(hit);
    });

    this.activeHits = [...newHits];
    this.activeHitColours = newHitColours;
    this.activeMC = newMCHits;
  }

  /**
   * Similar to the hit arrays, but for the markers.
   * Here, we want only the markers that are active, that are of the active
   * type.
   */
  #updateMarkers() {
    const newMarkers = new Set();

    // Check if there are any active markers, and if not, just return.
    if (this.activeMarkerTypes.size === 0) {
      this.activeMarkers = [];
      return;
    }

    // Otherwise, loop over the markers and add them if they're active.
    this.activeMarkerTypes.forEach((markerType) => {
      this.markers.forEach((marker) => {
        if (
          this.activeHitTypes.size > 0 &&
          !this.activeHitTypes.has(marker.type)
        )
          return;
        if (marker.marker === markerType) newMarkers.add(marker);
      });
    });

    this.activeMarkers = [...newMarkers];
  }

  /*
   * Run all the update functions for the active arrays.
   */
  #updateActiveArrays() {
    this.#updateHitArrays();
    this.#updateMarkers();
  }

  // What to do if the hit property option changes:
  //  - Update the active hit properties list.
  //  - We need to update any UI around them.
  //  - Can then re-render the hits out.
  onHitPropertyChange(hitProperty) {
    const buttonActive = isButtonActive(this.hitDim, hitProperty);
    const sceneActive = this.scene.visible;

    // If there was no actual hitProperty, or the scene isn't active but the
    // hits are setup correctly, just swap the scene and finish.
    if (hitProperty === "" || (buttonActive && !sceneActive)) {
      this.toggleScene(this.hitDim);
      return;
    }

    // If the "None" property is clicked, we want to toggle everything off.
    // Otherwise, add or remove this property from the list.
    if (hitProperty === BUTTON_ID.None) {
      this.activeHitProps.clear();
    } else {
      // Add or remove the toggled property as needed...
      if (this.activeHitProps.has(hitProperty)) {
        this.activeHitProps.delete(hitProperty);
      } else {
        this.activeHitProps.add(hitProperty);
      }
    }

    // Fix the active hits for this change...
    this.#updateActiveArrays();

    // Now that the internal state is correct, correct the UI.
    toggleButton(this.hitDim, hitProperty);
    this.toggleScene(this.hitDim);

    // Finally, render the new hits!
    this.renderHits();
  }

  // Similar to the property change, update the hit type list.
  onHitTypeChange(hitType) {
    // Add or remove the toggled class as needed...
    if (this.activeHitTypes.has(hitType)) {
      this.activeHitTypes.delete(hitType);
    } else {
      this.activeHitTypes.add(hitType);
    }

    // Fix the active hits for this change...
    const markerNum = this.activeMarkers.length;
    this.#updateActiveArrays();
    const newMarkerNum = this.activeMarkers.length;

    // Now that the internal state is correct, correct the UI.
    toggleButton("types", hitType, false);
    this.toggleScene(this.hitDim);

    // Finally, render the new hits!
    this.renderHits();

    // Its possible that the marker list has changed, so we need to update
    // the marker UI as well.
    if (markerNum !== newMarkerNum) {
      this.renderMarkers();
    }
  }

  // If any markers are toggled, update the list.
  onMarkerChange(markerType) {
    // Add or remove the toggled class as needed...
    if (this.activeMarkerTypes.has(markerType)) {
      this.activeMarkerTypes.delete(markerType);
    } else {
      this.activeMarkerTypes.add(markerType);
    }

    // Fix the active markers for this change...
    this.#updateMarkers();

    // Now that the internal state is correct, correct the UI.
    toggleButton("markers", markerType, false);
    this.toggleScene(this.hitDim);

    // Finally, render the new markers!
    this.renderMarkers();
  }

  // Finally, a MC-hit based toggle, enabling or disabling as needed.
  onMCToggle() {
    // Toggle the visibility state.
    this.mcHitGroup.visible = !this.mcHitGroup.visible;

    // Now that the internal state is correct, correct the UI.
    toggleButton("types_MC_toggle", this.hitDim, false);

    // Render out the new hits.
    this.renderMCHits();
  }

  // Setup the UI, should only be called once.
  // Populate various drop downs and buttons based on the state,
  // and then reset the camera.
  setupUI(renderTarget) {
    if (this.uiSetup) return;

    this.renderGeometry();
    this.renderHits();

    // Also render out the MC, but its not visible at first.
    this.renderMCHits();
    this.mcHitGroup.visible = false;

    // Fill in any dropdown entries, or hit class toggles.
    populateDropdown(this.hitDim, this.hitProperties, (prop) =>
      this.onHitPropertyChange(prop),
    );
    populateTypeToggle(this.hitDim, this.hits, (hitType) =>
      this.onHitTypeChange(hitType),
    );
    populateMarkerToggle(this.hitDim, this.markers, (markerType) =>
      this.onMarkerChange(markerType),
    );
    enableMCToggle(this.hitDim, this.mcHits, () => this.onMCToggle());

    // Move the scene/camera around to best fit it in.
    fitSceneInCamera(this.camera, this.controls, this.detGeoGroup, this.hitDim);
    setupControls(this.hitDim, this.controls);
    this.scene.add(this.camera);

    // Setup the default button.
    toggleButton(this.hitDim, BUTTON_ID.All);

    this.toggleScene(renderTarget);
    this.uiSetup = true;
  }

  // Attempt to activate or deactivate the scene, if needed.
  toggleScene(renderTarget) {
    this.scene.visible = this.hitDim === renderTarget;
    this.controls.enabled = this.hitDim === renderTarget;

    this.otherRenderer.scene.visible =
      this.otherRenderer.hitType === renderTarget;
    this.otherRenderer.controls.enabled =
      this.otherRenderer.hitType === renderTarget;

    updateUI(renderTarget);
  }

  // If this is currently active, reset the event display.
  resetView() {
    if (!this.scene.visible) return;

    // Reset back to all hits...
    this.activeHits = this.hits;
    this.activeMC = this.mcHits;
    this.activeHitColours = [];

    // And no properties active...
    this.activeHitProps = new Set([BUTTON_ID.All]);
    toggleButton(this.hitDim, BUTTON_ID.None);
    toggleButton(this.hitDim, BUTTON_ID.All);

    this.activeHitTypes.forEach((hitType) => {
      toggleButton("types", hitType, false);
    });
    this.activeHitTypes = new Set();

    // Re-render with the default hit array.
    this.renderGeometry();
    this.renderHits();

    // Reset the camera + controls.
    this.controls.reset();

    fitSceneInCamera(this.camera, this.controls, this.detGeoGroup, this.hitDim);
  }
}
