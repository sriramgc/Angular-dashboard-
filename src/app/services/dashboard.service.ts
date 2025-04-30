import { Injectable } from "@angular/core"
import { BehaviorSubject } from "rxjs"
import { CompactType, DisplayGrid, type GridsterConfig, GridType } from "angular-gridster2"
import type { DashboardCardData, GridsterCard, DashboardRow } from "../models/dashboard.model"

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  // Default cards with grid positioning
  private defaultCards: GridsterCard[] = [
    {
      id: "card-1",
      title: "Analytics",
      content: "Your analytics overview",
      color: "bg-blue-50 dark:bg-blue-950",
      x: 0, // gridster x coordinate
      y: 0, // gridster y coordinate
      cols: 6, // gridster column span
      rows: 2, // gridster row span
      cardType: "stat",
      gridColumn: 6, // Legacy property
      rowId: 1, // Legacy property
    },
    {
      id: "card-2",
      title: "Recent Activity",
      content: "Your recent activities",
      color: "bg-green-50 dark:bg-green-950",
      x: 6,
      y: 0,
      cols: 6,
      rows: 2,
      cardType: "chart",
      gridColumn: 6,
      rowId: 1,
    },
    {
      id: "card-3",
      title: "Tasks",
      content: "Your pending tasks",
      color: "bg-purple-50 dark:bg-purple-950",
      x: 0,
      y: 2,
      cols: 4,
      rows: 3,
      cardType: "todo",
      gridColumn: 4,
      rowId: 2,
    },
    {
      id: "card-4",
      title: "Messages",
      content: "Your recent messages",
      color: "bg-amber-50 dark:bg-amber-950",
      x: 4,
      y: 2,
      cols: 4,
      rows: 3,
      cardType: "default",
      gridColumn: 4,
      rowId: 2,
    },
    {
      id: "card-5",
      title: "Calendar",
      content: "Upcoming events",
      color: "bg-rose-50 dark:bg-rose-950",
      x: 8,
      y: 2,
      cols: 4,
      rows: 3,
      cardType: "default",
      gridColumn: 4,
      rowId: 2,
    },
    {
      id: "card-6",
      title: "Notes",
      content: "Your saved notes",
      color: "bg-cyan-50 dark:bg-cyan-950",
      x: 0,
      y: 5,
      cols: 12,
      rows: 3,
      cardType: "notes",
      gridColumn: 12,
      rowId: 3,
    },
  ]

  private cardsSubject = new BehaviorSubject<GridsterCard[]>([])
  private nextIdSubject = new BehaviorSubject<number>(7)
  private editModeSubject = new BehaviorSubject<boolean>(false)

  cards$ = this.cardsSubject.asObservable()
  nextId$ = this.nextIdSubject.asObservable()
  editMode$ = this.editModeSubject.asObservable()

  // Gridster configuration
  private _gridsterOptions: GridsterConfig = {
    gridType: GridType.Fixed,
    compactType: CompactType.None,
    margin: 10,
    outerMargin: true,
    outerMarginTop: null,
    outerMarginRight: null,
    outerMarginBottom: null,
    outerMarginLeft: null,
    useTransformPositioning: true,
    mobileBreakpoint: 640,
    minCols: 12,
    maxCols: 12,
    minRows: 1,
    maxRows: 100,
    maxItemCols: 12,
    minItemCols: 1,
    maxItemRows: 100,
    minItemRows: 1,
    maxItemArea: 2500,
    minItemArea: 1,
    defaultItemCols: 4,
    defaultItemRows: 2,
    fixedColWidth: 80,
    fixedRowHeight: 80,
    keepFixedHeightInMobile: false,
    keepFixedWidthInMobile: false,
    scrollSensitivity: 10,
    scrollSpeed: 20,
    enableEmptyCellClick: false,
    enableEmptyCellContextMenu: false,
    enableEmptyCellDrop: false,
    enableEmptyCellDrag: false,
    enableOccupiedCellDrop: false,
    emptyCellDragMaxCols: 50,
    emptyCellDragMaxRows: 50,
    ignoreMarginInRow: false,
    draggable: {
      enabled: true,
      ignoreContentClass: "gridster-item-content",
      ignoreContent: false,
      dragHandleClass: "drag-handle",
      stop: undefined,
      start: undefined,
      dropOverItems: false,
      dropOverItemsCallback: undefined,
    },
    resizable: {
      enabled: true,
      handles: {
        s: true,
        e: true,
        n: true,
        w: true,
        se: true,
        ne: true,
        sw: true,
        nw: true,
      },
      stop: undefined,
      start: undefined,
    },
    swap: false,
    pushItems: true,
    disablePushOnDrag: false,
    disablePushOnResize: false,
    pushDirections: { north: true, east: true, south: true, west: true },
    pushResizeItems: false,
    displayGrid: DisplayGrid.Always,
    disableWindowResize: false,
    disableWarnings: false,
    scrollToNewItems: false,
    itemChangeCallback: undefined,
    itemResizeCallback: undefined,
    itemInitCallback: undefined,
    api: {
      resize: undefined,
      optionsChanged: undefined,
      getNextPossiblePosition: undefined,
      getFirstPossiblePosition: undefined,
      getLastPossiblePosition: undefined,
    },
  }

  get gridsterOptions(): GridsterConfig {
    return this._gridsterOptions
  }

  constructor() {
    this.loadSavedLayout()
  }

  private loadSavedLayout(): void {
    const savedLayout = localStorage.getItem("dashboardLayout")
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)

        // Convert legacy format to gridster format if needed
        let gridsterCards: GridsterCard[]

        if (parsed.length > 0 && parsed[0].x !== undefined) {
          // Already in gridster format
          gridsterCards = parsed
        } else {
          // Convert from legacy format
          gridsterCards = this.convertLegacyToGridster(parsed)
        }

        this.cardsSubject.next(gridsterCards)

        // Find the highest ID to set nextId correctly
        const highestId = Math.max(
          ...gridsterCards.map((card) => Number.parseInt(card.id.replace("card-", ""), 10) || 0),
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

  // Reset to default cards
  resetToDefaultCards(): void {
    this.cardsSubject.next(this.defaultCards)
    this.nextIdSubject.next(7)
    localStorage.removeItem("dashboardLayout")
  }

  // Convert legacy card format to gridster format
  private convertLegacyToGridster(legacyCards: DashboardCardData[]): GridsterCard[] {
    const rowMap = new Map<number, { y: number; cards: DashboardCardData[] }>()

    // Group cards by row
    legacyCards.forEach((card) => {
      if (!rowMap.has(card.rowId)) {
        rowMap.set(card.rowId, { y: 0, cards: [] })
      }
      rowMap.get(card.rowId)?.cards.push(card)
    })

    // Sort rows by rowId
    const sortedRows = Array.from(rowMap.entries()).sort(([a], [b]) => a - b)

    // Assign y coordinates to rows
    let currentY = 0
    sortedRows.forEach(([_, rowData]) => {
      rowData.y = currentY
      // Assuming each row is 2 units high
      currentY += 2
    })

    // Convert each card
    const gridsterCards: GridsterCard[] = []
    sortedRows.forEach(([rowId, rowData]) => {
      let currentX = 0
      rowData.cards.forEach((card) => {
        gridsterCards.push({
          id: card.id,
          title: card.title,
          content: card.content,
          color: card.color,
          x: currentX,
          y: rowData.y,
          cols: card.gridColumn,
          rows: 2, // Default height
          cardType: "default", // Default card type
          gridColumn: card.gridColumn,
          rowId: card.rowId,
        })
        currentX += card.gridColumn
      })
    })

    return gridsterCards
  }

  saveLayout(): void {
    localStorage.setItem("dashboardLayout", JSON.stringify(this.cardsSubject.value))
  }

  toggleEditMode(): void {
    const newEditMode = !this.editModeSubject.value
    this.editModeSubject.next(newEditMode)

    // Update gridster options based on edit mode
    this._gridsterOptions = {
      ...this._gridsterOptions,
      draggable: {
        ...this._gridsterOptions.draggable,
        enabled: newEditMode,
      },
      resizable: {
        ...this._gridsterOptions.resizable,
        enabled: newEditMode,
      },
      displayGrid: newEditMode ? DisplayGrid.Always : DisplayGrid.None,
    }

    if (!newEditMode) {
      this.saveLayout()
    }
  }

  addCard(): void {
    const cards = this.cardsSubject.value
    const nextId = this.nextIdSubject.value

    // Find the highest y coordinate
    const highestY = Math.max(...cards.map((card) => card.y + card.rows), 0)

    // Card types to cycle through
    const cardTypes: Array<"default" | "stat" | "chart" | "todo" | "notes"> = [
      "default",
      "stat",
      "chart",
      "todo",
      "notes",
    ]

    // Pick a random card type
    const randomCardType = cardTypes[nextId % cardTypes.length]

    // Create a new card
    const newCard: GridsterCard = {
      id: `card-${nextId}`,
      title: `New ${randomCardType.charAt(0).toUpperCase() + randomCardType.slice(1)} Card`,
      content: "Click to edit this card",
      color: "bg-slate-50 dark:bg-slate-950",
      x: 0,
      y: highestY,
      cols: 4,
      rows: randomCardType === "notes" || randomCardType === "todo" ? 3 : 2, // Notes and todo cards are taller
      cardType: randomCardType,
      gridColumn: 4, // Legacy property
      rowId: highestY / 2 + 1, // Legacy property
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

  updateCard(updatedCard: GridsterCard): void {
    const cards = this.cardsSubject.value.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    this.cardsSubject.next(cards)
    this.saveLayout()
  }

  // Legacy methods for backward compatibility
  getRowsWithCards(): DashboardRow[] {
    const rows: { [key: number]: DashboardCardData[] } = {}

    // Group cards by rowId
    this.cardsSubject.value.forEach((card) => {
      const rowId = card["rowId"] || Math.floor(card.y / 2) + 1
      if (!rows[rowId]) {
        rows[rowId] = []
      }
      rows[rowId].push({
        id: card.id,
        title: card.title,
        content: card.content,
        color: card.color,
        gridColumn: card.cols,
        rowId: rowId,
      })
    })

    // Sort rows by rowId
    return Object.entries(rows)
      .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
      .map(([rowId, rowCards]) => ({
        rowId: Number.parseInt(rowId),
        cards: rowCards,
      }))
  }

  createNewRow(): number {
    // Find the highest rowId
    const highestRowId = Math.max(...this.cardsSubject.value.map((card) => card["rowId"] || Math.floor(card.y / 2) + 1), 0)
    return highestRowId + 1
  }
}
