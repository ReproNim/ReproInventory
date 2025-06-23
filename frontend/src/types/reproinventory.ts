export type ReproInventoryEntryId = string;

export enum LevelEnum {
    
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Advanced = "Advanced",
    NA = "NA",
};

export enum PlatformEnum {
    
    Mac = "Mac",
    Windows = "Windows",
    Linux = "Linux",
    Docker = "Docker",
    Jupyter = "Jupyter",
    NA = "NA",
};

export enum CourseLengthEnum {
    
    LESS_THAN_SIGN1_hr = "<1 hr",
    number_1_4_hrs = "1-4 hrs",
    number_1_day = "1 day",
    number_1_3_days = "1-3 days",
    number_1_week = "1 week",
    number_1PLUS_SIGN_weeks = "1+ weeks",
    NA = "NA",
};

export enum ContentFormatEnum {
    
    Hands_on_tutorial_SOLIDUS_notebooks = "Hands-on tutorial / notebooks",
    lecture = "lecture",
    video = "video",
    notes = "notes",
    blog_post = "blog post",
    reference = "reference",
    slides = "slides",
    website = "website",
    outline = "outline",
    meta_resource = "meta-resource",
    NA = "NA",
};

export enum DeliveryEnum {
    
    self_paced = "self-paced",
    instructor = "instructor",
    Hybrid = "Hybrid",
    Discussion_needed = "Discussion needed",
};

export enum LanguageEnum {
    
    English = "English",
    French = "French",
    Spanish = "Spanish",
    Chinese = "Chinese",
    German = "German",
    English_French = "English, French",
    English_German = "English, German",
    Other = "Other",
    NA = "NA",
};

export enum ProgrammingLanguageEnum {
    
    Python = "Python",
    R = "R",
    shell_scripting = "shell scripting",
    Matlab = "Matlab",
    Git = "Git",
    NA = "NA",
};

export enum NeuroimagingSoftwareEnum {
    
    AFNI = "AFNI",
    SPM = "SPM",
    FSL = "FSL",
    Freesurfer = "Freesurfer",
    Python = "Python",
    Multiple = "Multiple",
    NA = "NA",
};

export enum ImagingModalityEnum {
    
    DWI = "DWI",
    Structural = "Structural",
    Functional = "Functional",
    Task_based = "Task-based",
    Resting_State = "Resting-State",
    EEG = "EEG",
    Behavioral = "Behavioral",
    MEG = "MEG",
    MRI = "MRI",
    NA = "NA",
};

export enum OpenDatasetEnum {
    
    True = "True",
    False = "False",
    NA = "NA",
};

export enum QuadrantsEnum {
    
    information_oriented_LEFT_PARENTHESISreferenceRIGHT_PARENTHESIS = "information-oriented (reference)",
    understanding_oriented_LEFT_PARENTHESISexplanationRIGHT_PARENTHESIS = "understanding-oriented (explanation)",
    learning_oriented_LEFT_PARENTHESIStutorialsRIGHT_PARENTHESIS = "learning-oriented (tutorials)",
    problem_oriented_LEFT_PARENTHESIShow_to_guidesRIGHT_PARENTHESIS = "problem-oriented (how to guides)",
    NA = "NA",
};



export interface ReproInventoryEntry {
    id: string,
    tag_team?: string,
    course_name?: string,
    url?: string,
    level?: string,
    platform?: string,
    keywords?: string,
    course_length?: string,
    instruction_medium?: string,
    delivery?: string,
    language?: string,
    programming_language?: string,
    neuroimaging_software?: string,
    imaging_modality?: string,
    open_dataset?: string,
    last_updated?: string,
    functionality?: string,
    assessment?: string,
    prerequisite?: string,
    source?: string,
    review?: string,
    exclude_from_repro_inventory?: string,
    alias_links?: string,
    notes?: string,
    quadrants?: string,
}


export function isReproInventoryEntry(o: object): o is ReproInventoryEntry {
    return (
        'id' in o
    )
}

export function toReproInventoryEntry(o: ReproInventoryEntry): ReproInventoryEntry {
    return {
        id: o.id ?? null,
        tag_team: o.tag_team ?? null,
        course_name: o.course_name ?? null,
        url: o.url ?? null,
        level: o.level ?? null,
        platform: o.platform ?? null,
        keywords: o.keywords ?? null,
        course_length: o.course_length ?? null,
        instruction_medium: o.instruction_medium ?? null,
        delivery: o.delivery ?? null,
        language: o.language ?? null,
        programming_language: o.programming_language ?? null,
        neuroimaging_software: o.neuroimaging_software ?? null,
        imaging_modality: o.imaging_modality ?? null,
        open_dataset: o.open_dataset ?? null,
        last_updated: o.last_updated ?? null,
        functionality: o.functionality ?? null,
        assessment: o.assessment ?? null,
        prerequisite: o.prerequisite ?? null,
        source: o.source ?? null,
        review: o.review ?? null,
        exclude_from_repro_inventory: o.exclude_from_repro_inventory ?? null,
        alias_links: o.alias_links ?? null,
        notes: o.notes ?? null,
        quadrants: o.quadrants ?? null
    }
}

