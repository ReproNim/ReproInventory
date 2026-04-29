import { useState, useEffect } from "react"
import type { ReproInventoryEntry } from "@/types/reproinventory"

export function useInventoryData() {
  const [data, setData] = useState<ReproInventoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/reproinventory_data.json`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const json: ReproInventoryEntry[] = await response.json()
        setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}
