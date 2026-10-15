// GENERATED FILE - DO NOT EDIT.
// Generated from model/reproinventory_schema.yaml by model/generate_from_schema.py.

export type LevelEnum = "Beginner" | "Intermediate" | "Advanced" | "NA";
export const LevelEnumValues: LevelEnum[] = ["Beginner", "Intermediate", "Advanced", "NA"];

export type PlatformEnum = "Mac" | "Windows" | "Linux" | "Docker" | "Jupyter" | "NA";
export const PlatformEnumValues: PlatformEnum[] = ["Mac", "Windows", "Linux", "Docker", "Jupyter", "NA"];

export type CourseLengthEnum = "<1 hr" | "1-4 hrs" | "1 day" | "1-3 days" | "1 week" | "1+ weeks" | "NA";
export const CourseLengthEnumValues: CourseLengthEnum[] = ["<1 hr", "1-4 hrs", "1 day", "1-3 days", "1 week", "1+ weeks", "NA"];

export type ContentFormatEnum = "Hands-on tutorial / notebooks" | "lecture" | "video" | "notes" | "blog post" | "reference" | "slides" | "website" | "outline" | "meta-resource" | "NA";
export const ContentFormatEnumValues: ContentFormatEnum[] = ["Hands-on tutorial / notebooks", "lecture", "video", "notes", "blog post", "reference", "slides", "website", "outline", "meta-resource", "NA"];

export type DeliveryEnum = "self-paced" | "instructor" | "Hybrid";
export const DeliveryEnumValues: DeliveryEnum[] = ["self-paced", "instructor", "Hybrid"];

export type LanguageEnum = "English" | "French" | "Spanish" | "Chinese" | "German" | "English, French" | "English, German" | "Other" | "NA";
export const LanguageEnumValues: LanguageEnum[] = ["English", "French", "Spanish", "Chinese", "German", "English, French", "English, German", "Other", "NA"];

export type ProgrammingLanguageEnum = "Python" | "R" | "shell scripting" | "Matlab" | "Git" | "NA";
export const ProgrammingLanguageEnumValues: ProgrammingLanguageEnum[] = ["Python", "R", "shell scripting", "Matlab", "Git", "NA"];

export type NeuroimagingSoftwareEnum = "AFNI" | "SPM" | "FSL" | "Freesurfer" | "Python" | "Multiple" | "NA";
export const NeuroimagingSoftwareEnumValues: NeuroimagingSoftwareEnum[] = ["AFNI", "SPM", "FSL", "Freesurfer", "Python", "Multiple", "NA"];

export type ImagingModalityEnum = "DWI" | "Structural" | "Functional" | "Task-based" | "Resting-State" | "EEG" | "Behavioral" | "MEG" | "MRI" | "NA";
export const ImagingModalityEnumValues: ImagingModalityEnum[] = ["DWI", "Structural", "Functional", "Task-based", "Resting-State", "EEG", "Behavioral", "MEG", "MRI", "NA"];

export interface ReproInventoryEntry {
  id: number;
  tag_team?: string[];
  course_name?: string;
  url?: string;
  level?: LevelEnum[];
  platform?: PlatformEnum[];
  keywords?: string[];
  course_length?: CourseLengthEnum;
  instruction_medium?: ContentFormatEnum[];
  delivery?: DeliveryEnum[];
  language?: LanguageEnum[];
  programming_language?: ProgrammingLanguageEnum[];
  neuroimaging_software?: NeuroimagingSoftwareEnum[];
  imaging_modality?: ImagingModalityEnum[];
  open_dataset?: boolean;
  last_updated?: string;
  functionality?: string;
  assessment?: boolean;
  prerequisite?: string[];
  source?: string[];
  description?: string;
  review?: string;
  exclude_from_repro_inventory?: boolean;
  alias_links?: string;
  notes?: string;
  quadrant_weights?: QuadrantWeights;
}

export interface QuadrantWeights {
  tutorial?: number;
  how_to?: number;
  explanation?: number;
  reference?: number;
}
export const QuadrantWeightsKeys = ["tutorial", "how_to", "explanation", "reference"] as const;
export const QuadrantWeightsMin = 0;
export const QuadrantWeightsMax = 3;
