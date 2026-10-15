import { LevelEnumValues, PlatformEnumValues, CourseLengthEnumValues, ContentFormatEnumValues, DeliveryEnumValues, LanguageEnumValues, ProgrammingLanguageEnumValues, NeuroimagingSoftwareEnumValues, ImagingModalityEnumValues } from "@/types/reproinventory";
import QuadrantWeightsInput from "@/components/QuadrantWeightsInput";
import { QUADRANT_KEYS } from "@/lib/diataxis";
import React, { useState } from "react";
import { getGitHubRepoUrl } from "@/lib/github";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";
import type { ReproInventoryEntry, CourseLengthEnum } from "@/types/reproinventory";

const GITHUB_REPO = getGitHubRepoUrl();

const levelOptions = LevelEnumValues;
const platformOptions = PlatformEnumValues;
const courseLengthOptions = CourseLengthEnumValues;
const instructionMediumOptions = ContentFormatEnumValues;
const deliveryOptions = DeliveryEnumValues;
const languageOptions = LanguageEnumValues;
const programmingLanguageOptions = ProgrammingLanguageEnumValues;
const neuroimagingSoftwareOptions = NeuroimagingSoftwareEnumValues;
const imagingModalityOptions = ImagingModalityEnumValues;
function formatAsYaml(material: ReproInventoryEntry): string {
    const lines: string[] = [];

    const addScalar = (key: string, value: string | number | boolean | undefined | null) => {
        if (value !== undefined && value !== null && value !== "") {
            if (typeof value === "string") {
                const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
                lines.push(`${key}: "${escaped}"`);
            } else {
                lines.push(`${key}: ${value}`);
            }
        }
    };

    const addList = (key: string, values: string[] | undefined | null) => {
        if (values && values.length > 0) {
            lines.push(`${key}:`);
            values.forEach((v) => lines.push(`  - ${v}`));
        }
    };

    lines.push("id: TBD");
    addScalar("course_name", material.course_name);
    addScalar("url", material.url);
    addList("level", material.level);
    addList("platform", material.platform);
    addList("keywords", material.keywords);
    addScalar("course_length", material.course_length);
    addList("instruction_medium", material.instruction_medium);
    addList("delivery", material.delivery);
    addList("language", material.language);
    addList("programming_language", material.programming_language);
    addList("neuroimaging_software", material.neuroimaging_software);
    addList("imaging_modality", material.imaging_modality);
    addScalar("open_dataset", material.open_dataset);
    addScalar("description", material.description);
    addScalar("notes", material.notes);
    const weights = material.quadrant_weights;
    if (weights && QUADRANT_KEYS.some((k) => (weights[k] ?? 0) > 0)) {
        lines.push("quadrant_weights:");
        QUADRANT_KEYS.forEach((k) => lines.push(`  ${k}: ${weights[k] ?? 0}`));
    }

    return lines.join("\n");
}

