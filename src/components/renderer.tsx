import { useAtom, useAtomValue } from "jotai";
import {
  highestLayerAtom,
  LAYER_NAMES,
  modifierAtom,
  pressedKeysAtom,
  shortcutAtom,
} from "../store";

import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";

type RowKey =
  | {
      k: string;
      c: string;
      s?: string;
    }
  | string;

const ColTransition = [30, 15, 0, 8, 16];

const RowMap: [number, number, ...RowKey[]][] = [
  [0, 0, "Q", { k: "ㅅ", c: "red" }, { k: "ㅊ", c: "red" }],
  [1, 0, "W", { k: "ㅂ", c: "red" }, { k: "ㅍ", c: "red" }],
  [2, 0, "E", { k: "ㄹ", c: "red" }, { k: "ㅈ", c: "red" }],
  [3, 0, "R", { k: "ㅓ", c: "orange" }, { k: "ㅝ", c: "orange" }],
  [4, 0, "T", { k: "ㅕ", c: "orange" }, { k: "ㅒ", c: "orange" }],

  [0, 1, "A", { k: "ㅇ", c: "red" }, { k: "ㅀ", c: "red" }],
  [1, 1, "S", { k: "ㄴ", c: "red" }, { k: "ㅎ", c: "red" }],
  [2, 1, "D", { k: "ㅣ", c: "orange" }],
  [3, 1, "F", { k: "ㅏ", c: "orange" }],
  [4, 1, "G", { k: "ㅡ", c: "orange" }, { k: "ㅑ", c: "orange" }],

  [0, 2, "Z", { k: "ㅁ", c: "red" }, { k: "ㄷ", c: "red" }],
  [1, 2, "X", { k: "ㄱ", c: "red" }, { k: "ㅋ", c: "red" }],
  [2, 2, "C", { k: "ㅔ", c: "orange" }, { k: "ㅖ", c: "orange" }],
  [3, 2, "V", { k: "ㅗ", c: "orange" }, { k: "ㅛ", c: "orange" }],
  [4, 2, "B", { k: "ㅜ", c: "orange" }, { k: "ㅠ", c: "orange" }],

  [0, 3, "", "-"],
  [1, 3, "", "-"],
  [2, 3, "", "-"],

  [3, 3, "", "ESC"],
  [4, 3, "", "SPC"],
  [5, 3, "", "TAB"],

  [4, 4, "Y", { k: "ㅁ", c: "green" }],
  [3, 4, "U", { k: "ㄴ", c: "green" }],
  [2, 4, "I", { k: "ㄷ", c: "green" }],
  [1, 4, "O", { k: "ㅂ", c: "green" }],
  [0, 4, "P", { k: "ㅅ", c: "green" }],
  [4, 5, "H", { k: "ㅎ", c: "green" }],
  [3, 5, "J", { k: "ㅇ", c: "green" }],
  [2, 5, "K", { k: "ㄱ", c: "green" }],
  [1, 5, "L", { k: "ㅈ", c: "green" }],
  [0, 5, ";", { k: "ㅆ", c: "green" }],
  [4, 6, "N", { k: "ㅅ", c: "green" }],
  [3, 6, "M", { k: "ㄹ", c: "green" }],
  [2, 6, ",", "", ""],
  [1, 6, ".", { k: "ㅜ", c: "orange" }],
  [0, 6, "/"],

  [5, 7, "", "ENT"],
  [4, 7, "", "BS"],
  [0, 7, "", "-"],
];

