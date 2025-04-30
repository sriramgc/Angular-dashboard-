import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import type { DashboardCardData } from "../models/dashboard.model"

interface DashboardRow {
  rowId: number
  cards: DashboardCardData[]
}

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  // Default cards with grid positioning
  private defaultCards: DashboardCardData[] = [
    {
      id: "card-1",
      title: "Analytics",
      content: "Your analytics overview",
      color: "bg-blue-50 dark:bg-blue-950",
      gridColumn: 6, // Half of the 12-column grid
      rowId: 1,
      height: 200, // Default height in pixels
    },
    {
      id: "card-2",
      title: "Recent Activity",
      content: "Your recent activities",
      color: "bg-green-50 dark:bg-green-950",
      gridColumn: 6,
      rowId: 1,
      height: 200,
    },
    {
      id: "card-3",
      title: "Tasks",
      content: "Your pending tasks",
      color: "bg-purple-50 dark:bg-purple-950",
      gridColumn: 4,
      rowId: 2,
      height: 200,
    },
    {
      id: "card-4",
      title: "Messages",
      content: "Your recent messages",
      color: "bg-amber-50 dark:bg-amber-950",
      gridColumn: 4,
      rowId: 2,
      height: 200,
    },
    {
      id: "card-5",
      title: "Calendar",
      content: "Upcoming events",
      color: "bg-rose-50 dark:bg-rose-950",
      gridColumn: 4,
      rowId: 2,
      height: 200,
    },
    {
      id: "card-6",
      title: "Notes",
      content: "Your saved notes",
      color: "bg-cyan-50 dark:bg-cyan-950",
      gridColumn: 12, // Full width
      rowId: 3,
      height: 200,
    },
  ]

  private cardsSubject = new BehaviorSubject<DashboardCardData[]>([])
  private nextIdSubject = new BehaviorSubject<number>(7)
  private editModeSubject = new BehaviorSubject<boolean>(false)

  cards$ = this.cardsSubject.asObservable()
  nextId$ = this.nextIdSubject.asObservable()
  editMode$ = this.editModeSubject.asObservable()

  constructor() {
    this.loadSavedLayout()
  }

  private loadSavedLayout(): void {
    const savedLayout = localStorage.getItem("dashboardLayout")
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        this.cardsSubject.next(parsed)

        // Find the highest ID to set nextId correctly
        const highestId = Math.max(
          ...parsed.map((card: DashboardCardData) => Number.parseInt(card.id.replace("card-", ""), 10) || 0),
        )
        this.nextIdSubject.next(highestId + 1)
      } catch (e) {
        console.error("Error parsing saved layout", e)
        this.cardsSubject.next(this.defaultCards)
      }
    } else {
      this.cardsSubject.next(this.defaultCards)
    }
  }

  saveLayout(): void {
    localStorage.setItem("dashboardLayout", JSON.stringify(this.cardsSubject.value))
  }

  toggleEditMode(): void {
    this.editModeSubject.next(!this.editModeSubject.value)
    if (!this.editModeSubject.value) {
      this.saveLayout()
    }
  }

  addCard(): void {
    const cards = this.cardsSubject.value
    const nextId = this.nextIdSubject.value

    // Find the highest rowId
    const highestRowId = Math.max(...cards.map((card) => card.rowId), 0)

    // Create a new card
    const newCard: DashboardCardData = {
      id: `card-${nextId}`,
      title: `New Card ${nextId}`,
      content: "Click to edit this card",
      color: "bg-slate-50 dark:bg-slate-950",
      gridColumn: 4, // Default to 1/3 of the grid
      rowId: highestRowId + 1, // Add to a new row
      height: 200, // Default height
    }

    this.cardsSubject.next([...cards, newCard])
    this.nextIdSubject.next(nextId + 1)
    this.saveLayout()
  }

  removeCard(cardId: string): void {
    const cards = this.cardsSubject.value.filter((card) => card.id !== cardId)
    this.cardsSubject.next(cards)
    this.saveLayout()
  }

  moveCard(cardId: string, targetRowId: number): void {
    const cards = [...this.cardsSubject.value]
    const cardIndex = cards.findIndex((card) => card.id === cardId)

    if (cardIndex === -1) return

    const card = { ...cards[cardIndex] }
    const sourceRowId = card.rowId

    // Don't do anything if moving to the same row
    if (sourceRowId === targetRowId) return

    // Remove the card from its original position
    cards.splice(cardIndex, 1)

    // Update the card's rowId
    card.rowId = targetRowId

    // Get all cards in the destination row
    const cardsInDestRow = cards.filter((c) => c.rowId === targetRowId)

    // Calculate total columns used in the destination row
    const columnsUsed = cardsInDestRow.reduce((sum, c) => sum + c.gridColumn, 0)

    // Adjust the card's size if necessary
    const remainingColumns = 12 - columnsUsed
    if (remainingColumns < card.gridColumn) {
      card.gridColumn = Math.max(1, remainingColumns)
    }

    // If there's not enough space, redistribute columns
    if (remainingColumns <= 0) {
      // Calculate how many columns each card should have
      const totalCards = cardsInDestRow.length + 1 // +1 for the moved card
      const columnsPerCard = Math.floor(12 / totalCards)
      const extraColumns = 12 % totalCards

      // Redistribute columns
      cards.forEach((c) => {
        if (c.rowId === targetRowId) {
          c.gridColumn = columnsPerCard
        }
      })

      // Give the moved card the extra columns if any
      card.gridColumn = columnsPerCard + extraColumns
    }

    // Add the card to the end of the array
    cards.push(card)
    this.cardsSubject.next(cards)
    this.saveLayout()
  }

  resizeCard(cardId: string, increase: boolean): void {
    const cards = this.cardsSubject.value.map((card) => {
      if (card.id === cardId) {
        // Find all cards in the same row
        const cardsInSameRow = this.cardsSubject.value.filter((c) => c.rowId === card.rowId && c.id !== cardId)
        const totalOtherColumns = cardsInSameRow.reduce((sum, c) => sum + c.gridColumn, 0)

        // Calculate available space
        const availableSpace = 12 - totalOtherColumns

        // Calculate new size
        let newSize = increase ? card.gridColumn + 1 : card.gridColumn - 1

        // Ensure size is within bounds
        newSize = Math.max(1, Math.min(newSize, availableSpace))

        return { ...card, gridColumn: newSize }
      }
      return card
    })

    this.cardsSubject.next(cards)
    this.saveLayout()
  }

  // Enhanced method to handle proportional drag-resize
  resizeCardByDrag(cardId: string, dimensions: { width: number; height: number }): void {
    const cards = this.cardsSubject.value.map((card) => {
      if (card.id === cardId) {
        // Find all cards in the same row
        const cardsInSameRow = this.cardsSubject.value.filter((c) => c.rowId === card.rowId && c.id !== cardId)
        const totalOtherColumns = cardsInSameRow.reduce((sum, c) => sum + c.gridColumn, 0)

        // Calculate available space
        const availableSpace = 12 - totalOtherColumns

        // Ensure width is within bounds
        const newWidth = Math.max(1, Math.min(dimensions.width, availableSpace))

        return {
          ...card,
          gridColumn: newWidth,
          height: dimensions.height,
        }
      }
      return card
    })

    this.cardsSubject.next(cards)
    // We'll save when edit mode is toggled off to avoid performance issues
  }

  createNewRow(): number {
    // Find the highest rowId
    const highestRowId = Math.max(...this.cardsSubject.value.map((card) => card.rowId), 0)
    return highestRowId + 1
  }

  getRowsWithCards(): DashboardRow[] {
    const rows: { [key: number]: DashboardCardData[] } = {}

    // Group cards by rowId
    this.cardsSubject.value.forEach((card) => {
      if (!rows[card.rowId]) {
        rows[card.rowId] = []
      }
      rows[card.rowId].push(card)
    })

    // Sort rows by rowId
    return Object.entries(rows)
      .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
      .map(([rowId, rowCards]) => ({
        rowId: Number.parseInt(rowId),
        cards: rowCards,
      }))
  }
}
