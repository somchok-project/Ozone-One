"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Grid,
  OrbitControls,
  TransformControls,
  Environment,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Plus,
  Trash2,
  RotateCw,
  Move,
  Copy,
  Save,
  ChevronDown,
  PackageOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ItemType = "table" | "chair" | "rack" | "shelf" | "counter";

export interface BoothItem {
  id: string;
  type: ItemType;
  position: [number, number, number];
  rotation: [number, number, number];
  color?: string;
}

interface BoothConfigurator3DProps {
  /** Called whenever the items list changes */
  onChange?: (items: BoothItem[]) => void;
  /** Initial items to load */
  initialItems?: BoothItem[];
  /** Name of the hidden <input> that stores the JSON (for form submission) */
  inputName?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FLOOR_Y = 0;

const ITEM_FLOOR_OFFSET: Record<ItemType, number> = {
  table: 0.37,
  chair: 0.25,
  rack: 0.8,
  shelf: 0.5,
  counter: 0.45,
};

const ITEM_COLORS: Record<ItemType, string> = {
  table: "#d97706",
  chair: "#2563eb",
  rack: "#7c3aed",
  shelf: "#059669",
  counter: "#db2777",
};

const ITEM_LABELS: Record<ItemType, string> = {
  table: "โต๊ะ",
  chair: "เก้าอี้",
  rack: "ราวแขวน",
  shelf: "ชั้นวาง",
  counter: "เคาน์เตอร์",
};

// ─── Furniture geometry components ───────────────────────────────────────────

function TableMesh({
  selected,
  color,
}: {
  selected: boolean;
  color: string;
}) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.06, 0.5]} />
        <meshStandardMaterial color={mat} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Legs */}
      {[
        [-0.38, 0, -0.2],
        [0.38, 0, -0.2],
        [-0.38, 0, 0.2],
        [0.38, 0, 0.2],
      ].map(([x, , z], i) => (
        <mesh key={i} position={[x as number, 0.17, z as number]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.34, 8]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ChairMesh({
  selected,
  color,
}: {
  selected: boolean;
  color: string;
}) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color={mat} roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.44, 0.175]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial color={mat} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[
        [-0.16, -0.16],
        [0.16, -0.16],
        [-0.16, 0.16],
        [0.16, 0.16],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function RackMesh({
  selected,
  color,
}: {
  selected: boolean;
  color: string;
}) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      {/* Horizontal bar */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={mat} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Left support */}
      <mesh position={[-0.48, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 12]} />
        <meshStandardMaterial color={mat} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Right support */}
      <mesh position={[0.48, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 12]} />
        <meshStandardMaterial color={mat} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Base cross bars */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.04, 0.3]} />
        <meshStandardMaterial color={mat} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Hangers (decorative) */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0.08]}>
          <torusGeometry args={[0.05, 0.008, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function ShelfMesh({
  selected,
  color,
}: {
  selected: boolean;
  color: string;
}) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      {/* Shelves */}
      {[0, 0.44, 0.88].map((y, i) => (
        <mesh key={i} position={[0, y + 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.04, 0.3]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
      {/* Side panels */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 0]} castShadow>
          <boxGeometry args={[0.04, 1.04, 0.3]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function CounterMesh({
  selected,
  color,
}: {
  selected: boolean;
  color: string;
}) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.84, 0.5]} />
        <meshStandardMaterial color={mat} roughness={0.4} />
      </mesh>
      {/* Top slab */}
      <mesh position={[0, 0.87, 0]} castShadow>
        <boxGeometry args={[1.05, 0.06, 0.55]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

function FurnitureMesh({
  type,
  selected,
  color,
}: {
  type: ItemType;
  selected: boolean;
  color: string;
}) {
  switch (type) {
    case "table":
      return <TableMesh selected={selected} color={color} />;
    case "chair":
      return <ChairMesh selected={selected} color={color} />;
    case "rack":
      return <RackMesh selected={selected} color={color} />;
    case "shelf":
      return <ShelfMesh selected={selected} color={color} />;
    case "counter":
      return <CounterMesh selected={selected} color={color} />;
  }
}

// ─── Single draggable item ────────────────────────────────────────────────────

function FurnitureItem({
  item,
  isSelected,
  transformMode,
  orbitEnabled,
  onSelect,
  onDeselect,
  onTransform,
}: {
  item: BoothItem;
  isSelected: boolean;
  transformMode: "translate" | "rotate";
  orbitEnabled: React.MutableRefObject<boolean>;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onTransform: (id: string, position: [number, number, number], rotation: [number, number, number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const floorY = ITEM_FLOOR_OFFSET[item.type];

  const handleObjectChange = useCallback(() => {
    if (!groupRef.current) return;
    const p = groupRef.current.position;
    const r = groupRef.current.rotation;
    // Clamp to floor and within booth bounds (~2.5m each side)
    p.y = floorY;
    p.x = Math.max(-2.4, Math.min(2.4, p.x));
    p.z = Math.max(-2.4, Math.min(2.4, p.z));
    onTransform(
      item.id,
      [p.x, p.y, p.z],
      [r.x, r.y, r.z],
    );
  }, [item.id, floorY, onTransform]);

  return (
    <>
      <group
        ref={groupRef}
        position={item.position}
        rotation={item.rotation}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
      >
        <FurnitureMesh
          type={item.type}
          selected={isSelected}
          color={item.color ?? ITEM_COLORS[item.type]}
        />
        {/* Invisible hitbox */}
        <mesh visible={false}>
          <boxGeometry args={[1.1, 1.8, 0.6]} />
        </mesh>
        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[0.65, 0.72, 32]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* TransformControls — attached after mesh mounts */}
      {isSelected && mounted && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          showY={false} // Lock Y movement in translate
          onMouseDown={() => {
            orbitEnabled.current = false;
          }}
          onMouseUp={() => {
            orbitEnabled.current = true;
          }}
          onObjectChange={handleObjectChange}
        />
      )}
    </>
  );
}

// ─── Scene (inside Canvas) ───────────────────────────────────────────────────

function Scene({
  items,
  selectedId,
  transformMode,
  setSelectedId,
  onTransform,
}: {
  items: BoothItem[];
  selectedId: string | null;
  transformMode: "translate" | "rotate";
  setSelectedId: (id: string | null) => void;
  onTransform: (id: string, p: [number, number, number], r: [number, number, number]) => void;
}) {
  const orbitRef = useRef<any>(null);
  const orbitEnabled = useRef(true);

  // Sync orbit enable state each frame
  useEffect(() => {
    const frame = setInterval(() => {
      if (orbitRef.current) {
        orbitRef.current.enabled = orbitEnabled.current;
      }
    }, 10);
    return () => clearInterval(frame);
  }, []);

  return (
    <>
      {/* Camera & Controls */}
      <OrbitControls
        ref={orbitRef}
        makeDefault
        maxPolarAngle={Math.PI / 2.05}
        minDistance={2}
        maxDistance={14}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 4, -3]} intensity={0.4} />

      {/* Environment */}
      <color attach="background" args={["#f8fafc"]} />

      {/* Floor grid — 6x6 m booth area */}
      <Grid
        position={[0, FLOOR_Y, 0]}
        args={[6, 6]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#e2e8f0"
        sectionSize={1}
        sectionThickness={1.2}
        sectionColor="#94a3b8"
        followCamera={false}
        infiniteGrid={false}
        fadeDistance={20}
      />

      {/* Booth boundary walls (subtle) */}
      {/* Floor */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y - 0.002, 0]}
        onClick={() => setSelectedId(null)}
      >
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={1} />
      </mesh>

      {/* Contact shadows */}
      <ContactShadows
        position={[0, FLOOR_Y, 0]}
        opacity={0.3}
        scale={8}
        blur={2}
        far={4}
      />

      {/* Furniture items */}
      {items.map((item) => (
        <FurnitureItem
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          transformMode={transformMode}
          orbitEnabled={orbitEnabled}
          onSelect={setSelectedId}
          onDeselect={() => setSelectedId(null)}
          onTransform={onTransform}
        />
      ))}

      {/* Label for empty state */}
      {items.length === 0 && (
        <Html center position={[0, 0.5, 0]}>
          <div className="pointer-events-none flex flex-col items-center gap-2 text-center">
            <PackageOpen className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-400">
              เพิ่มเฟอร์นิเจอร์จากเมนูด้านล่าง
            </p>
          </div>
        </Html>
      )}
    </>
  );
}

// ─── Sidebar item button ──────────────────────────────────────────────────────

function AddButton({
  type,
  onAdd,
}: {
  type: ItemType;
  onAdd: (type: ItemType) => void;
}) {
  const icons: Record<ItemType, string> = {
    table: "🪵",
    chair: "🪑",
    rack: "👔",
    shelf: "📚",
    counter: "🏪",
  };
  return (
    <button
      type="button"
      onClick={() => onAdd(type)}
      className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
    >
      <span className="text-base">{icons[type]}</span>
      <span>{ITEM_LABELS[type]}</span>
      <Plus className="ml-auto h-3.5 w-3.5 opacity-50" />
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

let idCounter = 1;

export default function BoothConfigurator3D({
  onChange,
  initialItems = [],
  inputName = "booth_items",
}: BoothConfigurator3DProps) {
  const [items, setItems] = useState<BoothItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate">(
    "translate",
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedItem = items.find((i) => i.id === selectedId);

  // Add item in the center, slightly offset so items don't stack
  const addItem = useCallback(
    (type: ItemType) => {
      const offset = (idCounter % 3) * 0.4 - 0.4;
      const newItem: BoothItem = {
        id: `item-${idCounter++}`,
        type,
        position: [offset, ITEM_FLOOR_OFFSET[type], offset * 0.5],
        rotation: [0, 0, 0],
        color: ITEM_COLORS[type],
      };
      setItems((prev) => {
        const next = [...prev, newItem];
        onChange?.(next);
        return next;
      });
      setSelectedId(newItem.id);
    },
    [onChange],
  );

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== selectedId);
      onChange?.(next);
      return next;
    });
    setSelectedId(null);
  }, [selectedId, onChange]);

  const duplicateSelected = useCallback(() => {
    if (!selectedItem) return;
    const dup: BoothItem = {
      ...selectedItem,
      id: `item-${idCounter++}`,
      position: [
        selectedItem.position[0] + 0.5,
        selectedItem.position[1],
        selectedItem.position[2] + 0.5,
      ],
    };
    setItems((prev) => {
      const next = [...prev, dup];
      onChange?.(next);
      return next;
    });
    setSelectedId(dup.id);
  }, [selectedItem, onChange]);

  const handleTransform = useCallback(
    (
      id: string,
      position: [number, number, number],
      rotation: [number, number, number],
    ) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, position, rotation } : item,
        );
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const handleSaveLayout = useCallback(() => {
    console.log("📦 Booth Layout:", JSON.stringify(items, null, 2));
  }, [items]);

  const jsonValue = JSON.stringify(items);

  return (
    <div className="flex flex-col gap-0">
      {/* Hidden input for form submission */}
      <input type="hidden" name={inputName} value={jsonValue} />

      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-inner">
        {/* 3D Canvas */}
        <div className="h-[500px] w-full">
          <Canvas
            shadows
            camera={{ position: [4, 5, 6], fov: 45 }}
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <Scene
                items={items}
                selectedId={selectedId}
                transformMode={transformMode}
                setSelectedId={setSelectedId}
                onTransform={handleTransform}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Top-right mode toolbar */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 rounded-2xl bg-white/90 p-1.5 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm">
          <button
            type="button"
            title="ย้าย (Translate)"
            onClick={() => setTransformMode("translate")}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              transformMode === "translate"
                ? "bg-orange-500 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Move className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="หมุน (Rotate)"
            onClick={() => setTransformMode("rotate")}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              transformMode === "rotate"
                ? "bg-orange-500 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Selected item actions */}
        {selectedItem && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-2xl bg-white/90 px-3 py-2 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm">
            <span className="mr-1 text-xs font-bold text-slate-600">
              {ITEM_LABELS[selectedItem.type]}
            </span>
            <button
              type="button"
              title="ทำสำเนา"
              onClick={duplicateSelected}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="ลบ"
              onClick={removeSelected}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom toolbar: Add items + Save */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Add buttons */}
        {(["table", "chair", "rack", "shelf", "counter"] as ItemType[]).map(
          (type) => {
            const icons: Record<ItemType, string> = {
              table: "🪵",
              chair: "🪑",
              rack: "👔",
              shelf: "📚",
              counter: "🏪",
            };
            return (
              <button
                key={type}
                type="button"
                onClick={() => addItem(type)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <span>{icons[type]}</span>
                <span>+ {ITEM_LABELS[type]}</span>
              </button>
            );
          },
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Item count badge */}
        {items.length > 0 && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {items.length} ชิ้น
          </span>
        )}

        {/* Save / log layout */}
        <button
          type="button"
          onClick={handleSaveLayout}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />
          บันทึก Layout
        </button>
      </div>

      {/* Summary list */}
      {items.length > 0 && (
        <div className="mt-3 space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                item.id === selectedId
                  ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color ?? ITEM_COLORS[item.type] }}
              />
              <span className="font-semibold">{ITEM_LABELS[item.type]}</span>
              <span className="text-slate-400">
                x:{item.position[0].toFixed(2)} z:{item.position[2].toFixed(2)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setItems((prev) => {
                    const next = prev.filter((i) => i.id !== item.id);
                    onChange?.(next);
                    return next;
                  });
                  if (selectedId === item.id) setSelectedId(null);
                }}
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
