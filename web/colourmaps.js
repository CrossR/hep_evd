//
// Colour maps
//

import { DEFAULT_CATEGORICAL_LUT_CONFIG, DEFAULT_LUT_CONFIG } from "./constants.js";

// By default, THREE.js only includes 4 colour maps: 'rainbow', 'cooltowarm',
// 'blackbody', 'grayscale'.
//
// This adds more, building on some of the ones built into matplotlib.

// Tableau 10, see https://vega.github.io/vega/docs/schemes/#tableau10
// prettier-ignore
const tableau10Colours = [
  0x1F77B4, 0xFF7F0E, 0x2CA02C, 0xD62728, 0x9467BD, 0x8C564B, 0xE377C2,
  0x7F7F7F, 0xBCBD22, 0x17BECF,
];
const tableau10CM = tableau10Colours.map((c, i) => [i / 9, c]);

// Tableau 20, see https://vega.github.io/vega/docs/schemes/#tableau20
// prettier-ignore
const tableau20Colours = [
  0x1F77B4, 0xAEC7E8, 0xFF7F0E, 0xFFBB78, 0x2CA02C, 0x98DF8A, 0xD62728,
  0xFF9896, 0x9467BD, 0xC5B0D5, 0x8C564B, 0xC49C94, 0xE377C2, 0xF7B6D2,
  0x7F7F7F, 0xC7C7C7, 0xBCBD22, 0xDBDB8D, 0x17BECF, 0x9EDAE5,
];
const tableau20CM = tableau20Colours.map((c, i) => [i / 19, c]);

const tableau20bColours = [
  0x393b79, 0x5254a3, 0x6b6ecf, 0x9c9ede, 0x637939, 0x8ca252, 0xb5cf6b,
  0xcedb9c, 0x8c6d31, 0xbd9e39, 0xe7ba52, 0xe7cb94, 0x843c39, 0xad494a,
  0xd6616b, 0xe7969c, 0x7b4173, 0xa55194, 0xce6dbd, 0xde9ed6,
];
const tableau20bCM = tableau20bColours.map((c, i) => [i / 19, c]);

const tableau20cColours = [
  0x3182bd, 0x6baed6, 0x9ecae1, 0xc6dbef, 0xe6550d, 0xfd8d3c, 0xfdae6b,
  0xfdd0a2, 0x31a354, 0x74c476, 0xa1d99b, 0xc7e9c0, 0x756bb1, 0x9e9ac8,
  0xbcbddc, 0xdadaeb, 0x636363, 0x969696, 0xbdbdbd, 0xd9d9d9,
];
const tableau20cCM = tableau20cColours.map((c, i) => [i / 19, c]);

// Now, sequential colour maps.

// Viridis, see https://bids.github.io/colormap/

