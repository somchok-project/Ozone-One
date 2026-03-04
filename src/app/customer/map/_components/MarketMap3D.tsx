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
  Camera,
  Compass,
  HelpCircle,
} from "lucide-react";

interface BoothMapData {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  isCurrentlyBooked?: boolean;
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

  // Derive colour: grey=closed, green=available
  const baseColor = !booth.is_available
    ? new THREE.Color("#94a3b8")
    : new THREE.Color("#22c55e");

  const selectedColor = new THREE.Color("#fbbf24");
  const hoveredColor = baseColor.clone().lerp(new THREE.Color("#ffffff"), 0.3);
  const finalColor = isSelected
    ? selectedColor
    : hovered
      ? hoveredColor
      : baseColor;

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
          color={
            !booth.is_available
              ? "#94a3b8"
              : booth.isCurrentlyBooked
                ? "#f87171"
                : "#4ade80"
          }
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

      {/* Invisible ground plane for deselection */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        visible={false}
        onClick={() => onSelect("" as any)}
      >
        <planeGeometry args={[200, 200]} />
      </mesh>

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
  const [showHelp, setShowHelp] = useState(false);

  function resetCamera() {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }

  function setCameraView(px: number, py: number, pz: number) {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      controls.object.position.set(px, py, pz);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between">
        {/* Left: back + title */}
        <div className="flex items-center gap-2">
          <Link
            href="/customer/booths"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-white/20"
          >
            <ArrowLeft size={16} />
            กลับ
          </Link>
          <div className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20">
            🗺️ แผนผังตลาด 3D — {booths.length} บูธ
          </div>
        </div>

        {/* Right: legend + help */}
        <div className="flex items-start gap-2">
          {/* Help toggle */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md ring-1 ring-white/20 transition ${showHelp ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            title="วิธีใช้"
          >
            <HelpCircle size={16} />
          </button>

          {/* Compact legend */}
          <div className="rounded-xl bg-black/60 px-3 py-2 text-[11px] text-white backdrop-blur-md ring-1 ring-white/10">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500 inline-block" />
                สามารถจองได้
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-400 inline-block" />
                ปิดให้บริการชั่วคราว
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Help overlay */}
      {showHelp && (
        <div className="absolute top-16 right-4 z-20 w-64 rounded-2xl bg-black/80 p-4 text-xs text-white backdrop-blur-xl ring-1 ring-white/20">
          <p className="mb-3 font-bold text-green-400">🎮 วิธีใช้แผนผัง 3D</p>
          <div className="space-y-2 text-gray-300">
            <p>🖱️ <strong>คลิกซ้ายลาก</strong> — หมุนกล้อง</p>
            <p>🖱️ <strong>คลิกขวาลาก</strong> — เลื่อนกล้อง</p>
            <p>🔍 <strong>Scroll</strong> — ซูมเข้า/ออก</p>
            <p>👆 <strong>คลิกบูธ</strong> — ดูรายละเอียด & จอง</p>
            <p>📐 <strong>ปุ่มมุมมอง</strong> — เปลี่ยนมุมกล้องด่วน</p>
          </div>
          <button onClick={() => setShowHelp(false)} className="mt-3 w-full rounded-lg bg-white/10 py-1.5 text-center font-medium text-white/80 hover:bg-white/20">เข้าใจแล้ว ✓</button>
        </div>
      )}

      {/* Camera controls - bottom left */}
      <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
        {/* Preset camera views */}
        <div className="flex flex-col gap-1 rounded-xl bg-black/50 p-1.5 backdrop-blur-md ring-1 ring-white/10">
          <button
            onClick={() => setCameraView(0, 50, 0.1)}
            title="มุมมองบน (Top)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Compass size={15} />
          </button>
          <button
            onClick={() => setCameraView(0, 25, 35)}
            title="มุมมอง 3D (Isometric)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Camera size={15} />
          </button>
          <button
            onClick={() => setCameraView(45, 10, 0)}
            title="มุมมองด้านข้าง (Side)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Eye size={15} />
          </button>
          <div className="mx-1 border-t border-white/10" />
          <button
            onClick={resetCamera}
            title="รีเซ็ตมุมมอง"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Quick hint - bottom right */}
      <div className="absolute bottom-6 right-4 z-10 rounded-xl bg-black/40 px-3 py-2 text-[11px] text-gray-400 backdrop-blur-md">
        คลิกบูธเพื่อดูรายละเอียด • Scroll ซูม • ลากหมุน
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 25, 35], fov: 45 }}
        style={{ background: "linear-gradient(to bottom, #111827, #1f2937)" }}
      >
        <Suspense fallback={null}>
          <Scene
            booths={booths}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <OrbitControls
            ref={controlsRef}
            minDistance={3}
            maxDistance={120}
            target={[0, 0, 0]}
            enablePan
            enableDamping
            dampingFactor={0.08}
          />
        </Suspense>
      </Canvas>

      {/* Booth Detail Popup Modal */}
      {selectedBooth && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedId(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-md animate-[fadeInUp_0.3s_ease-out] overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative h-52 w-full bg-gradient-to-br from-green-100 to-emerald-50">
              {selectedBooth.images[0] ? (
                <img
                  src={selectedBooth.images[0].path}
                  alt={selectedBooth.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-green-300">
                    <Eye size={48} />
                    <span className="text-sm font-medium">ไม่มีรูปภาพ</span>
                  </div>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
              >
                <X size={16} />
              </button>

              {/* Status badge */}
              <span
                className={`absolute top-4 left-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${!selectedBooth.is_available
                  ? "bg-slate-500 text-white"
                  : selectedBooth.isCurrentlyBooked
                    ? "bg-amber-500 text-white"
                    : "bg-green-500 text-white"
                  }`}
              >
                {!selectedBooth.is_available
                  ? "ปิดชั่วคราว"
                  : selectedBooth.isCurrentlyBooked
                    ? "วันนี้ถูกจองแล้ว"
                    : "✓ ว่างอยู่"}
              </span>

              {/* Price overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-4 pt-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    ฿{selectedBooth.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-white/70">/วัน</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title + Zone */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedBooth.name}
                </h3>
                {selectedBooth.zone && (
                  <span
                    className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${selectedBooth.zone.color_code ?? "#22c55e"}15`,
                      color: selectedBooth.zone.color_code ?? "#22c55e",
                      border: `1px solid ${selectedBooth.zone.color_code ?? "#22c55e"}30`,
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: selectedBooth.zone.color_code ?? "#22c55e" }}
                    />
                    {selectedBooth.zone.name}
                  </span>
                )}
              </div>

              {/* Info grid */}
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-3">
                  <Ruler size={18} className="mb-1 text-gray-400" />
                  <span className="text-xs font-bold text-gray-700">{selectedBooth.dimension}</span>
                  <span className="text-[10px] text-gray-400">ขนาด</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-3">
                  <Star size={18} className="mb-1 text-yellow-400" />
                  <span className="text-xs font-bold text-gray-700">{selectedBooth._count.reviews}</span>
                  <span className="text-[10px] text-gray-400">รีวิว</span>
                </div>
                <div className="flex flex-col items-center rounded-2xl bg-gray-50 p-3">
                  <MapPin size={18} className="mb-1 text-green-400" />
                  <span className="text-xs font-bold text-gray-700">
                    {(selectedBooth.position_x ?? 0).toFixed(0)},{(selectedBooth.position_z ?? 0).toFixed(0)}
                  </span>
                  <span className="text-[10px] text-gray-400">ตำแหน่ง</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/customer/booths/${selectedBooth.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-600 hover:shadow-green-300 active:scale-[0.98]"
                >
                  {selectedBooth.isCurrentlyBooked
                    ? "ดูวันว่างที่เหลือ"
                    : "ดูรายละเอียด / จองบูธนี้"}
                </Link>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 transition-all hover:bg-gray-50"
                >
                  กลับไปดูบูธอื่น
                </button>
              </div>

              {selectedBooth.isCurrentlyBooked && selectedBooth.is_available && (
                <p className="mt-3 text-center text-[11px] text-amber-600/80">
                  💡 วันอื่นอาจยังว่างอยู่ กดเพื่อดูตารางการจอง
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
