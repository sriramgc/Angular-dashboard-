import type { GridsterItem } from "angular-gridster2"

export interface DashboardCardData {
  id: string
  title: string
  content: string
  color: string
  gridColumn: number // Legacy property for backward compatibility
  rowId: number // Legacy property for backward compatibility
  height?: number // Legacy property for backward compatibility
}

export interface GridsterCard extends GridsterItem {
  id: string
  title: string
  content: string
  color: string
  cardType?: "default" | "stat" | "chart" | "todo" | "notes"
}

export interface DashboardRow {
  rowId: number
  cards: DashboardCardData[]
}
