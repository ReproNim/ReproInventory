"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, BookOpen, Video, FileText, Clock, ExternalLink } from "lucide-react" // Added ExternalLink
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  type ReproInventoryEntry,
  type LevelEnum,
  type PlatformEnum,
  type CourseLengthEnum,
  type ContentFormatEnum,
  type DeliveryEnum,
  type LanguageEnum,
  type ProgrammingLanguageEnum,
  type NeuroimagingSoftwareEnum,
  type ImagingModalityEnum,
  type OpenDatasetEnum,
  type QuadrantsEnum,
} from "./types/reproinventory" // Import generated types

export default function TrainingMaterialsBrowser() {
  const [reproInventoryData, setReproInventoryData] = useState<ReproInventoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRawDataDialog, setShowRawDataDialog] = useState(false)
  const [selectedRawMaterial, setSelectedRawMaterial] = useState<ReproInventoryEntry | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/ReproInventory/data/reproinventory_data.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: ReproInventoryEntry[] = await response.json()
        setReproInventoryData(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // State for filters, adapted to schema
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevels, setSelectedLevels] = useState<LevelEnum[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformEnum[]>([])
  const [selectedCourseLengths, setSelectedCourseLengths] = useState<CourseLengthEnum[]>([])
  const [selectedInstructionMedia, setSelectedInstructionMedia] = useState<ContentFormatEnum[]>([])
  const [selectedDeliveries, setSelectedDeliveries] = useState<DeliveryEnum[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageEnum[]>([])
  const [selectedProgrammingLanguages, setSelectedProgrammingLanguages] = useState<ProgrammingLanguageEnum[]>([])
  const [selectedNeuroimagingSoftware, setSelectedNeuroimagingSoftware] = useState<NeuroimagingSoftwareEnum[]>([])
  const [selectedImagingModalities, setSelectedImagingModalities] = useState<ImagingModalityEnum[]>([])
  const [selectedOpenDataset, setSelectedOpenDataset] = useState<OpenDatasetEnum | "">("")
  const [selectedQuadrants, setSelectedQuadrants] = useState<QuadrantsEnum[]>([])
  const [showAssessmentOnly, setShowAssessmentOnly] = useState(false)
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false) // Assuming a 'featured' concept will be derived or added

  // Helper function to handle multi-select filters
  const handleMultiSelectFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T, checked: boolean) => {
    setter((prev) => (checked ? [...prev, value] : prev.filter((item) => item !== value)))
  }

  // Define filter options based on Enums from schema
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

  const filteredMaterials = useMemo(() => {
    let filtered = reproInventoryData

    return filtered.filter((material) => {
      // Search query filter: course_name, url, keywords, notes, review
      const searchFields = [
        material.course_name,
        material.url,
        material.review,
        material.notes,
        ...(material.keywords || []),
      ].filter(Boolean).map(String).join(" ").toLowerCase();

      if (searchQuery && !searchFields.includes(searchQuery.toLowerCase())) {
        return false
      }

      // Level filter
      if (selectedLevels.length > 0 && !material.level?.some(level => selectedLevels.includes(level))) {
        return false;
      }

      // Platform filter
      if (selectedPlatforms.length > 0 && !material.platform?.some(platform => selectedPlatforms.includes(platform))) {
        return false;
      }

      // Course Length filter
      if (selectedCourseLengths.length > 0 && material.course_length && !selectedCourseLengths.includes(material.course_length)) {
        return false;
      }

      // Instruction Medium filter
      if (selectedInstructionMedia.length > 0 && !material.instruction_medium?.some(medium => selectedInstructionMedia.includes(medium))) {
        return false;
      }

      // Delivery filter
      if (selectedDeliveries.length > 0 && !material.delivery?.some(delivery => selectedDeliveries.includes(delivery))) {
        return false;
      }

      // Language filter
      if (selectedLanguages.length > 0 && !material.language?.some(language => selectedLanguages.includes(language))) {
        return false;
      }

      // Programming Language filter
      if (selectedProgrammingLanguages.length > 0 && !material.programming_language?.some(lang => selectedProgrammingLanguages.includes(lang))) {
        return false;
      }

      // Neuroimaging Software filter
      if (selectedNeuroimagingSoftware.length > 0 && !material.neuroimaging_software?.some(software => selectedNeuroimagingSoftware.includes(software))) {
        return false;
      }

      // Imaging Modality filter
      if (selectedImagingModalities.length > 0 && !material.imaging_modality?.some(modality => selectedImagingModalities.includes(modality))) {
        return false;
      }

      // Open Dataset filter
      if (selectedOpenDataset && material.open_dataset !== selectedOpenDataset) {
        return false;
      }
      
      // Quadrants filter
      if (selectedQuadrants.length > 0 && !material.quadrants?.some(quadrant => selectedQuadrants.includes(quadrant))) {
        return false;
      }


      // Assessment filter (boolean)
      if (showAssessmentOnly && !material.assessment) {
        return false
      }

      // Featured filter (assuming 'featured' will be part of the schema or derived)
      // Currently, 'featured' is not in the schema. This filter will always return true
      // or needs to be adapted once 'featured' status is defined for ReproInventoryEntry.
      // For now, disabling or ignoring it if not mapped.
      if (showFeaturedOnly) {
         // No direct mapping for 'featured' in schema. Will either need to add it or
         // decide on a derivation for 'featured' status from existing fields.
         // For now, let's assume all are 'not featured' so this filter effectively does nothing unless implemented.
         // Or, if we expect "featured" to be a tag_team like "ReproNim", we can adjust.
         // For now, it's a dummy filter.
      }


      return true
    })
  }, [
    reproInventoryData,
    searchQuery,
    selectedLevels,
    selectedPlatforms,
    selectedCourseLengths,
    selectedInstructionMedia,
    selectedDeliveries,
    selectedLanguages,
    selectedProgrammingLanguages,
    selectedNeuroimagingSoftware,
    selectedImagingModalities,
    selectedOpenDataset,
    selectedQuadrants,
    showAssessmentOnly,
    showFeaturedOnly,
  ])

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedLevels([])
    setSelectedPlatforms([])
    setSelectedCourseLengths([])
    setSelectedInstructionMedia([])
    setSelectedDeliveries([])
    setSelectedLanguages([])
    setSelectedProgrammingLanguages([])
    setSelectedNeuroimagingSoftware([])
    setSelectedImagingModalities([])
    setSelectedOpenDataset("")
    setSelectedQuadrants([])
    setShowAssessmentOnly(false)
    setShowFeaturedOnly(false)
  }

  const getFormatIcon = (format: ContentFormatEnum | string) => {
    switch (format) {
      case "Hands-on tutorial / notebooks":
      case "website":
      case "notes":
      case "reference":
      case "blog post":
      case "outline":
      case "meta-resource":
        return <BookOpen className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "lecture":
      case "slides":
        return <FileText className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Training Materials Library</h1>
          <p className="text-muted-foreground">
            Explore our comprehensive collection of research training materials and educational resources
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={showFeaturedOnly}
                    onCheckedChange={(checked) => setShowFeaturedOnly(checked === true)}
                  />
                  <Label htmlFor="featured" className="text-sm">
                    Featured only
                  </Label>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Filters</span>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quadrants</CardTitle>
                    <CardDescription>Filter by Quadrants classification</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quadrantsOptions.map((quadrant) => (
                        <div key={quadrant} className="flex items-start space-x-2">
                          <Checkbox
                            id={`quadrant-${quadrant}`}
                            checked={selectedQuadrants.includes(quadrant)}
                            onCheckedChange={(checked) =>
                              handleMultiSelectFilterChange(setSelectedQuadrants, quadrant, checked as boolean)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`quadrant-${quadrant}`} className="text-sm font-medium">
                              {quadrant}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="level">
                    <AccordionTrigger>Level</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {levelOptions.map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`level-${level}`}
                              checked={selectedLevels.includes(level)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(setSelectedLevels, level, checked as boolean)
                              }
                            />
                            <Label htmlFor={`level-${level}`} className="text-sm">
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="platform">
                    <AccordionTrigger>Platform</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {platformOptions.map((platform) => (
                          <div key={platform} className="flex items-center space-x-2">
                            <Checkbox
                              id={`platform-${platform}`}
                              checked={selectedPlatforms.includes(platform)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(setSelectedPlatforms, platform, checked as boolean)
                              }
                            />
                            <Label htmlFor={`platform-${platform}`} className="text-sm">
                              {platform}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="course-length">
                    <AccordionTrigger>Course Length</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {courseLengthOptions.map((length) => (
                          <div key={length} className="flex items-center space-x-2">
                            <Checkbox
                              id={`length-${length}`}
                              checked={selectedCourseLengths.includes(length)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(setSelectedCourseLengths, length, checked as boolean)
                              }
                            />
                            <Label htmlFor={`length-${length}`} className="text-sm">
                              {length}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="instruction-medium">
                    <AccordionTrigger>Instruction Medium</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {instructionMediumOptions.map((medium) => (
                          <div key={medium} className="flex items-center space-x-2">
                            <Checkbox
                              id={`medium-${medium}`}
                              checked={selectedInstructionMedia.includes(medium)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(
                                  setSelectedInstructionMedia,
                                  medium,
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor={`medium-${medium}`} className="text-sm">
                              {medium}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="delivery">
                    <AccordionTrigger>Delivery</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {deliveryOptions.map((delivery) => (
                          <div key={delivery} className="flex items-center space-x-2">
                            <Checkbox
                              id={`delivery-${delivery}`}
                              checked={selectedDeliveries.includes(delivery)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(setSelectedDeliveries, delivery, checked as boolean)
                              }
                            />
                            <Label htmlFor={`delivery-${delivery}`} className="text-sm">
                              {delivery}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="language">
                    <AccordionTrigger>Language</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {languageOptions.map((language) => (
                          <div key={language} className="flex items-center space-x-2">
                            <Checkbox
                              id={`language-${language}`}
                              checked={selectedLanguages.includes(language)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(setSelectedLanguages, language, checked as boolean)
                              }
                            />
                            <Label htmlFor={`language-${language}`} className="text-sm">
                              {language}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="programming-language">
                    <AccordionTrigger>Programming Language</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {programmingLanguageOptions.map((lang) => (
                          <div key={lang} className="flex items-center space-x-2">
                            <Checkbox
                              id={`programming-language-${lang}`}
                              checked={selectedProgrammingLanguages.includes(lang)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(
                                  setSelectedProgrammingLanguages,
                                  lang,
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor={`programming-language-${lang}`} className="text-sm">
                              {lang}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="neuroimaging-software">
                    <AccordionTrigger>Neuroimaging Software</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {neuroimagingSoftwareOptions.map((software) => (
                          <div key={software} className="flex items-center space-x-2">
                            <Checkbox
                              id={`neuroimaging-software-${software}`}
                              checked={selectedNeuroimagingSoftware.includes(software)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(
                                  setSelectedNeuroimagingSoftware,
                                  software,
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor={`neuroimaging-software-${software}`} className="text-sm">
                              {software}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="imaging-modality">
                    <AccordionTrigger>Imaging Modality</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {imagingModalityOptions.map((modality) => (
                          <div key={modality} className="flex items-center space-x-2">
                            <Checkbox
                              id={`imaging-modality-${modality}`}
                              checked={selectedImagingModalities.includes(modality)}
                              onCheckedChange={(checked) =>
                                handleMultiSelectFilterChange(
                                  setSelectedImagingModalities,
                                  modality,
                                  checked as boolean,
                                )
                              }
                            />
                            <Label htmlFor={`imaging-modality-${modality}`} className="text-sm">
                              {modality}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="open-dataset">
                    <AccordionTrigger>Open Dataset</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {openDatasetOptions.map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <Checkbox
                              id={`open-dataset-${option}`}
                              checked={selectedOpenDataset === option}
                              onCheckedChange={() => setSelectedOpenDataset(option)}
                            />
                            <Label htmlFor={`open-dataset-${option}`} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="assessment">
                    <AccordionTrigger>Assessment Available</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showAssessmentOnly"
                          checked={showAssessmentOnly}
                          onCheckedChange={(checked) => setShowAssessmentOnly(checked as boolean)}
                        />
                        <Label htmlFor="showAssessmentOnly" className="text-sm">
                          Show only materials with assessment
                        </Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {loading && <p>Loading materials...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{filteredMaterials.length} Training Materials</h2>
                    {searchQuery && (
                      <p className="text-sm text-muted-foreground">Results for "{searchQuery}"</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredMaterials.map((material) => (
                    <Card key={material.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getFormatIcon(material.instruction_medium?.[0] || "")}
                            <Badge variant="secondary">
                              {material.instruction_medium?.[0] || "N/A"}
                            </Badge>
                          </div>
                          {material.assessment && <Badge variant="default">Assessment</Badge>}
                        </div>
                        <CardTitle className="text-lg">{material.course_name}</CardTitle>
                        <CardDescription>{material.review}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {material.course_length || "N/A"}
                          </div>
                          {material.level && (
                            <Badge variant="outline">{material.level.join(", ")}</Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">KEYWORDS</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {material.keywords?.map((keyword) => (
                                        <Badge key={keyword} variant="outline" className="text-xs">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">PROGRAMMING LANGUAGE</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {material.programming_language?.map((lang) => (
                                        <Badge key={lang} variant="outline" className="text-xs">
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground">PLATFORM</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {material.platform?.map((platform) => (
                                        <Badge key={platform} variant="outline" className="text-xs">
                                            {platform}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            {material.url && (
                              <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                Access Material <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-fit text-xs px-2 py-1 h-auto"
                              onClick={() => setSelectedRawMaterial(material)}
                            >
                              View Raw Data
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                              <DialogTitle>Raw Data for {selectedRawMaterial?.course_name}</DialogTitle>
                              <DialogDescription>
                                This is the raw JSON data for the selected training material.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[60vh] overflow-auto rounded-md bg-zinc-900 p-4 text-zinc-50">
                              <pre className="text-xs">
                                {selectedRawMaterial ? JSON.stringify(selectedRawMaterial, null, 2) : "No data selected"}
                              </pre>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredMaterials.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No materials found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or clearing some filters
                    </p>
                    <Button onClick={clearAllFilters}>Clear All Filters</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
