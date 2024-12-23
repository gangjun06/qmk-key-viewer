import { atom } from "jotai";

export const modifierAtom = atom<{
  command: boolean;
  option: boolean;
  control: boolean;
  shift: boolean;
}>({ command: false, option: false, control: false, shift: false });

export const pressedKeysAtom = atom<{ col: number; row: number }[]>([]);

export const shortcutAtom = atom<{ shortcut?: string; result: string } | null>(
  null
);

export const layerAtom = atom(0);
export const activatedLayerAtom = atom((get) => {
  const layerBits = get(layerAtom);

  // layerBits(0000 1001) -> activatedLayers([1, 4])
  const activatedLayers = [];

  for (let i = 0; i < 8; i++) {
    if (layerBits & (1 << i)) {
      activatedLayers.push(i);
    }
  }

  return activatedLayers;
});

export const highestLayerAtom = atom((get) => {
  const activatedLayers = get(activatedLayerAtom);
  return activatedLayers.length > 0
    ? activatedLayers.reduce((max, layer) => Math.max(max, layer), 0)
    : 0;
});

export const LAYER_NAMES = [
  "BASE",
  "SEMOI",
  "COLEMAK",
  "FUNCTION",
  "NAVIGATION",
  "WM",
  "POINTER",
  "NUMERAL",
  "SYMBOLS",
  "CONFIG",
];
