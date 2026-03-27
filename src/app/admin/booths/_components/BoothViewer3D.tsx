"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { BOOTH_FLOOR_Y, ITEM_COLORS } from "@/constants/boothItems";
import type { ItemType } from "@/constants/boothItems";
import { parseDimension } from "@/lib/utils/booth";

export interface ViewerItem {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string | null;
}

interface BoothViewer3DProps {
  items: ViewerItem[];
  dimension?: string;
}

// ─── โครงสร้างบูธ ───
function BoothStructure({ boothSize }: { boothSize: { w: number; d: number } }) {
  const hw = boothSize.w / 2;
  const hd = boothSize.d / 2;
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, BOOTH_FLOOR_Y / 2, 0]} receiveShadow>
        <boxGeometry args={[boothSize.w, BOOTH_FLOOR_Y, boothSize.d]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6 + BOOTH_FLOOR_Y, -(hd - 0.05)]} receiveShadow castShadow>
        <boxGeometry args={[boothSize.w, 1.2, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      <mesh position={[-(hw - 0.05), 0.4 + BOOTH_FLOOR_Y, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.8, boothSize.d]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      <mesh position={[hw - 0.05, 0.4 + BOOTH_FLOOR_Y, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.8, boothSize.d]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      <mesh position={[0, BOOTH_FLOOR_Y + 0.005, hd * 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.min(1.5, boothSize.w * 0.5), 0.4]} />
        <meshBasicMaterial color="#f97316" transparent opacity={0.3} />
      </mesh>
      <Html position={[0, BOOTH_FLOOR_Y + 0.01, hd * 0.8]} rotation={[-Math.PI / 2, 0, 0]} transform pointerEvents="none">
        <div className="text-[8px] font-bold text-orange-800 uppercase tracking-widest opacity-60">FRONT</div>
      </Html>
    </group>
  );
}

// ─── รูปทรงเฟอร์นิเจอร์ต่างๆ (ก๊อปมาจาก Configurator) ───
function TableMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      {([[-0.5, -0.25], [0.5, -0.25], [-0.5, 0.25], [0.5, 0.25]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, -0.175, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.35, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ChairMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0.175]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {([[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, -0.125, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function RackMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.55, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.4]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function ShelfMesh({ color }: { color: string }) {
  return (
    <group>
      {[-0.4, 0, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.04, 0.3]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 1.0, 0.3]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function CounterMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.25, 0.06, 0.55]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

function SofaMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.15, 0.55]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, -0.23]} castShadow>
        <boxGeometry args={[1.2, 0.45, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {([-0.55, 0.55] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]} castShadow>
          <boxGeometry args={[0.1, 0.2, 0.55]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      {[[-0.5, 0.25], [0.5, 0.25], [-0.5, -0.25], [0.5, -0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x!, -0.1, z!]} castShadow>
          <boxGeometry args={[0.07, 0.08, 0.07]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function DisplayMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.1, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 0.21]}>
        <boxGeometry args={[0.88, 0.95, 0.02]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.5} roughness={0.05} metalness={0.2} />
      </mesh>
      {[-0.25, 0.1, 0.38].map((y, i) => (
        <mesh key={i} position={[0, y, 0.03]}>
          <boxGeometry args={[0.85, 0.02, 0.36]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function FridgeMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 1.2, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0.31]}>
        <boxGeometry args={[0.62, 1.15, 0.01]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.5} />
      </mesh>
      <mesh position={[0.25, 0.1, 0.32]} castShadow>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.65, 0.08, 0.6]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>
    </group>
  );
}

function LampMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.06, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.5, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[0.3, 0.35, 16, 1, true]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
    </group>
  );
}

function PlantMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#a16207" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.02, 16]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.25, 0.1]} castShadow>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[-0.15, 0.28, -0.1]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#166534" roughness={0.7} />
      </mesh>
    </group>
  );
}

function BannerMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.35, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.35, 0.6, 0.025]}>
        <boxGeometry args={[0.55, 0.06, 0.01]} />
        <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0.35, 0.48, 0.025]}>
        <boxGeometry args={[0.45, 0.04, 0.01]} />
        <meshBasicMaterial color="#ffffff" opacity={0.4} transparent />
      </mesh>
      <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.1, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

function FurnitureMesh({ type, color }: { type: ItemType | string; color: string }) {
  switch (type) {
    case "table":   return <TableMesh   color={color} />;
    case "chair":   return <ChairMesh   color={color} />;
    case "rack":    return <RackMesh    color={color} />;
    case "shelf":   return <ShelfMesh   color={color} />;
    case "counter": return <CounterMesh color={color} />;
    case "sofa":    return <SofaMesh    color={color} />;
    case "display": return <DisplayMesh color={color} />;
    case "fridge":  return <FridgeMesh  color={color} />;
    case "lamp":    return <LampMesh    color={color} />;
    case "plant":   return <PlantMesh   color={color} />;
    case "banner":  return <BannerMesh  color={color} />;
    default:        return null;
  }
}

// ─── ฉาก 3D สำหรับแสดงผล ───
function Scene({ items, dimension }: { items: ViewerItem[]; dimension: string }) {
  const boothSize = parseDimension(dimension);

  return (
    <>
      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.2} minDistance={3} maxDistance={10} dampingFactor={0.05} autoRotate autoRotateSpeed={0.5} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
      <color attach="background" args={["#f8fafc"]} />
      <Grid position={[0, 0, 0]} args={[20, 20]} cellSize={1} cellThickness={0.5} cellColor="#e2e8f0" sectionSize={3} sectionThickness={1} sectionColor="#cbd5e1" fadeDistance={15} />
      
      <BoothStructure boothSize={boothSize} />
      <ContactShadows position={[0, BOOTH_FLOOR_Y, 0]} opacity={0.3} scale={5} blur={2} far={2} />

      {/* เรนเดอร์ไอเทมจาก Database จริงๆ แล้ว */}
      {items.map((item) => {
        // ใช้สีจาก Database หรือสี Default ถ้าไม่มี
        const itemColor = item.color || ITEM_COLORS[item.type as ItemType] || "#cccccc";
        
        return (
          <group key={item.id} position={item.position} rotation={item.rotation}>
            <FurnitureMesh type={item.type} color={itemColor} />
          </group>
        );
      })}
    </>
  );
}

export default function BoothViewer3D({ items, dimension = "3x3" }: BoothViewer3DProps) {
  return (
    <div className="relative flex h-[400px] w-full cursor-grab overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 4, 6], fov: 45 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <Scene items={items} dimension={dimension} />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 left-4 pointer-events-none rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-md">
        ลากเมาส์เพื่อหมุนดูแบบ 3D
      </div>
    </div>
  );
}