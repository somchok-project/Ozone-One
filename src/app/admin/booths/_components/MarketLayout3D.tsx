"use client";

import { useRef, useState, useCallback, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    Grid,
    OrbitControls,
    TransformControls,
    Html,
    Text,
    Environment,
    GizmoHelper,
    GizmoViewcube,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    Move,
    RotateCw,
    MousePointer2,
    MapPinned,
    Store,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BoothPositionData {
    id: string;
    name: string;
    dimension: string;
    is_available: boolean;
    position_x: number | null;
    position_y: number | null;
    position_z: number | null;
    rotation_y: number | null;
    scale: number | null;
    zone: { id: string; name: string; color_code: string | null } | null;
}

interface MarketLayout3DProps {
    booths: BoothPositionData[];
    onPositionChange?: (
        boothId: string,
        position: { x: number; y: number; z: number },
        rotationY: number,
    ) => void;
    highlightBoothId?: string;
    singleBoothMode?: boolean;
    height?: string;
}

// ─── Zone colors ──────────────────────────────────────────────────────────────

const ZONE_COLORS = {
    C: "#22c55e",
    A: "#f97316",
    F_SMALL: "#eab308",
    F_LARGE: "#a855f7",
    B: "#3b82f6",
    T: "#1e3a5f",
};

const DEFAULT_ZONE_COLOR = "#94a3b8";

// ─── Static Structures (same as customer map) ─────────────────────────────────

function ParkingArea({ position, width, depth, label }: {
    position: [number, number, number]; width: number; depth: number; label: string;
}) {
    const lineCount = Math.floor(width / 2.5);
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <planeGeometry args={[width, depth]} />
                <meshStandardMaterial color="#6b7280" roughness={0.95} />
            </mesh>
            {Array.from({ length: lineCount }).map((_, i) => {
                const x = -width / 2 + 1.5 + i * 2.5;
                return (
                    <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]}>
                        <planeGeometry args={[0.08, depth * 0.7]} />
                        <meshStandardMaterial color="#e5e7eb" />
                    </mesh>
                );
            })}
            <Text position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.5} color="#d1d5db" anchorX="center" anchorY="middle">P</Text>
            <Text position={[0, 0.1, depth / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.5} color="#9ca3af" anchorX="center" anchorY="middle">{label}</Text>
        </group>
    );
}

function OzoneOneBuilding({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[8, 6, 14]} />
                <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} />
            </mesh>
            <mesh position={[0, 6.2, 0]} castShadow>
                <boxGeometry args={[8.5, 0.4, 14.5]} />
                <meshStandardMaterial color="#991b1b" roughness={0.5} />
            </mesh>
            <Text position={[-4.02, 4.5, 0]} fontSize={0.9} color="#fef08a" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#7f1d1d" rotation={[0, Math.PI / 2, 0]}>OZONE ONE</Text>
            <Text position={[-4.02, 3.5, 0]} fontSize={0.55} color="#fef08a" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#7f1d1d" rotation={[0, Math.PI / 2, 0]}>ตลาดโอโซนวัน</Text>
            <mesh position={[-4.01, 1.5, 0]}>
                <boxGeometry args={[0.05, 3, 3]} />
                <meshStandardMaterial color="#451a03" roughness={0.8} />
            </mesh>
        </group>
    );
}

function ZoneFloor({ position, width, depth, color, label }: {
    position: [number, number, number]; width: number; depth: number; color: string; label: string;
}) {
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
                <planeGeometry args={[width, depth]} />
                <meshStandardMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
            <Text position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.8} color={color} anchorX="center" anchorY="middle" outlineWidth={0.05} outlineColor="#000000" fillOpacity={0.5}>{label}</Text>
        </group>
    );
}

function ActivityArea({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
                <planeGeometry args={[8, 8]} />
                <meshStandardMaterial color="#d97706" transparent opacity={0.1} />
            </mesh>
            <Text position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.7} color="#d97706" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000" fillOpacity={0.4}>สนามกิจกรรม</Text>
        </group>
    );
}

function RentalArea({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
                <planeGeometry args={[7, 10]} />
                <meshStandardMaterial color="#06b6d4" transparent opacity={0.12} />
            </mesh>
            <Text position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.65} color="#06b6d4" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000" fillOpacity={0.5}>พื้นที่ให้เช่า</Text>
        </group>
    );
}

