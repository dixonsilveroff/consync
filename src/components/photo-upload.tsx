"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Upload, X, ImagePlus, Loader2, CheckCircle2, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import exifr from "exifr";

interface PhotoUploadProps {
  milestoneId: Id<"milestones">;
  milestoneName: string;
  onSuccess: () => void;
}

type UploadState = "idle" | "uploading" | "submitting" | "done";

interface PhotoItem {
  file: File;
  preview: string;
  gps: { lat: number; lng: number } | null;
}

export function PhotoUpload({ milestoneId, milestoneName, onSuccess }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [note, setNote] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const createSubmission = useMutation(api.submissions.createSubmission);

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).filter((f) =>
      ["image/jpeg", "image/png", "image/heic", "image/webp"].includes(f.type)
    );

    const newPhotoItems: PhotoItem[] = [];

    for (const file of accepted) {
      let gps = null;
      try {
        const gpsData = await exifr.gps(file);
        if (gpsData && gpsData.latitude != null && gpsData.longitude != null) {
          gps = { lat: gpsData.latitude, lng: gpsData.longitude };
        }
      } catch (e) {
        console.warn(`Could not extract GPS data from ${file.name}`, e);
      }

      newPhotoItems.push({
        file,
        preview: URL.createObjectURL(file),
        gps,
      });
    }

    const combined = [...photos, ...newPhotoItems].slice(0, 5);
    setPhotos(combined);
  };

  const removeFile = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    setPhotos(next);
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError("Please add at least one photo.");
      return;
    }
    setError(null);
    setState("uploading");

    try {
      // Extract GPS from the first photo that has it
      const firstWithGps = photos.find(p => p.gps !== null);
      const submissionLat = firstWithGps?.gps?.lat;
      const submissionLng = firstWithGps?.gps?.lng;

      // Upload each file to Convex storage
      const storageIds: Id<"_storage">[] = [];
      for (const photo of photos) {
        const uploadUrl = await generateUploadUrl();
        if (!uploadUrl) {
          throw new Error("Could not generate upload URL. Please try again.");
        }

        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": photo.file.type || "image/jpeg" },
          body: photo.file,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Upload failed for ${photo.file.name}: ${res.status} ${errorText}`);
        }

        const { storageId } = await res.json();
        storageIds.push(storageId as Id<"_storage">);
      }

      // Create the submission record
      setState("submitting");
      await createSubmission({
        milestoneId,
        photoStorageIds: storageIds,
        contractorNote: note.trim() || undefined,
        gpsLatitude: submissionLat,
        gpsLongitude: submissionLng,
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
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {photos.map((photo, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="relative aspect-square rounded-lg overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {!isLoading && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="text-xs text-center px-1">
                {photo.gps ? (
                  <div className="flex items-center justify-center gap-1 text-on-surface-variant">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="truncate" title={`${photo.gps.lat}, ${photo.gps.lng}`}>
                      {photo.gps.lat.toFixed(4)}, {photo.gps.lng.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-destructive/80" title="No location data found">
                    <AlertTriangle className="w-3 h-3" />
                    <span>No GPS</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {photos.length < 5 && !isLoading && (
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
      <Button
        onClick={handleSubmit}
        disabled={isLoading || photos.length === 0}
        className="w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {state === "uploading" ? `Uploading ${photos.length} photo${photos.length > 1 ? "s" : ""}…` : "Submitting…"}
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Submit {photos.length > 0 ? `${photos.length} Photo${photos.length > 1 ? "s" : ""}` : "Photos"}
          </>
        )}
      </Button>
    </div>
  );
}
