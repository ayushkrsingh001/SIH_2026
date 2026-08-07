import { addModule, addScene, getModules, deleteModule, getDocs, collection, deleteDoc } from '../firebase/firestore';
import { db } from '../firebase/config';
import { world1Modules, world1Scenes } from '../data/world1';
import { world2Modules, world2Scenes } from '../data/world2';
import { world3Modules, world3Scenes } from '../data/world3';
import { world4Modules, world4Scenes } from '../data/world4';
import { world5Modules, world5Scenes } from '../data/world5';
import toast from 'react-hot-toast';

export const seedCompleteGame = async () => {
  try {
    toast.loading('Clearing old modules...', { id: 'seedMaster' });
    const existingModules = await getModules();
    for (const mod of existingModules) {
      if (mod.id) {
        // We also need to delete the scenes subcollection if we wanted to be thorough, 
        // but for a demo, deleting the module doc is a start. Let's try to delete scenes too.
        const scenesSnapshot = await getDocs(collection(db, 'modules', mod.id, 'scenes'));
        for (const sceneDoc of scenesSnapshot.docs) {
          await deleteDoc(sceneDoc.ref);
        }
        await deleteModule(mod.id);
      }
    }

    const allModules = [
      ...world1Modules,
      ...world2Modules,
      ...world3Modules,
      ...world4Modules,
      ...world5Modules
    ];

    const allScenes = {
      ...world1Scenes,
      ...world2Scenes,
      ...world3Scenes,
      ...world4Scenes,
      ...world5Scenes
    };

    let prevModuleId: string | null = null;
    let count = 0;

    for (const mod of allModules) {
      count++;
      toast.loading(`Creating Module ${count}/50: ${mod.title}...`, { id: 'seedMaster' });
      
      // Update the prerequisite to properly point to the previously created module
      const moduleToCreate = {
        ...mod,
        prerequisiteModuleId: prevModuleId
      };

      const newModuleId = await addModule(moduleToCreate);
      prevModuleId = newModuleId;

      // Add scenes for this module
      const scenes = allScenes[mod.order];
      if (scenes && scenes.length > 0) {
        // Link scenes in a chain
        let prevSceneId: string | null = null;
        const createdSceneIds: string[] = [];

        // We create them in order, then update the previous one to point to the current one
        for (let i = 0; i < scenes.length; i++) {
          const sceneData = scenes[i];
          sceneData.order = i + 1;
          const sceneId = await addScene(newModuleId, sceneData);
          createdSceneIds.push(sceneId);
          
          if (prevSceneId) {
            // In a real app we'd use updateScene, but here we can just let ScenarioPlayer go by order.
            // Wait, we need an `updateScene` function in firestore.ts to link them if we want nextSceneId to work.
            // Let's import it dynamically to avoid cycle issues.
            const { updateScene } = await import('../firebase/firestore');
            await updateScene(newModuleId, prevSceneId, { nextSceneId: sceneId });
          }
          prevSceneId = sceneId;
        }
      }
    }

    toast.success('Successfully generated 50 Levels and 250+ Scenes!', { id: 'seedMaster' });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('Seed Error:', error);
    toast.error('Failed to seed game.', { id: 'seedMaster' });
  }
};
