"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Grid,
  OrbitControls,
  TransformControls,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Trash2,
  RotateCw,
  Move,
  Copy,
  MousePointer2,
  List,
  X,
  Eye,
  Store,
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
  onChange?: (items: BoothItem[]) => void;
  initialItems?: BoothItem[];
  inputName?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// ความสูงของพื้นบูธ
const BOOTH_FLOOR_Y = 0.04; 
// ขนาดขอบเขตบูธ (บูธขนาด 3x3 เมตร -> กว้าง 1.5 จากจุดศูนย์กลาง)
const BOOTH_BOUNDS = 1.25; 

const ITEM_FLOOR_OFFSET: Record<ItemType, number> = {
  table: BOOTH_FLOOR_Y + 0.35,
  chair: BOOTH_FLOOR_Y + 0.25,
  rack: BOOTH_FLOOR_Y + 0.8,
  shelf: BOOTH_FLOOR_Y + 0.5,
  counter: BOOTH_FLOOR_Y + 0.45,
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

const ITEM_ICONS: Record<ItemType, string> = {
  table: "🪵",
  chair: "🪑",
  rack: "👔",
  shelf: "📚",
  counter: "🏪",
};

// ─── Booth Default Structure ─────────────────────────────────────────────────

function BoothStructure({ onDeselect }: { onDeselect: () => void }) {
  return (
    <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onDeselect(); }}>
      {/* พื้นบูธ (Floor Pad) */}
      <mesh position={[0, BOOTH_FLOOR_Y / 2, 0]} receiveShadow>
        <boxGeometry args={[3, BOOTH_FLOOR_Y, 3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      
      {/* ผนังด้านหลัง (Back Wall) */}
      <mesh position={[0, 0.6 + BOOTH_FLOOR_Y, -1.45]} receiveShadow castShadow>
        <boxGeometry args={[3, 1.2, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      
      {/* ผนังด้านซ้าย (Left Wall) */}
      <mesh position={[-1.45, 0.4 + BOOTH_FLOOR_Y, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.8, 3]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      
      {/* ผนังด้านขวา (Right Wall) */}
      <mesh position={[1.45, 0.4 + BOOTH_FLOOR_Y, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.8, 3]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>

      {/* พรมบอกทางเข้า (Entrance Indicator) */}
      <mesh position={[0, BOOTH_FLOOR_Y + 0.005, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.4]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.3} />
      </mesh>
      {/* Text Label "ทางเข้า" in 3D using Html */}
      <Html position={[0, BOOTH_FLOOR_Y + 0.01, 1.2]} rotation={[-Math.PI / 2, 0, 0]} transform pointerEvents="none">
        <div className="text-[8px] font-bold text-orange-800 uppercase tracking-widest opacity-60">
          FRONT / ทางเข้า
        </div>
      </Html>
    </group>
  );
}

// ─── Furniture Geometry Components ───────────────────────────────────────────
// (ลดความซับซ้อนโค้ดรูปทรง)
function TableMesh({ selected, color }: { selected: boolean; color: string }) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color={mat} roughness={0.4} metalness={0.1} />
      </mesh>
      {[[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.175, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.35, 8]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ChairMesh({ selected, color }: { selected: boolean; color: string }) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color={mat} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0.175]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial color={mat} roughness={0.6} />
      </mesh>
      {[[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.125, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function RackMesh({ selected, color }: { selected: boolean; color: string }) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color={mat} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 12]} />
        <meshStandardMaterial color={mat} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 12]} />
        <meshStandardMaterial color={mat} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.4]} />
        <meshStandardMaterial color={mat} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function ShelfMesh({ selected, color }: { selected: boolean; color: string }) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      {[-0.4, 0, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.04, 0.3]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 1.0, 0.3]} />
          <meshStandardMaterial color={mat} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function CounterMesh({ selected, color }: { selected: boolean; color: string }) {
  const mat = selected ? "#f97316" : color;
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 0.5]} />
        <meshStandardMaterial color={mat} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.25, 0.06, 0.55]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

function FurnitureMesh({ type, selected, color }: { type: ItemType; selected: boolean; color: string }) {
  switch (type) {
    case "table": return <TableMesh selected={selected} color={color} />;
    case "chair": return <ChairMesh selected={selected} color={color} />;
    case "rack": return <RackMesh selected={selected} color={color} />;
    case "shelf": return <ShelfMesh selected={selected} color={color} />;
    case "counter": return <CounterMesh selected={selected} color={color} />;
  }
}

// ─── Interactive Draggable Item ───────────────────────────────────────────────

