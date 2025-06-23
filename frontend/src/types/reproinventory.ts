export type ReproInventoryEntryId = string;

export type LevelEnum = "Beginner" | "Intermediate" | "Advanced" | "NA";

export type PlatformEnum = "Mac" | "Windows" | "Linux" | "Docker" | "Jupyter" | "NA";

export type CourseLengthEnum = "<1 hr" | "1-4 hrs" | "1 day" | "1-3 days" | "1 week" | "1+ weeks" | "NA";

export type ContentFormatEnum = "Hands-on tutorial / notebooks" | "lecture" | "video" | "notes" | "blog post" | "reference" | "slides" | "website" | "outline" | "meta-resource" | "NA";

export type DeliveryEnum = "self-paced" | "instructor" | "Hybrid" | "Discussion needed";

export type LanguageEnum = "English" | "French" | "Spanish" | "Chinese" | "German" | "English, French" | "English, German" | "Other" | "NA";

export type ProgrammingLanguageEnum = "Python" | "R" | "shell scripting" | "Matlab" | "Git" | "NA";

export type NeuroimagingSoftwareEnum = "AFNI" | "SPM" | "FSL" | "Freesurfer" | "Python" | "Multiple" | "NA";

export type ImagingModalityEnum = "DWI" | "Structural" | "Functional" | "Task-based" | "Resting-State" | "EEG" | "Behavioral" | "MEG" | "MRI" | "NA";

export type OpenDatasetEnum = "True" | "False" | "NA";

export type QuadrantsEnum = "information-oriented (reference)" | "understanding-oriented (explanation)" | "learning-oriented (tutorials)" | "problem-oriented (how to guides)" | "NA";



export interface ReproInventoryEntry {
    id: string,
    tag_team?: string,
    course_name?: string,
    url?: string,
    level?: LevelEnum[], // Changed from string to LevelEnum[]
    platform?: PlatformEnum[], // Changed from string to PlatformEnum[]
    keywords?: string[], // Changed from string to string[]
    course_length?: CourseLengthEnum, // Changed from string to CourseLengthEnum
    instruction_medium?: ContentFormatEnum[], // Changed from string to ContentFormatEnum[]
    delivery?: DeliveryEnum[], // Changed from string to DeliveryEnum[]
    language?: LanguageEnum[], // Changed from string to LanguageEnum[]
    programming_language?: ProgrammingLanguageEnum[], // Changed from string to ProgrammingLanguageEnum[]
    neuroimaging_software?: NeuroimagingSoftwareEnum[], // Changed from string to NeuroimagingSoftwareEnum[]
    imaging_modality?: ImagingModalityEnum[], // Changed from string to ImagingModalityEnum[]
    open_dataset?: OpenDatasetEnum, // Changed from string to OpenDatasetEnum
    last_updated?: string,
    functionality?: string,
    assessment?: string,
    prerequisite?: string,
    source?: string,
    review?: string,
    exclude_from_repro_inventory?: string,
    alias_links?: string,
    notes?: string,
    quadrants?: QuadrantsEnum[], // Changed from string to QuadrantsEnum[]
}


export function isReproInventoryEntry(o: object): o is ReproInventoryEntry {
    return (
        'id' in o
    )
}

export function toReproInventoryEntry(o: ReproInventoryEntry): ReproInventoryEntry {
    return {
        id: o.id ?? undefined,
        tag_team: o.tag_team ?? undefined,
        course_name: o.course_name ?? undefined,
        url: o.url ?? undefined,
        level: o.level ?? undefined,
        platform: o.platform ?? undefined,
        keywords: o.keywords ?? undefined,
        course_length: o.course_length ?? undefined,
        instruction_medium: o.instruction_medium ?? undefined,
        delivery: o.delivery ?? undefined,
        language: o.language ?? undefined,
        programming_language: o.programming_language ?? undefined,
        neuroimaging_software: o.neuroimaging_software ?? undefined,
        imaging_modality: o.imaging_modality ?? undefined,
        open_dataset: o.open_dataset ?? undefined,
        last_updated: o.last_updated ?? undefined,
        functionality: o.functionality ?? undefined,
        assessment: o.assessment ?? undefined,
        prerequisite: o.prerequisite ?? undefined,
        source: o.source ?? undefined,
        review: o.review ?? undefined,
        exclude_from_repro_inventory: o.exclude_from_repro_inventory ?? undefined,
        alias_links: o.alias_links ?? undefined,
        notes: o.notes ?? undefined,
        quadrants: o.quadrants ?? undefined
    }
}

