"use client";

import {
  useState
} from "react";
import {
  Bookmark,
  Gauge,
  Info,
  ThumbsUp,
  ThumbsDown,
  Flag,
  X
} from "lucide-react";

interface ShortsMenuSheetProps {
  open: boolean;
  onClose: () => void;
  isSaved: boolean;
  onSave: () => void;
  onPlaybackSpeedChange?: (speed: number) => void;
  currentPlaybackSpeed?: number;
  onReport?: (reason: string) => void;
  onInterested?: () => void;
  onNotInterested?: () => void;
  onWhySeeing?: () => void;
}

export default function ShortsMenuSheet({
  open,
  onClose,
  isSaved,
  onSave,
  onPlaybackSpeedChange,
  currentPlaybackSpeed,
  onReport,
  onInterested,
  onNotInterested,
  onWhySeeing,
}: ShortsMenuSheetProps) {

  const [activeTab, setActiveTab] = useState<'main' | 'playback' | 'report'>('main');

  return (
    <div
      className={`
        fixed bottom-[70px] left-0 right-0 z-[1000]
        rounded-t-[20px] bg-neutral-900 text-white
        transition-all duration-300
        ${open ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-neutral-700">
        <h2 className="text-lg font-semibold">Options</h2>
        <button onClick={onClose} className="p-1 rounded-full bg-neutral-800">
          <X size={20} />
        </button>
      </div>

      <div className="p-2">
        {activeTab === 'main' && (
          <div className="flex flex-col gap-1">
            {onInterested && (
              <button onClick={() => { onInterested(); onClose(); }} className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg">
                <ThumbsUp size={24} />
                Interested
              </button>
            )}
            {onNotInterested && (
              <button onClick={() => { onNotInterested(); onClose(); }} className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg">
                <ThumbsDown size={24} />
                Not interested
              </button>
            )}
            <button onClick={() => { onSave(); onClose(); }} className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg">
              <Bookmark size={24} className={isSaved ? "text-cyan-400" : ""} />
              {isSaved ? "Remove from Saved" : "Save"}
            </button>
            {onPlaybackSpeedChange && (
              <button onClick={() => setActiveTab('playback')} className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg">
                <Gauge size={24} />
                Playback speed
              </button>
            )}
            {onWhySeeing && (
              <button onClick={() => { onWhySeeing(); onClose(); }} className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg">
                <Info size={24} />
                Why you're seeing this post
              </button>
            )}
            {onReport && (
              <button onClick={() => setActiveTab('report')} className="flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg text-red-500">
                <Flag size={24} />
                Report
              </button>
            )}
          </div>
        )}

        {onPlaybackSpeedChange && activeTab === 'playback' && (
          <div className="flex flex-col gap-1">
            <button onClick={() => setActiveTab('main')} className="p-4 mb-2">Back</button>
            {[0.5, 1, 1.5, 2].map(speed => (
              <button 
                key={speed} 
                onClick={() => { onPlaybackSpeedChange(speed); onClose(); setActiveTab('main'); }}
                className={`flex items-center justify-between p-4 hover:bg-neutral-800 rounded-lg ${currentPlaybackSpeed === speed ? 'text-cyan-400' : ''}`}
              >
                {speed}x
                {currentPlaybackSpeed === speed && <span>✓</span>}
              </button>
            ))}
          </div>
        )}

        {onReport && activeTab === 'report' && (
            <div className="flex flex-col gap-1">
                <button onClick={() => setActiveTab('main')} className="p-4 mb-2">Back</button>
                {['Spam', 'Misleading', 'Hate', 'Nudity', 'Violence', 'Copyright', 'Other'].map(reason => (
                    <button 
                        key={reason} 
                        onClick={() => { onReport(reason); onClose(); setActiveTab('main'); }}
                        className="p-4 hover:bg-neutral-800 rounded-lg text-left"
                    >
                        {reason}
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
