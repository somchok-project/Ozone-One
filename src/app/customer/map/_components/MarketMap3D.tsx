"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Environment,
  Grid,
  GizmoHelper,
  GizmoViewcube,
} from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import {
  ArrowLeft,
  X,
  MapPin,
  Ruler,
  Star,
  RotateCcw,
  Eye,
  Camera,
  Compass,
  HelpCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════════════
// ── Floor Plan Constants (ตามแผนผังจริง) ─────────────────────────
// ═════════════════════════════════════════════════════════════════════

// Zone colors from the map legend
const ZONE_COLORS = {
  C: "#22c55e",  // Container — เขียว
  A: "#f97316",  // ลานอาหาร — ส้ม
  F_SMALL: "#eab308", // อาหาร 3×2 — เหลือง
  F_LARGE: "#a855f7", // อาหาร 3×4 — ม่วง
  B: "#3b82f6",  // สินค้าทั่วไป — น้ำเงิน
  T: "#1e3a5f",  // ตลาดนัดเปิดท้าย — น้ำเงินเข้ม
};

// ── Decorative: Tree ──────────────────────────────────────────────
function MarketTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#40916c" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── Decorative: Lantern ───────────────────────────────────────────
function Lantern({ position, color = "#fbbf24" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3, 6]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 8]} />
        <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// ── Parking Area ──────────────────────────────────────────────────
