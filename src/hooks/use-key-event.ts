import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { useSetAtom } from "jotai";
import {
  layerAtom,
  modifierAtom,
  pressedKeysAtom,
  shortcutAtom,
} from "../store";

import { convertQwertyToHangul } from "es-hangul";

export function useKeyEvent() {
  const setPressedKeys = useSetAtom(pressedKeysAtom);
  const setLayer = useSetAtom(layerAtom);
  const setShortcut = useSetAtom(shortcutAtom);
  const setModifier = useSetAtom(modifierAtom);

  const shortcutRef = useRef<number | null>(null);

  const initOnce = useRef(false);

  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;

    let unlisten: (() => void) | null = null;

    (async () => {
      unlisten = await listen("hid_event", (event) => {
        const input = event.payload as { message: string };
        const message = input.message;

        if (message.startsWith("#0>")) {
          const content = message.slice(3);
          const [col, row, isPressed] = content.split(" ");

          if (isPressed === "0") {
            setPressedKeys((prev) =>
              prev.filter(
                (key) => key.col !== parseInt(col) && key.row !== parseInt(row)
              )
            );
          } else {
            setPressedKeys((prev) => [
              ...prev,
              { col: parseInt(col), row: parseInt(row) },
            ]);
          }
        }

        if (message.startsWith("#1>")) {
          const content = message.slice(3);
          const [keycode, _col, _row, isPressed, tapCount] = content.split(" ");
          if (tapCount !== "0") return;

          const keycodeInNum = parseInt(keycode);

          const modifier = ((keycodeInNum >> 8) & 0x1f)
            .toString(2)
            .padStart(6, "0")
            .slice(2);
          const currentModifier = [
            "command",
            "option",
            "shift",
            "control",
          ].find((_, index) => modifier[index] === "1");

          if (currentModifier) {
            setModifier((prev) => {
              return {
                ...prev,
                [currentModifier as keyof typeof prev]: isPressed === "1",
              };
            });
          }
        }

        if (message.startsWith("#2>")) {
          const content = message.slice(3);
          const [layer] = content.split(" ");
          setLayer(parseInt(layer));
        }

        if (message.startsWith("#9(semoi-shortcut)>")) {
          const content = message.slice(19);
          const [shortcut, result] = content.split(" ");
          if (shortcutRef.current) {
            clearTimeout(shortcutRef.current);
          }

          setShortcut({
            shortcut: shortcut.split("").join("+"),
            result: convertQwertyToHangul(
              result.replace(/_/g, " ").replace(/\./g, "")
            ),
          });
          shortcutRef.current = setTimeout(() => {
            setShortcut(null);
          }, 1000);
        }

        if (message.startsWith("#9(semoi-type)>")) {
          const content = message.slice(15);
          if (shortcutRef.current) {
            clearTimeout(shortcutRef.current);
          }

          setShortcut({
            result: "Type - " + convertQwertyToHangul(content),
          });
          shortcutRef.current = setTimeout(() => {
            setShortcut(null);
          }, 1000);
        }
      });
    })();

    return () => {
      unlisten?.();
    };
  }, []);
}
