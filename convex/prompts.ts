export function buildSystemPrompt(): string {
  return `You are ConSync AI, an expert construction milestone verification system specializing in Nigerian construction projects. Your role is to analyze key frames extracted from video evidence submitted by contractors to determine if a construction milestone has been completed according to specified acceptance criteria.

Core principles:
- You are grounded in visual evidence only. Do not make assumptions or infer things not visible.
- If lighting, occlusion, or blurriness prevents assessment, you must use CANNOT_VERIFY and note it.
- Use consistent terminology.

Verification status rules:
- CONFIRMED: All criteria met, confidence >= 80%, no HIGH/CRITICAL anomalies
- UNCONFIRMED: Major criteria not met or confidence < 50%
- NEEDS_REVIEW: Mixed results, some criteria unclear, confidence 50-79%
- RESUBMIT_REQUIRED: Photos/frames are too blurry, too dark, or do not show the work area

Routing rules:
- APPROVE: verificationStatus is CONFIRMED
- REVIEW: verificationStatus is NEEDS_REVIEW
- REJECT: verificationStatus is UNCONFIRMED or RESUBMIT_REQUIRED

IMPORTANT: You must respond with a JSON object that strictly matches the required schema.`;
}

export interface PromptContext {
  projectName: string;
  projectType: string;
  projectLocation: string | null;
  milestoneName: string;
  milestoneDescription: string;
  boqReference: string | null;
  acceptanceCriteria: string[];
  contractorNote: string | null;
  frameCount: number;
}

export interface PriorAnalysisContext {
  analysisDate: string;
  milestoneName: string;
  status: string;
  plainSummary: string;
  priorFrameCount: number;
  unresolvedAnomalies: string[];
}

export function buildBaselinePrompt(ctx: PromptContext): string {
  const criteriaList = ctx.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
  return `PROJECT CONTEXT:
- Project Name: ${ctx.projectName}
- Project Type: ${ctx.projectType}
- Location: ${ctx.projectLocation || 'Unknown'}

MILESTONE BEING CLAIMED:
Name: ${ctx.milestoneName}
BOQ Reference: ${ctx.boqReference || 'N/A'}
Description: ${ctx.milestoneDescription}

ACCEPTANCE CRITERIA:
The following criteria must ALL be visually confirmed for this milestone to be approved.
${criteriaList}

${ctx.contractorNote ? `CONTRACTOR NOTE: ${ctx.contractorNote}` : ''}

IMAGES PROVIDED:
The following ${ctx.frameCount} images are key frames extracted from the contractor's submission video, ordered chronologically. Images are labelled [FRAME_1] through [FRAME_${ctx.frameCount}].

TASK:
1. Review each image carefully.
2. For each acceptance criterion, assess whether it is: MET, NOT_MET, or CANNOT_VERIFY from the visual evidence.
3. Note any anomalies, defects, safety concerns, or elements that appear inconsistent with the project specification.
4. Provide an overall verification status and confidence score.

IMPORTANT: This is the first video analysis for this project. You have no prior reference frames. Your assessment is based on your knowledge of construction best practices and the project context above.`;
}

export function buildMilestoneDeltaPrompt(ctx: PromptContext, prior: PriorAnalysisContext): string {
  const criteriaList = ctx.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const anomaliesList = prior.unresolvedAnomalies.length > 0 
    ? prior.unresolvedAnomalies.map(a => `- ${a}`).join('\n')
    : 'None recorded.';

  return `PROJECT CONTEXT:
- Project Name: ${ctx.projectName}
- Project Type: ${ctx.projectType}

MILESTONE BEING CLAIMED:
Name: ${ctx.milestoneName}
BOQ Reference: ${ctx.boqReference || 'N/A'}
Description: ${ctx.milestoneDescription}

ACCEPTANCE CRITERIA:
${criteriaList}

${ctx.contractorNote ? `CONTRACTOR NOTE: ${ctx.contractorNote}` : ''}

PRIOR ANALYSIS CONTEXT:
A prior analysis of this same milestone was conducted on ${prior.analysisDate}.
Prior analysis outcome: ${prior.status}
Prior analysis summary: ${prior.plainSummary}

Unresolved anomalies from prior analysis:
${anomaliesList}

The prior analysis reference frames are provided first and are labelled [PRIOR_FRAME_1] through [PRIOR_FRAME_${prior.priorFrameCount}].
The current submission frames are labelled [CURRENT_FRAME_1] through [CURRENT_FRAME_${ctx.frameCount}].

TASK:
1. Compare the CURRENT frames against the PRIOR frames for this milestone.
2. For each acceptance criterion, assess its status: MET, NOT_MET, or CANNOT_VERIFY.
3. Specifically assess: has the work progressed since the prior analysis in ways consistent with the claimed milestone? Have any previously flagged anomalies been resolved?
4. Flag any new anomalies that are visible in the current frames but were not present in prior frames.
5. Note any elements from the prior frames that appear to be missing or changed in ways that are inconsistent with normal construction progression (regression).`;
}

export function buildProjectProgressPrompt(ctx: PromptContext, priors: PriorAnalysisContext[]): string {
  const criteriaList = ctx.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const priorsBlock = priors.map((p, i) => `Analysis ${i + 1}: Date: ${p.analysisDate}, Milestone: ${p.milestoneName}, Status: ${p.status}\nSummary: ${p.plainSummary}`).join('\n\n');

  return `PROJECT CONTEXT:
- Project Name: ${ctx.projectName}
- Project Type: ${ctx.projectType}

MILESTONE BEING CLAIMED:
Name: ${ctx.milestoneName}
BOQ Reference: ${ctx.boqReference || 'N/A'}
Description: ${ctx.milestoneDescription}

ACCEPTANCE CRITERIA:
${criteriaList}

${ctx.contractorNote ? `CONTRACTOR NOTE: ${ctx.contractorNote}` : ''}

PRIOR PROJECT ANALYSES:
The following prior analyses have been recorded for this project. Use these as context for understanding the project's visual history and construction progression.
${priorsBlock}

The current submission frames are labelled [CURRENT_FRAME_1] through [CURRENT_FRAME_${ctx.frameCount}].

TASK:
1. Assess each acceptance criterion for the current milestone: MET, NOT_MET, or CANNOT_VERIFY.
2. Check that the current submission's visual state is consistent with a project that previously passed the milestones shown in the prior analyses. Flag any inconsistencies.
3. Identify any anomalies in the current submission.
4. Consider whether the claimed milestone is plausible given the visual history.`;
}
