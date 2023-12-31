//
// Data Loader
//

// Are we running on GitHub Pages?
export function isRunningOnGitHubPages() {
  return window.location.hostname.includes("github.io");
}

async function getDataWithProgress(url) {
  const response = await fetch(url);

  const reader = response.body.getReader();
  const contentLength = +response.headers.get("Content-Length");
  const loadingBar = document.getElementById("loading_bar_data");

  if (contentLength && contentLength > 250) {
    loadingBar.style.display = "block";
  } else {
    loadingBar.style.display = "none";
  }

  let receivedLength = 0;
  let chunks = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    receivedLength += value.length;

    const percent = Math.round((receivedLength / contentLength) * 100);

    if (contentLength && contentLength > 250)
      loadingBar.style.width = percent + "%";
  }

  let chunksAll = new Uint8Array(receivedLength);
  let position = 0;
  for (let chunk of chunks) {
    chunksAll.set(chunk, position);
    position += chunk.length;
  }

  let result = new TextDecoder("utf-8").decode(chunksAll);

  if (contentLength && contentLength > 250) loadingBar.style.display = "none";

  return JSON.parse(result);
}

// Simple function to pull down all data from the server.
async function loadServerData() {
  const detectorGeometry = await getDataWithProgress("geometry");
  const hits = await getDataWithProgress("hits");
  const mcHits = await getDataWithProgress("mcHits");
  const markers = await getDataWithProgress("markers");
  const particles = await getDataWithProgress("particles");

  return {
    hits: hits,
    mcHits: mcHits,
    markers: markers,
    particles: particles,
    detectorGeometry: detectorGeometry,
  };
}

// Load data from a GitHub Gist URL.
async function loadExternalData(url) {
  // Now, request the data from the supplied GitHub Gist URL.
  // First, just check tha the URL is valid and is a raw URL, not a
  // link to the GitHub page.
  if (!url.includes("gist.githubusercontent.com")) {
    console.error("Invalid URL for GitHub Gist");
    return;
  }

  // Now, request the data from the supplied GitHub Gist URL.
  const request = new XMLHttpRequest();
  request.open("GET", url, false);
  request.send(null);

  if (request.status === 404) {
    console.error("Could not find data file");
    return;
  } else if (request.status !== 200) {
    console.error("Error loading data file");
    return;
  }

  // Now, parse the data as JSON.
  const data = JSON.parse(request.responseText);

  return data;
}

// Top-level function to load data from the server or from a GitHub Gist URL.
export async function getData() {
  if (isRunningOnGitHubPages()) {
    return loadExternalData(
      "https://gist.githubusercontent.com/CrossR/f0ab94b5d945d58742586a16eb10bcf4/raw/bcf98bf8e3c56834c2a0fabe5eaaf4d23c867f0b/testEvent.json",
    );
  } else {
    return loadServerData();
  }
}
