import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TerrainProps {
  terrain: string;      // "Road" | "Mud" | "Stone" | "Gravel" | "Bush" | "Water" | "Slope" | "Pothole"
  speed: string;        // "Stop" | "Slow" | "Medium" | "Fast" | "Reverse"
}

interface Obstacle {
  id: number;
  x: number;
  z: number;
  scale: number;
  rotY: number;
  type: string;
}

// Particle helper class for wheel spray
class SprayParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;

  constructor(origin: THREE.Vector3, type: string) {
    this.position = origin.clone();
    
    const speedScale = type === 'Water' ? 3.5 : 2.5;
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.6,
      Math.random() * 2.0 + 0.8,
      -(Math.random() * speedScale + 1.5) // spray backwards
    );

    this.maxLife = Math.random() * 0.4 + 0.25; // seconds
    this.life = this.maxLife;
  }

  update(dt: number) {
    // Apply gravity
    this.velocity.y -= 9.8 * dt;
    this.position.addScaledVector(this.velocity, dt);
    this.life -= dt;
  }
}

// Shared elevation calculation function for the Digital Twin
export const getTerrainHeight = (
  x: number,
  z: number,
  terrain: string,
  time: number,
  scrollOffset: number
): number => {
  const zScrolled = z + scrollOffset;

  switch (terrain) {
    case 'Slope':
      // Ground plane incline (~12.5 degrees)
      return -z * Math.sin(0.22) - 0.45;

    case 'Pothole': {
      // Periodic pothole dips along center and sides
      const zPeriod = 20;
      const zPos = ((zScrolled + 1000) % zPeriod) - zPeriod / 2;
      const distanceToPothole = Math.sqrt((x * 0.7) * (x * 0.7) + zPos * zPos);
      if (distanceToPothole < 2.2) {
        return -0.45 - (Math.cos((distanceToPothole / 2.2) * Math.PI) + 1.0) * 0.35;
      }
      return -0.45;
    }

    case 'Stone': {
      // Procedural stones/bumps on the road
      const zPeriod = 12;
      const zCell = Math.floor(zScrolled / zPeriod);
      // Deterministic coordinates based on cell index
      const stoneX = Math.sin(zCell * 12.9898) * 2.5;
      const stoneZ = zCell * zPeriod + zPeriod / 2 - scrollOffset;
      
      const dx = x - stoneX;
      const dz = z - stoneZ;
      const distanceToStone = Math.sqrt(dx * dx + dz * dz);
      
      if (distanceToStone < 0.9) {
        return -0.45 + (Math.cos((distanceToStone / 0.9) * Math.PI) + 1.0) * 0.22;
      }
      return -0.45;
    }

    case 'Mud': {
      // Deep mud ruts
      const ruts = Math.sin(x * 2.8) * 0.08 + Math.cos(zScrolled * 1.8) * 0.06;
      return -0.45 + ruts;
    }

    case 'Gravel': {
      // High frequency vibrations
      const bumps = Math.sin(x * 15) * Math.cos(zScrolled * 15) * 0.035;
      return -0.45 + bumps;
    }

    case 'Water': {
      // Flowing water wave height
      const waves = Math.sin(x * 2.5 + time * 3.5) * Math.cos(zScrolled * 1.8 + time * 2.5) * 0.07;
      return -0.45 + waves;
    }

    case 'Road':
    default:
      return -0.45;
  }
};