// prettier-ignore
let viridisColours = [
  0x440154, 0x440256, 0x450457, 0x450559, 0x46075a, 0x46085c, 0x460a5d,
  0x460b5e, 0x470d60, 0x470e61, 0x471063, 0x471164, 0x471365, 0x481467,
  0x481668, 0x481769, 0x48186a, 0x481a6c, 0x481b6d, 0x481c6e, 0x481d6f,
  0x481f70, 0x482071, 0x482173, 0x482374, 0x482475, 0x482576, 0x482677,
  0x482878, 0x482979, 0x472a7a, 0x472c7a, 0x472d7b, 0x472e7c, 0x472f7d,
  0x46307e, 0x46327e, 0x46337f, 0x463480, 0x453581, 0x453781, 0x453882,
  0x443983, 0x443a83, 0x443b84, 0x433d84, 0x433e85, 0x423f85, 0x424086,
  0x424186, 0x414287, 0x414487, 0x404588, 0x404688, 0x3f4788, 0x3f4889,
  0x3e4989, 0x3e4a89, 0x3e4c8a, 0x3d4d8a, 0x3d4e8a, 0x3c4f8a, 0x3c508b,
  0x3b518b, 0x3b528b, 0x3a538b, 0x3a548c, 0x39558c, 0x39568c, 0x38588c,
  0x38598c, 0x375a8c, 0x375b8d, 0x365c8d, 0x365d8d, 0x355e8d, 0x355f8d,
  0x34608d, 0x34618d, 0x33628d, 0x33638d, 0x32648e, 0x32658e, 0x31668e,
  0x31678e, 0x31688e, 0x30698e, 0x306a8e, 0x2f6b8e, 0x2f6c8e, 0x2e6d8e,
  0x2e6e8e, 0x2e6f8e, 0x2d708e, 0x2d718e, 0x2c718e, 0x2c728e, 0x2c738e,
  0x2b748e, 0x2b758e, 0x2a768e, 0x2a778e, 0x2a788e, 0x29798e, 0x297a8e,
  0x297b8e, 0x287c8e, 0x287d8e, 0x277e8e, 0x277f8e, 0x27808e, 0x26818e,
  0x26828e, 0x26828e, 0x25838e, 0x25848e, 0x25858e, 0x24868e, 0x24878e,
  0x23888e, 0x23898e, 0x238a8d, 0x228b8d, 0x228c8d, 0x228d8d, 0x218e8d,
  0x218f8d, 0x21908d, 0x21918c, 0x20928c, 0x20928c, 0x20938c, 0x1f948c,
  0x1f958b, 0x1f968b, 0x1f978b, 0x1f988b, 0x1f998a, 0x1f9a8a, 0x1e9b8a,
  0x1e9c89, 0x1e9d89, 0x1f9e89, 0x1f9f88, 0x1fa088, 0x1fa188, 0x1fa187,
  0x1fa287, 0x20a386, 0x20a486, 0x21a585, 0x21a685, 0x22a785, 0x22a884,
  0x23a983, 0x24aa83, 0x25ab82, 0x25ac82, 0x26ad81, 0x27ad81, 0x28ae80,
  0x29af7f, 0x2ab07f, 0x2cb17e, 0x2db27d, 0x2eb37c, 0x2fb47c, 0x31b57b,
  0x32b67a, 0x34b679, 0x35b779, 0x37b878, 0x38b977, 0x3aba76, 0x3bbb75,
  0x3dbc74, 0x3fbc73, 0x40bd72, 0x42be71, 0x44bf70, 0x46c06f, 0x48c16e,
  0x4ac16d, 0x4cc26c, 0x4ec36b, 0x50c46a, 0x52c569, 0x54c568, 0x56c667,
  0x58c765, 0x5ac864, 0x5cc863, 0x5ec962, 0x60ca60, 0x63cb5f, 0x65cb5e,
  0x67cc5c, 0x69cd5b, 0x6ccd5a, 0x6ece58, 0x70cf57, 0x73d056, 0x75d054,
  0x77d153, 0x7ad151, 0x7cd250, 0x7fd34e, 0x81d34d, 0x84d44b, 0x86d549,
  0x89d548, 0x8bd646, 0x8ed645, 0x90d743, 0x93d741, 0x95d840, 0x98d83e,
  0x9bd93c, 0x9dd93b, 0xa0da39, 0xa2da37, 0xa5db36, 0xa8db34, 0xaadc32,
  0xaddc30, 0xb0dd2f, 0xb2dd2d, 0xb5de2b, 0xb8de29, 0xbade28, 0xbddf26,
  0xc0df25, 0xc2df23, 0xc5e021, 0xc8e020, 0xcae11f, 0xcde11d, 0xd0e11c,
  0xd2e21b, 0xd5e21a, 0xd8e219, 0xdae319, 0xdde318, 0xdfe318, 0xe2e418,
  0xe5e419, 0xe7e419, 0xeae51a, 0xece51b, 0xefe51c, 0xf1e51d, 0xf4e61e,
  0xf6e620, 0xf8e621, 0xfbe723, 0xfde725
];
const viridisCM = viridisColours.map((c, i) => [i / 255, c]);

