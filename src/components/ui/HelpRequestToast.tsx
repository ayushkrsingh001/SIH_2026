import toast from 'react-hot-toast';

export const showHelpRequestToast = (actorName: string, category: string, message: string) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-surface-container-lowest shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] pointer-events-auto flex flex-col border border-outline-variant/30 overflow-hidden mt-4`}
      >
        <div className="p-6 bg-error/10 border-b border-error/20 flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-error/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-error text-on-error rounded-[18px] shadow-sm flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">emergency</span>
            </div>
            <div>
              <h3 className="font-headline text-headline-sm text-error leading-tight mb-1">Help Request</h3>
              <p className="font-body text-body-md text-error/80 font-medium">From <span className="font-bold">{actorName}</span></p>
            </div>
          </div>
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full text-error hover:bg-white hover:shadow-sm transition-all relative z-10 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div className="p-6 md:p-8 space-y-6 bg-[#FDFBF7]">
          <div>
            <span className="font-body text-label-sm text-on-surface-variant uppercase tracking-wider font-bold mb-2 block">Category</span>
            <div className="font-body text-title-md text-on-surface capitalize font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                 <span className="material-symbols-outlined text-[16px] filled">label</span>
              </div>
              {category.replace('_', ' ')}
            </div>
          </div>
          
          <div>
            <span className="font-body text-label-sm text-on-surface-variant uppercase tracking-wider font-bold mb-2 block">Child's Message</span>
            <div className="bg-white border-2 border-outline-variant/50 p-5 rounded-[24px] shadow-sm relative">
              <span className="material-symbols-outlined absolute -top-3 -left-2 text-3xl text-surface-dim bg-[#FDFBF7] rounded-full px-1">format_quote</span>
              <p className="font-body text-body-lg text-on-surface italic leading-relaxed pt-2">
                "{message}"
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => toast.dismiss(t.id)} 
            className="w-full py-4 bg-error text-on-error rounded-full font-headline text-title-lg shadow-sm hover:bg-error/90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all border-b-4 border-on-error-container btn-tactile"
          >
            Take Action Now
          </button>
        </div>
      </div>
    ),
    { 
      duration: Infinity, // Require manual dismissal
      position: 'top-center'
    }
  );
};