export const Terrain = ({ terrain, speed }: TerrainProps) => {
  const groundRef = useRef<THREE.Mesh>(null);
  const scrollOffset = useRef(0);

  // Instanced Meshes for static obstacles
  const rockMeshRef = useRef<THREE.InstancedMesh>(null);
  const bushMeshARef = useRef<THREE.InstancedMesh>(null);
  const bushMeshBRef = useRef<THREE.InstancedMesh>(null);
  const bushMeshCRef = useRef<THREE.InstancedMesh>(null);

  const tempObject = useMemo(() => new THREE.Object3D(), []);

  // Speed value for movement
  const speedVal = useMemo(() => {
    switch (speed) {
      case 'Slow': return 1.8;
      case 'Medium': return 4.5;
      case 'Fast': return 9.0;
      case 'Reverse': return -2.2;
      case 'Stop':
      default: return 0;
    }
  }, [speed]);

  // Materials & Colors configuration for terrains
  const terrainConfig = useMemo(() => {
    switch (terrain) {
      case 'Mud':
        return {
          color: '#4e3629',
          roughness: 0.95,
          metalness: 0.05,
          wireframe: false,
          bumpScale: 0.08,
          ambientColor: '#2b1b11'
        };
      case 'Stone':
        return {
          color: '#55585d',
          roughness: 0.85,
          metalness: 0.2,
          wireframe: false,
          bumpScale: 0.15,
          ambientColor: '#1d1e20'
        };
      case 'Gravel':
        return {
          color: '#6e6d6c',
          roughness: 0.9,
          metalness: 0.1,
          wireframe: false,
          bumpScale: 0.05,
          ambientColor: '#2d2c2b'
        };
      case 'Bush':
        return {
          color: '#2a4d2a',
          roughness: 0.9,
          metalness: 0.02,
          wireframe: false,
          bumpScale: 0.03,
          ambientColor: '#0f1f0f'
        };
      case 'Water':
        return {
          color: '#1a4c6e',
          roughness: 0.1,
          metalness: 0.9,
          wireframe: false,
          bumpScale: 0.02,
          ambientColor: '#071624'
        };
      case 'Slope':
        return {
          color: '#3d4045',
          roughness: 0.7,
          metalness: 0.3,
          wireframe: false,
          bumpScale: 0.01,
          ambientColor: '#151619'
        };
      case 'Pothole':
        return {
          color: '#343a40',
          roughness: 0.8,
          metalness: 0.1,
          wireframe: false,
          bumpScale: 0.06,
          ambientColor: '#121416'
        };
      case 'Road':
      default:
        return {
          color: '#1c1f22',
          roughness: 0.6,
          metalness: 0.25,
          wireframe: false,
          bumpScale: 0.01,
          ambientColor: '#0a0c0e'
        };
    }
  }, [terrain]);

  // Static items positions for infinite scrolling (Rocks, Bushes)
  const obstaclePositions = useMemo<Obstacle[]>(() => {
    const items: Obstacle[] = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        x: (Math.sin(i * 9.8) * 2.8), // spread across track
        z: (i * 3.5) - 35,
        scale: 0.3 + (Math.cos(i * 1.5) * 0.15 + 0.15),
        rotY: i * 0.45,
        type: i % 2 === 0 ? 'A' : 'B'
      });
    }
    return items;
  }, []);

  const [activeObstacles, setActiveObstacles] = useState<Obstacle[]>(obstaclePositions);

  // Wheel spray particle state
  const particlesRef = useRef<SprayParticle[]>([]);
  const pointsRef = useRef<THREE.Points>(null);

  // Pre-allocated static arrays for particle system (Performance Optimization)
  const positionsArray = useMemo(() => new Float32Array(500 * 3), []);
  const colorsArray = useMemo(() => new Float32Array(500 * 3), []);

  // Update textures and scrolling logic inside useFrame
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // 1. Calculate ground scroll
    scrollOffset.current += speedVal * dt;

    // Direct scroll reference update to share with Rover.tsx
    (window as any).__scrollOffset = scrollOffset.current;

    // Tilt the terrain plane if we are on the slope terrain
    if (groundRef.current) {
      const targetRotationX = terrain === 'Slope' ? 0.22 : 0;
      const targetPositionY = terrain === 'Slope' ? -0.8 : -0.45;
      
      groundRef.current.rotation.x = THREE.MathUtils.lerp(groundRef.current.rotation.x, targetRotationX, dt * 4);
      groundRef.current.position.y = THREE.MathUtils.lerp(groundRef.current.position.y, targetPositionY, dt * 4);
    }

    // 2. Animate scrolling obstacles (Rocks and Bushes)
    setActiveObstacles((prev: Obstacle[]) => {
      return prev.map((obs: Obstacle) => {
        let zWorld = obs.z - speedVal * dt;
        if (zWorld < -35) {
          zWorld = 35 + (zWorld + 35);
        } else if (zWorld > 35) {
          zWorld = -35 + (zWorld - 35);
        }
        return { ...obs, z: zWorld };
      });
    });

    // 3. Render Instanced Obstacles (Performance Optimization)
    if (terrain === 'Stone') {
      if (rockMeshRef.current) {
        activeObstacles.forEach((obs, i) => {
          tempObject.position.set(obs.x, -0.35 + (obs.scale * 0.1), obs.z);
          tempObject.rotation.set(0, obs.rotY, 0);
          tempObject.scale.set(obs.scale, obs.scale * 0.8, obs.scale);
          tempObject.updateMatrix();
          rockMeshRef.current!.setMatrixAt(i, tempObject.matrix);
        });
        rockMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    if (terrain === 'Bush') {
      activeObstacles.forEach((obs, i) => {
        const baseScale = obs.scale;
        
        // Sphere A (Center)
        if (bushMeshARef.current) {
          tempObject.position.set(obs.x, -0.42, obs.z);
          tempObject.scale.set(baseScale * 0.8, baseScale, baseScale * 0.8);
          tempObject.rotation.set(0, obs.rotY, 0);
          tempObject.updateMatrix();
          bushMeshARef.current.setMatrixAt(i, tempObject.matrix);
        }

        // Sphere B (Left side)
        if (bushMeshBRef.current) {
          tempObject.position.set(obs.x + 0.2 * baseScale, -0.42 + 0.2 * baseScale, obs.z + 0.1 * baseScale);
          tempObject.scale.set(baseScale * 0.56, baseScale * 0.7, baseScale * 0.56);
          tempObject.rotation.set(0, obs.rotY, 0);
          tempObject.updateMatrix();
          bushMeshBRef.current.setMatrixAt(i, tempObject.matrix);
        }

        // Sphere C (Right side)
        if (bushMeshCRef.current) {
          tempObject.position.set(obs.x - 0.25 * baseScale, -0.42 + 0.15 * baseScale, obs.z - 0.2 * baseScale);
          tempObject.scale.set(baseScale * 0.64, baseScale * 0.8, baseScale * 0.64);
          tempObject.rotation.set(0, obs.rotY, 0);
          tempObject.updateMatrix();
          bushMeshCRef.current.setMatrixAt(i, tempObject.matrix);
        }
      });

      if (bushMeshARef.current) bushMeshARef.current.instanceMatrix.needsUpdate = true;
      if (bushMeshBRef.current) bushMeshBRef.current.instanceMatrix.needsUpdate = true;
      if (bushMeshCRef.current) bushMeshCRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Wheel Particle Spray Generation
    const shouldSpray = speedVal !== 0 && ['Mud', 'Gravel', 'Water', 'Stone'].includes(terrain);
    
    if (shouldSpray) {
      const wheelOffsets = [
        new THREE.Vector3(0.85, getTerrainHeight(0.85, 0.9, terrain, time, scrollOffset.current), 0.9),  // FL
        new THREE.Vector3(-0.85, getTerrainHeight(-0.85, 0.9, terrain, time, scrollOffset.current), 0.9), // FR
        new THREE.Vector3(0.85, getTerrainHeight(0.85, -0.9, terrain, time, scrollOffset.current), -0.9), // RL
        new THREE.Vector3(-0.85, getTerrainHeight(-0.85, -0.9, terrain, time, scrollOffset.current), -0.9) // RR
      ];

      const spawnChance = speed === 'Fast' ? 0.95 : speed === 'Medium' ? 0.7 : 0.35;
      
      wheelOffsets.forEach(offset => {
        if (Math.random() < spawnChance && particlesRef.current.length < 500) {
          particlesRef.current.push(new SprayParticle(offset, terrain));
        }
      });
    }

    // Update existing particles
    particlesRef.current.forEach(p => p.update(dt));
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Update geometry buffers (Optimized by avoiding garbage collection allocations)
    if (pointsRef.current) {
      const positionAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colorAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
      
      const count = particlesRef.current.length;
      const drawCount = Math.min(count, 500);

      const particleColor = new THREE.Color(
        terrain === 'Water' ? '#bae6fd' : 
        terrain === 'Mud' ? '#271a11' : 
        terrain === 'Gravel' ? '#71717a' : '#52525b'
      );

      for (let i = 0; i < drawCount; i++) {
        const p = particlesRef.current[i];
        positionsArray[i * 3] = p.position.x;
        positionsArray[i * 3 + 1] = p.position.y;
        positionsArray[i * 3 + 2] = p.position.z;

        const fade = p.life / p.maxLife;
        const colorVal = particleColor.clone().multiplyScalar(fade);
        
        colorsArray[i * 3] = colorVal.r;
        colorsArray[i * 3 + 1] = colorVal.g;
        colorsArray[i * 3 + 2] = colorVal.b;
      }

      if (positionAttr && colorAttr) {
        positionAttr.copyArray(positionsArray);
        colorAttr.copyArray(colorsArray);
        
        positionAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        
        pointsRef.current.geometry.setDrawRange(0, drawCount);
      }
    }
  });

  return (
    <group>
      {/* Lights tailored to terrain type */}
      <directionalLight
        castShadow
        position={[8, 12, 5]}
        intensity={terrain === 'Water' ? 1.6 : 1.3}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={45}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <ambientLight intensity={0.4} color={terrainConfig.ambientColor} />

      {/* Main Ground Plane */}
      <mesh 
        ref={groundRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.45, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 70, 1, 1]} />
        <meshStandardMaterial 
          color={terrainConfig.color}
          roughness={terrainConfig.roughness}
          metalness={terrainConfig.metalness}
          wireframe={terrainConfig.wireframe}
          bumpScale={terrainConfig.bumpScale}
        />
      </mesh>

      {/* Water Overlay (Only active for Water terrain) */}
      {terrain === 'Water' && (
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.32, 0]}
        >
          <planeGeometry args={[12, 70]} />
          <meshStandardMaterial 
            color="#2a75a0" 
            transparent 
            opacity={0.65} 
            roughness={0.05} 
            metalness={0.9} 
          />
        </mesh>
      )}

      {/* Grid lines to make it feel like a virtual sim */}
      <gridHelper 
        args={[70, 35, '#00b4d8', 'rgba(0, 180, 216, 0.05)']} 
        position={[0, -0.44, 0]} 
      />

      {/* Optimized Instanced Render of Scrolling Obstacles */}
      {terrain === 'Stone' && (
        <instancedMesh ref={rockMeshRef} args={[undefined as any, undefined as any, activeObstacles.length]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#4a5568" roughness={0.9} metalness={0.1} />
        </instancedMesh>
      )}

      {terrain === 'Bush' && (
        <group>
          <instancedMesh ref={bushMeshARef} args={[undefined as any, undefined as any, activeObstacles.length]} castShadow>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#1e3f20" roughness={0.95} />
          </instancedMesh>
          <instancedMesh ref={bushMeshBRef} args={[undefined as any, undefined as any, activeObstacles.length]} castShadow>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#2d5a27" roughness={0.95} />
          </instancedMesh>
          <instancedMesh ref={bushMeshCRef} args={[undefined as any, undefined as any, activeObstacles.length]} castShadow>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#2f6630" roughness={0.95} />
          </instancedMesh>
        </group>
      )}

      {/* Particle System for wheel spray */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(500 * 3), 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[new Float32Array(500 * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.NormalBlending}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};