function FurnitureItem({
  item,
  isSelected,
  transformMode,
  orbitEnabled,
  onSelect,
  onTransform,
}: {
  item: BoothItem;
  isSelected: boolean;
  transformMode: "translate" | "rotate" | "none";
  orbitEnabled: React.MutableRefObject<boolean>;
  onSelect: (id: string) => void;
  onTransform: (id: string, position: [number, number, number], rotation: [number, number, number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const floorY = ITEM_FLOOR_OFFSET[item.type];

  const handleObjectChange = useCallback(() => {
    if (!groupRef.current) return;
    const p = groupRef.current.position;
    const r = groupRef.current.rotation;
    
    // Clamp ให้อยู่ในกรอบบูธ (ไม่ให้ทะลุผนัง) และไม่จมดิน
    p.y = floorY;
    p.x = Math.max(-BOOTH_BOUNDS, Math.min(BOOTH_BOUNDS, p.x));
    p.z = Math.max(-BOOTH_BOUNDS, Math.min(BOOTH_BOUNDS, p.z));
    
    onTransform(item.id, [p.x, p.y, p.z], [r.x, r.y, r.z]);
  }, [item.id, floorY, onTransform]);

  const showX = transformMode === "translate";
  const showZ = transformMode === "translate";
  const showY = transformMode === "rotate"; 

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
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      >
        <FurnitureMesh
          type={item.type}
          selected={isSelected || hovered}
          color={item.color ?? ITEM_COLORS[item.type]}
        />
        
        {/* กล่อง Hitbox ที่ใหญ่กว่าตัวโมเดลนิดหน่อย เพื่อให้คลิกง่าย */}
        <mesh visible={false}>
          <boxGeometry args={[1.4, 1.4, 1.0]} />
        </mesh>
      </group>

      {isSelected && mounted && groupRef.current && transformMode !== "none" && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          showX={showX}
          showZ={showZ}
          showY={showY}
          size={0.9}
          onMouseDown={() => { orbitEnabled.current = false; }}
          onMouseUp={() => { orbitEnabled.current = true; }}
          onObjectChange={handleObjectChange}
        />
      )}
    </>
  );
}

// ─── 3D Scene Container ──────────────────────────────────────────────────────

function Scene({
  items,
  selectedId,
  transformMode,
  setSelectedId,
  onTransform,
}: {
  items: BoothItem[];
  selectedId: string | null;
  transformMode: "translate" | "rotate" | "none";
  setSelectedId: (id: string | null) => void;
  onTransform: (id: string, p: [number, number, number], r: [number, number, number]) => void;
}) {
  const orbitRef = useRef<any>(null);
  const orbitEnabled = useRef(true);

  // Sync orbit controls state
  useEffect(() => {
    const frame = setInterval(() => {
      if (orbitRef.current) orbitRef.current.enabled = orbitEnabled.current;
    }, 10);
    return () => clearInterval(frame);
  }, []);

  return (
    <>
      <OrbitControls
        ref={orbitRef}
        makeDefault
        maxPolarAngle={Math.PI / 2.2} // กันกล้องมุดใต้ดิน
        minDistance={3}
        maxDistance={10}
        dampingFactor={0.05}
      />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 4, -3]} intensity={0.3} />

      <color attach="background" args={["#f1f5f9"]} />

      {/* Grid Floor Global (จางๆ) */}
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#e2e8f0"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#cbd5e1"
        fadeDistance={15}
        infiniteGrid={true}
      />

      {/* โครงสร้างบูธ Default */}
      <BoothStructure onDeselect={() => setSelectedId(null)} />

      <ContactShadows position={[0, BOOTH_FLOOR_Y, 0]} opacity={0.3} scale={5} blur={2} far={2} />

      {items.map((item) => (
        <FurnitureItem
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          transformMode={transformMode}
          orbitEnabled={orbitEnabled}
          onSelect={setSelectedId}
          onTransform={onTransform}
        />
      ))}
    </>
  );
}

// ─── Main Component: Configurator UI ─────────────────────────────────────────

let idCounter = 1;

