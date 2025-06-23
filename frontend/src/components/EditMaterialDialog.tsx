import React, { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus } from "lucide-react"; // Added Plus and Minus for dynamic fields
import type {
    ReproInventoryEntry,
    LevelEnum,
    PlatformEnum,
    CourseLengthEnum,
    ContentFormatEnum,
    DeliveryEnum,
    LanguageEnum,
    ProgrammingLanguageEnum,
    NeuroimagingSoftwareEnum,
    ImagingModalityEnum,
    OpenDatasetEnum,
    QuadrantsEnum,
} from "@/types/reproinventory";

interface EditMaterialDialogProps {
    material: ReproInventoryEntry;
    onSave: (updatedMaterial: ReproInventoryEntry) => void;
    onClose: () => void;
}

const levelOptions: LevelEnum[] = ["Beginner", "Intermediate", "Advanced", "NA"];
const platformOptions: PlatformEnum[] = ["Mac", "Windows", "Linux", "Docker", "Jupyter", "NA"];
const courseLengthOptions: CourseLengthEnum[] = ["<1 hr", "1-4 hrs", "1 day", "1-3 days", "1 week", "1+ weeks", "NA"];
const instructionMediumOptions: ContentFormatEnum[] = ["Hands-on tutorial / notebooks", "lecture", "video", "notes", "blog post", "reference", "slides", "website", "outline", "meta-resource", "NA"];
const deliveryOptions: DeliveryEnum[] = ["self-paced", "instructor", "Hybrid", "Discussion needed"];
const languageOptions: LanguageEnum[] = ["English", "French", "Spanish", "Chinese", "German", "English, French", "English, German", "Other", "NA"];
const programmingLanguageOptions: ProgrammingLanguageEnum[] = ["Python", "R", "shell scripting", "Matlab", "Git", "NA"];
const neuroimagingSoftwareOptions: NeuroimagingSoftwareEnum[] = ["AFNI", "SPM", "FSL", "Freesurfer", "Python", "Multiple", "NA"];
const imagingModalityOptions: ImagingModalityEnum[] = ["DWI", "Structural", "Functional", "Task-based", "Resting-State", "EEG", "Behavioral", "MEG", "MRI", "NA"];
const openDatasetOptions: OpenDatasetEnum[] = ["True", "False", "NA"];
const quadrantsOptions: QuadrantsEnum[] = ["information-oriented (reference)", "understanding-oriented (explanation)", "learning-oriented (tutorials)", "problem-oriented (how to guides)", "NA"];