function Road({ position, width, depth, label }: {
    position: [number, number, number]; width: number; depth: number; label?: string;
}) {
    return (
        <group position={position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
                <planeGeometry args={[width, depth]} />
                <meshStandardMaterial color="#374151" roughness={0.95} />
            </mesh>
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
                <Text position={[0, 0.05, depth / 2 + 0.3]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#9ca3af" anchorX="center" anchorY="middle">{label}</Text>
            )}
        </group>
    );
}

function EntranceGate({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[-3, 2, 0]} castShadow><boxGeometry args={[0.5, 4, 0.5]} /><meshStandardMaterial color="#dc2626" roughness={0.5} /></mesh>
            <mesh position={[3, 2, 0]} castShadow><boxGeometry args={[0.5, 4, 0.5]} /><meshStandardMaterial color="#dc2626" roughness={0.5} /></mesh>
            <mesh position={[0, 4.1, 0]} castShadow><boxGeometry args={[7, 0.4, 0.6]} /><meshStandardMaterial color="#991b1b" roughness={0.5} /></mesh>
            <mesh position={[0, 4.6, 0]} castShadow><boxGeometry args={[7.5, 0.15, 1.0]} /><meshStandardMaterial color="#7f1d1d" roughness={0.5} /></mesh>
            <Text position={[0, 3.5, 0.32]} fontSize={0.55} color="#fef08a" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000000">OZONE ONE MARKET</Text>
        </group>
    );
}

// Tree + Lantern decorative
function MarketTree({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.08, 0.12, 1.2, 8]} /><meshStandardMaterial color="#8B5E3C" roughness={0.9} /></mesh>
            <mesh position={[0, 1.4, 0]} castShadow><sphereGeometry args={[0.5, 8, 8]} /><meshStandardMaterial color="#2d6a4f" roughness={0.8} /></mesh>
            <mesh position={[0, 1.8, 0]} castShadow><sphereGeometry args={[0.35, 8, 8]} /><meshStandardMaterial color="#40916c" roughness={0.8} /></mesh>
        </group>
    );
}

function Lantern({ position, color = "#fbbf24" }: { position: [number, number, number]; color?: string }) {
    return (
        <group position={position}>
            <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.03, 0.03, 3, 6]} /><meshStandardMaterial color="#374151" metalness={0.6} roughness={0.3} /></mesh>
            <mesh position={[0, 3.1, 0]}><cylinderGeometry args={[0.15, 0.2, 0.4, 8]} /><meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.4} /></mesh>
            <mesh position={[0, 2.85, 0]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} /></mesh>
        </group>
    );
}

// ─── Booth 3D Mesh ────────────────────────────────────────────────────────────

