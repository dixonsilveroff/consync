"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface MilestoneInput {
  name: string;
  description: string;
  valueKobo: number;
  acceptanceCriteria: string[];
}

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [location, setLocation] = useState("");
  const [totalValueNaira, setTotalValueNaira] = useState("");
  const [contractorEmail, setContractorEmail] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    {
      name: "",
      description: "",
      valueKobo: 0,
      acceptanceCriteria: [""],
    },
  ]);

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

      const result = await createProject({
        name,
        description: description || undefined,
        projectType,
        location: location || undefined,
        totalValueKobo,
        contractorEmail: contractorEmail || undefined,
        milestones: milestones.map((m) => ({
          name: m.name,
          description: m.description,
          valueKobo: m.valueKobo,
          acceptanceCriteria: m.acceptanceCriteria.filter((c) => c.trim() !== ""),
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
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Project Type <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g. Residential"
                  required
                />
              </div>
            </div>

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