function Row({
  col,
  row,
}: {
  col: number;
  row: number;
  children?: React.ReactNode;
}) {
  const [pressedKeys] = useAtom(pressedKeysAtom);
  const [isRecentlyActive, setIsRecentlyActive] = useState(false);

  const isActive = useMemo(
    () => pressedKeys.some((key) => key.col === col && key.row === row),
    [pressedKeys, col, row]
  );

  useEffect(() => {
    if (isActive) {
      setIsRecentlyActive(true);
      setTimeout(() => {
        setIsRecentlyActive(false);
      }, 150);
    }
  }, [isActive]);

  const key = RowMap.find((item) => item[0] === col && item[1] === row);
  const keyItems = (key?.slice(2) ?? []) as (RowKey | string)[];

  return (
    <div
      data-active={isActive || (!isActive && isRecentlyActive)}
      className={cn(
        "w-14 h-14 rounded-md flex items-center justify-center transition-all py-1 pr-1.5 pl-2",
        "text-sm text-center transition rounded-lg border",
        "border-white/10 data-[active=true]:border-white/0 data-[active=true]:shadow-none data-[active=true]:translate-y-0.5",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] cursor-default bg-cyan-800 text-cyan-100 outline-0 data-[active=true]:bg-cyan-600",
        "shadow-[0px_2px_1px_rgba(255,255,255,0.1)] data-[active=true]:shadow-none"
      )}
    >
      <div className="relative w-full h-full font-semibold text-base">
        {keyItems?.map((item, index) => {
          const { k, c } = typeof item === "string" ? { k: item, c: "" } : item;
          return (
            <div
              key={index}
              className={cn(
                "absolute",
                index === 0 && "top-0 left-0",
                index === 1 && "bottom-0 right-0 text-right translate-y-0.5",
                index === 2 && "right-0 bottom-[17px]",
                c === "red" && "text-red-400",
                c === "orange" && "text-orange-400",
                c === "green" && "text-green-400"
              )}
            >
              {k}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LayerIndicator() {
  const highestLayer = useAtomValue(highestLayerAtom);

  return (
    <div className="text-cyan-100 text-lg font-semibold tracking-wide flex items-center gap-2 flex-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
      </svg>
      <div className="underline underline-offset-4 decoration-cyan-100/50 decoration-wavy">
        {highestLayer} ({LAYER_NAMES[highestLayer]})
      </div>
    </div>
  );
}

function ModifierItem({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) {
  const [isRecentlyActive, setIsRecentlyActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsRecentlyActive(true);
      setTimeout(() => {
        setIsRecentlyActive(false);
      }, 150);
    }
  }, [isActive]);

  return (
    <div
      className={cn(
        "w-6 h-6 flex items-center justify-center bg-cyan-100/10 rounded-lg transition-all",
        isActive || isRecentlyActive
          ? "bg-cyan-300/50 shadow-2xl -translate-y-0.5"
          : "bg-cyan-100/10"
      )}
    >
      {children}
    </div>
  );
}

function ModifierIndicator() {
  const modifier = useAtomValue(modifierAtom);

  return (
    <div className="flex gap-2.5 text-sm text-cyan-100 flex-1 justify-end">
      <ModifierItem isActive={modifier.command}>⌘</ModifierItem>
      <ModifierItem isActive={modifier.option}>⌥</ModifierItem>
      <ModifierItem isActive={modifier.control}>⌃</ModifierItem>
      <ModifierItem isActive={modifier.shift}>⇧</ModifierItem>
    </div>
  );
}

function LogViewer() {
  const shortcut = useAtomValue(shortcutAtom);

  return (
    <div className="text-cyan-100 flex-1 flex justify-center gap-2">
      {shortcut?.shortcut && (
        <>
          <div>{shortcut?.shortcut}</div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </>
      )}
      <div>{shortcut?.result}</div>
    </div>
  );
}

export function Renderer() {
  return (
    <div
      className="flex flex-col gap-2 bg-cyan-900 pt-16 pb-28 items-center justify-center rounded-3xl relative select-none"
      data-tauri-drag-region
    >
      <div className="absolute flex justify-between px-8 pb-7 left-0 bottom-0 w-full items-center">
        <LayerIndicator />
        <LogViewer />
        <ModifierIndicator />
      </div>

      <div className="flex flex-row justify-center gap-60">
        <div className="grid grid-cols-5 gap-2.5 h-fit relative">
          {Array(18)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                style={{
                  transform: `translateY(${
                    ColTransition[RowMap[index][0]] || 0
                  }px)`,
                }}
              >
                <Row col={RowMap[index][0]} row={RowMap[index][1]} />
              </div>
            ))}

          <div className="flex gap-3 w-0 translate-y-5 translate-x-6">
            <div className="">
              <Row col={3} row={3} />
            </div>
            <div className="rotate-[10deg] translate-y-2">
              <Row col={4} row={3} />
            </div>
            <div className="rotate-[20deg] translate-y-6">
              <Row col={5} row={3} />
            </div>
          </div>
          <div className="absolute -right-20 top-6">
            <div className="rounded-lg w-16 h-40 bg-white/10"></div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2.5 h-fit relative">
          <div className="absolute -left-20 top-6">
            <div className="rounded-lg w-16 h-40 bg-white/10"></div>
          </div>
          {Array(15)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                style={{
                  transform: `translateY(${
                    ColTransition[RowMap[index + 21][0]] || 0
                  }px)`,
                }}
              >
                <Row col={RowMap[index + 21][0]} row={RowMap[index + 21][1]} />
              </div>
            ))}
          <div className="flex gap-3 w-0 translate-y-5 -translate-x-[88px]">
            <div className="rotate-[-20deg] translate-y-6">
              <Row col={5} row={7} />
            </div>
            <div className="rotate-[-10deg] translate-y-2">
              <Row col={4} row={7} />
            </div>
          </div>
          <div />
          <div className="w-0 translate-y-4">
            <div className="rounded-full w-24 h-24 bg-white/10"></div>
          </div>
          <div />

          <div
            style={{
              transform: `translateY(${ColTransition[0]}px)`,
            }}
          >
            <Row col={0} row={7} />
          </div>
        </div>
      </div>
    </div>
  );
}
