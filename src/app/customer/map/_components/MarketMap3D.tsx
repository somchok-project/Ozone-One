"use client";

import { Suspense, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Html,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewcube,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import {
  ArrowLeft,
  Info,
  X,
  MapPin,
  Ruler,
  Star,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
} from "lucide-react";

interface BoothMapData {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  dimension: string;
  position_x: number | null;
  position_y: number | null;
  position_z: number | null;
  rotation_x: number | null;
  rotation_y: number | null;
  rotation_z: number | null;
  scale: number | null;
  model_url: string | null;
  zone: { id: string; name: string; color_code: string | null } | null;
  images: { path: string }[];
  _count: { reviews: number };
}

interface MarketMap3DProps {
  booths: BoothMapData[];
}

// ── Booth mesh component ──────────────────────────────────────────
function BoothMesh({
  booth,
  isSelected,
  onClick,
}: {
  booth: BoothMapData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const px = booth.position_x ?? 0;
  const py = booth.position_y ?? 0;
  const pz = booth.position_z ?? 0;
  const sc = booth.scale ?? 1;
  const ry = booth.rotation_y ?? 0;

  // Derive colour from zone's color_code or availability
  const zoneColor = booth.zone?.color_code
    ? new THREE.Color(booth.zone.color_code)
    : new THREE.Color(booth.is_available ? "#f97316" : "#ef4444");

  const selectedColor = new THREE.Color("#fbbf24");
  const hoveredColor = zoneColor.clone().lerp(new THREE.Color("#ffffff"), 0.3);
  const finalColor = isSelected
    ? selectedColor
    : hovered
    ? hoveredColor
    : zoneColor;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isSelected || hovered) {
      meshRef.current.position.y = py + Math.sin(Date.now() * 0.003) * 0.05 + 0.05;
    } else {
      meshRef.current.position.y = py;
    }
  });

  return (
    <group position={[px, 0, pz]} rotation={[0, ry, 0]}>
      {/* Base slab */}
      <mesh
        ref={meshRef}
        position={[0, py + 0.5 * sc, 0]}
        scale={[sc, sc, sc]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.8, 1, 1.8]} />
        <meshStandardMaterial
          color={finalColor}
          roughness={0.4}
          metalness={0.1}
          emissive={isSelected ? selectedColor : new THREE.Color(0)}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, py + sc * 1.1, 0]} scale={[sc, sc * 0.3, sc]}>
        <coneGeometry args={[1.3, 0.8, 4]} />
        <meshStandardMaterial
          color={finalColor}
          roughness={0.6}
          emissive={isSelected ? selectedColor : new THREE.Color(0)}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Door */}
      <mesh position={[0, py + 0.3 * sc, 0.91 * sc]} scale={[sc, sc, sc]}>
        <boxGeometry args={[0.4, 0.6, 0.05]} />
        <meshStandardMaterial
          color={booth.is_available ? "#4ade80" : "#f87171"}
          roughness={0.5}
        />
      </mesh>

      {/* Floating label */}
      <Text
        position={[0, py + sc * 2.0, 0]}
        fontSize={0.25}
        color={isSelected ? "#fbbf24" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        maxWidth={3}
      >
        {booth.name}
      </Text>

      {/* Price tag */}
      <Text
        position={[0, py + sc * 1.7, 0]}
        fontSize={0.18}
        color="#d1fae5"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {`฿${booth.price.toLocaleString()}/วัน`}
      </Text>
    </group>
  );
}

