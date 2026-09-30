import { motion } from "framer-motion";

export default function SponsoredOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 text-white backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 flex flex-col items-center"
      >
        <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20" />
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.4)]">
                <span className="text-4xl">▶</span>
            </div>
        </div>
        <h2 className="text-4xl font-black tracking-tight text-center">Sponsored Ad</h2>
        <p className="mt-4 text-white/60 font-semibold text-lg text-center max-w-[280px]">
            Please wait while the sponsored video loads...
        </p>
      </motion.div>
    </div>
  );
}
