import type { Module, Scene } from '../types';
import { world1Modules, world1Scenes } from './world1';
import { world2Modules, world2Scenes } from './world2';
import { world3Modules, world3Scenes } from './world3';
import { world4Modules, world4Scenes } from './world4';
import { world5Modules, world5Scenes } from './world5';

const rawModules = [
  ...world1Modules,
  ...world2Modules,
  ...world3Modules,
  ...world4Modules,
  ...world5Modules
];

const rawScenes = {
  ...world1Scenes,
  ...world2Scenes,
  ...world3Scenes,
  ...world4Scenes,
  ...world5Scenes
};

// Generate deterministic IDs based on the level order (1 to 50)
export const allLocalModules: Module[] = rawModules.map(mod => ({
  ...mod,
  id: `level_${mod.order}`
}));

// Helper to get scenes for a specific module ID
export const getLocalScenes = (moduleId: string): Scene[] => {
  // Extract the order from the ID (e.g., "level_5" -> 5)
  const orderMatch = moduleId.match(/level_(\d+)/);
  if (!orderMatch) return [];
  
  const order = parseInt(orderMatch[1], 10);
  const scenesForModule = rawScenes[order];
  
  if (!scenesForModule) return [];

  // Map them to include proper IDs and nextSceneIds
  return scenesForModule.map((scene, idx) => {
    const sceneId = `${moduleId}_scene_${idx + 1}`;
    const nextSceneId = idx < scenesForModule.length - 1 ? `${moduleId}_scene_${idx + 2}` : null;
    
    return {
      ...scene,
      id: sceneId,
      moduleId: moduleId,
      order: idx + 1,
      // For choice types, we should theoretically update the choices array if they navigate anywhere else,
      // but the engine currently just uses nextSceneId from the scene itself if choice.nextSceneId is null.
      // Wait, let's ensure choices have the correct nextSceneId fallback.
      choices: scene.choices?.map(c => ({
        ...c,
        nextSceneId: c.nextSceneId || nextSceneId
      })) || [],
      nextSceneId: nextSceneId
    } as Scene;
  });
};
