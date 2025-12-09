import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState, ParticleData } from '../types';
import { CONFIG } from '../constants';
import { InstancedParticles } from './InstancedParticles';

interface TreeExperienceProps {
  treeState: TreeMorphState;
}

// Helper to generate random points in a sphere
const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Helper to generate points on a cone surface (The Tree)
const getConePoint = (height: number, maxRadius: number, verticalBias: number): THREE.Vector3 => {
  // verticalBias 0 to 1. Higher value = point is higher up the tree.
  const y = verticalBias * height;
  const currentRadius = maxRadius * (1 - verticalBias); // Radius shrinks as we go up
  const angle = Math.random() * Math.PI * 2;
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;
  
  // Add slight noise so it's not a perfect geometric cone
  const noise = 0.2;
  return new THREE.Vector3(
    x + (Math.random() - 0.5) * noise,
    y,
    z + (Math.random() - 0.5) * noise
  );
};

export const TreeExperience: React.FC<TreeExperienceProps> = ({ treeState }) => {
  
  // 1. Generate Needle Data (The Greenery)
  const needleData = useMemo(() => {
    const data: ParticleData[] = [];
    for (let i = 0; i < CONFIG.needleCount; i++) {
      const verticalBias = Math.pow(Math.random(), 0.8); // Bias slightly towards bottom for volume
      
      data.push({
        treePosition: getConePoint(CONFIG.treeHeight, CONFIG.treeRadius, verticalBias),
        scatterPosition: getRandomSpherePoint(CONFIG.scatterRadius),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.5 + Math.random() * 1.5,
      });
    }
    return data;
  }, []);

  // 2. Generate Ornament Data (The Gold)
  const ornamentData = useMemo(() => {
    const data: ParticleData[] = [];
    for (let i = 0; i < CONFIG.ornamentCount; i++) {
      const verticalBias = Math.random();
      
      // Ornaments sit slightly outside the needles
      const treePos = getConePoint(CONFIG.treeHeight, CONFIG.treeRadius + 0.2, verticalBias);
      
      data.push({
        treePosition: treePos,
        scatterPosition: getRandomSpherePoint(CONFIG.scatterRadius * 1.2),
        rotation: new THREE.Euler(0, 0, 0), // Spheres don't need much rotation logic
        scale: 0.8 + Math.random() * 1.2,
      });
    }
    return data;
  }, []);

  return (
    <>
      {/* The Emerald Needles */}
      <InstancedParticles 
        data={needleData} 
        treeState={treeState} 
        type="NEEDLE"
      />
      
      {/* The Gold Ornaments */}
      <InstancedParticles 
        data={ornamentData} 
        treeState={treeState} 
        type="ORNAMENT"
      />

      {/* The Star Top - A standalone mesh that also scatters */}
      <TopStar treeState={treeState} />
    </>
  );
};

// Mini component for the star
const TopStar: React.FC<{ treeState: TreeMorphState }> = ({ treeState }) => {
   const meshRef = useRef<THREE.Mesh>(null);
   const targetPos = useMemo(() => new THREE.Vector3(0, CONFIG.treeHeight + 0.5, 0), []);
   const scatterPos = useMemo(() => getRandomSpherePoint(CONFIG.scatterRadius), []);
   
   useFrame((state, delta) => {
      if(!meshRef.current) return;
      
      const target = treeState === TreeMorphState.TREE_SHAPE ? targetPos : scatterPos;
      
      // Smooth interpolation
      meshRef.current.position.lerp(target, 2 * delta);
      
      // Constant rotation
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
   });

   return (
     <mesh ref={meshRef} position={[0, CONFIG.treeHeight, 0]}>
       <octahedronGeometry args={[0.8, 0]} />
       <meshStandardMaterial 
         color="#FFD700" 
         emissive="#FFD700" 
         emissiveIntensity={2} 
         roughness={0} 
         metalness={1} 
       />
       <pointLight color="#FFD700" distance={8} intensity={5} decay={2} />
     </mesh>
   );
};