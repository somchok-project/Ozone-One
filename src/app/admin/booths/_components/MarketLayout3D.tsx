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
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    Move,
    RotateCw,
    MousePointer2,
    MapPinned,
    Store,
    Save,
    Undo2,
    Maximize2,
} from "lucide-react";
import { parseDimension } from "@/lib/utils/booth";

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
    /** Called when a booth's position/rotation changes via drag */
    onPositionChange?: (
        boothId: string,
        position: { x: number; y: number; z: number },
        rotationY: number,
    ) => void;
    /** Booth ID to highlight (for single-booth mode in BoothForm) */
    highlightBoothId?: string;
    /** If true, only the highlighted booth is draggable */
    singleBoothMode?: boolean;
    /** Height of the canvas container */
    height?: string;
}

// ─── Booth 3D Mesh ────────────────────────────────────────────────────────────

const DEFAULT_ZONE_COLOR = "#94a3b8";

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
    const zoneColor = booth.zone?.color_code ?? DEFAULT_ZONE_COLOR;

    // Compute color based on state
    const baseColor = !booth.is_available
        ? new THREE.Color("#94a3b8")
        : new THREE.Color("#22c55e");

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

    // Door color
    const doorColor = !booth.is_available ? "#94a3b8" : "#4ade80";

    // Hover animation
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
            onClick={(e) => {
                e.stopPropagation();
                if (isDraggable) onSelect(booth.id);
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                if (isDraggable) document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = "auto";
            }}
        >
            {/* Base slab */}
            <mesh
                ref={meshRef}
                position={[0, py + 0.5 * sc, 0]}
                scale={[sc, sc, sc]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[1.8, 1, 1.8]} />
                <meshStandardMaterial
                    color={finalColor}
                    roughness={0.4}
                    metalness={0.1}
                    transparent
                    opacity={opacity}
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
                    transparent
                    opacity={opacity}
                    emissive={isSelected ? selectedColor : new THREE.Color(0)}
                    emissiveIntensity={isSelected ? 0.2 : 0}
                />
            </mesh>

            {/* Door */}
            <mesh position={[0, py + 0.3 * sc, 0.91 * sc]} scale={[sc, sc, sc]}>
                <boxGeometry args={[0.4, 0.6, 0.05]} />
                <meshStandardMaterial color={doorColor} roughness={0.5} transparent opacity={opacity} />
            </mesh>

            {/* Floating name label */}
            <Text
                position={[0, py + sc * 2.0, 0]}
                fontSize={0.25}
                color={isSelected ? "#fbbf24" : "#334155"}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#ffffff"
                maxWidth={3}
            >
                {booth.name}
            </Text>

            {/* Zone label */}
            {booth.zone && (
                <Text
                    position={[0, py + sc * 1.7, 0]}
                    fontSize={0.18}
                    color={zoneColor}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.015}
                    outlineColor="#ffffff"
                >
                    {booth.zone.name}
                </Text>
            )}

            {/* Coordinate tooltip on hover/select */}
            {(hovered || isSelected) && (
                <Html
                    position={[0, py + sc * 2.5, 0]}
                    center
                    distanceFactor={15}
                    style={{ pointerEvents: "none" }}
                >
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
    booth,
    isSelected,
    isHighlighted,
    isDraggable,
    transformMode,
    orbitEnabled,
    onSelect,
    onTransform,
}: {
    booth: BoothPositionData;
    isSelected: boolean;
    isHighlighted: boolean;
    isDraggable: boolean;
    transformMode: "translate" | "rotate" | "none";
    orbitEnabled: React.MutableRefObject<boolean>;
    onSelect: (id: string) => void;
    onTransform: (
        id: string,
        position: { x: number; y: number; z: number },
        rotationY: number,
    ) => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleObjectChange = useCallback(() => {
        if (!groupRef.current) return;
        const p = groupRef.current.position;
        const r = groupRef.current.rotation;
        // Lock Y position to ground (XZ plane only)
        p.y = 0;
        onTransform(booth.id, { x: p.x, y: p.y, z: p.z }, r.y);
    }, [booth.id, onTransform]);

    const showGizmo =
        isSelected && mounted && groupRef.current && isDraggable && transformMode !== "none";

    const showX = transformMode === "translate";
    const showZ = transformMode === "translate";
    const showY = transformMode === "rotate";

    return (
        <>
            <group
                ref={groupRef}
                position={[
                    booth.position_x ?? 0,
                    0,
                    booth.position_z ?? 0,
                ]}
                rotation={[0, booth.rotation_y ?? 0, 0]}
            >
                <BoothBox
                    booth={booth}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    isDraggable={isDraggable}
                    onSelect={onSelect}
                />
            </group>

            {showGizmo && (
                <TransformControls
                    object={groupRef.current!}
                    mode={transformMode}
                    showX={showX}
                    showZ={showZ}
                    showY={showY}
                    size={0.8}
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

// ─── Scene ────────────────────────────────────────────────────────────────────

function MarketScene({
    booths,
    selectedId,
    highlightBoothId,
    singleBoothMode,
    transformMode,
    setSelectedId,
    onTransform,
}: {
    booths: BoothPositionData[];
    selectedId: string | null;
    highlightBoothId?: string;
    singleBoothMode?: boolean;
    transformMode: "translate" | "rotate" | "none";
    setSelectedId: (id: string | null) => void;
    onTransform: (
        id: string,
        position: { x: number; y: number; z: number },
        rotationY: number,
    ) => void;
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
            <OrbitControls
                ref={orbitRef}
                makeDefault
                maxPolarAngle={Math.PI / 2.5}
                minDistance={5}
                maxDistance={80}
                dampingFactor={0.05}
            />

            <ambientLight intensity={0.5} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-10, 15, -10]} intensity={0.5} color="#fde68a" />

            <Environment preset="city" />

            <color attach="background" args={["#f1f5f9"]} />

            {/* Market ground grid */}
            <Grid
                position={[0, -0.01, 0]}
                args={[100, 100]}
                cellSize={2}
                cellThickness={0.4}
                cellColor="#e2e8f0"
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#94a3b8"
                fadeDistance={60}
                infiniteGrid
            />

            {/* Clickable ground plane for deselection */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.02, 0]}
                visible={false}
                onClick={() => setSelectedId(null)}
            >
                <planeGeometry args={[200, 200]} />
            </mesh>

            {booths.map((booth) => {
                const isDraggable = singleBoothMode
                    ? booth.id === highlightBoothId
                    : true;
                return (
                    <DraggableBoothItem
                        key={booth.id}
                        booth={booth}
                        isSelected={selectedId === booth.id}
                        isHighlighted={booth.id === highlightBoothId}
                        isDraggable={isDraggable}
                        transformMode={transformMode}
                        orbitEnabled={orbitEnabled}
                        onSelect={setSelectedId}
                        onTransform={onTransform}
                    />
                );
            })}
        </>
    );
}

// ─── Zone Legend ──────────────────────────────────────────────────────────────

function ZoneLegend({ booths }: { booths: BoothPositionData[] }) {
    const zonesMap = new Map<string, { name: string; color: string }>();
    for (const b of booths) {
        if (b.zone && !zonesMap.has(b.zone.id)) {
            zonesMap.set(b.zone.id, {
                name: b.zone.name,
                color: b.zone.color_code ?? DEFAULT_ZONE_COLOR,
            });
        }
    }
    const zones = Array.from(zonesMap.values());
    if (zones.length === 0) return null;

    return (
        <div className="pointer-events-auto flex flex-wrap gap-2 rounded-2xl bg-white/90 p-2 shadow-md backdrop-blur-md">
            {zones.map((z) => (
                <div key={z.name} className="flex items-center gap-1.5 px-2 py-1">
                    <span
                        className="h-3 w-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: z.color }}
                    />
                    <span className="text-[10px] font-bold text-slate-600">{z.name}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Main Exported Component ─────────────────────────────────────────────────

export default function MarketLayout3D({
    booths,
    onPositionChange,
    highlightBoothId,
    singleBoothMode = false,
    height = "550px",
}: MarketLayout3DProps) {
    const [selectedId, setSelectedId] = useState<string | null>(
        highlightBoothId ?? null,
    );
    const [transformMode, setTransformMode] = useState<
        "translate" | "rotate" | "none"
    >("translate");

    const selectedBooth = booths.find((b) => b.id === selectedId);

    const handleTransform = useCallback(
        (
            id: string,
            position: { x: number; y: number; z: number },
            rotationY: number,
        ) => {
            onPositionChange?.(id, position, rotationY);
        },
        [onPositionChange],
    );

    return (
        <div
            className="relative flex w-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100"
            style={{ height }}
        >
            {/* 3D Canvas */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    shadows
                    camera={{ position: [0, 35, 40], fov: 50 }}
                    gl={{ antialias: true }}
                >
                    <Suspense fallback={null}>
                        <MarketScene
                            booths={booths}
                            selectedId={selectedId}
                            highlightBoothId={highlightBoothId}
                            singleBoothMode={singleBoothMode}
                            transformMode={transformMode}
                            setSelectedId={setSelectedId}
                            onTransform={handleTransform}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4">
                {/* Top bar */}
                <div className="flex items-start justify-between">
                    {/* Badge */}
                    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
                        <MapPinned className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-bold text-slate-700">
                            แผนผังตลาด 3D ({booths.length} บูธ)
                        </span>
                    </div>

                    {/* Mode toggles */}
                    <div className="pointer-events-auto flex gap-2">
                        <div className="flex rounded-2xl bg-white/90 p-1 shadow-md backdrop-blur-md">
                            <button
                                type="button"
                                onClick={() => setTransformMode("none")}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${transformMode === "none"
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                <MousePointer2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">หมุนกล้อง</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTransformMode("translate")}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${transformMode === "translate"
                                    ? "bg-orange-500 text-white"
                                    : "text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                <Move className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">ย้าย</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTransformMode("rotate")}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${transformMode === "rotate"
                                    ? "bg-orange-500 text-white"
                                    : "text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                <RotateCw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">หมุน</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-end justify-between">
                    {/* Zone Legend + Booth Selector */}
                    <div className="flex flex-col gap-2">
                        <ZoneLegend booths={booths} />
                        {/* Booth selector dropdown for overlapping booths */}
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

                    {/* Selected booth info */}
                    <div
                        className={`pointer-events-auto transition-all duration-300 ${selectedBooth
                            ? "translate-y-0 opacity-100"
                            : "pointer-events-none translate-y-4 opacity-0"
                            }`}
                    >
                        {selectedBooth && (
                            <div className="flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur-md">
                                <Store className="h-4 w-4 text-orange-400" />
                                <span className="text-xs font-bold text-white">
                                    {selectedBooth.name}
                                </span>
                                <div className="h-3 w-px bg-slate-600" />
                                <span className="text-[10px] text-slate-400">
                                    X: {(selectedBooth.position_x ?? 0).toFixed(1)} | Z:{" "}
                                    {(selectedBooth.position_z ?? 0).toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