// ── Ground grid with zone colored areas ──────────────────────────
function ZonePlane({
  color,
  cx,
  cz,
  w,
  h,
}: {
  color: string;
  cx: number;
  cz: number;
  w: number;
  h: number;
}) {
  return (
    <mesh position={[cx, -0.01, cz]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Scene ─────────────────────────────────────────────────────────
function Scene({
  booths,
  selectedId,
  onSelect,
}: {
  booths: BoothMapData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { camera } = useThree();

  // Group booths by zone to draw zone areas
  const zoneMap = new Map<
    string,
    { booths: BoothMapData[]; color: string; name: string }
  >();
  for (const b of booths) {
    if (!b.zone) continue;
    const key = b.zone.id;
    if (!zoneMap.has(key)) {
      zoneMap.set(key, {
        booths: [],
        color: b.zone.color_code ?? "#f97316",
        name: b.zone.name,
      });
    }
    zoneMap.get(key)!.booths.push(b);
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 15, -10]} intensity={0.5} color="#fde68a" />

      {/* Environment */}
      <Environment preset="city" />

      {/* Ground */}
      <Grid
        args={[100, 100]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#4b5563"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#6b7280"
        fadeDistance={80}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Zone areas */}
      {Array.from(zoneMap.entries()).map(([zoneId, zData]) => {
        const xs = zData.booths.map((b) => b.position_x ?? 0);
        const zs = zData.booths.map((b) => b.position_z ?? 0);
        const minX = Math.min(...xs) - 2;
        const maxX = Math.max(...xs) + 2;
        const minZ = Math.min(...zs) - 2;
        const maxZ = Math.max(...zs) + 2;
        return (
          <ZonePlane
            key={zoneId}
            color={zData.color}
            cx={(minX + maxX) / 2}
            cz={(minZ + maxZ) / 2}
            w={maxX - minX}
            h={maxZ - minZ}
          />
        );
      })}

      {/* Zone labels on ground */}
      {Array.from(zoneMap.entries()).map(([zoneId, zData]) => {
        const xs = zData.booths.map((b) => b.position_x ?? 0);
        const zs = zData.booths.map((b) => b.position_z ?? 0);
        const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
        const cz = zs.reduce((a, b) => a + b, 0) / zs.length;
        return (
          <Text
            key={`label-${zoneId}`}
            position={[cx, 0.05, cz]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.6}
            color={zData.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
            fillOpacity={0.6}
          >
            {zData.name}
          </Text>
        );
      })}

      {/* Market entrance */}
      <Text
        position={[0, 0.05, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1}
        color="#f97316"
        anchorX="center"
        outlineWidth={0.08}
        outlineColor="#000000"
      >
        ทางเข้าตลาด
      </Text>

      {/* Booths */}
      {booths.map((booth) => (
        <BoothMesh
          key={booth.id}
          booth={booth}
          isSelected={selectedId === booth.id}
          onClick={() => onSelect(booth.id)}
        />
      ))}

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function MarketMap3D({ booths }: MarketMap3DProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const selectedBooth = booths.find((b) => b.id === selectedId) ?? null;

  function resetCamera() {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full">
      {/* Top bar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <Link
          href="/customer/booths"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/20"
        >
          <ArrowLeft size={16} />
          กลับไปหน้าบูธ
        </Link>
        <div className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20">
          🗺️ แผนผังตลาด 3D — {booths.length} บูธ
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 rounded-xl bg-black/60 px-4 py-3 text-xs text-white backdrop-blur-md ring-1 ring-white/10">
        <p className="mb-2 font-bold text-gray-300 uppercase tracking-wider">
          สำนวน
        </p>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-green-500 inline-block" />
            ประตูเขียว = ว่าง
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-red-400 inline-block" />
            ประตูแดง = เต็ม
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-yellow-400 inline-block" />
            ขอบเหลือง = เลือกอยู่
          </span>
        </div>
      </div>

      {/* Camera controls */}
      <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={resetCamera}
          title="รีเซ็ตมุมมอง"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/20"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-4 z-10 rounded-xl bg-black/50 px-4 py-2.5 text-xs text-gray-300 backdrop-blur-md ring-1 ring-white/10">
        <p>🖱️ ลาก = หมุน | Scroll = ซูม | คลิกบูธ = รายละเอียด</p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 25, 35], fov: 45 }}
        style={{ background: "linear-gradient(to bottom, #111827, #1f2937)" }}
        onClick={() => setSelectedId(null)}
      >
        <Suspense fallback={null}>
          <Scene
            booths={booths}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <OrbitControls
            ref={controlsRef}
            minDistance={5}
            maxDistance={80}
            maxPolarAngle={Math.PI / 2.1}
            target={[0, 0, 0]}
            enablePan
          />
        </Suspense>
      </Canvas>

      {/* Selected booth panel */}
      {selectedBooth && (
        <div className="pointer-events-auto absolute right-4 top-1/2 z-20 w-72 -translate-y-1/2">
          <div className="overflow-hidden rounded-2xl bg-gray-900/90 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
            {/* Image */}
            <div className="relative h-40 w-full bg-gray-800">
              {selectedBooth.images[0] ? (
                <img
                  src={selectedBooth.images[0].path}
                  alt={selectedBooth.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Eye size={36} className="text-gray-600" />
                </div>
              )}
              {/* Status */}
              <span
                className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold ${
                  selectedBooth.is_available
                    ? "bg-green-400/90 text-white"
                    : "bg-red-400/90 text-white"
                }`}
              >
                {selectedBooth.is_available ? "ว่าง" : "เต็ม"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(null);
                }}
                className="absolute top-3 left-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4">
              <h3 className="mb-1 text-base font-bold text-white">
                {selectedBooth.name}
              </h3>
              {selectedBooth.zone && (
                <span
                  className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: `${selectedBooth.zone.color_code ?? "#f97316"}33`,
                    color: selectedBooth.zone.color_code ?? "#f97316",
                    border: `1px solid ${selectedBooth.zone.color_code ?? "#f97316"}55`,
                  }}
                >
                  {selectedBooth.zone.name}
                </span>
              )}

              <div className="mb-4 flex flex-col gap-1.5 text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <Ruler size={14} className="text-gray-500" />
                  {selectedBooth.dimension}
                </p>
                <p className="flex items-center gap-2">
                  <Star size={14} className="text-gray-500" />
                  {selectedBooth._count.reviews} รีวิว
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-500" />
                  ตำแหน่ง ({selectedBooth.position_x?.toFixed(1) ?? 0},{" "}
                  {selectedBooth.position_z?.toFixed(1) ?? 0})
                </p>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xl font-extrabold text-orange-400">
                    ฿{selectedBooth.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500"> /วัน</span>
                </div>
              </div>

              <Link
                href={`/customer/booths/${selectedBooth.id}`}
                className="block w-full rounded-xl bg-orange-500 py-2.5 text-center text-sm font-bold text-white transition hover:bg-orange-600"
              >
                ดูรายละเอียด / จอง
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