function openGitHubIssue(material: ReproInventoryEntry) {
    const yaml = formatAsYaml(material);
    const title = `Add material: ${material.course_name || "New training material"}`;
    const body =
        `## New Training Material Submission\n\n` +
        `Please review the following training material for addition to ReproInventory.\n\n` +
        `\`\`\`yaml\n${yaml}\n\`\`\``;
    const url = `${GITHUB_REPO}/issues/new?labels=new-material&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
}

interface AddMaterialDialogProps {
    onClose: () => void;
}

const AddMaterialDialog: React.FC<AddMaterialDialogProps> = ({ onClose }) => {
    const [material, setMaterial] = useState<ReproInventoryEntry>({
        id: 0, // assigned automatically when the contribution is processed
        course_name: "",
        url: "",
        level: [],
        platform: [],
        keywords: [],
        course_length: undefined,
        instruction_medium: [],
        delivery: [],
        language: [],
        programming_language: [],
        neuroimaging_software: [],
        imaging_modality: [],
        open_dataset: undefined,
        description: "",
        notes: "",
    });

    const handleChange = (field: keyof ReproInventoryEntry, value: ReproInventoryEntry[keyof ReproInventoryEntry]) => {
        setMaterial((prev) => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field: keyof ReproInventoryEntry, option: string, checked: boolean) => {
        const current = (material[field] || []) as string[];
        handleChange(field, checked ? [...current, option] : current.filter((v) => v !== option));
    };

    const handleArrayItemChange = (field: keyof ReproInventoryEntry, index: number, value: string) => {
        const arr = [...((material[field] || []) as string[])];
        arr[index] = value;
        handleChange(field, arr);
    };

    const handleAddArrayItem = (field: keyof ReproInventoryEntry) => {
        handleChange(field, [...((material[field] || []) as string[]), ""]);
    };

    const handleRemoveArrayItem = (field: keyof ReproInventoryEntry, index: number) => {
        handleChange(field, ((material[field] || []) as string[]).filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!material.course_name?.trim()) {
            alert("Please provide a course name.");
            return;
        }
        openGitHubIssue(material);
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[800px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>Add New Training Material</DialogTitle>
                <DialogDescription>
                    Fill in the details below. Submitting will open a pre-filled GitHub issue for maintainer review.
                    Only course name is required.
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                {/* Essential fields */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="course_name" className="text-right">Course Name *</Label>
                    <Input
                        id="course_name"
                        value={material.course_name || ""}
                        onChange={(e) => handleChange("course_name", e.target.value)}
                        className="col-span-3"
                        placeholder="Enter course name"
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">URL</Label>
                    <Input
                        id="url"
                        value={material.url || ""}
                        onChange={(e) => handleChange("url", e.target.value)}
                        className="col-span-3"
                        placeholder="https://example.com"
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input
                        id="description"
                        value={material.description || ""}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className="col-span-3"
                        placeholder="Brief description of the material"
                    />
                </div>

                {/* Keywords */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Keywords</Label>
                    <div className="col-span-3 space-y-2">
                        {(material.keywords || []).map((keyword, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={keyword}
                                    onChange={(e) => handleArrayItemChange("keywords", index, e.target.value)}
                                    className="flex-grow"
                                    placeholder="Enter keyword"
                                />
                                <Button variant="outline" size="icon" onClick={() => handleRemoveArrayItem("keywords", index)}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddArrayItem("keywords")}>
                            <Plus className="h-4 w-4 mr-2" /> Add Keyword
                        </Button>
                    </div>
                </div>

                {/* Course Length */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Course Length</Label>
                    <Select
                        value={material.course_length || ""}
                        onValueChange={(value) => handleChange("course_length", value as CourseLengthEnum)}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select course length" />
                        </SelectTrigger>
                        <SelectContent>
                            {courseLengthOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Multi-select grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Level */}
                    <div>
                        <Label className="text-sm font-medium">Level</Label>
                        <div className="mt-2 space-y-2">
                            {levelOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-level-${option}`}
                                        checked={material.level?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("level", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-level-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <Label className="text-sm font-medium">Platform</Label>
                        <div className="mt-2 space-y-2">
                            {platformOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-platform-${option}`}
                                        checked={material.platform?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("platform", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-platform-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instruction Medium */}
                    <div>
                        <Label className="text-sm font-medium">Instruction Medium</Label>
                        <div className="mt-2 space-y-2">
                            {instructionMediumOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-medium-${option}`}
                                        checked={material.instruction_medium?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("instruction_medium", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-medium-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery */}
                    <div>
                        <Label className="text-sm font-medium">Delivery</Label>
                        <div className="mt-2 space-y-2">
                            {deliveryOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-delivery-${option}`}
                                        checked={material.delivery?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("delivery", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-delivery-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div>
                        <Label className="text-sm font-medium">Language</Label>
                        <div className="mt-2 space-y-2">
                            {languageOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-language-${option}`}
                                        checked={material.language?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("language", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-language-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Programming Language */}
                    <div>
                        <Label className="text-sm font-medium">Programming Language</Label>
                        <div className="mt-2 space-y-2">
                            {programmingLanguageOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-prog-${option}`}
                                        checked={material.programming_language?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("programming_language", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-prog-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Neuroimaging Software */}
                    <div>
                        <Label className="text-sm font-medium">Neuroimaging Software</Label>
                        <div className="mt-2 space-y-2">
                            {neuroimagingSoftwareOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-neuro-${option}`}
                                        checked={material.neuroimaging_software?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("neuroimaging_software", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-neuro-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Imaging Modality */}
                    <div>
                        <Label className="text-sm font-medium">Imaging Modality</Label>
                        <div className="mt-2 space-y-2">
                            {imagingModalityOptions.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`add-modality-${option}`}
                                        checked={material.imaging_modality?.includes(option) || false}
                                        onCheckedChange={(checked) => handleMultiSelectChange("imaging_modality", option, checked as boolean)}
                                    />
                                    <Label htmlFor={`add-modality-${option}`} className="text-sm">{option}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Open Dataset */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Open Dataset</Label>
                    <div className="col-span-3 flex items-center gap-2">
                        <Checkbox
                            id="open_dataset"
                            checked={material.open_dataset === true}
                            onCheckedChange={(checked) => handleChange("open_dataset", checked === true)}
                        />
                        <Label htmlFor="open_dataset" className="text-sm">Uses an open dataset</Label>
                    </div>
                </div>

                {/* Diataxis profile */}
                <div>
                    <Label className="text-sm font-medium">Diataxis profile</Label>
                    <div className="mt-2">
                        <QuadrantWeightsInput
                            idPrefix="add-quadrant"
                            value={material.quadrant_weights}
                            onChange={(w) => handleChange("quadrant_weights", w)}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">Notes</Label>
                    <Input
                        id="notes"
                        value={material.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        className="col-span-3"
                        placeholder="Additional notes"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Submit via GitHub Issue</Button>
            </div>
        </DialogContent>
    );
};

export default AddMaterialDialog;