const EditMaterialDialog: React.FC<EditMaterialDialogProps> = ({ material, onSave, onClose }) => {
    const [editedMaterial, setEditedMaterial] = useState<ReproInventoryEntry>(material);

    useEffect(() => {
        setEditedMaterial(material);
    }, [material]);

    const handleChange = (field: keyof ReproInventoryEntry, value: any) => {
        setEditedMaterial(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field: keyof ReproInventoryEntry, option: string, checked: boolean) => {
        const currentValues = (editedMaterial[field] || []) as string[];
        const updatedValues = checked
            ? [...currentValues, option]
            : currentValues.filter(item => item !== option);
        handleChange(field, updatedValues);
    };

    const handleArrayInputChange = (field: keyof ReproInventoryEntry, index: number, value: string) => {
        const currentArray = (editedMaterial[field] || []) as string[];
        const updatedArray = [...currentArray];
        updatedArray[index] = value;
        handleChange(field, updatedArray);
    };

    const handleAddArrayItem = (field: keyof ReproInventoryEntry) => {
        const currentArray = (editedMaterial[field] || []) as string[];
        handleChange(field, [...currentArray, ""]); // Add an empty string for new item
    };

    const handleRemoveArrayItem = (field: keyof ReproInventoryEntry, index: number) => {
        const currentArray = (editedMaterial[field] || []) as string[];
        const updatedArray = currentArray.filter((_, i) => i !== index);
        handleChange(field, updatedArray);
    };

    const handleSave = () => {
        onSave(editedMaterial);
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>Edit {editedMaterial.course_name || "Material"}</DialogTitle>
                <DialogDescription>
                    Update the details of this training material.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {/* Text Inputs */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">ID</Label>
                    <Input id="id" value={editedMaterial.id} disabled className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course_name" className="text-right">Course Name</Label>
                    <Input id="course_name" value={editedMaterial.course_name || ""} onChange={(e) => handleChange("course_name", e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">URL</Label>
                    <Input id="url" value={editedMaterial.url || ""} onChange={(e) => handleChange("url", e.target.value)} className="col-span-3" />
                </div>
                {/* Dynamic Tag Team fields */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="tag_team" className="text-right pt-2">Tag Team</Label>
                    <div className="col-span-3 space-y-2">
                        {(editedMaterial.tag_team || [] as string[]).map((team, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={team}
                                    onChange={(e) => handleArrayInputChange("tag_team", index, e.target.value)}
                                    className="flex-grow"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveArrayItem("tag_team", index)}
                                    className="flex-shrink-0"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddArrayItem("tag_team")}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Tag Team
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="last_updated" className="text-right">Last Updated</Label>
                    <Input id="last_updated" value={editedMaterial.last_updated || ""} onChange={(e) => handleChange("last_updated", e.target.value)} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="functionality" className="text-right">Functionality</Label>
                    <Input id="functionality" value={editedMaterial.functionality || ""} onChange={(e) => handleChange("functionality", e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assessment" className="text-right">Assessment</Label>
                    <Input id="assessment" value={editedMaterial.assessment || ""} onChange={(e) => handleChange("assessment", e.target.value)} className="col-span-3" />
                </div>
                {/* Dynamic Prerequisite fields */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="prerequisite" className="text-right pt-2">Prerequisite</Label>
                    <div className="col-span-3 space-y-2">
                        {(editedMaterial.prerequisite || [] as string[]).map((req, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={req}
                                    onChange={(e) => handleArrayInputChange("prerequisite", index, e.target.value)}
                                    className="flex-grow"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveArrayItem("prerequisite", index)}
                                    className="flex-shrink-0"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddArrayItem("prerequisite")}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Prerequisite
                        </Button>
                    </div>
                </div>
                {/* Dynamic Source fields */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="source" className="text-right pt-2">Source</Label>
                    <div className="col-span-3 space-y-2">
                        {(editedMaterial.source || [] as string[]).map((src, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={src}
                                    onChange={(e) => handleArrayInputChange("source", index, e.target.value)}
                                    className="flex-grow"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveArrayItem("source", index)}
                                    className="flex-shrink-0"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddArrayItem("source")}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Source
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="review" className="text-right">Review</Label>
                    <Input id="review" value={editedMaterial.review || ""} onChange={(e) => handleChange("review", e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="exclude_from_repro_inventory" className="text-right">Exclude from Repro Inventory</Label>
                    <Input id="exclude_from_repro_inventory" value={editedMaterial.exclude_from_repro_inventory || ""} onChange={(e) => handleChange("exclude_from_repro_inventory", e.target.value)} className="col-span-3" />
                </div>
                {/* Reverted Alias Links to single input */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alias_links" className="text-right">Alias Links</Label>
                    <Input
                        id="alias_links"
                        value={editedMaterial.alias_links || ""}
                        onChange={(e) => handleChange("alias_links", e.target.value)}
                        className="col-span-3"
                    />
                </div>
                {/* Dynamic Keywords fields */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="keywords" className="text-right pt-2">Keywords</Label>
                    <div className="col-span-3 space-y-2">
                        {(editedMaterial.keywords || [] as string[]).map((keyword, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={keyword}
                                    onChange={(e) => handleArrayInputChange("keywords", index, e.target.value)}
                                    className="flex-grow"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleRemoveArrayItem("keywords", index)}
                                    className="flex-shrink-0"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddArrayItem("keywords")}
                            className="mt-2"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Keyword
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">Notes</Label>
                    <Input id="notes" value={editedMaterial.notes || ""} onChange={(e) => handleChange("notes", e.target.value)} className="col-span-3" />
                </div>

                {/* Multi-select Checkboxes (rest remain the same) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-left">Level</Label>
                        {levelOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`level-${option}`}
                                    checked={editedMaterial.level?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("level", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`level-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Platform</Label>
                        {platformOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`platform-${option}`}
                                    checked={editedMaterial.platform?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("platform", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`platform-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Instruction Medium</Label>
                        {instructionMediumOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`instruction_medium-${option}`}
                                    checked={editedMaterial.instruction_medium?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("instruction_medium", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`instruction_medium-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Delivery</Label>
                        {deliveryOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`delivery-${option}`}
                                    checked={editedMaterial.delivery?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("delivery", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`delivery-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Language</Label>
                        {languageOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`language-${option}`}
                                    checked={editedMaterial.language?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("language", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`language-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Programming Language</Label>
                        {programmingLanguageOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`programming_language-${option}`}
                                    checked={editedMaterial.programming_language?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("programming_language", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`programming_language-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Neuroimaging Software</Label>
                        {neuroimagingSoftwareOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`neuroimaging_software-${option}`}
                                    checked={editedMaterial.neuroimaging_software?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("neuroimaging_software", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`neuroimaging_software-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Imaging Modality</Label>
                        {imagingModalityOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`imaging_modality-${option}`}
                                    checked={editedMaterial.imaging_modality?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("imaging_modality", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`imaging_modality-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Label className="text-left">Quadrants</Label>
                        {quadrantsOptions.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`quadrants-${option}`}
                                    checked={editedMaterial.quadrants?.includes(option) || false}
                                    onCheckedChange={(checked) =>
                                        handleMultiSelectChange("quadrants", option, checked as boolean)
                                    }
                                />
                                <Label htmlFor={`quadrants-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Single Selects */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course_length" className="text-right">Course Length</Label>
                    <Select
                        value={editedMaterial.course_length || ""}
                        onValueChange={(value) => handleChange("course_length", value as CourseLengthEnum)}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select course length" />
                        </SelectTrigger>
                        <SelectContent>
                            {courseLengthOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="open_dataset" className="text-right">Open Dataset</Label>
                    <Select
                        value={editedMaterial.open_dataset || ""}
                        onValueChange={(value) => handleChange("open_dataset", value as OpenDatasetEnum)}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select dataset availability" />
                        </SelectTrigger>
                        <SelectContent>
                            {openDatasetOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </DialogContent>
    );
};

export default EditMaterialDialog;