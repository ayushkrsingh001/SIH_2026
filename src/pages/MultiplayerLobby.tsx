import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChild } from '../contexts/ChildContext';
import toast from 'react-hot-toast';

const MultiplayerLobby = () => {
  const { activeChild } = useChild();
  const [joinCode, setJoinCode] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleHost = () => {
    // Mock generating a code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
    setIsHosting(true);
  };

  const handleJoin = () => {
    if (joinCode.length !== 6) {
      toast.error('Invalid Room Code');
      return;
    }
    toast.success('Joining room...');
    // Mock join delay
    setTimeout(() => {
      toast.error('Room not found or game already started!');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 md:px-0">
      <div className="text-center mb-10">
        <h1 className="font-headline text-headline-md text-on-surface flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary">swords</span>
          Quiz Battle
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant mt-2">Challenge your friends or family in real-time!</p>
      </div>

      <AnimatePresence mode="wait">
        {!isHosting ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Host Card */}
            <div className="bg-primary-container text-on-primary-container p-8 rounded-[32px] shadow-card flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-6xl mb-4 filled">add_circle</span>
              <h2 className="font-headline text-title-lg mb-2">Create a Room</h2>
              <p className="font-body text-body-md opacity-90 mb-8">Host a Quiz Battle and invite your friends to join using a secret code.</p>
              <button 
                onClick={handleHost}
                className="bg-primary text-on-primary w-full py-4 rounded-full font-body text-label-lg btn-tactile border-b-4 border-on-primary-fixed-variant"
              >
                Host Game
              </button>
            </div>

            {/* Join Card */}
            <div className="bg-surface-container-lowest p-8 rounded-[32px] shadow-card flex flex-col items-center text-center border-2 border-surface-dim">
              <span className="material-symbols-outlined text-6xl mb-4 text-secondary filled">login</span>
              <h2 className="font-headline text-title-lg text-on-surface mb-2">Join a Room</h2>
              <p className="font-body text-body-md text-on-surface-variant mb-6">Got a room code from a friend? Enter it below to join their game.</p>
              
              <div className="w-full flex flex-col gap-4">
                <input 
                  type="text" 
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="6-DIGIT CODE"
                  className="w-full h-14 bg-surface-bright border-2 border-outline-variant rounded-[16px] text-center font-headline text-title-lg tracking-widest uppercase focus:border-secondary transition-colors outline-none"
                />
                <button 
                  onClick={handleJoin}
                  className="bg-secondary text-on-secondary w-full py-4 rounded-full font-body text-label-lg btn-tactile border-b-4 border-[#006b5a]"
                >
                  Join Game
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest p-8 rounded-[32px] shadow-card max-w-2xl mx-auto border-2 border-surface-dim"
          >
            <button onClick={() => setIsHosting(false)} className="mb-6 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-body text-label-md">Back</span>
            </button>
            
            <div className="text-center mb-8">
              <h2 className="font-headline text-title-lg text-on-surface mb-2">Waiting for players...</h2>
              <p className="font-body text-body-md text-on-surface-variant mb-4">Share this code with your friends!</p>
              
              <div className="bg-surface-bright border-4 border-primary/20 rounded-[24px] py-6 px-10 inline-block">
                <span className="font-headline text-display-lg tracking-[0.2em] text-primary">{generatedCode}</span>
              </div>
            </div>
            
            <div className="bg-surface-container-high rounded-[24px] p-6 mb-8">
              <h3 className="font-headline text-title-md text-on-surface mb-4">Players in Room (1/4)</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-xl border-2 border-primary">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <span className="font-body text-label-md text-on-surface">{activeChild?.displayName} (You)</span>
                  <span className="ml-auto bg-primary-container text-on-primary-container px-2 py-1 rounded text-xs font-bold uppercase">Host</span>
                </div>
                {/* Mock empty slots */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 border-2 border-dashed border-outline-variant p-3 rounded-xl opacity-50">
                     <span className="material-symbols-outlined">hourglass_empty</span>
                     <span className="font-body text-label-md">Waiting...</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="bg-primary text-on-primary w-full py-4 rounded-full font-body text-label-lg btn-tactile border-b-4 border-on-primary-fixed-variant disabled:opacity-50"
            >
              Start Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiplayerLobby;
