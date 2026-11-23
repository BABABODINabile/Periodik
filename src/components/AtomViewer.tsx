/* eslint-disable react-hooks/immutability -- Les shared values Reanimated et les refs de la boucle R3F sont mutables par conception. */
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Feather } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type ThemePalette } from '@/theme';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { useSettings } from '@/store/settings';
import { valenceOf } from '@/lib/valence';
import { SHELL_COLORS } from '@/theme/shells';
import type { BaseElement, ElementDetail } from '@/types';

const SHELLS = [2, 8, 8, 18, 18, 32, 32];
const FOV = 45;

interface Particle {
  type: 'proton' | 'neutron';
  position: [number, number, number];
}

interface Interaction {
  yaw: SharedValue<number>;
  pitch: SharedValue<number>;
  zoom: SharedValue<number>;
  dragging: SharedValue<boolean>;
}

interface Shell {
  radius: number;
  count: number;
  euler: THREE.Euler;
  offset: number;
}

function shellsCount(atomicNumber: number): number {
  let remaining = atomicNumber;
  return SHELLS.filter((capacity) => {
    const used = Math.min(remaining, capacity);
    remaining -= used;
    return used > 0;
  }).length;
}

function trailLengthFor(atomicNumber: number): number {
  if (atomicNumber <= 20) return 8;
  if (atomicNumber <= 54) return 5;
  return 3;
}

function neutronsFor(element: BaseElement, detail?: ElementDetail): number {
  if (element.number === 1) return 0;
  const override = (detail?.level2_atomic as { [key: string]: unknown } | undefined)?.neutronOverride;
  if (typeof override === 'number') return override;
  const raw = detail?.level2_atomic?.mass?.highSchool;
  const mass = raw ? parseFloat(raw.replace(',', '.')) : NaN;
  return Number.isFinite(mass) ? Math.max(0, Math.round(mass) - element.number) : element.number;
}

function buildParticles(element: BaseElement, detail?: ElementDetail): Particle[] {
  const count = neutronsFor(element, detail);
  const particles: Particle[] = [];
  for (let i = 0; i < element.number; i += 1) particles.push({ type: 'proton', position: [0, 0, 0] });
  for (let i = 0; i < count; i += 1) particles.push({ type: 'neutron', position: [0, 0, 0] });

  const total = particles.length;
  if (total === 0) return particles;
  if (total === 1) return particles;

  // Répartition de Fibonacci : nucléons espacés de façon régulière sur une sphère.
  const phi = Math.PI * (3 - Math.sqrt(5));
  const scale = Math.pow(total, 1 / 3) * 0.36;
  particles.forEach((particle, index) => {
    const k = index + 0.5;
    const y = 1 - (k / total) * 2;
    const theta = phi * k;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const jitter = Math.sin(index * 12.9898) * 0.08;
    particle.position = [
      Math.cos(theta) * radius * scale + jitter,
      y * scale + jitter * 0.5,
      Math.sin(theta) * radius * scale - jitter,
    ];
  });

  // Les nucléons internes sont masqués : on ne garde que la couche de surface.
  if (total <= 20) return particles;
  let maxDistance = 0;
  particles.forEach((particle) => {
    maxDistance = Math.max(maxDistance, Math.hypot(...particle.position));
  });
  const cutoff = maxDistance - 1.2;
  return particles.filter((particle) => Math.hypot(...particle.position) >= cutoff);
}

function buildShells(atomicNumber: number): Shell[] {
  const shells: Shell[] = [];
  let remaining = atomicNumber;
  let offset = 0;
  SHELLS.forEach((capacity, index) => {
    if (remaining <= 0) return;
    const count = Math.min(remaining, capacity);
    remaining -= count;
    // Chaque couche possède son propre plan : les orbites se croisent sans se confondre.
    shells.push({
      radius: 4.5 + index * 2.5,
      count,
      offset,
      euler: new THREE.Euler(
        0.28 + (index % 3) * 0.36,
        index * 0.62,
        (index % 2 === 0 ? 1 : -1) * 0.22,
      ),
    });
    offset += count;
  });
  return shells;
}

interface SceneProps {
  element: BaseElement;
  detail?: ElementDetail;
  interaction: Interaction;
  reduceMotion: boolean;
}