function ParkingArea({ position, width, depth, label }: {
  position: [number, number, number];
  width: number;
  depth: number;
  label: string;
}) {
  const lineCount = Math.floor(width / 2.5);
  return (
    <group position={position}>
      {/* Parking surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#6b7280" roughness={0.95} />
      </mesh>
      {/* Parking lines */}
      {Array.from({ length: lineCount }).map((_, i) => {
        const x = -width / 2 + 1.5 + i * 2.5;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]}>
            <planeGeometry args={[0.08, depth * 0.7]} />
            <meshStandardMaterial color="#e5e7eb" />
          </mesh>
        );
      })}
      {/* P sign */}
      <Text
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.5}
        color="#d1d5db"
        anchorX="center"
        anchorY="middle"
      >
        P
      </Text>
      {/* Label */}
      <Text
        position={[0, 0.1, depth / 2 + 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// ── Ozone One Main Building ───────────────────────────────────────
function OzoneOneBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main structure */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 6, 14]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[8.5, 0.4, 14.5]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>
      {/* Front face decoration */}
      <mesh position={[-4.01, 3.5, 0]}>
        <planeGeometry args={[0.1, 4]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
      {/* Sign: โอโซนวัน */}
      <Text
        position={[-4.02, 4.5, 0]}
        fontSize={0.9}
        color="#fef08a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#7f1d1d"
        rotation={[0, Math.PI / 2, 0]}
      >
        OZONE ONE
      </Text>
      <Text
        position={[-4.02, 3.5, 0]}
        fontSize={0.55}
        color="#fef08a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#7f1d1d"
        rotation={[0, Math.PI / 2, 0]}
      >
        ตลาดโอโซนวัน
      </Text>
      {/* Door */}
      <mesh position={[-4.01, 1.5, 0]}>
        <boxGeometry args={[0.05, 3, 3]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── Zone Floor Panel ──────────────────────────────────────────────
function ZoneFloor({ position, width, depth, color, label }: {
  position: [number, number, number];
  width: number;
  depth: number;
  color: string;
  label: string;
}) {
  return (
    <group position={position}>
      {/* Zone colored floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Zone border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[width + 0.1, depth + 0.1]} />
        <meshStandardMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Zone label */}
      <Text
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.8}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
        fillOpacity={0.5}
      >
        {label}
      </Text>
    </group>
  );
}

// ── Activity Area (สนามกิจกรรม) ───────────────────────────────────
function ActivityArea({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#d97706" transparent opacity={0.1} />
      </mesh>
      <Text
        position={[0, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.7}
        color="#d97706"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
        fillOpacity={0.4}
      >
        สนามกิจกรรม
      </Text>
    </group>
  );
}

// ── Rental Area Marker ────────────────────────────────────────────
function RentalArea({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <planeGeometry args={[7, 10]} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.12} />
      </mesh>
      <Text
        position={[0, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.65}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
        fillOpacity={0.5}
      >
        พื้นที่ให้เช่า
      </Text>
    </group>
  );
}

// ── Road ──────────────────────────────────────────────────────────
function Road({ position, width, depth, label }: {
  position: [number, number, number];
  width: number;
  depth: number;
  label?: string;
}) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#374151" roughness={0.95} />
      </mesh>
      {/* Center line dashes */}
      {Array.from({ length: Math.floor(width / 4) }).map((_, i) => {
        const x = -width / 2 + 2 + i * 4;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.003, 0]}>
            <planeGeometry args={[2, 0.12]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        );
      })}
      {label && (
        <Text
          position={[0, 0.05, depth / 2 + 0.3]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.4}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

// ── Market Entrance Gate ──────────────────────────────────────────
function EntranceGate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-3, 2, 0]} castShadow>
        <boxGeometry args={[0.5, 4, 0.5]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      <mesh position={[3, 2, 0]} castShadow>
        <boxGeometry args={[0.5, 4, 0.5]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[7, 0.4, 0.6]} />
        <meshStandardMaterial color="#991b1b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.6, 0]} castShadow>
        <boxGeometry args={[7.5, 0.15, 1.0]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
      </mesh>
      <Text
        position={[0, 3.5, 0.32]}
        fontSize={0.55}
        color="#fef08a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        OZONE ONE MARKET
      </Text>
      <mesh position={[-2, 3.7, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
      </mesh>
      <mesh position={[2, 3.7, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// ── Booth Mesh ────────────────────────────────────────────────────
function BoothMesh({
  booth,
  isSelected,
  onClick,
}: {
  booth: BoothMapData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const px = booth.position_x ?? 0;
  const pz = booth.position_z ?? 0;
  const sc = booth.scale ?? 1;
  const ry = booth.rotation_y ?? 0;

  const isAvailable = booth.is_available;
  const isBooked = booth.isCurrentlyBooked;
  const isClosed = !isAvailable;

  const zoneName = booth.zone?.name?.toUpperCase() ?? "";

  // ระบบสี 2 สี: เขียว = จองได้, เทา = ปิดชั่วคราว
  const boothColor = isClosed ? "#6b7280" : "#16a34a";
  const awningColor = boothColor;
  const counterColor = isClosed ? "#9ca3af" : "#22c55e";

  const selectedColor = new THREE.Color("#fbbf24");
  const highlightIntensity = isSelected ? 0.4 : 0;

  useFrame(() => {
    if (!groupRef.current) return;
    if (isSelected || hovered) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.04;
    } else {
      groupRef.current.position.y = 0;
    }
  });

  // Determine booth style based on zone
  const isContainer = zoneName.includes("C");
  const isTruck = zoneName.includes("T");

  return (
    <group ref={groupRef} position={[px, 0, pz]} rotation={[0, ry, 0]}>
      {/* Floor / Base platform */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      >
        <planeGeometry args={[2.0 * sc, 2.0 * sc]} />
        <meshStandardMaterial color={isClosed ? "#4b5563" : "#e5e7eb"} roughness={0.9} />
      </mesh>

      {isContainer ? (
        /* ── Container style booth ── */
        <>
          <mesh
            position={[0, 0.6 * sc, 0]}
            scale={[sc, sc, sc]}
            castShadow receiveShadow
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
            onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
          >
            <boxGeometry args={[1.8, 1.2, 1.4]} />
            <meshStandardMaterial
              color={counterColor}
              roughness={0.3}
              metalness={0.4}
              emissive={isSelected ? selectedColor : new THREE.Color(0)}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          {/* Container ridges */}
          {[-0.4, 0, 0.4].map((z) => (
            <mesh key={z} position={[0, 1.21 * sc, z * sc]} scale={[sc, sc, sc]}>
              <boxGeometry args={[1.82, 0.04, 0.05]} />
              <meshStandardMaterial color={isClosed ? "#4b5563" : "#16a34a"} roughness={0.3} metalness={0.5} />
            </mesh>
          ))}
        </>
      ) : isTruck ? (
        /* ── Truck style booth ── */
        <>
          {/* Truck bed */}
          <mesh
            position={[0, 0.35 * sc, 0]}
            scale={[sc, sc, sc]}
            castShadow receiveShadow
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
            onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
          >
            <boxGeometry args={[1.6, 0.7, 1.2]} />
            <meshStandardMaterial
              color={counterColor}
              roughness={0.5}
              metalness={0.2}
              emissive={isSelected ? selectedColor : new THREE.Color(0)}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          {/* Truck cab */}
          <mesh position={[0, 0.5 * sc, -0.7 * sc]} scale={[sc, sc, sc]} castShadow>
            <boxGeometry args={[1.2, 0.9, 0.5]} />
            <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Wheels */}
          {[-0.6, 0.6].map((x) => (
            <mesh key={x} position={[x * sc, 0.12 * sc, -0.75 * sc]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.12, 0.08, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
          ))}
        </>
      ) : (
        /* ── Standard stall (Food / General) ── */
        <>
          {/* Counter / Table */}
          <mesh
            position={[0, 0.4 * sc, 0]}
            scale={[sc, sc, sc]}
            castShadow receiveShadow
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
            onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
          >
            <boxGeometry args={[1.8, 0.8, 1.4]} />
            <meshStandardMaterial
              color={counterColor}
              roughness={0.7}
              emissive={isSelected ? selectedColor : new THREE.Color(0)}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>

          {/* Front display shelf */}
          <mesh position={[0, 0.85 * sc, 0.55 * sc]} scale={[sc, sc, sc]} castShadow>
            <boxGeometry args={[1.6, 0.08, 0.3]} />
            <meshStandardMaterial color="#92400e" roughness={0.8} />
          </mesh>

          {/* Left pole */}
          <mesh position={[-0.85 * sc, 1.2 * sc, -0.65 * sc]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.4 * sc, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Right pole */}
          <mesh position={[0.85 * sc, 1.2 * sc, -0.65 * sc]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 2.4 * sc, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.4} />
          </mesh>

          {/* Awning / Canopy */}
          <mesh position={[0, 2.3 * sc, 0]} castShadow>
            <boxGeometry args={[2.1 * sc, 0.06, 2.0 * sc]} />
            <meshStandardMaterial
              color={awningColor}
              roughness={0.6}
              emissive={isSelected ? selectedColor : new THREE.Color(0)}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          {/* Awning front drape */}
          <mesh position={[0, 2.2 * sc, 0.97 * sc]} castShadow>
            <boxGeometry args={[2.1 * sc, 0.2, 0.04]} />
            <meshStandardMaterial color={awningColor} roughness={0.7} />
          </mesh>
        </>
      )}

      {/* Status indicator dot */}
      <mesh position={[0.7 * sc, 0.85 * sc, 0.71 * sc]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={isClosed ? "#94a3b8" : isBooked ? "#ef4444" : "#22c55e"}
          emissive={isClosed ? "#94a3b8" : isBooked ? "#ef4444" : "#22c55e"}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Floating label */}
      <Text
        position={[0, (isContainer ? 1.6 : isTruck ? 1.3 : 2.7) * sc, 0]}
        fontSize={0.22}
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
        position={[0, (isContainer ? 1.35 : isTruck ? 1.05 : 2.45) * sc, 0]}
        fontSize={0.16}
        color="#d1fae5"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {`฿${booth.price.toLocaleString()}/วัน`}
      </Text>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2 * sc, 1.35 * sc, 32]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ═════════════════════════════════════════════════════════════════════
// ── Scene (ตามแผนผังจริง) ─────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════
function Scene({
  booths,
  selectedId,
  onSelect,
}: {
  booths: BoothMapData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {/* ═══════ Lighting — warm market ambiance ═══════ */}
      <ambientLight intensity={0.4} color="#fff5eb" />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        color="#fef3c7"
      />
      <pointLight position={[-10, 15, -10]} intensity={0.4} color="#fde68a" />
      <hemisphereLight args={["#87ceeb", "#4a3728", 0.3]} />
      <Environment preset="sunset" />

      {/* ═══════ Main Ground Plane ═══════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[120, 100]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.95} metalness={0.05} />
      </mesh>

      <Grid
        args={[120, 100]}
        cellSize={2}
        cellThickness={0.3}
        cellColor="#555555"
        sectionSize={10}
        sectionThickness={0.6}
        sectionColor="#666666"
        fadeDistance={80}
        fadeStrength={1.5}
        infiniteGrid
      />

      {/* Invisible ground plane for deselection */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        visible={false}
        onClick={() => onSelect("" as string)}
      >
        <planeGeometry args={[200, 200]} />
      </mesh>

      {/* ═══════ ROADS (ถนน) ═══════ */}
      {/* ถนนด้านหน้า (ล่าง) — ถ. เทศบาลเมือง */}
      <Road position={[0, 0, 30]} width={90} depth={4} label="ถนน เทศบาลเมือง / ทางเข้าหลัก" />
      {/* ถนนด้านหลัง (บน) */}
      <Road position={[0, 0, -32]} width={90} depth={3} label="ถนน ด้านหลังตลาด" />

      {/* ═══════ PARKING AREAS (ลานจอดรถ × 3) ═══════ */}
      <ParkingArea position={[-30, 0, -24]} width={14} depth={8} label="ลานจอดรถ" />
      <ParkingArea position={[0, 0, -24]} width={14} depth={8} label="ลานจอดรถ" />
      <ParkingArea position={[35, 0, -24]} width={14} depth={8} label="ลานจอดรถ" />

      {/* ═══════ OZONE ONE BUILDING (อาคารหลัก) ═══════ */}
      <OzoneOneBuilding position={[38, 0, 5]} />

      {/* ═══════ RENTAL AREA (พื้นที่ให้เช่า ขวาบน) ═══════ */}
      <RentalArea position={[38, 0, -14]} />

      {/* ═══════ ENTRANCE GATE (ทางเข้าตลาด) ═══════ */}
      <EntranceGate position={[0, 0, 27]} />

      {/* ═══════ ZONE FLOORS (พื้นสีตามโซน) ═══════ */}

      {/* Zone C — Container (แถวบน — เขียว) 12×7.5m */}
      <ZoneFloor position={[0, 0, -14]} width={55} depth={8} color={ZONE_COLORS.C} label="โซน C — คอนเทนเนอร์ (12×7.5 ม.)" />

      {/* Zone A — ลานอาหาร (กลาง — ส้ม) 2×3m */}
      <ZoneFloor position={[-5, 0, -2]} width={20} depth={8} color={ZONE_COLORS.A} label="โซน A — ลานอาหาร (2×3 ม.)" />

      {/* Zone F — อาหาร ซ้าย (เหลือง) 3×2m */}
      <ZoneFloor position={[-22, 0, -2]} width={10} depth={8} color={ZONE_COLORS.F_SMALL} label="โซน F — อาหาร (3×2 ม.)" />

      {/* Zone F — อาหาร ขวา (ม่วง) 3×4m */}
      <ZoneFloor position={[22, 0, -2]} width={10} depth={8} color={ZONE_COLORS.F_LARGE} label="โซน F — อาหาร (3×4 ม.)" />

      {/* สนามกิจกรรม (ตรงกลาง) */}
      <ActivityArea position={[10, 0, -2]} />

      {/* Zone B — สินค้าทั่วไป (แถวล่าง — น้ำเงิน) */}
      <ZoneFloor position={[0, 0, 10]} width={55} depth={8} color={ZONE_COLORS.B} label="โซน B — สินค้าทั่วไป" />

      {/* Zone T — ตลาดนัดท้ายรถ (ล่างสุด — น้ำเงินเข้ม) */}
      <ZoneFloor position={[0, 0, 20]} width={55} depth={6} color={ZONE_COLORS.T} label="โซน T — ตลาดนัดเปิดท้าย Truck" />

      {/* ═══════ WALKWAYS (ทางเดิน) ═══════ */}
      {/* ทางเดินกลาง แนวตั้ง */}
      <mesh position={[0, 0.004, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, 45]} />
        <meshStandardMaterial color="#78716c" roughness={0.95} />
      </mesh>
      {/* ทางเดิน แนวนอน กลาง */}
      <mesh position={[0, 0.004, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 2]} />
        <meshStandardMaterial color="#78716c" roughness={0.95} />
      </mesh>
      {/* ทางเดิน แนวนอน ล่าง */}
      <mesh position={[0, 0.004, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 2]} />
        <meshStandardMaterial color="#78716c" roughness={0.95} />
      </mesh>

      {/* ═══════ DECORATIVE ELEMENTS ═══════ */}
      {/* Trees */}
      <MarketTree position={[-28, 0, 25]} />
      <MarketTree position={[28, 0, 25]} />
      <MarketTree position={[-28, 0, -5]} />
      <MarketTree position={[28, 0, -5]} />
      <MarketTree position={[-15, 0, -20]} />
      <MarketTree position={[15, 0, -20]} />
      <MarketTree position={[-28, 0, 15]} />
      <MarketTree position={[28, 0, 15]} />

      {/* Lanterns along walkways */}
      <Lantern position={[-2, 0, 24]} color="#fbbf24" />
      <Lantern position={[2, 0, 24]} color="#fb923c" />
      <Lantern position={[-2, 0, 15]} color="#fbbf24" />
      <Lantern position={[2, 0, 15]} color="#fb923c" />
      <Lantern position={[-2, 0, -2]} color="#fbbf24" />
      <Lantern position={[2, 0, -2]} color="#fb923c" />
      <Lantern position={[-2, 0, -14]} color="#fbbf24" />
      <Lantern position={[2, 0, -14]} color="#fb923c" />

      {/* ═══════ BOOTHS (from database) ═══════ */}
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

// ═════════════════════════════════════════════════════════════════════
// ── Main Component ────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════
export default function MarketMap3D({ booths }: MarketMap3DProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  const selectedBooth = booths.find((b) => b.id === selectedId) ?? null;
  const [showHelp, setShowHelp] = useState(false);

  // Zone legend from booths data
  const zoneMap = new Map<string, { name: string; color: string }>();
  for (const b of booths) {
    if (b.zone && !zoneMap.has(b.zone.id)) {
      zoneMap.set(b.zone.id, {
        name: b.zone.name,
        color: b.zone.color_code ?? "#22c55e",
      });
    }
  }

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
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md ring-1 ring-white/20 transition ${showHelp ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            title="วิธีใช้"
          >
            <HelpCircle size={16} />
          </button>

          {/* Zone legend from database */}
          <div className="rounded-xl bg-black/60 px-3 py-2 text-[11px] text-white backdrop-blur-md ring-1 ring-white/10">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-500 inline-block" />
                สามารถจองได้
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-400 inline-block" />
                ปิดชั่วคราว
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
        <div className="flex flex-col gap-1 rounded-xl bg-black/50 p-1.5 backdrop-blur-md ring-1 ring-white/10">
          <button
            onClick={() => setCameraView(0, 60, 0.1)}
            title="มุมมองบน (Top)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Compass size={15} />
          </button>
          <button
            onClick={() => setCameraView(0, 35, 50)}
            title="มุมมอง 3D (Isometric)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            <Camera size={15} />
          </button>
          <button
            onClick={() => setCameraView(55, 12, 0)}
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
        camera={{ position: [0, 35, 50], fov: 45 }}
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
            minDistance={5}
            maxDistance={150}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
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

              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
              >
                <X size={16} />
              </button>

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
