import { useRef } from 'react';
import { Box, Maximize2, Play } from 'lucide-react';
import { BaseCard } from '../ui/BaseCard';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface SimulationCardProps {
  status: string;
  suspension: string;
  driveMode: string;
  terrain: string;
  severity: string;
  animation?: string;
}

const Tire = ({ isRight, glowColor }: { isRight: boolean, glowColor: string }) => {
  const treads = [];
  const treadCount = 12;
  for (let i = 0; i < treadCount; i++) {
    const angle = (i / treadCount) * Math.PI * 2;
    treads.push(
      <mesh 
        key={i} 
        position={[0, Math.sin(angle) * 0.45, Math.cos(angle) * 0.45]}
        rotation={[angle, 0, 0]}
      >
        <boxGeometry args={[0.26, 0.06, 0.12]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
    );
  }

  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.25, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      <mesh position={[isRight ? -0.13 : 0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 12]} />
        <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.2} />
      </mesh>

      <mesh position={[isRight ? -0.16 : 0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
        <meshStandardMaterial 
          color="#090d16"
          emissive={glowColor} 
          emissiveIntensity={1.5} 
        />
      </mesh>

      {treads}
    </group>
  );
};

const VehicleModel = ({ suspension, severity, animation = 'normal', driveMode }: { suspension: string, severity: string, animation?: string, driveMode: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const targetY = suspension === 'MAXIMUM' ? 1.5 : (suspension === 'HIGH' ? 1.0 : (suspension === 'MEDIUM' ? 0.7 : 0.5));
  const shakeIntensity = severity === 'Critical' ? 0.1 : (severity === 'High' ? 0.05 : (severity === 'Medium' ? 0.02 : 0));

  const getGlowColor = () => {
    switch (driveMode) {
      case '4WD': return '#00b4d8';
      case 'AWD': return '#06d6a0';
      case '2WD': return '#7209b7';
      default: return '#00b4d8';
    }
  };

  const glowColor = getGlowColor();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
      
      if (shakeIntensity > 0) {
        groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 20) * shakeIntensity;
        groupRef.current.position.z = Math.cos(state.clock.elapsedTime * 25) * shakeIntensity;
      } else {
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1);
      }
      
      if (animation === 'lift_front') {
         groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -0.2, 0.1);
      } else if (animation === 'medium_bounce') {
         groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 15) * 0.03;
         groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      } else {
         groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      }

      // Rotate wheels slowly for the preview
      groupRef.current.children.forEach((child) => {
        if (child.name === 'wheel') {
           child.children[0].rotation.x += 0.02;
        }
      });
    }
  });

  const htmlStyle = {
    fontFamily: 'monospace',
    fontSize: '9px',
    color: glowColor,
    background: 'rgba(5, 6, 8, 0.85)',
    border: `1px solid ${glowColor}`,
    padding: '2px 4px',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const
  };

  return (
    <group ref={groupRef} position={[0, 0.5, 0]} scale={0.75}>
      {/* Wheels */}
      <group position={[0.85, 0, 0.9]} name="wheel">
        <group><Tire isRight={false} glowColor={glowColor} /></group>
        <Html position={[0, 0.6, 0]} distanceFactor={6} center>
          <div style={htmlStyle}>FL_DRV: {driveMode === '2WD' ? 'OFF' : 'ON'}</div>
        </Html>
      </group>
      <group position={[-0.85, 0, 0.9]} name="wheel">
        <group><Tire isRight={true} glowColor={glowColor} /></group>
        <Html position={[0, 0.6, 0]} distanceFactor={6} center>
          <div style={htmlStyle}>FR_DRV: {driveMode === '2WD' ? 'OFF' : 'ON'}</div>
        </Html>
      </group>
      <group position={[0.85, 0, -0.9]} name="wheel">
        <group><Tire isRight={false} glowColor={glowColor} /></group>
        <Html position={[0, -0.6, 0]} distanceFactor={6} center>
          <div style={htmlStyle}>RL_DRV: ON</div>
        </Html>
      </group>
      <group position={[-0.85, 0, -0.9]} name="wheel">
        <group><Tire isRight={true} glowColor={glowColor} /></group>
        <Html position={[0, -0.6, 0]} distanceFactor={6} center>
          <div style={htmlStyle}>RR_DRV: ON</div>
        </Html>
      </group>

      {/* Suspension Wishbones */}
      <group>
        <mesh position={[0.65, 0.05, 0.9]} rotation={[0, 0, 0.2]}><cylinderGeometry args={[0.03, 0.03, 0.4, 8]} /><meshStandardMaterial color="#4a5568" /></mesh>
        <mesh position={[-0.65, 0.05, 0.9]} rotation={[0, 0, -0.2]}><cylinderGeometry args={[0.03, 0.03, 0.4, 8]} /><meshStandardMaterial color="#4a5568" /></mesh>
        <mesh position={[0.65, 0.05, -0.9]} rotation={[0, 0, 0.2]}><cylinderGeometry args={[0.03, 0.03, 0.4, 8]} /><meshStandardMaterial color="#4a5568" /></mesh>
        <mesh position={[-0.65, 0.05, -0.9]} rotation={[0, 0, -0.2]}><cylinderGeometry args={[0.03, 0.03, 0.4, 8]} /><meshStandardMaterial color="#4a5568" /></mesh>
      </group>

      {/* Chassis Body */}
      <group>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.35, 2.0]} />
          <meshStandardMaterial color="#2b2d31" metalness={0.8} roughness={0.3} />
        </mesh>

        <mesh castShadow position={[0, 0.1, 0.2]}>
          <boxGeometry args={[0.9, 0.22, 1.4]} />
          <meshStandardMaterial color="#1a1c1e" metalness={0.9} roughness={0.25} />
        </mesh>

        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.8, 0.05, 1.9]} />
          <meshStandardMaterial color="#0c0d0f" roughness={0.9} />
        </mesh>

        <group position={[0, 0.05, 1.15]}>
          <mesh position={[0.25, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[-0.25, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
          </mesh>
        </group>

        <group position={[0, 0.15, -0.2]}>
          <mesh>
            <boxGeometry args={[0.5, 0.15, 0.5]} />
            <meshStandardMaterial color="#0c0d0f" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.35, 0.14, 0.35]} />
            <meshStandardMaterial color="#020305" emissive={glowColor} />
          </mesh>
          <Html position={[0, 0.25, 0]} distanceFactor={6} center>
            <div style={{...htmlStyle, color: glowColor, border: 'none', background: 'transparent', fontWeight: 'bold'}}>
              AI_CORE_ACTIVE
            </div>
          </Html>
        </group>

        <group position={[0, 0.3, 0.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.1, 16]} />
            <meshStandardMaterial color="#1a1c1e" metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.12, 16]} />
            <meshStandardMaterial color="#2d3748" metalness={0.9} />
            <mesh position={[0, 0, 0.11]}>
              <boxGeometry args={[0.04, 0.04, 0.02]} />
              <meshStandardMaterial color="#ef476f" emissive="#ef476f" emissiveIntensity={2.0} />
            </mesh>
          </mesh>
        </group>

        <group position={[0.25, 0.25, -0.8]}>
          <mesh castShadow position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.005, 0.015, 0.8, 8]} />
            <meshStandardMaterial color="#4a5568" roughness={0.3} />
            <mesh position={[0, 0.41, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color="#ef476f" />
            </mesh>
          </mesh>
        </group>

        <Html position={[0, -0.4, 0]} distanceFactor={6} center>
          <div style={{...htmlStyle, color: '#a0aec0', borderColor: 'rgba(255, 255, 255, 0.1)'}}>
            SUSP: {suspension} (0cm)
          </div>
        </Html>
      </group>
    </group>
  );
};