function AtomScene({ element, detail, interaction, reduceMotion }: SceneProps) {
  const { colors } = useTheme();
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Group>(null);
  const electronsRef = useRef<THREE.InstancedMesh>(null);
  const trailsRef = useRef<THREE.InstancedMesh>(null);
  const introStart = useRef<number | null>(null);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0.28);
  const { size } = useThree();
  const { animationPaused, animationSpeed } = useSettings();
  const readyRef = useRef(false);

  const nucleusSegments = element.number > 54 ? 12 : 20;
  const electronSegments = element.number > 54 ? 8 : 16;
  const tubularSegments = element.number > 54 ? 36 : 64;
  const trailCount = trailLengthFor(element.number);

  const particles = useMemo(() => buildParticles(element, detail), [element, detail]);
  const shells = useMemo(() => buildShells(element.number), [element.number]);
  const totalElectrons = shells.reduce((sum, shell) => sum + shell.count, 0);
  const maxRadius = shells.length ? shells[shells.length - 1].radius + 0.6 : 5;

  const nucleusGeometry = useMemo(
    () => new THREE.SphereGeometry(0.45, nucleusSegments, nucleusSegments),
    [nucleusSegments],
  );
  const electronGeometry = useMemo(
    () => new THREE.SphereGeometry(0.3, electronSegments, electronSegments),
    [electronSegments],
  );
  const trailGeometry = useMemo(() => new THREE.SphereGeometry(0.17, 8, 8), []);
  const orbitGeometries = useMemo(
    () => shells.map((shell) => new THREE.TorusGeometry(shell.radius, 0.035, 6, tubularSegments)),
    [shells, tubularSegments],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const trailPositions = useMemo(
    () => new Float32Array(Math.max(1, totalElectrons) * trailCount * 3),
    [totalElectrons, trailCount],
  );
  const angles = useMemo(() => new Float32Array(Math.max(1, totalElectrons)), [totalElectrons]);
  const valenceShell = valenceOf(detail) !== null ? shells.length - 1 : -1;

  useEffect(() => {
    introStart.current = null;
    readyRef.current = false;
    const electrons = electronsRef.current;
    const trails = trailsRef.current;
    if (!electrons || !trails) return;

    shells.forEach((shell, shellIndex) => {
      const shellColor = new THREE.Color(SHELL_COLORS[shellIndex]);
      for (let index = 0; index < shell.count; index += 1) {
        const electronIndex = shell.offset + index;
        const angle = (index / shell.count) * Math.PI * 2;
        angles[electronIndex] = angle;
        position.set(Math.cos(angle) * shell.radius, Math.sin(angle) * shell.radius, 0).applyEuler(shell.euler);
        for (let trail = 0; trail < trailCount; trail += 1) {
          const base = (electronIndex * trailCount + trail) * 3;
          trailPositions[base] = position.x;
          trailPositions[base + 1] = position.y;
          trailPositions[base + 2] = position.z;
          trails.setColorAt(electronIndex * trailCount + trail, shellColor.clone().multiplyScalar(1 - trail / (trailCount + 1)));
        }
        electrons.setColorAt(electronIndex, shellColor);
      }
    });
    if (electrons.instanceColor) electrons.instanceColor.needsUpdate = true;
    if (trails.instanceColor) trails.instanceColor.needsUpdate = true;
    readyRef.current = true;
  }, [shells, trailCount, angles, position, trailPositions, colors.salmon, colors.accent, valenceShell]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const electrons = electronsRef.current;
    const trails = trailsRef.current;
    if (!group || !electrons || !trails || !readyRef.current) return;

    if (introStart.current === null) introStart.current = Date.now();
    const elapsed = (Date.now() - introStart.current) / 1000;
    const aspect = size.width / Math.max(1, size.height);
    const fitDistance = (maxRadius * 1.12) / Math.tan((FOV * Math.PI) / 360);
    const baseDistance = fitDistance * Math.max(1, 1 / aspect);
    const targetZ = baseDistance * interaction.zoom.value;
    state.camera.position.z =
      !reduceMotion && elapsed < 1.6
        ? baseDistance * 1.45 - (baseDistance * 1.45 - targetZ) * (1 - Math.pow(1 - elapsed / 1.6, 4))
        : targetZ;

    const speed = animationPaused || reduceMotion ? 0 : animationSpeed;
    currentYaw.current = THREE.MathUtils.damp(currentYaw.current, interaction.yaw.value, 12, delta);
    currentPitch.current = THREE.MathUtils.damp(currentPitch.current, interaction.pitch.value, 12, delta);
    group.rotation.y = currentYaw.current + (interaction.dragging.value ? 0 : delta * 0.18 * speed);
    group.rotation.x = currentPitch.current;
    if (nucleusRef.current) nucleusRef.current.rotation.y -= delta * 0.3 * speed;

    shells.forEach((shell) => {
      for (let index = 0; index < shell.count; index += 1) {
        const electronIndex = shell.offset + index;
        const angularSpeed = (0.5 - shell.count * 0.004) * speed;
        angles[electronIndex] += angularSpeed * delta;
        const angle = angles[electronIndex];
        position.set(Math.cos(angle) * shell.radius, Math.sin(angle) * shell.radius, 0).applyEuler(shell.euler);

        dummy.position.copy(position);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        electrons.setMatrixAt(electronIndex, dummy.matrix);

        for (let trail = trailCount - 1; trail > 0; trail -= 1) {
          const current = (electronIndex * trailCount + trail) * 3;
          const previous = (electronIndex * trailCount + trail - 1) * 3;
          trailPositions[current] = trailPositions[previous];
          trailPositions[current + 1] = trailPositions[previous + 1];
          trailPositions[current + 2] = trailPositions[previous + 2];
        }
        const head = electronIndex * trailCount * 3;
        trailPositions[head] = position.x;
        trailPositions[head + 1] = position.y;
        trailPositions[head + 2] = position.z;

        for (let trail = 0; trail < trailCount; trail += 1) {
          const base = (electronIndex * trailCount + trail) * 3;
          dummy.position.set(trailPositions[base], trailPositions[base + 1], trailPositions[base + 2]);
          dummy.scale.setScalar(Math.max(0.18, 1 - trail / trailCount));
          dummy.updateMatrix();
          trails.setMatrixAt(electronIndex * trailCount + trail, dummy.matrix);
        }
      }
    });
    electrons.instanceMatrix.needsUpdate = true;
    trails.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[10, 10, 10]} intensity={0.5} />
      {element.number > 1 && <pointLight color={colors.accent} intensity={2.4} distance={18} />}
      <group ref={groupRef}>
        <group ref={nucleusRef}>
          <mesh>
            <sphereGeometry args={[Math.pow(particles.length, 1 / 3) * 0.5 + 0.3, 24, 24]} />
            <meshBasicMaterial color={colors.accent} transparent opacity={0.1} />
          </mesh>
          {particles.map((particle, index) => (
            <mesh key={`${particle.type}-${index}`} geometry={nucleusGeometry} position={particle.position}>
              <meshStandardMaterial
                color={particle.type === 'proton' ? colors.accent : colors.lineStrong}
                roughness={0.3}
                metalness={0.3}
                emissive={particle.type === 'proton' ? '#5C1A08' : '#2A2824'}
                emissiveIntensity={particle.type === 'proton' ? 0.9 : 0.25}
              />
            </mesh>
          ))}
        </group>

        {shells.map((shell, index) => (
          <mesh key={`orbit-${index}`} geometry={orbitGeometries[index]} rotation={[shell.euler.x, shell.euler.y, shell.euler.z]}>
            <meshBasicMaterial
              color={SHELL_COLORS[index]}
              transparent
              opacity={index === valenceShell ? 0.75 : 0.42}
            />
          </mesh>
        ))}

        <instancedMesh ref={electronsRef} args={[electronGeometry, undefined, Math.max(1, totalElectrons)]}>
          <meshStandardMaterial color={colors.salmon} roughness={0.35} metalness={0.4} />
        </instancedMesh>
        <instancedMesh ref={trailsRef} args={[trailGeometry, undefined, Math.max(1, totalElectrons * trailCount)]}>
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.55} />
        </instancedMesh>
      </group>
    </>
  );
}

