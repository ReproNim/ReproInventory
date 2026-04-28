import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Footer from "@/components/Footer"
import { useInventoryData } from "@/hooks/useInventoryData"
import { buildSingleItemJsonLd } from "@/lib/schema-org"

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function BadgeList({ items }: { items: string[] | undefined }) {
  if (!items?.length) return <span className="text-sm text-muted-foreground">N/A</span>
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
      ))}
    </div>
  )
}

export default function ItemPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, error } = useInventoryData()

  const item = data.find((entry) => String(entry.id) === id)

  useEffect(() => {
    if (!item) return
    const existing = document.getElementById("reproinventory-item-schema-org")
    if (existing) existing.remove()
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.id = "reproinventory-item-schema-org"
    script.textContent = buildSingleItemJsonLd(item)
    document.head.appendChild(script)
    if (item.course_name) document.title = `${item.course_name} — ReproInventory`
    return () => {
      document.getElementById("reproinventory-item-schema-org")?.remove()
      document.title = "ReproInventory"
    }
  }, [item])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Browse
            </Button>
          </Link>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && !item && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Item not found</h2>
            <Link to="/"><Button>Back to Browse</Button></Link>
          </div>
        )}

        {item && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.course_name}</h1>
              {item.description && (
                <p className="text-muted-foreground text-lg">{item.description}</p>
              )}
            </div>

            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  Access Material <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <DetailRow label="Level">
                    <BadgeList items={item.level?.filter((l) => l !== "NA")} />
                  </DetailRow>
                  <DetailRow label="Course Length">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {item.course_length ?? "N/A"}
                    </div>
                  </DetailRow>
                  <DetailRow label="Format">
                    <BadgeList items={item.instruction_medium?.filter((m) => m !== "NA")} />
                  </DetailRow>
                  <DetailRow label="Delivery">
                    <BadgeList items={item.delivery} />
                  </DetailRow>
                  <DetailRow label="Language">
                    <BadgeList items={item.language?.filter((l) => l !== "NA")} />
                  </DetailRow>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Technical Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <DetailRow label="Platform">
                    <BadgeList items={item.platform?.filter((p) => p !== "NA")} />
                  </DetailRow>
                  <DetailRow label="Programming Language">
                    <BadgeList items={item.programming_language?.filter((l) => l !== "NA")} />
                  </DetailRow>
                  <DetailRow label="Neuroimaging Software">
                    <BadgeList items={item.neuroimaging_software?.filter((s) => s !== "NA")} />
                  </DetailRow>
                  <DetailRow label="Imaging Modality">
                    <BadgeList items={item.imaging_modality?.filter((m) => m !== "NA")} />
                  </DetailRow>
                  <DetailRow label="Open Dataset">
                    <span className="text-sm">
                      {item.open_dataset === true ? "Yes" : item.open_dataset === false ? "No" : "N/A"}
                    </span>
                  </DetailRow>
                </CardContent>
              </Card>

              {(item.keywords?.length || item.quadrants?.length || item.functionality) && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {item.functionality && (
                      <DetailRow label="Functionality">
                        <p className="text-sm">{item.functionality}</p>
                      </DetailRow>
                    )}
                    {item.keywords?.length && (
                      <DetailRow label="Keywords">
                        <BadgeList items={item.keywords} />
                      </DetailRow>
                    )}
                    {item.quadrants?.length && (
                      <DetailRow label="Quadrants">
                        <BadgeList items={item.quadrants.filter((q) => q !== "NA")} />
                      </DetailRow>
                    )}
                  </CardContent>
                </Card>
              )}

              {(item.prerequisite?.length || item.notes) && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Additional Info</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {item.prerequisite?.length && (
                      <DetailRow label="Prerequisites">
                        <BadgeList items={item.prerequisite} />
                      </DetailRow>
                    )}
                    {item.notes && (
                      <DetailRow label="Notes">
                        <p className="text-sm">{item.notes}</p>
                      </DetailRow>
                    )}
                    {item.last_updated && (
                      <DetailRow label="Last Updated">
                        <span className="text-sm">{item.last_updated}</span>
                      </DetailRow>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
