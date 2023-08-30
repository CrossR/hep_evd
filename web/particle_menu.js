//
// Particle Info/Filtering Menu
//
// Display a nested menu of particle information, with checkboxes to
// filter the particles displayed in the main view.

import { INTERACTION_TYPE_SCORE } from "./constants.js";

/**
 * Creates a menu item for a particle with the given hit dimension, particle object, and onClick function.
 * 
 * @param {number} hitDim - The hit dimension of the particle.
 * @param {Object} particle - The particle object.
 * @param {Function} onClick - The function to be called when the menu item is clicked.
 * @param {Map} particlesMap - The map of particles.
 * @param {HTMLElement} parentElement - The parent element to which the menu item will be appended.
 * @returns {void}
 */
function createMenuItem(
  hitDim,
  particle,
  onClick,
  particlesMap,
  parentElement
) {
  // Make the top level menu item for the particle.
  const menuItem = document.createElement("li");
  menuItem.id = `particle_${particle.id}_${hitDim}`;
  menuItem.classList.add("block");

  // Make an optional details element for the particle, which will
  // only be used if the particle has child particles.
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  details.open = false;

  // This is the label, which tells the user the particle type and
  // number of hits.
  const label = document.createElement("span");
  label.classList.add("label-text", "pr-4");
  label.addEventListener("click", () => {
    onClick(particle, particlesMap);
  });

  // If there are any child particles, we need to create a sub-menu
  // for them. To do that, we do a recursive call to this function,
  // but with a new parent element, to nest them under the current
  // particle.
  let totalNumHits = particle.hits.length;
  const elementList = document.createElement("ul");

  particle.childIDs.map((childID) => {
    const childParticle = particlesMap.get(childID);

    // INFO: Likely a particle with no valid hits for this dimension.
    if (childParticle === undefined) {
      return;
    }

    // Recursively create the menu item for the child particle.
    // This can be called multiple times, if the child particle
    // has child particles of its own.
    createMenuItem(hitDim, childParticle, onClick, particlesMap, elementList);
    totalNumHits += childParticle.hits.length;
  });

  // Set the label text to include the number of hits, including the
  // child particles hits.
  label.innerHTML = `${particle.interactionType} (${totalNumHits})`;

  // If there are any child particles, we should include
  // the details and summary elements in the menu item.
  // This will give us the dropdown arrow to expand the
  // sub-menu.
  if (elementList.childElementCount > 0) {
    summary.appendChild(label);
    details.appendChild(summary);
    details.appendChild(elementList);
    menuItem.appendChild(details);
  } else {
    menuItem.appendChild(label);
  }

  // Finally, append the menu item to the parent element.
  parentElement.appendChild(menuItem);
}

/**
 * Creates a particle menu with the given hit dimension, particles map, and onClick function.
 * 
 * @param {string} hitDim - The hit dimension.
 * @param {Map} particlesMap - The particles map.
 * @param {function} onClick - The onClick function.
 * @returns {void}
 */
export function createParticleMenu(hitDim, particlesMap, onClick) {
  const menu = document.getElementById(`particle_menu_${hitDim}`);

  // Filter then sort the particles. Filtering is used to
  // remove the child particles from the list, as they will
  // be included as sub-items of their parent particles.
  //
  // Sorting is done by:
  // 1. The interaction type, based on the INTERACTION_TYPE_SCORE.
  // 2. The number of hits (including child particles)
  const particles = Array.from(particlesMap.values())
    .filter((particle) => particle.parentID === "")
    .sort((a, b) => {
      if (a.interactionType !== b.interactionType) {
        return (
          INTERACTION_TYPE_SCORE[a.interactionType] -
          INTERACTION_TYPE_SCORE[b.interactionType]
        );
      }

      const aNumHits = a.childIDs.reduce((acc, childID) => {
        return acc + particlesMap.get(childID).hits.length;
      }, a.hits.length);
      const bNumHits = b.childIDs.reduce((acc, childID) => {
        return acc + particlesMap.get(childID).hits.length;
      }, b.hits.length);

      return aNumHits < bNumHits;
    });

  if (particles.length === 0) {
    menu.hidden = true;
    return;
  }

  particles.forEach((particle, _) => {
    createMenuItem(hitDim, particle, onClick, particlesMap, menu);
  });
}