interface AtomViewerProps {
  element: BaseElement;
  detail?: ElementDetail;
  height: number;
}

export function AtomViewer({ element, detail, height }: AtomViewerProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const yaw = useSharedValue(0);
  const pitch = useSharedValue(0.28);
  const zoom = useSharedValue(1);
  const dragging = useSharedValue(false);
  const interaction = useMemo(() => ({ yaw, pitch, zoom, dragging }), [yaw, pitch, zoom, dragging]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let subscription: { remove: () => void } | undefined;
    if (typeof AccessibilityInfo.addEventListener === 'function') {
      subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    }
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    return () => subscription?.remove();
  }, []);

  const pan = Gesture.Pan()
    .onStart(() => {
      dragging.value = true;
    })
    .onChange((event) => {
      yaw.value += event.changeX * 0.005;
      pitch.value = Math.max(-1.15, Math.min(1.15, pitch.value + event.changeY * 0.005));
    })
    .onFinalize(() => {
      dragging.value = false;
    })
    .runOnJS(false);

  const pinch = Gesture.Pinch()
    .onChange((event) => {
      zoom.value = Math.max(0.5, Math.min(2.4, 1 / event.scale));
    })
    .runOnJS(false);

  const gestures = Gesture.Simultaneous(pan, pinch);

  const reset = () => {
    yaw.value = 0;
    pitch.value = 0.28;
    zoom.value = 1;
    dragging.value = false;
  };

  return (
    <View
      style={[styles.container, { height }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('app.atom.spatial', { symbol: element.symbol, count: shellsCount(element.number) })}
      accessibilityHint={t('app.atom.hint')}
    >
      <GestureDetector gesture={gestures}>
        <View style={StyleSheet.absoluteFill}>
          <Canvas
            camera={{ fov: FOV, position: [0, 0, 16], near: 0.1, far: 1000 }}
            gl={{ antialias: element.number <= 54, alpha: true, powerPreference: 'high-performance' }}
          >
            <AtomScene element={element} detail={detail} interaction={interaction} reduceMotion={reduceMotion} />
          </Canvas>
        </View>
      </GestureDetector>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('app.atom.reset')}
        hitSlop={8}
        onPress={reset}
        style={styles.reset}
      >
        <Feather name="rotate-ccw" size={15} color={colors.lineStrong} />
      </Pressable>
    </View>
  );
}

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemePalette) => StyleSheet.create({
  container: { width: '100%', backgroundColor: colors.card, overflow: 'hidden' },
  reset: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
