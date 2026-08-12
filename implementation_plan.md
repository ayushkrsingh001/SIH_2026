# Goal Description
Build a complete "Rights Detective" puzzle game for the RightsQuest platform. This will be a gamified legal-awareness investigation mode where children play as young detectives. They will explore scenes, discover clues, solve drag-and-drop puzzles, and learn about real-life child safety and rights.

The game will feature 15 sequentially unlocking cases, utilizing a Candy Crush-style progression map, and integrate seamlessly with the existing child XP/leveling and Firebase systems.

## User Review Required
- The implementation is quite large. Please review the proposed file structure and data schemas before I begin execution.
- I will be generating some placeholder images for the investigation scenes using the AI image generation tool unless you have existing assets you'd prefer me to use.

## Open Questions
- Do you have a specific detective mascot image you would like me to use, or should I just re-use the existing MASCOT_URL?
- Do you want me to generate the investigation scene images using DALL-E, or would you prefer a more stylized vector approach using Framer Motion and CSS?

## Proposed Changes

### 1. Types & Data
#### [MODIFY] src/types/index.ts
- Add `DetectiveCase`, `DetectiveScene`, `DetectiveClue`, `DetectivePuzzle`, `DetectiveProgress` interfaces.

#### [NEW] src/data/rightsDetectiveCases.ts
- Define the array of 15 fully structured cases covering topics like School Bullying, Cyberbullying, Privacy, Stranger Danger, Road Safety, and more.
- Each case will have scenes, clues, and 2-3 interactive drag-and-drop puzzles.

### 2. Firebase Integration
#### [MODIFY] src/firebase/firestore.ts
- Add functions to save and retrieve detective progress under a new collection path: `parents/{parentId}/children/{childId}/detectiveProgress/{caseId}`.
- Function to update the child's overall XP and level when a case is solved.

### 3. Routing & Navigation
#### [MODIFY] src/App.tsx
- Add lazy-loaded routes:
  - `/play/:childId/detective` -> `RightsDetectiveHome`
  - `/play/:childId/detective/:caseId` -> `RightsDetectiveCase`

#### [MODIFY] src/layouts/ChildLayout.tsx
- Add the "Rights Detective" entry to the child's navigation bar.

### 4. New Pages & Components
#### [NEW] src/pages/RightsDetectiveHome.tsx
- Landing page and Candy Crush-style map.
- Calculates which cases are locked/unlocked based on progress.

#### [NEW] src/pages/RightsDetectiveCase.tsx
- The main gameplay controller.
- Handles the state machine: `STORY` -> `INVESTIGATION` -> `PUZZLE_1` -> `PUZZLE_2` -> `COMPLETED`.

#### [NEW] src/components/game/rights-detective/StoryView.tsx
- Displays the narrative setup for the case.

#### [NEW] src/components/game/rights-detective/InvestigationView.tsx
- The interactive scene where the child clicks around to find clues.
- Includes a `ClueBook` drawer.

#### [NEW] src/components/game/rights-detective/ActionSortPuzzle.tsx
- Drag-and-drop puzzle to sort Safe vs Unsafe actions.

#### [NEW] src/components/game/rights-detective/SequencePuzzle.tsx
- Drag-and-drop puzzle to arrange safe actions in the correct order.

#### [NEW] src/components/game/rights-detective/CaseComplete.tsx
- The victory screen showing clues found, XP earned, and unlocking the next case.

## Verification Plan
### Automated Tests
- TypeScript compiler (`npx tsc --noEmit`) to verify strict typing of the massive 15-case data structure.
- Vite build to ensure all lazy loaded routes resolve correctly.

### Manual Verification
- Navigate to the Child Panel and enter "Rights Detective".
- Verify Case 01 is unlocked and Case 02 is locked.
- Play through Case 01 (find 3 clues, complete 2 drag-and-drop puzzles).
- Verify XP is correctly awarded and Case 02 unlocks.
- Refresh the page and verify progress is preserved from Firebase.