export const SimulationCard = ({ status, suspension, driveMode, terrain, severity, animation = 'normal' }: SimulationCardProps) => (
  <BaseCard title="DIGITAL TWIN" icon={Box} className="h-full flex flex-col">
    {/* Top: Simulation Status */}
    <div className="flex items-center gap-2 mb-6 text-[13px] tracking-wider uppercase font-mono mt-0">
      <span className="w-2 h-2 rounded-full bg-automotive-green animate-pulse"></span>
      <span className="text-automotive-green font-bold">{status}</span>
    </div>

    {/* Center: Large simulation viewport */}
    <div className="flex-1 bg-automotive-black rounded-lg border border-automotive-gray/30 relative flex flex-col min-h-[300px] w-full h-full overflow-hidden">
      <Canvas camera={{ position: [4, 2.5, 4], fov: 50 }}>
        <color attach="background" args={['#050810']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Environment preset="city" />
        
        <VehicleModel suspension={suspension} severity={severity} animation={animation} driveMode={driveMode} />
        
        <Grid 
          renderOrder={-1} 
          position={[0, 0, 0]} 
          infiniteGrid 
          cellSize={1} 
          cellThickness={0.5} 
          sectionSize={3} 
          sectionThickness={1} 
          sectionColor="#00b4d8" 
          cellColor="#00667a"
          fadeDistance={30} 
        />
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
      
      {/* Centered label */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1.5 rounded text-automotive-gray text-[10px] uppercase tracking-widest font-mono font-[600]">
        3D Simulation Preview
      </div>
    </div>

    {/* Bottom: Vehicle State */}
    <div className="mt-6 grid grid-cols-2 gap-4 text-[12px] uppercase tracking-wider font-mono">
      <div className="bg-automotive-dark/60 p-3 rounded-lg border border-automotive-gray/20 flex flex-col gap-1">
        <div className="text-automotive-gray/80 text-[10px]">Suspension</div>
        <div className="text-automotive-blue font-[700] text-[13px]">{suspension}</div>
      </div>
      <div className="bg-automotive-dark/60 p-3 rounded-lg border border-automotive-gray/20 flex flex-col gap-1">
        <div className="text-automotive-gray/80 text-[10px]">Drive Mode</div>
        <div className="text-automotive-blue font-[700] text-[13px]">{driveMode}</div>
      </div>
      <div className="bg-automotive-dark/60 p-3 rounded-lg border border-automotive-gray/20 flex flex-col gap-1">
        <div className="text-automotive-gray/80 text-[10px]">Terrain</div>
        <div className="text-automotive-blue font-[700] text-[13px]">{terrain}</div>
      </div>
      <div className="bg-automotive-dark/60 p-3 rounded-lg border border-automotive-gray/20 flex flex-col gap-1">
        <div className="text-automotive-gray/80 text-[10px]">Severity</div>
        <div className="text-automotive-blue font-[700] text-[13px]">{severity}</div>
      </div>
    </div>

    {/* Bottom Buttons */}
    <div className="mt-6 flex gap-4 w-full">
      <button className="flex-1 h-11 flex items-center justify-center gap-2 bg-automotive-dark hover:bg-automotive-gray/20 text-automotive-white border border-automotive-gray/30 rounded text-[13px] tracking-widest uppercase transition-colors font-[600]">
        <Play className="w-4 h-4" /> Open Simulation
      </button>
      <button className="h-11 w-11 flex items-center justify-center bg-automotive-dark hover:bg-automotive-gray/20 text-automotive-white border border-automotive-gray/30 rounded transition-colors">
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  </BaseCard>
);
