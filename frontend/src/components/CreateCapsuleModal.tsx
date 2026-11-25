import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Calendar,
  Clock,
  Globe,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Trash2,
  AlertCircle,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Capsule, CapsuleCategory } from '../types';

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (capsuleData: Partial<Capsule>, files: File[]) => Promise<void> | void;
}

export const CreateCapsuleModal: React.FC<CreateCapsuleModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<CapsuleCategory>('Personal');

  // Set default opening date to 1 year ahead
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const defaultDateStr = defaultDate.toISOString().split('T')[0];

  const [openingDate, setOpeningDate] = useState(defaultDateStr);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs when modal unmounts
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  if (!isOpen) return null;

  const handleProcessFiles = (incomingFiles: File[]) => {
    setError(null);

    // Limit maximum 10 files
    if (selectedFiles.length + incomingFiles.length > 10) {
      setError('You can attach a maximum of 10 artifacts per time capsule.');
      return;
    }

    // Check size limit (50MB per file)
    const oversized = incomingFiles.find((f) => f.size > 50 * 1024 * 1024);
    if (oversized) {
      setError(`File "${oversized.name}" exceeds the 50MB per-file upload limit.`);
      return;
    }

    // Generate previews for images
    const newPreviews: { [key: string]: string } = {};
    incomingFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        newPreviews[file.name + file.size] = URL.createObjectURL(file);
      }
    });

    setFilePreviews((prev) => ({ ...prev, ...newPreviews }));
    setSelectedFiles((prev) => [...prev, ...incomingFiles]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleProcessFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleProcessFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    const key = fileToRemove.name + fileToRemove.size;
    if (filePreviews[key]) {
      URL.revokeObjectURL(filePreviews[key]);
      setFilePreviews((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalFileSizeMB = (
    selectedFiles.reduce((acc, f) => acc + f.size, 0) /
    (1024 * 1024)
  ).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Capsule title is required.');
      return;
    }

    // Server-enforced future date check
    const combinedDate = new Date(`${openingDate}T${openingTime}:00`);
    const now = new Date();

    if (isNaN(combinedDate.getTime())) {
      setError('Please provide a valid date and time.');
      return;
    }

    if (combinedDate.getTime() <= now.getTime()) {
      setError('Temporal Lock Rule: Scheduled opening date must be strictly in the future!');
      return;
    }

    setSubmitting(true);

    try {
      const newCapsule: Partial<Capsule> = {
        title,
        description,
        message,
        category,
        opening_date: combinedDate.toISOString(),
        timezone,
        status: 'locked',
        created_at: new Date().toISOString(),
        files_count: selectedFiles.length,
      };

      await onCreate(newCapsule, selectedFiles);

      // Reset form
      setTitle('');
      setDescription('');
      setMessage('');
      setSelectedFiles([]);
      setFilePreviews({});
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create capsule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0D121F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto z-10 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create Time Capsule</h2>
            <p className="text-xs text-gray-400">
              Seal personal letters, photographs, videos, and private records in a cryptographic vault.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Capsule Title *
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Letters to My 30-Year-Old Self or College Crew Memories"
              className="w-full bg-[#131A2B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Category & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                disabled={submitting}
                onChange={(e) => setCategory(e.target.value as CapsuleCategory)}
                className="w-full bg-[#131A2B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Personal">Personal</option>
                <option value="Friends">Friends</option>
                <option value="Family">Family</option>
                <option value="Education">Education</option>
                <option value="Travel">Travel</option>
                <option value="Career">Career</option>
                <option value="Love">Love</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                Timezone
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  disabled={submitting}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#131A2B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Description / Summary
            </label>
            <input
              type="text"
              disabled={submitting}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A reflection on milestones, goals, and thoughts before a major life shift"
              className="w-full bg-[#131A2B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Scheduled Opening Date & Time */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              Scheduled Opening Timestamp (Must be in the future)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Target Opening Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    disabled={submitting}
                    min={new Date().toISOString().split('T')[0]}
                    value={openingDate}
                    onChange={(e) => setOpeningDate(e.target.value)}
                    className="w-full bg-[#131A2B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Target Opening Time</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="time"
                    required
                    disabled={submitting}
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full bg-[#131A2B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Letter / Sealed Message */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Personal Letter / Message
            </label>
            <textarea
              rows={4}
              disabled={submitting}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dear Future Me, write whatever is in your heart. This message will be locked and encrypted until the chosen date."
              className="w-full bg-[#131A2B] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all leading-relaxed"
            />
          </div>

          {/* Media / File Upload Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Attach Artifacts (Photos, Videos, PDFs, Docs)
              </label>
              <span className="text-[11px] text-gray-400 font-mono">
                {selectedFiles.length}/10 files ({totalFileSizeMB} MB)
              </span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-[#131A2B]/40 group cursor-pointer ${
                isDragging
                  ? 'border-purple-400 bg-purple-950/30 scale-[1.01]'
                  : 'border-white/10 hover:border-purple-500/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                disabled={submitting}
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,.doc,.docx,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-gray-200">
                Click to browse or drag and drop artifacts here
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Supports JPG, PNG, MP4, MOV, PDF, and Documents up to 50MB per file
              </p>
            </div>

            {/* Uploaded File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-3">
                {selectedFiles.map((f, i) => {
                  const key = f.name + f.size;
                  const isImage = f.type.startsWith('image/');
                  const isVideo = f.type.startsWith('video/');
                  const previewUrl = filePreviews[key];

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300"
                    >
                      <div className="flex items-center gap-3 truncate max-w-sm">
                        {isImage && previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="preview"
                            className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                        ) : isVideo ? (
                          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                            <Video className="w-4 h-4 text-purple-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-400" />
                          </div>
                        )}

                        <div className="truncate">
                          <span className="truncate block font-medium text-white">{f.name}</span>
                          <span className="text-[10px] text-gray-400">
                            {(f.size / (1024 * 1024)).toFixed(2)} MB &bull; {f.type || 'file'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(i);
                        }}
                        className="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading Artifacts & Encrypting Vault...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Lock & Seal Capsule Forever</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
