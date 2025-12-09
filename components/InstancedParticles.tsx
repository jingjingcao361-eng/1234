import React, { useRef, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState, ParticleData } from '../types';
import { COLORS, TRANSITION_SPEED } from '../constants';

interface InstancedParticlesProps {
  data: ParticleData[];
  treeState: TreeMorphState;
  type: 'NEEDLE' | 'ORNAMENT';
}

export const InstancedParticles: React.FC<InstancedParticlesProps> = ({ data, treeState, type }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Helper object to calculate matrices without creating new objects per frame
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Store current animated positions to allow smooth interruption of animations
  const currentPositions = useMemo(() => {
    return new Float32Array(data.length * 3);
  }, [data]);

  // Initial layout
  useLayoutEffect(() => {
    if (meshRef.current) {
      data.forEach((particle, i) => {
        // Initialize at scatter position
        particle.scatterPosition.toArray(currentPositions, i * 3);
        dummy.position.copy(particle.scatterPosition);
        dummy.rotation.copy(particle.rotation);
        dummy.scale.setScalar(particle.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, dummy, currentPositions]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    data.forEach((particle, i) => {
      // 1. Determine Target
      const target = treeState === TreeMorphState.TREE_SHAPE 
        ? particle.treePosition 
        : particle.scatterPosition;

      // 2. Interpolate Current Position towards Target
      // We read from our Float32Array cache, damp it, and write back
      const x = currentPositions[i * 3];
      const y = currentPositions[i * 3 + 1];
      const z = currentPositions[i * 3 + 2];

      // Smooth step using Three's built-in damp
      const nextX = THREE.MathUtils.damp(x, target.x, 2, delta);
      const nextY = THREE.MathUtils.damp(y, target.y, 2, delta);
      const nextZ = THREE.MathUtils.damp(z, target.z, 2, delta);

      // Write back to cache
      currentPositions[i * 3] = nextX;
      currentPositions[i * 3 + 1] = nextY;
      currentPositions[i * 3 + 2] = nextZ;

      // 3. Update Matrix
      dummy.position.set(nextX, nextY, nextZ);
      
      if (type === 'NEEDLE') {
          // Reset to base rotation
          dummy.rotation.copy(particle.rotation);
          
          if (treeState === TreeMorphState.TREE_SHAPE) {
             // Subtle wind effect in tree mode
             dummy.rotation.z += Math.sin(time * 2 + i) * 0.05;
          } else {
             // Constant tumble in scatter mode using time
             // We use time + i to give each particle a unique phase/offset
             dummy.rotation.x += time * 0.5 + i * 0.1;
             dummy.rotation.z += time * 0.3 + i * 0.1;
          }
      } else {
          // Ornaments stay upright but maybe Bob slightly?
          dummy.rotation.set(0, 0, 0);
          if (treeState === TreeMorphState.SCATTERED) {
            dummy.rotation.x = time * 0.2 + i;
            dummy.rotation.y = time * 0.2;
          }
      }

      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Geometry and Material Selection
  const geometry = useMemo(() => {
    if (type === 'NEEDLE') {
        return new THREE.ConeGeometry(0.1, 0.8, 3); 
    }
    return new THREE.SphereGeometry(0.25, 16, 16);
  }, [type]);

  const material = useMemo(() => {
    if (type === 'NEEDLE') {
      return new THREE.MeshStandardMaterial({
        color: COLORS.emerald,
        roughness: 0.3,
        metalness: 0.4,
        emissive: COLORS.emeraldDark,
        emissiveIntensity: 0.2,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      roughness: 0.1, // Very shiny
      metalness: 0.95, // High metal
      emissive: COLORS.goldHighlight,
      emissiveIntensity: 0.1,
    });
  }, [type]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      castShadow
      receiveShadow
    />
  );
};