"use client"

import { useState, useMemo } from "react"
import { Search, BookOpen, Video, FileText, Users, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Sample training materials data
const trainingMaterials = [
  {
    id: 1,
    title: "Research Design Fundamentals",
    description: "Comprehensive guide to designing robust research studies and methodologies.",
    format: "Course",
    duration: "4 hours",
    audience: ["Researchers", "Graduate Students"],
    topics: ["Methodology", "Statistics"],
    researchStages: ["design"],
    practices: ["plan", "standardize"],
    difficulty: "Beginner",
    featured: true,
  },
  {
    id: 2,
    title: "Data Collection Best Practices",
    description: "Learn effective techniques for gathering high-quality research data.",
    format: "Workshop",
    duration: "2 hours",
    audience: ["Researchers", "Data Scientists"],
    topics: ["Data Management", "Quality Control"],
    researchStages: ["collect"],
    practices: ["standardize", "annotate/describe"],
    difficulty: "Intermediate",
    featured: false,
  },
  {
    id: 3,
    title: "Image Processing with Python",
    description: "Hands-on tutorial for processing and analyzing research images.",
    format: "Tutorial",
    duration: "6 hours",
    audience: ["Data Scientists", "Researchers"],
    topics: ["Programming", "Image Analysis"],
    researchStages: ["image process"],
    practices: ["version control", "standardize"],
    difficulty: "Advanced",
    featured: true,
  },
  {
    id: 4,
    title: "Statistical Analysis Toolkit",
    description: "Essential statistical methods and tools for research analysis.",
    format: "Course",
    duration: "8 hours",
    audience: ["Researchers", "Graduate Students", "Data Scientists"],
    topics: ["Statistics", "Analysis"],
    researchStages: ["statistic"],
    practices: ["standardize", "annotate/describe"],
    difficulty: "Intermediate",
    featured: false,
  },
  {
    id: 5,
    title: "Academic Publishing Guide",
    description: "Step-by-step guide to publishing research findings effectively.",
    format: "Guide",
    duration: "3 hours",
    audience: ["Researchers", "Graduate Students"],
    topics: ["Writing", "Publishing"],
    researchStages: ["publish"],
    practices: ["archive/publish", "standardize"],
    difficulty: "Intermediate",
    featured: true,
  },
  {
    id: 6,
    title: "Version Control for Researchers",
    description: "Master Git and version control systems for research projects.",
    format: "Workshop",
    duration: "4 hours",
    audience: ["Researchers", "Data Scientists"],
    topics: ["Programming", "Collaboration"],
    researchStages: ["design", "collect"],
    practices: ["version control", "plan"],
    difficulty: "Beginner",
    featured: false,
  },
  {
    id: 7,
    title: "Data Annotation Standards",
    description: "Learn to create consistent and meaningful data annotations.",
    format: "Tutorial",
    duration: "2 hours",
    audience: ["Researchers", "Data Scientists"],
    topics: ["Data Management", "Documentation"],
    researchStages: ["collect", "image process"],
    practices: ["annotate/describe", "standardize"],
    difficulty: "Beginner",
    featured: false,
  },
  {
    id: 8,
    title: "Research Project Planning",
    description: "Comprehensive framework for planning successful research projects.",
    format: "Course",
    duration: "5 hours",
    audience: ["Researchers", "Graduate Students"],
    topics: ["Project Management", "Methodology"],
    researchStages: ["design"],
    practices: ["plan", "standardize"],
    difficulty: "Beginner",
    featured: true,
  },
]

const researchStages = [
  { id: "design", label: "Design", description: "Research planning and methodology design" },
  { id: "collect", label: "Collect", description: "Data collection and gathering" },
  { id: "image process", label: "Image Process", description: "Image analysis and processing" },
  { id: "statistic", label: "Statistics", description: "Statistical analysis and modeling" },
  { id: "publish", label: "Publish", description: "Publication and dissemination" },
]

const practices = [
  { id: "plan", label: "Plan", description: "Project planning and organization" },
  { id: "version control", label: "Version Control", description: "Code and document versioning" },
  { id: "annotate/describe", label: "Annotate/Describe", description: "Data annotation and documentation" },
  { id: "standardize", label: "Standardize", description: "Standardization and best practices" },
  { id: "archive/publish", label: "Archive/Publish", description: "Archiving and publishing workflows" },
]

const formats = ["Course", "Workshop", "Tutorial", "Guide"]
const audiences = ["Researchers", "Graduate Students", "Data Scientists"]
const topics = [
  "Methodology",
  "Statistics",
  "Data Management",
  "Programming",
  "Analysis",
  "Writing",
  "Publishing",
  "Quality Control",
  "Image Analysis",
  "Collaboration",
  "Documentation",
  "Project Management",
]
const difficulties = ["Beginner", "Intermediate", "Advanced"]

export default function TrainingMaterialsBrowser() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [selectedPractices, setSelectedPractices] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    const setters = {
      format: setSelectedFormats,
      audience: setSelectedAudiences,
      topic: setSelectedTopics,
      stage: setSelectedStages,
      practice: setSelectedPractices,
      difficulty: setSelectedDifficulties,
    }

    const setter = setters[filterType as keyof typeof setters]
    if (setter) {
      setter((prev) => (checked ? [...prev, value] : prev.filter((item) => item !== value)))
    }
  }

  const filteredMaterials = useMemo(() => {
    return trainingMaterials.filter((material) => {
      // Search query filter
      if (
        searchQuery &&
        !material.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !material.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // Format filter
      if (selectedFormats.length > 0 && !selectedFormats.includes(material.format)) {
        return false
      }

      // Audience filter
      if (selectedAudiences.length > 0 && !selectedAudiences.some((audience) => material.audience.includes(audience))) {
        return false
      }

      // Topic filter
      if (selectedTopics.length > 0 && !selectedTopics.some((topic) => material.topics.includes(topic))) {
        return false
      }

      // Research stage filter
      if (selectedStages.length > 0 && !selectedStages.some((stage) => material.researchStages.includes(stage))) {
        return false
      }

      // Practice filter
      if (
        selectedPractices.length > 0 &&
        !selectedPractices.some((practice) => material.practices.includes(practice))
      ) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(material.difficulty)) {
        return false
      }

      // Featured filter
      if (showFeaturedOnly && !material.featured) {
        return false
      }

      return true
    })
  }, [
    searchQuery,
    selectedFormats,
    selectedAudiences,
    selectedTopics,
    selectedStages,
    selectedPractices,
    selectedDifficulties,
    showFeaturedOnly,
  ])

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedFormats([])
    setSelectedAudiences([])
    setSelectedTopics([])
    setSelectedStages([])
    setSelectedPractices([])
    setSelectedDifficulties([])
    setShowFeaturedOnly(false)
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "Course":
        return <BookOpen className="w-4 h-4" />
      case "Workshop":
        return <Users className="w-4 h-4" />
      case "Tutorial":
        return <Video className="w-4 h-4" />
      case "Guide":
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
                    <CardTitle className="text-lg">Research Process</CardTitle>
                    <CardDescription>Filter by research methodology stages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {researchStages.map((stage) => (
                        <div key={stage.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`stage-${stage.id}`}
                            checked={selectedStages.includes(stage.id)}
                            onCheckedChange={(checked) => handleFilterChange("stage", stage.id, checked as boolean)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`stage-${stage.id}`} className="text-sm font-medium">
                              {stage.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{stage.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Research Practices</CardTitle>
                    <CardDescription>Filter by research practice areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {practices.map((practice) => (
                        <div key={practice.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`practice-${practice.id}`}
                            checked={selectedPractices.includes(practice.id)}
                            onCheckedChange={(checked) =>
                              handleFilterChange("practice", practice.id, checked as boolean)
                            }
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`practice-${practice.id}`} className="text-sm font-medium">
                              {practice.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{practice.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="format">
                    <AccordionTrigger>Format</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {formats.map((format) => (
                          <div key={format} className="flex items-center space-x-2">
                            <Checkbox
                              id={`format-${format}`}
                              checked={selectedFormats.includes(format)}
                              onCheckedChange={(checked) => handleFilterChange("format", format, checked as boolean)}
                            />
                            <Label htmlFor={`format-${format}`} className="text-sm">
                              {format}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="audience">
                    <AccordionTrigger>Target Audience</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {audiences.map((audience) => (
                          <div key={audience} className="flex items-center space-x-2">
                            <Checkbox
                              id={`audience-${audience}`}
                              checked={selectedAudiences.includes(audience)}
                              onCheckedChange={(checked) =>
                                handleFilterChange("audience", audience, checked as boolean)
                              }
                            />
                            <Label htmlFor={`audience-${audience}`} className="text-sm">
                              {audience}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="topics">
                    <AccordionTrigger>Topics</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {topics.map((topic) => (
                          <div key={topic} className="flex items-center space-x-2">
                            <Checkbox
                              id={`topic-${topic}`}
                              checked={selectedTopics.includes(topic)}
                              onCheckedChange={(checked) => handleFilterChange("topic", topic, checked as boolean)}
                            />
                            <Label htmlFor={`topic-${topic}`} className="text-sm">
                              {topic}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="difficulty">
                    <AccordionTrigger>Difficulty Level</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {difficulties.map((difficulty) => (
                          <div key={difficulty} className="flex items-center space-x-2">
                            <Checkbox
                              id={`difficulty-${difficulty}`}
                              checked={selectedDifficulties.includes(difficulty)}
                              onCheckedChange={(checked) =>
                                handleFilterChange("difficulty", difficulty, checked as boolean)
                              }
                            />
                            <Label htmlFor={`difficulty-${difficulty}`} className="text-sm">
                              {difficulty}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{filteredMaterials.length} Training Materials</h2>
                <p className="text-sm text-muted-foreground">{searchQuery && `Results for "${searchQuery}"`}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getFormatIcon(material.format)}
                        <Badge variant="secondary">{material.format}</Badge>
                      </div>
                      {material.featured && <Badge variant="default">Featured</Badge>}
                    </div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {material.duration}
                      </div>
                      <Badge variant="outline">{material.difficulty}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">RESEARCH STAGES</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {material.researchStages.map((stage) => (
                            <Badge key={stage} variant="outline" className="text-xs">
                              {researchStages.find((s) => s.id === stage)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">PRACTICES</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {material.practices.map((practice) => (
                            <Badge key={practice} variant="outline" className="text-xs">
                              {practices.find((p) => p.id === practice)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">TOPICS</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {material.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {material.topics.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{material.topics.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">Access Material</Button>
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
          </div>
        </div>
      </div>
    </div>
  )
}
