import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Globe,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Capsule } from '../types';
import { CountdownClock } from './CountdownClock';
import { getSynchronizedNow } from '../utils/timeSync';

interface CapsuleDetailsModalProps {
  capsule: Capsule | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCapsule?: (capsule: Capsule) => void;
}

export const CapsuleDetailsModal: React.FC<CapsuleDetailsModalProps> = ({
  capsule,
  isOpen,
  onClose,
  onOpenCapsule,
}) => {
  const [isReadyToOpen, setIsReadyToOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!capsule) return;
    const checkArrival = () => {
      const arrived = new Date(capsule.opening_date).getTime() <= getSynchronizedNow();
      setIsReadyToOpen(arrived);
    };

    checkArrival();
    const interval = setInterval(checkArrival, 1000);
    return () => clearInterval(interval);
  }, [capsule]);

  if (!isOpen || !capsule) return null;

  const isAlreadyOpened = capsule.status === 'opened';
  const isReady = capsule.status === 'locked' && isReadyToOpen;
  const isLocked = capsule.status === 'locked' && !isReadyToOpen;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#0D121F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto z-10 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Status & Category */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {capsule.category}
          </span>

          {isAlreadyOpened ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Unlock className="w-3.5 h-3.5" />
              <span>VAULT UNLOCKED & ACCESSIBLE</span>
            </span>
          ) : isReady ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>TIME HAS ARRIVED &bull; READY TO UNLOCK</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>TEMPORALLY LOCKED</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {capsule.title}
          </h2>
          <p className="text-sm text-gray-300 mt-2 leading-relaxed">
            {capsule.description || 'No description provided.'}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#141B2D]/70 border border-white/5 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Created On
            </span>
            <span className="text-white font-medium">
              {new Date(capsule.created_at).toLocaleDateString(undefined, {
                dateStyle: 'medium',
              })}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Scheduled Opening
            </span>
            <span className="text-white font-medium">
              {new Date(capsule.opening_date).toLocaleDateString(undefined, {
                dateStyle: 'medium',
              })}{' '}
              {new Date(capsule.opening_date).toLocaleTimeString(undefined, {
                timeStyle: 'short',
              })}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Timezone
            </span>
            <span className="text-white font-medium truncate block">
              {capsule.timezone || 'UTC'}
            </span>
          </div>
        </div>

        {/* Server-Synchronized Countdown Display (if locked) */}
        {isLocked && (
          <CountdownClock
            createdAt={capsule.created_at}
            openingDate={capsule.opening_date}
            onReachedZero={() => setIsReadyToOpen(true)}
          />
        )}

        {/* Unlock Action Button (if arrived) */}
        {isReady && onOpenCapsule && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border border-cyan-500/40 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-spin" style={{ animationDuration: '4s' }} />
            <h4 className="text-lg font-bold text-white">The Opening Moment Has Arrived!</h4>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              Your capsule's temporal lock has expired. Click below to unseal your memories.
            </p>
            <button
              onClick={() => onOpenCapsule(capsule)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 transition-all inline-flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Permanently Open Capsule</span>
            </button>
          </div>
        )}

        {/* Personal Message / Letter Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Personal Letter / Message</span>
          </h4>

          {isLocked ? (
            <div className="p-6 rounded-2xl bg-[#090D18] border border-white/5 text-center space-y-2">
              <Lock className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                [Message Sealed & Encrypted]
              </p>
              <p className="text-[11px] text-gray-500">
                Server-side security prevents premature decryption of your letter before the target timestamp.
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#141B2D]/80 border border-purple-500/20 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
              {capsule.message || 'No letter was written for this capsule.'}
            </div>
          )}
        </div>

        {/* Attached Files & Media Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Attached Media & Documents</span>
            </span>
            <span className="text-[11px] text-purple-300">
              {capsule.files?.length || capsule.files_count || 0} artifacts
            </span>
          </h4>

          {isLocked ? (
            <div className="p-5 rounded-2xl bg-[#090D18] border border-white/5 text-center text-xs text-gray-400 space-y-1">
              <p>Artifacts are safely preserved in private Supabase Storage.</p>
              <p className="text-[11px] text-gray-500">
                Time-limited signed download URLs will be issued once the capsule is unsealed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {capsule.files && capsule.files.length > 0 ? (
                capsule.files.map((file) => {
                  const isImage = file.file_type.includes('image');
                  const isVideo = file.file_type.includes('video');

                  return (
                    <div
                      key={file.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isImage ? (
                            <ImageIcon className="w-4 h-4 text-emerald-400" />
                          ) : isVideo ? (
                            <Video className="w-4 h-4 text-purple-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-400" />
                          )}
                          <div>
                            <span className="text-white font-medium block truncate max-w-xs">
                              {file.file_name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {(file.file_size / (1024 * 1024)).toFixed(2)} MB &bull; {file.file_type}
                            </span>
                          </div>
                        </div>

                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-semibold text-[11px] flex items-center gap-1 border border-purple-500/30 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download (Signed URL)</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic">Protected</span>
                        )}
                      </div>

                      {/* Image Preview */}
                      {isImage && file.url && (
                        <div className="pt-2">
                          <img
                            src={file.url}
                            alt={file.file_name}
                            className="max-h-48 rounded-xl border border-white/10 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setSelectedPreviewImage(file.url || null)}
                          />
                        </div>
                      )}

                      {/* Video Player */}
                      {isVideo && file.url && (
                        <div className="pt-2">
                          <video
                            controls
                            src={file.url}
                            className="max-h-56 w-full rounded-xl border border-white/10 bg-black"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 italic p-3">No files were uploaded to this vault.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Enforced by Temporal Lock Middleware
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={selectedPreviewImage}
            alt="Fullscreen preview"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
