export interface CriterionTemplate {
  criterionId: string;
  criterionText: string;
  visualIndicator: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface MilestoneTemplate {
  milestoneId: string;
  orderIndex: number;
  name: string;
  description: string;
  acceptanceCriteria: string[]; // criterionText strings only — stored in DB
  criteriaMetadata: CriterionTemplate[]; // full metadata for AI prompt
  requiresPriorMilestoneId: string | null;
  submissionNote: string | null;
  severityIfMissing: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface ProjectTemplate {
  templateId: string;
  projectType: "RESIDENTIAL_BUILDING" | "ROAD_CONSTRUCTION";
  geofenceType: "POINT_RADIUS" | "LINEAR_CORRIDOR";
  milestones: MilestoneTemplate[];
}

export const RESIDENTIAL_BUILDING_TEMPLATE: ProjectTemplate = {
  templateId: "RESIDENTIAL_BUILDING_STANDARD",
  projectType: "RESIDENTIAL_BUILDING",
  geofenceType: "POINT_RADIUS",
  milestones: [
    {
      milestoneId: "M1_FOUNDATION",
      orderIndex: 1,
      name: "Foundation + DPC",
      description: "Foundation footings cast and damp proof course level reached.",
      requiresPriorMilestoneId: null,
      submissionNote: null,
      severityIfMissing: "CRITICAL",
      acceptanceCriteria: [
        "Concrete slab is visible and continuous",
        "Damp proof membrane is installed correctly",
      ],
      criteriaMetadata: [
        {
          criterionId: "M1_C1",
          criterionText: "Concrete slab is visible and continuous",
          visualIndicator: "Continuous concrete surface with no severe cracking.",
          severity: "HIGH",
        },
        {
          criterionId: "M1_C2",
          criterionText: "Damp proof membrane is installed correctly",
          visualIndicator: "DPM visible at edges of the slab.",
          severity: "HIGH",
        },
      ],
    },
    {
      milestoneId: "M2_BLOCKWORK",
      orderIndex: 2,
      name: "Superstructure Blockwork",
      description: "Walls erected to lintel/roofing level.",
      requiresPriorMilestoneId: null,
      submissionNote: null,
      severityIfMissing: "HIGH",
      acceptanceCriteria: [
        "Blockwork is vertically aligned and plumb",
        "Mortar joints are uniform and well-filled",
      ],
      criteriaMetadata: [
        {
          criterionId: "M2_C1",
          criterionText: "Blockwork is vertically aligned and plumb",
          visualIndicator: "Straight wall lines.",
          severity: "HIGH",
        },
        {
          criterionId: "M2_C2",
          criterionText: "Mortar joints are uniform and well-filled",
          visualIndicator: "Consistent mortar gaps.",
          severity: "MEDIUM",
        },
      ],
    },
    {
      milestoneId: "M3_ROOFING",
      orderIndex: 3,
      name: "Roofing",
      description: "Roof trusses installed and roof covering completed.",
      requiresPriorMilestoneId: null,
      submissionNote: null,
      severityIfMissing: "CRITICAL",
      acceptanceCriteria: [
        "Roof trusses are properly spaced and secured",
        "Roof covering is complete with no visible gaps",
      ],
      criteriaMetadata: [
        {
          criterionId: "M3_C1",
          criterionText: "Roof trusses are properly spaced and secured",
          visualIndicator: "Even truss spacing.",
          severity: "HIGH",
        },
        {
          criterionId: "M3_C2",
          criterionText: "Roof covering is complete with no visible gaps",
          visualIndicator: "Complete coverage.",
          severity: "HIGH",
        },
      ],
    },
  ],
};

export const ROAD_CONSTRUCTION_TEMPLATE: ProjectTemplate = {
  templateId: "ROAD_CONSTRUCTION_FLEXIBLE_PAVEMENT",
  projectType: "ROAD_CONSTRUCTION",
  geofenceType: "LINEAR_CORRIDOR",
  milestones: [
    {
      milestoneId: "M1_SUBGRADE_PREPARATION",
      orderIndex: 1,
      name: "Subgrade Preparation",
      description: "Ground soil cleared, grubbed, and compacted to a structurally stable formation level before any imported material is placed.",
      requiresPriorMilestoneId: null,
      submissionNote: null,
      severityIfMissing: "HIGH",
      acceptanceCriteria: [
        "Soil surface displays uniform colour consistency matching approved regional laterite or borrow pit profile, with zero visible organic matter, roots, or dark plastic clay clumps (black cotton soil).",
        "Under active rolling from a minimum 10-tonne vibratory roller, the soil surface shows zero pumping (water rising to surface) and zero tire ruts exceeding 25mm depth, confirming proximity to Optimum Moisture Content.",
        "Cleared and grubbed right-of-way aligns precisely with the registered linear geofence corridor. Both side drain lines are visible and the full carriageway width is cleared.",
        "Compacted formation level is visibly above the drain invert with correct camber slope toward the side drains, confirmed against the drainage wall or grade stake reference datum.",
      ],
      criteriaMetadata: [
        {
          criterionId: "M1_C1",
          criterionText: "Soil surface displays uniform colour consistency matching approved regional laterite or borrow pit profile, with zero visible organic matter, roots, or dark plastic clay clumps (black cotton soil).",
          visualIndicator: "Colour uniformity, absence of dark organic patches, no clay clumps.",
          severity: "HIGH",
        },
        {
          criterionId: "M1_C2",
          criterionText: "Under active rolling from a minimum 10-tonne vibratory roller, the soil surface shows zero pumping (water rising to surface) and zero tire ruts exceeding 25mm depth, confirming proximity to Optimum Moisture Content.",
          visualIndicator: "Roller passes visible, no water pumping, ruts below 25mm threshold.",
          severity: "HIGH",
        },
        {
          criterionId: "M1_C3",
          criterionText: "Cleared and grubbed right-of-way aligns precisely with the registered linear geofence corridor. Both side drain lines are visible and the full carriageway width is cleared.",
          visualIndicator: "Alignment with registered corridor, both drain lines visible, full carriageway width cleared.",
          severity: "HIGH",
        },
        {
          criterionId: "M1_C4",
          criterionText: "Compacted formation level is visibly above the drain invert with correct camber slope toward the side drains, confirmed against the drainage wall or grade stake reference datum.",
          visualIndicator: "Formation height relative to drain datum, camber direction sloping toward drains.",
          severity: "MEDIUM",
        },
      ],
    },
    {
      milestoneId: "M2_SUBBASE_INSTALLATION",
      orderIndex: 2,
      name: "Sub-Base Course Installation",
      description: "Granular sub-base drainage layer spread to correct thickness and compacted with uniform cross-fall slope toward side drains.",
      requiresPriorMilestoneId: null,
      submissionNote: null,
      severityIfMissing: "HIGH",
      acceptanceCriteria: [
        "Spread sub-base material measures a uniform height relative to the reference datum (adjacent concrete drainage coping or pre-installed grade stakes), confirming consistent layer thickness across the chainage section.",
        "Video footage shows a minimum of 6 to 8 roller passes across the full carriageway width of the chainage section. Roller coverage must not be limited to the centreline only.",
        "Final compacted surface shows zero visible indentations or tire tracks after the last roller pass, confirming compaction is complete.",
        "Compacted sub-base surface displays a visually uniform cross-fall (camber) sloping from the centreline crown down toward both side drains, with no flat spots or reverse slopes where water could pool.",
      ],
      criteriaMetadata: [
        {
          criterionId: "M2_C1",
          criterionText: "Spread sub-base material measures a uniform height relative to the reference datum (adjacent concrete drainage coping or pre-installed grade stakes), confirming consistent layer thickness across the chainage section.",
          visualIndicator: "Pixel height of spread layer against drain wall or grade stake markings, uniformity along chainage section.",
          severity: "HIGH",
        },
        {
          criterionId: "M2_C2",
          criterionText: "Video footage shows a minimum of 6 to 8 roller passes across the full carriageway width of the chainage section. Roller coverage must not be limited to the centreline only.",
          visualIndicator: "Pass count visible in footage, full-width coverage confirmed, roller drum covers edge to edge.",
          severity: "HIGH",
        },
        {
          criterionId: "M2_C3",
          criterionText: "Final compacted surface shows zero visible indentations or tire tracks after the last roller pass, confirming compaction is complete.",
          visualIndicator: "Surface closure after final pass, no residual indentations or tire track impressions.",
          severity: "HIGH",
        },
        {
          criterionId: "M2_C4",
          criterionText: "Compacted sub-base surface displays a visually uniform cross-fall (camber) sloping from the centreline crown down toward both side drains, with no flat spots or reverse slopes where water could pool.",
          visualIndicator: "Cross-section shape from crown to drain visible in wide shot, no pooling-risk flat or reverse slope zones.",
          severity: "HIGH",
        },
      ],
    },
    {
      milestoneId: "M3A_BASE_COURSE_LOOSE",
      orderIndex: 3,
      name: "Base Course — Loose Stone Spread (Pre-Compaction)",
      description: "Crushed granite stone base spread to minimum 225mm (9 inches) uncompressed loose thickness before compaction begins. THIS SUBMISSION MUST BE APPROVED BEFORE COMPACTION STARTS AND BEFORE MILESTONE 3B IS UNLOCKED.",
      requiresPriorMilestoneId: null,
      submissionNote: "PRE_COMPACTION — contractor must not begin compaction until this milestone is approved.",
      severityIfMissing: "CRITICAL",
      acceptanceCriteria: [
        "Loose crushed granite layer measures a minimum uncompressed thickness of 225mm (9 inches) when measured against the adjacent drainage wall or grade stake reference datum.",
        "Aggregate consists visibly of clean, angular, well-graded crushed granite with sharp broken edges and a grading range from coarse to fine. Zero smooth rounded river gravel, zero excessive clay or soil blinding material visible in the mix.",
        "Stone base surface is uniform across the full carriageway width with no segregation pockets — areas where only large coarse stones appear without fine aggregate to fill and lock voids.",
      ],
      criteriaMetadata: [
        {
          criterionId: "M3A_C1",
          criterionText: "Loose crushed granite layer measures a minimum uncompressed thickness of 225mm (9 inches) when measured against the adjacent drainage wall or grade stake reference datum.",
          visualIndicator: "Pixel height of loose stone surface against drain datum, minimum 225mm confirmed.",
          severity: "CRITICAL",
        },
        {
          criterionId: "M3A_C2",
          criterionText: "Aggregate consists visibly of clean, angular, well-graded crushed granite with sharp broken edges and a grading range from coarse to fine. Zero smooth rounded river gravel, zero excessive clay or soil blinding material visible in the mix.",
          visualIndicator: "Angular particle shape (sharp edges), grading range visible, granite colour, no rounded river gravel, no clay coating.",
          severity: "HIGH",
        },
        {
          criterionId: "M3A_C3",
          criterionText: "Stone base surface is uniform across the full carriageway width with no segregation pockets — areas where only large coarse stones appear without fine aggregate to fill and lock voids.",
          visualIndicator: "Surface uniformity, no visible coarse-only clusters, fines visible throughout spread surface.",
          severity: "HIGH",
        },
      ],
    },
    {
      milestoneId: "M3B_BASE_COURSE_COMPACTED",
      orderIndex: 4,
      name: "Base Course — Compacted Stone Base (Post-Compaction)",
      description: "Crushed granite stone base fully compacted to minimum 150mm (6 inches) compressed thickness. Measurable height reduction from Milestone 3A confirms genuine compaction occurred. THIS SUBMISSION UNLOCKS ASPHALT PROCUREMENT FUNDS. DO NOT LAY ASPHALT BEFORE THIS MILESTONE IS APPROVED.",
      requiresPriorMilestoneId: "M3A_BASE_COURSE_LOOSE",
      submissionNote: "POST_COMPACTION — unlocks wearing course payment tranche. Asphalt laid before approval will result in full milestone rejection as retroactive base course verification is not possible.",
      severityIfMissing: "CRITICAL",
      acceptanceCriteria: [
        "Compacted stone base measures a minimum compressed thickness of 150mm (6 inches) against the same reference datum used in Milestone 3A. A measurable height reduction from the 225mm loose reading must be visible, confirming genuine compaction.",
        "Compacted surface shows tightly interlocked aggregate with fine material filling surface voids. No loose pieces, no open surface voids, no rocking stones visible.",
        "Final roller pass leaves zero visible tire tracks or indentations on the compacted stone base surface.",
      ],
      criteriaMetadata: [
        {
          criterionId: "M3B_C1",
          criterionText: "Compacted stone base measures a minimum compressed thickness of 150mm (6 inches) against the same reference datum used in Milestone 3A. A measurable height reduction from the 225mm loose reading must be visible, confirming genuine compaction.",
          visualIndicator: "Compressed layer height against drain datum, minimum 150mm confirmed, visible reduction from Milestone 3A submission.",
          severity: "CRITICAL",
        },
        {
          criterionId: "M3B_C2",
          criterionText: "Compacted surface shows tightly interlocked aggregate with fine material filling surface voids. No loose pieces, no open surface voids, no rocking stones visible.",
          visualIndicator: "Surface void closure, stone interlock, no loose surface aggregate, no open texture.",
          severity: "HIGH",
        },
        {
          criterionId: "M3B_C3",
          criterionText: "Final roller pass leaves zero visible tire tracks or indentations on the compacted stone base surface.",
          visualIndicator: "Surface condition after final pass, zero residual tire impressions.",
          severity: "HIGH",
        },
      ],
    },
    {
      milestoneId: "M4_WEARING_COURSE",
      orderIndex: 5,
      name: "Wearing Course Application (Asphalt)",
      description: "Hot-mix asphalt laid at correct temperature with continuous mat coverage and properly compacted to a sealed, smooth finish level with the top of the drainage gutter. THIS MILESTONE GATES THE FINAL CONTRACTOR PAYMENT TRANCHE.",
      requiresPriorMilestoneId: null,
      submissionNote: null,
      severityIfMissing: "CRITICAL",
      acceptanceCriteria: [
        "Asphalt mix at the paver hopper displays a deep, rich, glossy black appearance with visible steam columns rising from the surface, confirming placement within the required temperature range of 130°C to 160°C. Dull brown or grey mix with no steam indicates a cold, brittle mix and will be flagged as SPECIFICATION_DEVIATION.",
        "Freshly laid asphalt mat immediately behind the paver screed shows a seamless, continuous texture with zero surface tearing, zero longitudinal segregation lines, and no cold joints where the paver paused and the mat surface cooled.",
        "Steel-wheeled breakdown roller follows immediately behind the paver on the hot mat, followed by pneumatic-tired intermediate roller passes. Compaction begins while the mat is still visibly steaming. Final surface shows no roller-induced cracking or tearing.",
        "Finished asphalt surface is sealed, smooth, and non-porous with uniform texture across the full carriageway width. The top of the finished mat is level with or marginally above the top edge of the drainage gutter — not below it, which would cause surface ponding.",
      ],
      criteriaMetadata: [
        {
          criterionId: "M4_C1",
          criterionText: "Asphalt mix at the paver hopper displays a deep, rich, glossy black appearance with visible steam columns rising from the surface, confirming placement within the required temperature range of 130°C to 160°C. Dull brown or grey mix with no steam indicates a cold, brittle mix and will be flagged as SPECIFICATION_DEVIATION.",
          visualIndicator: "Glossy black colour, visible steam, fluid workable texture. Dull brown/grey, no steam, stiff texture = cold mix flag.",
          severity: "CRITICAL",
        },
        {
          criterionId: "M4_C2",
          criterionText: "Freshly laid asphalt mat immediately behind the paver screed shows a seamless, continuous texture with zero surface tearing, zero longitudinal segregation lines, and no cold joints where the paver paused and the mat surface cooled.",
          visualIndicator: "Mat continuity, no tearing, no segregation lines, no cold joints, clean straight edges.",
          severity: "CRITICAL",
        },
        {
          criterionId: "M4_C3",
          criterionText: "Steel-wheeled breakdown roller follows immediately behind the paver on the hot mat, followed by pneumatic-tired intermediate roller passes. Compaction begins while the mat is still visibly steaming. Final surface shows no roller-induced cracking or tearing.",
          visualIndicator: "Roller sequence (steel drum first, pneumatic second), promptness on hot mat, surface response under rollers.",
          severity: "HIGH",
        },
        {
          criterionId: "M4_C4",
          criterionText: "Finished asphalt surface is sealed, smooth, and non-porous with uniform texture across the full carriageway width. The top of the finished mat is level with or marginally above the top edge of the drainage gutter — not below it, which would cause surface ponding.",
          visualIndicator: "Surface texture closure, no pinholes, no open aggregate texture, mat level at or above drain gutter coping.",
          severity: "HIGH",
        },
      ],
    },
  ],
};
