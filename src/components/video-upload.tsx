"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Video, Upload, X, Loader2, CheckCircle2, MapPin, AlertTriangle, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractKeyFrames, ExtractedFrame, ExtractionProgress } from "@/lib/frame-extractor";

interface VideoUploadProps {
  milestoneId: Id<"milestones">;
  milestoneName: string;
  onSuccess: () => void;
}

type UploadState = "idle" | "extracting" | "uploading" | "submitting" | "done";

export function VideoUpload({ milestoneId, milestoneName, onSuccess }: VideoUploadProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [note, setNote] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const createSubmission = useMutation(api.submissions.createSubmission);

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Check type
    if (!["video/mp4", "video/quicktime", "video/webm"].includes(file.type)) {
      setError("Please select a valid video file (MP4, MOV, or WEBM).");
      return;
    }

    // Max 40MB
    if (file.size > 40 * 1024 * 1024) {
      setError("Video file exceeds the 40MB limit.");
      return;
    }

    setVideoFile(file);
    setError(null);
    setState("extracting");
    
    try {
      const extracted = await extractKeyFrames(file, (progress: ExtractionProgress) => {
        if (progress.phase === 'extracting') {
          setProgressMsg(`Extracting frames... ${progress.current + 1}/${progress.total}`);
        } else if (progress.phase === 'filtering') {
          setProgressMsg("Filtering for quality...");
        } else {
          setProgressMsg("Selecting best frames...");
        }
      });
      
      setFrames(extracted);
      setState("idle");
    } catch (err) {
      console.error("Extraction error:", err);
      setError(err instanceof Error ? err.message : "Failed to process video.");
      setVideoFile(null);
      setState("idle");
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    frames.forEach(f => URL.revokeObjectURL(f.thumbnailUrl));
    setFrames([]);
    setError(null);
  };

  const getGpsLocation = (): Promise<{ lat: number, lng: number, acc: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const handleSubmit = async () => {
    if (!videoFile || frames.length === 0) {
      setError("Please select a video file and wait for frame extraction.");
      return;
    }
    setError(null);
    setState("uploading");

    try {
      // 1. Get Location
      const location = await getGpsLocation();

      // 2. Upload Video File
      setProgressMsg("Uploading raw video...");
      const videoUploadUrl = await generateUploadUrl();
      if (!videoUploadUrl) throw new Error("Could not generate upload URL.");
      
      const videoRes = await fetch(videoUploadUrl, {
        method: "POST",
        headers: { "Content-Type": videoFile.type },
        body: videoFile,
      });
      if (!videoRes.ok) throw new Error("Failed to upload video.");
      const { storageId: videoStorageId } = await videoRes.json();

      // 3. Upload Key Frames
      const keyFrameStorageIds: Id<"_storage">[] = [];
      for (let i = 0; i < frames.length; i++) {
        setProgressMsg(`Uploading key frames... ${i + 1}/${frames.length}`);
        const frame = frames[i];
        const frameUploadUrl = await generateUploadUrl();
        if (!frameUploadUrl) throw new Error("Could not generate upload URL for frame.");
        
        const frameRes = await fetch(frameUploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: frame.blob,
        });
        if (!frameRes.ok) throw new Error("Failed to upload key frame.");
        const { storageId: frameStorageId } = await frameRes.json();
        keyFrameStorageIds.push(frameStorageId as Id<"_storage">);
      }

      // 4. Create Submission
      setState("submitting");
      setProgressMsg("Finalizing submission...");
      await createSubmission({
        milestoneId,
        videoStorageId: videoStorageId as Id<"_storage">,
        keyFrameStorageIds,
        contractorNote: note.trim() || undefined,
        gpsLatitude: location?.lat,
        gpsLongitude: location?.lng,
        gpsAccuracyMeters: location?.acc,
        videoDurationSeconds: frames.length > 0 ? frames[frames.length - 1].timestamp : undefined,
        deviceCaptureTimestamp: new Date().toISOString()
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
          AI analysis is running on your video. You&apos;ll see the verdict shortly.
        </p>
      </div>
    );
  }

  const isLoading = state === "extracting" || state === "uploading" || state === "submitting";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-headline-sm text-on-surface">Submit Video Evidence</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          <span className="label-blueprint">{milestoneName}</span>
        </p>
      </div>

      {/* Drop Zone / Selected Video */}
      {!videoFile ? (
        <div
          onClick={() => !isLoading && inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
            ${isLoading ? "opacity-50 cursor-not-allowed border-outline/30" : "border-outline/50 hover:border-primary hover:bg-primary/5"}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
            disabled={isLoading}
          />
          <Video className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
          <p className="text-body-md text-on-surface font-medium">
            Click to select a video file
          </p>
          <p className="text-body-sm text-on-surface-variant mt-1">
            MP4, MOV, WEBM · Up to 40MB · Max 3 mins
          </p>
        </div>
      ) : (
        <div className="p-4 border border-outline/50 rounded-xl bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Film className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-body-md font-medium text-on-surface truncate max-w-[200px] sm:max-w-[400px]">
                  {videoFile.name}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isLoading && (
              <Button variant="ghost" size="icon" onClick={removeVideo}>
                <X className="w-5 h-5 text-on-surface-variant" />
              </Button>
            )}
          </div>

          {state === "extracting" && (
            <div className="flex items-center gap-3 text-primary p-3 bg-primary/5 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-body-md font-medium">{progressMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Frame Previews */}
      {frames.length > 0 && (
        <div>
          <h3 className="text-body-md font-medium text-on-surface mb-3 flex items-center justify-between">
            <span>Extracted Key Frames ({frames.length})</span>
            <span className="text-body-sm font-normal text-on-surface-variant">These will be sent to the AI</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {frames.map((frame, i) => (
              <div key={i} className="relative aspect-video rounded-lg overflow-hidden group bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame.thumbnailUrl} alt={`Frame at ${frame.timestamp}s`} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm font-mono">
                  {Math.floor(frame.timestamp / 60)}:{(Math.floor(frame.timestamp) % 60).toString().padStart(2, '0')}
                </div>
                {frame.blurScore < 20 && (
                  <div className="absolute top-1 right-1 bg-warning/90 text-on-warning text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm flex items-center gap-1" title="Low sharpness">
                    <AlertTriangle className="w-3 h-3" /> Blur
                  </div>
                )}
              </div>
            ))}
          </div>
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
        <p className="text-body-sm text-error flex items-center gap-2 bg-error/10 p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || frames.length === 0}
        className="w-full flex items-center justify-center gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {state === "uploading" ? progressMsg : state === "submitting" ? progressMsg : "Processing…"}
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            Submit Video for Analysis
          </>
        )}
      </Button>
    </div>
  );
}
