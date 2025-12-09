import * as THREE from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  // The final position in the tree form
  treePosition: THREE.Vector3;
  // The random position in the scattered form
  scatterPosition: THREE.Vector3;
  // Random rotation for variety
  rotation: THREE.Euler;
  // Scale variation
  scale: number;
}

export interface TreeConfig {
  height: number;
  radius: number;
  needleCount: number;
  ornamentCount: number;
}