export default function BoothConfigurator3D({
  onChange,
  initialItems = [],
  inputName = "booth_items",
}: BoothConfigurator3DProps) {
  const [items, setItems] = useState<BoothItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "none">("translate");
  const [showItemList, setShowItemList] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedId);

  // ─── Actions ───
  const addItem = useCallback(
    (type: ItemType) => {
      const offset = (idCounter % 3) * 0.4 - 0.4;
      const newItem: BoothItem = {
        id: `item-${Date.now()}-${idCounter++}`,
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
      setTransformMode("translate"); 
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
      id: `item-${Date.now()}-${idCounter++}`,
      position: [
        Math.min(BOOTH_BOUNDS, selectedItem.position[0] + 0.5),
        selectedItem.position[1],
        Math.min(BOOTH_BOUNDS, selectedItem.position[2] + 0.5),
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
    (id: string, position: [number, number, number], rotation: [number, number, number]) => {
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

  return (
    <div className="relative flex h-[550px] w-full flex-col overflow-hidden rounded-[2rem] bg-slate-100 border border-slate-200">
      <input type="hidden" name={inputName} value={JSON.stringify(items)} />

      {/* ─── 3D Canvas Layer ─── */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 4, 6], fov: 45 }} gl={{ antialias: true }}>
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

      {/* ─── UI Overlay Layer ─── */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-5">
        
        {/* Top Controls */}
        <div className="flex items-start justify-between w-full">
          
          {/* Badge */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
            <Store className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-700">จำลองพื้นที่ 3x3 เมตร</span>
          </div>

          {/* Right Tools: View/Edit Modes */}
          <div className="pointer-events-auto flex gap-2">
            <div className="flex rounded-2xl bg-white/90 p-1 shadow-md backdrop-blur-md">
              <button
                type="button"
                onClick={() => setTransformMode("none")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  transformMode === "none" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <MousePointer2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">หมุนกล้อง</span>
              </button>
              <button
                type="button"
                onClick={() => setTransformMode("translate")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  transformMode === "translate" ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Move className="h-3.5 w-3.5" /> <span className="hidden sm:inline">ย้าย</span>
              </button>
              <button
                type="button"
                onClick={() => setTransformMode("rotate")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  transformMode === "rotate" ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <RotateCw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">หมุน</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowItemList(!showItemList)}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/90 text-slate-600 shadow-md backdrop-blur-md hover:bg-slate-50"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Context & Add Items (The Sims Style Dock) */}
        <div className="flex flex-col items-center gap-4">
          
          {/* Selected Item Actions */}
          <div className={`pointer-events-auto transition-all duration-300 ${selectedItem ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
            {selectedItem && (
              <div className="flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur-md">
                <span className="text-xs font-bold text-white">
                  {ITEM_ICONS[selectedItem.type]} {ITEM_LABELS[selectedItem.type]}
                </span>
                <div className="h-3 w-px bg-slate-600" />
                <button
                  type="button"
                  onClick={duplicateSelected}
                  className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" /> ก๊อปปี้
                </button>
                <button
                  type="button"
                  onClick={removeSelected}
                  className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> ลบ
                </button>
              </div>
            )}
          </div>

          {/* Bottom Dock: Add Items */}
          <div className="pointer-events-auto flex max-w-full overflow-x-auto rounded-[2rem] bg-white/95 p-2 shadow-lg backdrop-blur-md ring-1 ring-slate-200/50 sm:overflow-visible">
            {(["table", "chair", "rack", "shelf", "counter"] as ItemType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addItem(type)}
                className="group flex flex-col items-center gap-1 rounded-xl p-2 min-w-[64px] transition-colors hover:bg-orange-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-xl shadow-inner transition-transform group-hover:scale-110 group-hover:bg-orange-100">
                  {ITEM_ICONS[type]}
                </span>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-orange-600">
                  {ITEM_LABELS[type]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Slide-over Item List Panel ─── */}
      <div
        className={`absolute right-0 top-0 z-20 h-full w-64 transform bg-white/95 p-5 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          showItemList ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <List className="h-4 w-4 text-orange-500" /> ของตกแต่งในบูธ ({items.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowItemList(false)}
            className="rounded-lg bg-slate-50 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 text-center text-xs text-slate-400">ยังไม่มีเฟอร์นิเจอร์</div>
        ) : (
          <div className="flex h-[calc(100%-4rem)] flex-col gap-2 overflow-y-auto pr-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id);
                  setTransformMode("translate");
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-3 text-left text-xs transition-all ${
                  item.id === selectedId
                    ? "bg-orange-50 shadow-sm ring-1 ring-orange-200"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{ITEM_ICONS[item.type]}</span>
                  <span className={`font-semibold ${item.id === selectedId ? "text-orange-700" : "text-slate-600"}`}>
                    {ITEM_LABELS[item.type]}
                  </span>
                </div>
                
                {item.id === selectedId ? (
                  <Eye className="h-4 w-4 text-orange-400" />
                ) : (
                  <Trash2 
                    className="h-4 w-4 text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setItems((prev) => {
                        const next = prev.filter((i) => i.id !== item.id);
                        onChange?.(next);
                        return next;
                      });
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}