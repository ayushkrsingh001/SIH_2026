import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import selfDefenceData from './categories/self_defence.json';
import girlsSafetyData from './categories/girls_safety.json';
import legalAwarenessData from './categories/legal_awareness.json';
import antiBullyingData from './categories/anti_bullying.json';
import touchSafetyData from './categories/touch_safety.json';
import disasterPrepData from './categories/disaster_preparedness.json';
import cyberSafetyData from './categories/cyber_safety.json';
import selfDefenceAdvData from './categories/self_defence_advanced.json';
import girlsSafetyAdvData from './categories/girls_safety_advanced.json';
import type { Badge, Organization } from '../types';

const INITIAL_BADGES: Omit<Badge, 'id'>[] = [
  { title: "First Steps", iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=First&backgroundColor=FFD166", criteriaType: "modules_completed", criteriaValue: 1, description: "Completed your first learning quest!" },
  { title: "Safety Scout", iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=Safety&backgroundColor=EF476F", criteriaType: "modules_completed", criteriaValue: 3, description: "Completed 3 quests!" },
  { title: "Flawless Victory", iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=Perfect&backgroundColor=118AB2", criteriaType: "perfect_score", criteriaValue: 1, description: "Got a 100% score on a quest!" },
  { title: "Dedicated Learner", iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=Streak&backgroundColor=06D6A0", criteriaType: "streak", criteriaValue: 3, description: "Logged in for 3 days in a row!" },
];

const INITIAL_ORGS: Omit<Organization, 'id'>[] = [
  { name: "ChildLine India", type: "Helpline", verified: true, contactInfo: "1098", resourceLinks: ["https://www.childlineindia.org/"], description: "24/7 emergency phone service for children in need of aid and assistance." },
  { name: "National Commission for Women", type: "Helpline", verified: true, contactInfo: "7827170170", resourceLinks: ["http://ncw.nic.in/"], description: "Helpline for women in distress." },
  { name: "Cyber Crime Reporting", type: "LegalAid", verified: true, contactInfo: "1930", resourceLinks: ["https://cybercrime.gov.in/"], description: "National Cyber Crime Reporting Portal." }
];

export const seedDatabase = async () => {
  try {
    console.log("Starting database seed...");
    const batch = writeBatch(db);

    // 0. Cleanup Old Modules (to prevent duplicates and fix broken ones)
    const existingModules = await getDocs(collection(db, 'modules'));
    existingModules.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log("Cleared old modules...");

    // 1. Seed Badges
    const badgeCollection = collection(db, 'badges');
    INITIAL_BADGES.forEach(badge => {
      const docRef = doc(badgeCollection);
      batch.set(docRef, badge);
    });
    console.log("Batched badges...");

    // 2. Seed Organizations
    const orgCollection = collection(db, 'organizations');
    INITIAL_ORGS.forEach(org => {
      const docRef = doc(orgCollection);
      batch.set(docRef, org);
    });
    console.log("Batched orgs...");

    // 3. Load Modules from JSON Data Engine
    const allModulesData = [
      ...selfDefenceData, 
      ...girlsSafetyData, 
      ...legalAwarenessData, 
      ...antiBullyingData,
      ...touchSafetyData,
      ...disasterPrepData,
      ...cyberSafetyData,
      ...selfDefenceAdvData,
      ...girlsSafetyAdvData
    ] as any[];
    
    for (const modData of allModulesData) {
      const { scenes, id, ...moduleInfo } = modData;
      
      // Add Module
      const modDocRef = doc(collection(db, 'modules'));
      batch.set(modDocRef, moduleInfo);
      const newModuleId = modDocRef.id;
      
      console.log(`Batched module: ${moduleInfo.title}`);

      // Add Scenes to subcollection
      const sceneCollection = collection(db, 'modules', newModuleId, 'scenes');
      scenes.forEach((scene: any) => {
        const sceneDocRef = doc(sceneCollection, scene.id);
        
        // Remap the nextSceneId to point to our custom string IDs
        const sceneToSave = {
          ...scene,
          moduleId: newModuleId,
        };
        batch.set(sceneDocRef, sceneToSave);
      });
    }

    console.log("Committing batch...");
    await batch.commit();
    console.log("Database seeded successfully from JSON engine!");
    return true;
  } catch (error) {
    console.error("Error seeding database: ", error);
    return false;
  }
};