function BoothBox({
    booth,
    isSelected,
    isHighlighted,
    isDraggable,
    onSelect,
}: {
    booth: BoothPositionData;
    isSelected: boolean;
    isHighlighted: boolean;
    isDraggable: boolean;
    onSelect: (id: string) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const sc = booth.scale ?? 1;
    const py = booth.position_y ?? 0;
    const isClosed = !booth.is_available;
    const zoneName = booth.zone?.name?.toUpperCase() ?? "";

    // ระบบสี 2 สี: เขียว = จองได้, เทา = ปิดชั่วคราว
    const awningColor = isClosed ? "#6b7280" : "#16a34a";
    const counterColor = isClosed ? "#9ca3af" : "#22c55e";

    const baseColor = new THREE.Color(counterColor);
    const selectedColor = new THREE.Color("#fbbf24");
    const highlightColor = new THREE.Color("#3b82f6");
    const hoveredColor = baseColor.clone().lerp(new THREE.Color("#ffffff"), 0.3);

    const finalColor = isSelected
        ? selectedColor
        : isHighlighted
            ? highlightColor
            : hovered && isDraggable
                ? hoveredColor
                : baseColor;

    const opacity = !isDraggable && !isHighlighted ? 0.5 : 1.0;
    const isContainer = zoneName.includes("C");
    const isTruck = zoneName.includes("T");

    useFrame(() => {
        if (!meshRef.current) return;
        if (isSelected || hovered) {
            meshRef.current.position.y = py + Math.sin(Date.now() * 0.003) * 0.05 + 0.05;
        } else {
            meshRef.current.position.y = py;
        }
    });

    return (
        <group
            onClick={(e) => { e.stopPropagation(); if (isDraggable) onSelect(booth.id); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (isDraggable) document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        >
            {isContainer ? (
                <>
                    {/* Container body */}
                    <mesh ref={meshRef} position={[0, py + 0.6 * sc, 0]} scale={[sc, sc, sc]} castShadow receiveShadow>
                        <boxGeometry args={[1.8, 1.2, 1.4]} />
                        <meshStandardMaterial color={finalColor} roughness={0.3} metalness={0.4} transparent opacity={opacity}
                            emissive={isSelected ? selectedColor : new THREE.Color(0)} emissiveIntensity={isSelected ? 0.3 : 0} />
                    </mesh>
                    {[-0.4, 0, 0.4].map((z) => (
                        <mesh key={z} position={[0, py + 1.21 * sc, z * sc]} scale={[sc, sc, sc]}>
                            <boxGeometry args={[1.82, 0.04, 0.05]} />
                            <meshStandardMaterial color={awningColor} roughness={0.3} metalness={0.5} />
                        </mesh>
                    ))}
                </>
            ) : isTruck ? (
                <>
                    {/* Truck bed */}
                    <mesh ref={meshRef} position={[0, py + 0.35 * sc, 0]} scale={[sc, sc, sc]} castShadow receiveShadow>
                        <boxGeometry args={[1.6, 0.7, 1.2]} />
                        <meshStandardMaterial color={finalColor} roughness={0.5} metalness={0.2} transparent opacity={opacity}
                            emissive={isSelected ? selectedColor : new THREE.Color(0)} emissiveIntensity={isSelected ? 0.3 : 0} />
                    </mesh>
                    {/* Truck cab */}
                    <mesh position={[0, py + 0.5 * sc, -0.7 * sc]} scale={[sc, sc, sc]} castShadow>
                        <boxGeometry args={[1.2, 0.9, 0.5]} />
                        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.3} transparent opacity={opacity} />
                    </mesh>
                </>
            ) : (
                <>
                    {/* Standard stall */}
                    <mesh ref={meshRef} position={[0, py + 0.5 * sc, 0]} scale={[sc, sc, sc]} castShadow receiveShadow>
                        <boxGeometry args={[1.8, 1, 1.4]} />
                        <meshStandardMaterial color={finalColor} roughness={0.4} metalness={0.1} transparent opacity={opacity}
                            emissive={isSelected ? selectedColor : new THREE.Color(0)} emissiveIntensity={isSelected ? 0.3 : 0} />
                    </mesh>
                    {/* Awning - status color */}
                    <mesh position={[0, py + sc * 1.2, 0]} scale={[sc, sc * 0.15, sc]} castShadow>
                        <boxGeometry args={[2.1, 0.4, 2.0]} />
                        <meshStandardMaterial color={awningColor} roughness={0.6} transparent opacity={opacity} />
                    </mesh>
                </>
            )}

            {/* Status indicator */}
            <mesh position={[0.7 * sc, py + 0.85 * sc, 0.71 * sc]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial
                    color={isClosed ? "#94a3b8" : "#22c55e"}
                    emissive={isClosed ? "#94a3b8" : "#22c55e"}
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Name label */}
            <Text
                position={[0, py + sc * (isContainer ? 1.6 : isTruck ? 1.3 : 2.0), 0]}
                fontSize={0.25}
                color={isSelected ? "#fbbf24" : "#334155"}
                anchorX="center" anchorY="middle"
                outlineWidth={0.02} outlineColor="#ffffff"
                maxWidth={3}
            >
                {booth.name}
            </Text>

            {/* Zone label */}
            {booth.zone && (
                <Text
                    position={[0, py + sc * (isContainer ? 1.35 : isTruck ? 1.05 : 1.7), 0]}
                    fontSize={0.18}
                    color={booth.zone?.color_code ?? "#94a3b8"}
                    anchorX="center" anchorY="middle"
                    outlineWidth={0.015} outlineColor="#ffffff"
                >
                    {booth.zone.name}
                </Text>
            )}

            {/* Coordinate tooltip */}
            {(hovered || isSelected) && (
                <Html position={[0, py + sc * 2.5, 0]} center distanceFactor={15} style={{ pointerEvents: "none" }}>
                    <div className="whitespace-nowrap rounded-lg bg-slate-900/90 px-2.5 py-1 text-center shadow-xl backdrop-blur-md">
                        <div className="text-[8px] text-slate-400">
                            X: {(booth.position_x ?? 0).toFixed(1)} | Z: {(booth.position_z ?? 0).toFixed(1)}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// ─── Draggable Booth Wrapper ──────────────────────────────────────────────────

function DraggableBoothItem({
    booth, isSelected, isHighlighted, isDraggable, transformMode, orbitEnabled, onSelect, onTransform,
}: {
    booth: BoothPositionData; isSelected: boolean; isHighlighted: boolean; isDraggable: boolean;
    transformMode: "translate" | "rotate" | "none"; orbitEnabled: React.MutableRefObject<boolean>;
    onSelect: (id: string) => void;
    onTransform: (id: string, position: { x: number; y: number; z: number }, rotationY: number) => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleObjectChange = useCallback(() => {
        if (!groupRef.current) return;
        const p = groupRef.current.position;
        const r = groupRef.current.rotation;
        p.y = 0;
        onTransform(booth.id, { x: p.x, y: p.y, z: p.z }, r.y);
    }, [booth.id, onTransform]);

    const showGizmo = isSelected && mounted && groupRef.current && isDraggable && transformMode !== "none";
    const showX = transformMode === "translate";
    const showZ = transformMode === "translate";
    const showY = transformMode === "rotate";

    return (
        <>
            <group
                ref={groupRef}
                position={[booth.position_x ?? 0, 0, booth.position_z ?? 0]}
                rotation={[0, booth.rotation_y ?? 0, 0]}
            >
                <BoothBox booth={booth} isSelected={isSelected} isHighlighted={isHighlighted} isDraggable={isDraggable} onSelect={onSelect} />
            </group>
            {showGizmo && (
                <TransformControls
                    object={groupRef.current!}
                    mode={transformMode}
                    showX={showX} showZ={showZ} showY={showY}
                    size={0.8}
                    onMouseDown={() => { orbitEnabled.current = false; }}
                    onMouseUp={() => { orbitEnabled.current = true; }}
                    onObjectChange={handleObjectChange}
                />
            )}
        </>
    );
}

// ─── Scene (with floor plan structures) ───────────────────────────────────────

function MarketScene({
    booths, selectedId, highlightBoothId, singleBoothMode, transformMode, setSelectedId, onTransform,
}: {
    booths: BoothPositionData[]; selectedId: string | null; highlightBoothId?: string;
    singleBoothMode?: boolean; transformMode: "translate" | "rotate" | "none";
    setSelectedId: (id: string | null) => void;
    onTransform: (id: string, position: { x: number; y: number; z: number }, rotationY: number) => void;
}) {
    const orbitRef = useRef<OrbitControlsImpl | null>(null);
    const orbitEnabled = useRef(true);

    useEffect(() => {
        const frame = setInterval(() => {
            if (orbitRef.current) orbitRef.current.enabled = orbitEnabled.current;
        }, 10);
        return () => clearInterval(frame);
    }, []);

    return (
        <>
            <OrbitControls ref={orbitRef} makeDefault maxPolarAngle={Math.PI / 2.5} minDistance={5} maxDistance={120} dampingFactor={0.05} />
            <ambientLight intensity={0.4} color="#fff5eb" />
            <directionalLight position={[15, 25, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]}
                shadow-camera-near={0.5} shadow-camera-far={80} shadow-camera-left={-50} shadow-camera-right={50}
                shadow-camera-top={50} shadow-camera-bottom={-50} color="#fef3c7" />
            <pointLight position={[-10, 15, -10]} intensity={0.4} color="#fde68a" />
            <hemisphereLight args={["#87ceeb", "#4a3728", 0.3]} />
            <Environment preset="sunset" />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[120, 100]} />
                <meshStandardMaterial color="#4a4a4a" roughness={0.95} metalness={0.05} />
            </mesh>

            <Grid args={[120, 100]} cellSize={2} cellThickness={0.3} cellColor="#555555"
                sectionSize={10} sectionThickness={0.6} sectionColor="#666666" fadeDistance={80} fadeStrength={1.5} infiniteGrid />

            {/* Deselect plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} visible={false} onClick={() => setSelectedId(null)}>
                <planeGeometry args={[200, 200]} />
            </mesh>

            {/* ═══ Static Floor Plan Structures ═══ */}
            <Road position={[0, 0, 30]} width={90} depth={4} label="ถนน ทางเข้าหลัก" />
            <Road position={[0, 0, -32]} width={90} depth={3} label="ถนน ด้านหลังตลาด" />

            <ParkingArea position={[-30, 0, -24]} width={14} depth={8} label="ลานจอดรถ" />
            <ParkingArea position={[0, 0, -24]} width={14} depth={8} label="ลานจอดรถ" />
            <ParkingArea position={[35, 0, -24]} width={14} depth={8} label="ลานจอดรถ" />

            <OzoneOneBuilding position={[38, 0, 5]} />
            <RentalArea position={[38, 0, -14]} />
            <EntranceGate position={[0, 0, 27]} />

            <ZoneFloor position={[0, 0, -14]} width={55} depth={8} color={ZONE_COLORS.C} label="โซน C — คอนเทนเนอร์" />
            <ZoneFloor position={[-5, 0, -2]} width={20} depth={8} color={ZONE_COLORS.A} label="โซน A — ลานอาหาร" />
            <ZoneFloor position={[-22, 0, -2]} width={10} depth={8} color={ZONE_COLORS.F_SMALL} label="โซน F (3×2)" />
            <ZoneFloor position={[22, 0, -2]} width={10} depth={8} color={ZONE_COLORS.F_LARGE} label="โซน F (3×4)" />
            <ActivityArea position={[10, 0, -2]} />
            <ZoneFloor position={[0, 0, 10]} width={55} depth={8} color={ZONE_COLORS.B} label="โซน B — สินค้าทั่วไป" />
            <ZoneFloor position={[0, 0, 20]} width={55} depth={6} color={ZONE_COLORS.T} label="โซน T — Truck" />

            {/* Walkways */}
            <mesh position={[0, 0.004, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[3, 45]} /><meshStandardMaterial color="#78716c" roughness={0.95} /></mesh>
            <mesh position={[0, 0.004, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[60, 2]} /><meshStandardMaterial color="#78716c" roughness={0.95} /></mesh>
            <mesh position={[0, 0.004, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[60, 2]} /><meshStandardMaterial color="#78716c" roughness={0.95} /></mesh>

            {/* Trees + Lanterns */}
            <MarketTree position={[-28, 0, 25]} /><MarketTree position={[28, 0, 25]} />
            <MarketTree position={[-28, 0, -5]} /><MarketTree position={[28, 0, -5]} />
            <MarketTree position={[-15, 0, -20]} /><MarketTree position={[15, 0, -20]} />
            <Lantern position={[-2, 0, 24]} color="#fbbf24" /><Lantern position={[2, 0, 24]} color="#fb923c" />
            <Lantern position={[-2, 0, -2]} color="#fbbf24" /><Lantern position={[2, 0, -2]} color="#fb923c" />

            {/* ═══ Draggable Booths ═══ */}
            {booths.map((booth) => {
                const isDraggable = singleBoothMode ? booth.id === highlightBoothId : true;
                return (
                    <DraggableBoothItem
                        key={booth.id} booth={booth} isSelected={selectedId === booth.id}
                        isHighlighted={booth.id === highlightBoothId} isDraggable={isDraggable}
                        transformMode={transformMode} orbitEnabled={orbitEnabled}
                        onSelect={setSelectedId} onTransform={onTransform}
                    />
                );
            })}

            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewcube />
            </GizmoHelper>
        </>
    );
}

// ─── Zone Legend ──────────────────────────────────────────────────────────────

function ZoneLegend({ booths }: { booths: BoothPositionData[] }) {
    const zonesMap = new Map<string, { name: string; color: string }>();
    for (const b of booths) {
        if (b.zone && !zonesMap.has(b.zone.id)) {
            zonesMap.set(b.zone.id, { name: b.zone.name, color: b.zone.color_code ?? DEFAULT_ZONE_COLOR });
        }
    }
    const zones = Array.from(zonesMap.values());
    if (zones.length === 0) return null;

    return (
        <div className="pointer-events-auto flex flex-wrap gap-2 rounded-2xl bg-white/90 p-2 shadow-md backdrop-blur-md">
            {zones.map((z) => (
                <div key={z.name} className="flex items-center gap-1.5 px-2 py-1">
                    <span className="h-3 w-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: z.color }} />
                    <span className="text-[10px] font-bold text-slate-600">{z.name}</span>
                </div>
            ))}
            <div className="flex items-center gap-1.5 px-2 py-1">
                <span className="h-3 w-3 rounded-full bg-green-500 border border-white shadow-sm" />
                <span className="text-[10px] font-bold text-slate-600">หลังคา = ว่าง</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1">
                <span className="h-3 w-3 rounded-full bg-gray-500 border border-white shadow-sm" />
                <span className="text-[10px] font-bold text-slate-600">หลังคา = ปิด</span>
            </div>
        </div>
    );
}

// ─── Main Exported Component ─────────────────────────────────────────────────

export default function MarketLayout3D({
    booths, onPositionChange, highlightBoothId, singleBoothMode = false, height = "550px",
}: MarketLayout3DProps) {
    const [selectedId, setSelectedId] = useState<string | null>(highlightBoothId ?? null);
    const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "none">("translate");

    const selectedBooth = booths.find((b) => b.id === selectedId);

    const handleTransform = useCallback(
        (id: string, position: { x: number; y: number; z: number }, rotationY: number) => {
            onPositionChange?.(id, position, rotationY);
        },
        [onPositionChange],
    );

    return (
        <div className="relative flex w-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100" style={{ height }}>
            <div className="absolute inset-0 z-0">
                <Canvas shadows camera={{ position: [0, 35, 50], fov: 45 }}
                    gl={{ antialias: true }}
                    style={{ background: "linear-gradient(to bottom, #111827, #1f2937)" }}>
                    <Suspense fallback={null}>
                        <MarketScene
                            booths={booths} selectedId={selectedId} highlightBoothId={highlightBoothId}
                            singleBoothMode={singleBoothMode} transformMode={transformMode}
                            setSelectedId={setSelectedId} onTransform={handleTransform}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
                <div className="flex items-start justify-between">
                    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                        <MapPinned className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-bold text-slate-700">
                            แผนผังตลาด 3D ({booths.length} บูธ)
                        </span>
                    </div>
                    <div className="pointer-events-auto flex gap-2">
                        <div className="flex rounded-2xl bg-white/90 p-1 shadow-md backdrop-blur-md">
                            <button type="button" onClick={() => setTransformMode("none")}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${transformMode === "none" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                                <MousePointer2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">หมุนกล้อง</span>
                            </button>
                            <button type="button" onClick={() => setTransformMode("translate")}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${transformMode === "translate" ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                                <Move className="h-3.5 w-3.5" /><span className="hidden sm:inline">ย้าย</span>
                            </button>
                            <button type="button" onClick={() => setTransformMode("rotate")}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${transformMode === "rotate" ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                                <RotateCw className="h-3.5 w-3.5" /><span className="hidden sm:inline">หมุน</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-2">
                        <ZoneLegend booths={booths} />
                        <div className="pointer-events-auto">
                            <select
                                value={selectedId ?? ""}
                                onChange={(e) => setSelectedId(e.target.value || null)}
                                className="w-48 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md backdrop-blur-md outline-none ring-1 ring-slate-200"
                            >
                                <option value="">เลือกบูธ...</option>
                                {booths
                                    .filter((b) => singleBoothMode ? b.id === highlightBoothId : true)
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} ({(b.position_x ?? 0).toFixed(0)}, {(b.position_z ?? 0).toFixed(0)})
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>
                    <div className={`pointer-events-auto transition-all duration-300 ${selectedBooth ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
                        {selectedBooth && (
                            <div className="flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur-md">
                                <Store className="h-4 w-4 text-orange-400" />
                                <span className="text-xs font-bold text-white">{selectedBooth.name}</span>
                                <div className="h-3 w-px bg-slate-600" />
                                <span className="text-[10px] text-slate-400">
                                    X: {(selectedBooth.position_x ?? 0).toFixed(1)} | Z: {(selectedBooth.position_z ?? 0).toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
