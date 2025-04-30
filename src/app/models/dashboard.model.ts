export interface DashboardCardData {
  id: string
  title: string
  content: string
  color: string
  gridColumn: number // Number of columns this card spans (1-12)
  rowId: number // To group cards by row
  height?: number // Height in pixels
}

export interface DashboardRow {
  rowId: number
  cards: DashboardCardData[]
}