// prettier-ignore
const magmaColours = [
  0x010000, 0x010005, 0x010106, 0x010108, 0x020109, 0x02020b, 0x02020d,
  0x03030f, 0x030312, 0x040414, 0x050416, 0x060518, 0x06051a, 0x07061c,
  0x08071e, 0x090720, 0x0a0822, 0x0b0924, 0x0c0926, 0x0d0a29, 0x0e0b2b,
  0x100b2d, 0x110c2f, 0x120d31, 0x130d34, 0x140e36, 0x150e38, 0x160f3b,
  0x180f3d, 0x19103f, 0x1a1042, 0x1c1044, 0x1d1147, 0x1e1149, 0x20114b,
  0x21114e, 0x221150, 0x241253, 0x251255, 0x271258, 0x29115a, 0x2a115c,
  0x2c115f, 0x2d1161, 0x2f1163, 0x311165, 0x331067, 0x341069, 0x36106b,
  0x38106c, 0x390f6e, 0x3b0f70, 0x3d0f71, 0x3f0f72, 0x400f74, 0x420f75,
  0x440f76, 0x451077, 0x471078, 0x491078, 0x4a1079, 0x4c117a, 0x4e117b,
  0x4f127b, 0x51127c, 0x52137c, 0x54137d, 0x56147d, 0x57157e, 0x59157e,
  0x5a167e, 0x5c167f, 0x5d177f, 0x5f187f, 0x601880, 0x621980, 0x641a80,
  0x651a80, 0x671b80, 0x681c81, 0x6a1c81, 0x6b1d81, 0x6d1d81, 0x6e1e81,
  0x701f81, 0x721f81, 0x732081, 0x752181, 0x762181, 0x782281, 0x792282,
  0x7b2382, 0x7c2382, 0x7e2482, 0x802582, 0x812581, 0x832681, 0x842681,
  0x862781, 0x882781, 0x892881, 0x8b2981, 0x8c2981, 0x8e2a81, 0x902a81,
  0x912b81, 0x932b80, 0x942c80, 0x962c80, 0x982d80, 0x992d80, 0x9b2e7f,
  0x9c2e7f, 0x9e2f7f, 0xa02f7f, 0xa1307e, 0xa3307e, 0xa5317e, 0xa6317d,
  0xa8327d, 0xaa337d, 0xab337c, 0xad347c, 0xae347b, 0xb0357b, 0xb2357b,
  0xb3367a, 0xb5367a, 0xb73779, 0xb83779, 0xba3878, 0xbc3978, 0xbd3977,
  0xbf3a77, 0xc03a76, 0xc23b75, 0xc43c75, 0xc53c74, 0xc73d73, 0xc83e73,
  0xca3e72, 0xcc3f71, 0xcd4071, 0xcf4070, 0xd0416f, 0xd2426f, 0xd3436e,
  0xd5446d, 0xd6456c, 0xd8456c, 0xd9466b, 0xdb476a, 0xdc4869, 0xde4968,
  0xdf4a68, 0xe04c67, 0xe24d66, 0xe34e65, 0xe44f64, 0xe55064, 0xe75263,
  0xe85362, 0xe95462, 0xea5661, 0xeb5760, 0xec5860, 0xed5a5f, 0xee5b5e,
  0xef5d5e, 0xf05f5e, 0xf1605d, 0xf2625d, 0xf2645c, 0xf3655c, 0xf4675c,
  0xf4695c, 0xf56b5c, 0xf66c5c, 0xf66e5c, 0xf7705c, 0xf7725c, 0xf8745c,
  0xf8765c, 0xf9785d, 0xf9795d, 0xf97b5d, 0xfa7d5e, 0xfa7f5e, 0xfa815f,
  0xfb835f, 0xfb8560, 0xfb8761, 0xfc8961, 0xfc8a62, 0xfc8c63, 0xfc8e64,
  0xfc9065, 0xfd9266, 0xfd9467, 0xfd9668, 0xfd9869, 0xfd9a6a, 0xfd9b6b,
  0xfe9d6c, 0xfe9f6d, 0xfea16e, 0xfea36f, 0xfea571, 0xfea772, 0xfea973,
  0xfeaa74, 0xfeac76, 0xfeae77, 0xfeb078, 0xfeb27a, 0xfeb47b, 0xfeb67c,
  0xfeb77e, 0xfeb97f, 0xfebb81, 0xfebd82, 0xfebf84, 0xfec185, 0xfec287,
  0xfec488, 0xfec68a, 0xfec88c, 0xfeca8d, 0xfecc8f, 0xfecd90, 0xfecf92,
  0xfed194, 0xfed395, 0xfed597, 0xfed799, 0xfed89a, 0xfdda9c, 0xfddc9e,
  0xfddea0, 0xfde0a1, 0xfde2a3, 0xfde3a5, 0xfde5a7, 0xfde7a9, 0xfde9aa,
  0xfdebac, 0xfcecae, 0xfceeb0, 0xfcf0b2, 0xfcf2b4, 0xfcf4b6, 0xfcf6b8,
  0xfcf7b9, 0xfcf9bb, 0xfcfbbd, 0xfcfdbf
];
const magmaCM = magmaColours.map((c, i) => [i / 255, c]);

// Exported function that adds the requested colour map to the given LUT.
// The name must be one of the keys in COLOUR_MAPS.
export function addColourMap(lut, name, num) {
  if (!(name in COLOUR_MAPS)) {
    if (!(name in DEFAULT_MAPS)) {
      throw new Error("Unknown colour map: " + name);
    }
    lut.setColorMap(name, num);
  } else {
    lut.addColorMap(name, COLOUR_MAPS[name]);
    lut.setColorMap(name, num);
  }
}

// COLOUR_MAPS lookup table.
export const COLOUR_MAPS = {
  // Qualitative colour maps.
  tableau10: tableau10CM,
  tableau20: tableau20CM,
  tableau20b: tableau20bCM,
  tableau20c: tableau20cCM,
  // Sequential colour maps.
  viridis: viridisCM,
  magma: magmaCM,
};

export const DEFAULT_MAPS = {
    "cooltowarm": 128,
    "rainbow": 128,
    "blackbody": 128,
    "grayscale": 128,
};

export function getCategoricalLutConf() {
  const storage = window.localStorage;

  if (storage.getItem("categoricalColourMap") === null) {
    storage.setItem("categoricalColourMap", JSON.stringify(DEFAULT_CATEGORICAL_LUT_CONFIG));
  }

  return JSON.parse(storage.getItem("categoricalColourMap"));
}

export function getContinuousLutConf() {
  const storage = window.localStorage;

  if (storage.getItem("continuousColourMap") === null) {
    storage.setItem("continuousColourMap", JSON.stringify(DEFAULT_LUT_CONFIG));
  }

  return JSON.parse(storage.getItem("continuousColourMap"));
}
