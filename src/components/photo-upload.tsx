"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Upload, X, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";

interface PhotoUploadProps {
  milestoneId: Id<"milestones">;
  milestoneName: string;
  onSuccess: () => void;
}

type UploadState = "idle" | "uploading" | "submitting" | "done";

export function PhotoUpload({ milestoneId, milestoneName, onSuccess }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const createSubmission = useMutation(api.submissions.createSubmission);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).filter((f) =>
      ["image/jpeg", "image/png", "image/heic", "image/webp"].includes(f.type)
    );
    const combined = [...files, ...accepted].slice(0, 5);
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please add at least one photo.");
      return;
    }
    setError(null);
    setState("uploading");

    try {
      // Upload each file to Convex storage
      const storageIds: Id<"_storage">[] = [];
      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        if (!uploadUrl) {
          throw new Error("Could not generate upload URL. Please try again.");
        }

        console.log(`[PhotoUpload] Uploading ${file.name} to:`, uploadUrl);

        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Upload failed for ${file.name}: ${res.status} ${errorText}`);
        }

        const { storageId } = await res.json();
        storageIds.push(storageId as Id<"_storage">);
      }

      // Create the submission record (triggers AI analysis automatically)
      setState("submitting");
      await createSubmission({
        milestoneId,
        photoStorageIds: storageIds,
        contractorNote: note.trim() || undefined,
      });

      setState("done");
      setTimeout(onSuccess, 1500);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
        <p className="font-heading text-headline-sm text-on-surface">Submitted!</p>
        <p className="text-body-md text-on-surface-variant text-center">
          AI analysis is running. You&apos;ll see the verdict shortly.
        </p>
      </div>
    );
  }

  const isLoading = state === "uploading" || state === "submitting";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-headline-sm text-on-surface">Submit Milestone Photos</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          <span className="label-blueprint">{milestoneName}</span>
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isLoading ? "opacity-50 cursor-not-allowed border-outline/30" : "border-outline/50 hover:border-primary hover:bg-primary/5"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isLoading}
        />
        <ImagePlus className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
        <p className="text-body-md text-on-surface font-medium">
          Click to add photos or drag & drop
        </p>
        <p className="text-body-sm text-on-surface-variant mt-1">
          JPEG, PNG, HEIC, WebP · Up to 5 photos
        </p>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {!isLoading && (
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
          {previews.length < 5 && !isLoading && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-outline/40 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="w-5 h-5 text-on-surface-variant" />
            </button>
          )}
        </div>
      )}

      {/* Contractor Note */}
      <div>
        <label className="label-blueprint block mb-2">Contractor Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe the work completed, any site conditions, or context for the reviewer..."
          rows={3}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg border border-outline/40 bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-50"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-body-sm text-error flex items-center gap-2">
          <X className="w-4 h-4" /> {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || files.length === 0}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {state === "uploading" ? `Uploading ${files.length} photo${files.length > 1 ? "s" : ""}…` : "Submitting…"}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Submit {files.length > 0 ? `${files.length} Photo${files.length > 1 ? "s" : ""}` : "Photos"}
          </>
        )}
      </button>
    </div>
  );
}
