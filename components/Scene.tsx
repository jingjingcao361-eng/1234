import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeMorphState } from '../types';
import { TreeExperience } from './TreeExperience';
import { COLORS } from '../constants';

interface SceneProps {
  treeState: TreeMorphState;
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]} // Handle high DPI screens
      gl={{ 
        antialias: false, 
        toneMappingExposure: 1.5, 
        stencil: false, 
        depth: true 
      }}
      shadows
    >
      <PerspectiveCamera makeDefault position={[0, 2, 18]} fov={45} />
      
      {/* Lighting Setup for Dramatic Luxury */}
      <ambientLight intensity={0.2} color={COLORS.ambient} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color={COLORS.gold} 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#00ffcc" />
      <pointLight position={[0, -5, 5]} intensity={0.5} color={COLORS.gold} />

      <Suspense fallback={null}>
        <group position={[0, -4, 0]}>
          <TreeExperience treeState={treeState} />
        </group>
        
        {/* Environment for shiny metallic reflections */}
        <Environment preset="city" /> 
      </Suspense>

      <OrbitControls 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5} 
        maxPolarAngle={Math.PI / 1.5}
        minDistance={5}
        maxDistance={30}
      />

      {/* Cinematic Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} // Only very bright things glow
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};