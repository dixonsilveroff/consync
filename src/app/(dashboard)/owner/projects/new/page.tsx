"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { RESIDENTIAL_BUILDING_TEMPLATE, ROAD_CONSTRUCTION_TEMPLATE } from "@/lib/project-templates";

const GeofenceMap = dynamic(() => import("@/components/geofence-map"), { ssr: false });
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface MilestoneInput {
  templateMilestoneId?: string;
  name: string;
  description: string;
  valueKobo: number;
  acceptanceCriteria: string[];
  requiresPriorMilestoneId?: string;
  submissionNote?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<"RESIDENTIAL_BUILDING" | "ROAD_CONSTRUCTION">("RESIDENTIAL_BUILDING");
  const [location, setLocation] = useState("");
  const [totalValueNaira, setTotalValueNaira] = useState("");
  const [contractorEmail, setContractorEmail] = useState("");
  
  const [roadCentrelineCoords, setRoadCentrelineCoords] = useState<{lat: number, lng: number}[]>([]);
  const [corridorWidthMetres, setCorridorWidthMetres] = useState("50");

  const [milestones, setMilestones] = useState<MilestoneInput[]>(() => {
    return RESIDENTIAL_BUILDING_TEMPLATE.milestones.map(m => ({
      templateMilestoneId: m.milestoneId,
      name: m.name,
      description: m.description,
      valueKobo: 0,
      acceptanceCriteria: [...m.acceptanceCriteria],
      requiresPriorMilestoneId: m.requiresPriorMilestoneId ?? undefined,
      submissionNote: m.submissionNote ?? undefined,
    }));
  });

  const handleProjectTypeChange = (type: "RESIDENTIAL_BUILDING" | "ROAD_CONSTRUCTION") => {
    setProjectType(type);
    const template = type === "RESIDENTIAL_BUILDING" ? RESIDENTIAL_BUILDING_TEMPLATE : ROAD_CONSTRUCTION_TEMPLATE;
    setMilestones(template.milestones.map(m => ({
      templateMilestoneId: m.milestoneId,
      name: m.name,
      description: m.description,
      valueKobo: 0,
      acceptanceCriteria: [...m.acceptanceCriteria],
      requiresPriorMilestoneId: m.requiresPriorMilestoneId ?? undefined,
      submissionNote: m.submissionNote ?? undefined,
    })));
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { name: "", description: "", valueKobo: 0, acceptanceCriteria: [""] },
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string | number | string[]) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const addCriterion = (milestoneIndex: number) => {
    const updated = [...milestones];
    updated[milestoneIndex].acceptanceCriteria.push("");
    setMilestones(updated);
  };

  const updateCriterion = (milestoneIndex: number, criterionIndex: number, value: string) => {
    const updated = [...milestones];
    updated[milestoneIndex].acceptanceCriteria[criterionIndex] = value;
    setMilestones(updated);
  };

  const removeCriterion = (milestoneIndex: number, criterionIndex: number) => {
    const updated = [...milestones];
    if (updated[milestoneIndex].acceptanceCriteria.length <= 1) return;
    updated[milestoneIndex].acceptanceCriteria.splice(criterionIndex, 1);
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const totalValueKobo = Math.round(parseFloat(totalValueNaira) * 100);

      let processedRoadCoords = undefined;
      if (projectType === "ROAD_CONSTRUCTION" && roadCentrelineCoords.length > 0) {
        processedRoadCoords = roadCentrelineCoords;
      }

      const result = await createProject({
        name,
        description: description || undefined,
        projectType,
        geofenceType: projectType === "ROAD_CONSTRUCTION" ? "LINEAR_CORRIDOR" : "POINT_RADIUS",
        roadCentrelineCoords: processedRoadCoords,
        corridorWidthMetres: projectType === "ROAD_CONSTRUCTION" ? parseInt(corridorWidthMetres, 10) : undefined,
        location: location || undefined,
        totalValueKobo,
        contractorEmail: contractorEmail || undefined,
        milestones: milestones.map((m) => ({
          templateMilestoneId: m.templateMilestoneId,
          name: m.name,
          description: m.description,
          valueKobo: m.valueKobo,
          acceptanceCriteria: m.acceptanceCriteria.filter((c) => c.trim() !== ""),
          requiresPriorMilestoneId: m.requiresPriorMilestoneId,
          submissionNote: m.submissionNote,
        })),
      });

      setIsSubmitting(false); // Reset before routing to fix bfcache issue
      router.push(`/owner/projects/${result.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/owner/projects")}
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-heading text-display-sm text-on-surface">
            New Project
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Define your construction project, milestones, and acceptance criteria.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 text-body-md mb-6 flex items-center gap-2">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ─── Project Details ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Project Details</CardTitle>
            <CardDescription>
              Basic information and location for your construction project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 4-Bedroom Bungalow, Lekki"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Project Type <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value="RESIDENTIAL_BUILDING"
                      checked={projectType === "RESIDENTIAL_BUILDING"}
                      onChange={() => handleProjectTypeChange("RESIDENTIAL_BUILDING")}
                      className="accent-primary"
                    />
                    <span className="text-sm">Residential Building</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value="ROAD_CONSTRUCTION"
                      checked={projectType === "ROAD_CONSTRUCTION"}
                      onChange={() => handleProjectTypeChange("ROAD_CONSTRUCTION")}
                      className="accent-primary"
                    />
                    <span className="text-sm">Road Construction</span>
                  </label>
                </div>
              </div>
            </div>

            {projectType === "ROAD_CONSTRUCTION" && (
              <div className="grid grid-cols-1 gap-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Corridor Width (Metres)
                  </label>
                  <Input
                    type="number"
                    value={corridorWidthMetres}
                    onChange={(e) => setCorridorWidthMetres(e.target.value)}
                    placeholder="e.g. 50"
                    min="1"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Submission zone extends half this width on each side.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Road Centreline Coordinates
                  </label>
                  <GeofenceMap
                    corridorWidthMetres={parseInt(corridorWidthMetres) || 50}
                    initialCoords={roadCentrelineCoords}
                    onChange={setRoadCentrelineCoords}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the scope of work..."
                className="min-h-[100px] resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Location
                </label>
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Lagos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Total Value (₦) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  value={totalValueNaira}
                  onChange={(e) => setTotalValueNaira(e.target.value)}
                  placeholder="e.g. 8500000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Contractor Email (Optional)
              </label>
              <Input
                type="email"
                value={contractorEmail}
                onChange={(e) => setContractorEmail(e.target.value)}
                placeholder="contractor@example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If provided, we will automatically invite them to this project.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Milestones ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-on-surface">
                Milestones
              </h2>
              <p className="text-sm text-muted-foreground">
                Break the project down into verifiable payment phases.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </Button>
          </div>

          <div className="space-y-6">
            {milestones.map((milestone, mIndex) => (
              <Card key={mIndex} className="overflow-hidden border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-4 bg-surface-container-low border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {mIndex + 1}
                    </div>
                    <CardTitle className="text-lg">Milestone {mIndex + 1}</CardTitle>
                  </div>
                  {milestones.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeMilestone(mIndex)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors w-8 h-8 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        Milestone Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        value={milestone.name}
                        onChange={(e) =>
                          updateMilestone(mIndex, "name", e.target.value)
                        }
                        placeholder="e.g. Foundation + DPC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        Payment Value (₦) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="number"
                        value={milestone.valueKobo / 100 || ""}
                        onChange={(e) =>
                          updateMilestone(
                            mIndex,
                            "valueKobo",
                            Math.round(parseFloat(e.target.value || "0") * 100)
                          )
                        }
                        placeholder="e.g. 2500000"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) =>
                        updateMilestone(mIndex, "description", e.target.value)
                      }
                      placeholder="Briefly describe what marks the completion of this phase..."
                      required
                    />
                  </div>

                  {/* Acceptance Criteria */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium leading-none">
                        Acceptance Criteria
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => addCriterion(mIndex)}
                        className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Criterion
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {milestone.acceptanceCriteria.map((criterion, cIndex) => (
                        <div key={cIndex} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-6 text-center">
                            {cIndex + 1}.
                          </span>
                          <Input
                            type="text"
                            value={criterion}
                            onChange={(e) =>
                              updateCriterion(mIndex, cIndex, e.target.value)
                            }
                            placeholder="e.g. Concrete slab is visible and continuous"
                            required
                          />
                          {milestone.acceptanceCriteria.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => removeCriterion(mIndex, cIndex)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 w-8 h-8 rounded-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ─── Submit ─── */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push("/owner/projects")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Creating Project...</span>
            ) : (
              <>
                Create Project
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
