"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      router.push(`/owner/projects/${result.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Back Link */}
      <Button
        variant="ghost"
        onClick={() => router.push("/owner/projects")}
        className="flex items-center gap-1 mb-6 -ml-4 text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </Button>

      {/* Page Header */}
      <h1 className="font-heading text-display-sm text-on-surface mb-2">
        New Project
      </h1>
      <p className="text-body-lg text-on-surface-variant mb-8">
        Define your construction project, milestones, and acceptance criteria.
      </p>

      {error && (
        <div className="chip-rejected mb-6 px-4 py-3 text-body-md w-full">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ─── Project Details ─── */}
        <section>
          <h2 className="font-heading text-headline-sm text-on-surface mb-4">
            Project Details
          </h2>
          <div className="card-enforcer space-y-4">
            <div>
              <label className="label-blueprint block mb-2">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 4-Bedroom Bungalow, Lekki"
                className="input-enforcer"
                required
              />
            </div>

            <div>
              <label className="label-blueprint block mb-2">Project Type</label>
              <input
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="e.g. Residential 4-Bedroom Bungalow"
                className="input-enforcer"
                required
              />
            </div>

            <div>
              <label className="label-blueprint block mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief project description..."
                className="input-enforcer min-h-[80px] resize-y"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-blueprint block mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  className="input-enforcer"
                />
              </div>
              <div>
                <label className="label-blueprint block mb-2">
                  Total Value (₦)
                </label>
                <input
                  type="number"
                  value={totalValueNaira}
                  onChange={(e) => setTotalValueNaira(e.target.value)}
                  placeholder="e.g. 8500000"
                  className="input-enforcer"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-blueprint block mb-2">
                Contractor Email
              </label>
              <input
                type="email"
                value={contractorEmail}
                onChange={(e) => setContractorEmail(e.target.value)}
                placeholder="contractor@example.com"
                className="input-enforcer"
              />
              <p className="text-body-sm text-on-surface-variant mt-1">
                Optional. The contractor will be invited to join the project.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Milestones ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-headline-sm text-on-surface">
              Milestones
            </h2>
            <Button
              variant="outline"
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </Button>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone, mIndex) => (
              <div key={mIndex} className="card-enforcer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-container flex items-center justify-center text-primary text-label-lg font-heading font-semibold">
                      {mIndex + 1}
                    </div>
                    <h3 className="label-blueprint">Milestone {mIndex + 1}</h3>
                  </div>
                  {milestones.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeMilestone(mIndex)}
                      className="text-destructive hover:text-destructive/80 transition-colors w-8 h-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-blueprint block mb-2">Name</label>
                      <input
                        type="text"
                        value={milestone.name}
                        onChange={(e) =>
                          updateMilestone(mIndex, "name", e.target.value)
                        }
                        placeholder="e.g. Foundation + DPC"
                        className="input-enforcer"
                        required
                      />
                    </div>
                    <div>
                      <label className="label-blueprint block mb-2">
                        Value (₦)
                      </label>
                      <input
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
                        className="input-enforcer"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-blueprint block mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) =>
                        updateMilestone(mIndex, "description", e.target.value)
                      }
                      placeholder="Brief description of this milestone..."
                      className="input-enforcer"
                      required
                    />
                  </div>

                  {/* Acceptance Criteria */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label-blueprint">
                        Acceptance Criteria
                      </label>
                      <button
                        type="button"
                        onClick={() => addCriterion(mIndex)}
                        className="text-primary text-label-sm hover:underline"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {milestone.acceptanceCriteria.map((criterion, cIndex) => (
                        <div key={cIndex} className="flex items-center gap-2">
                          <span className="text-label-sm text-on-surface-variant w-5 text-right flex-shrink-0">
                            {cIndex + 1}.
                          </span>
                          <input
                            type="text"
                            value={criterion}
                            onChange={(e) =>
                              updateCriterion(mIndex, cIndex, e.target.value)
                            }
                            placeholder="e.g. Concrete slab is visible and continuous"
                            className="input-enforcer flex-1"
                            required
                          />
                          {milestone.acceptanceCriteria.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => removeCriterion(mIndex, cIndex)}
                              className="text-on-surface-variant hover:text-destructive transition-colors flex-shrink-0 w-8 h-8"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Submit ─── */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse-subtle">Creating...</span>
              </>
            ) : (
              <>
                Create Project
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/owner/projects")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
