"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import DashboardCard from "./dashboard-card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Save } from "lucide-react"

// Enhanced card type with grid position information
interface DashboardCardData {
  id: string
  title: string
  content: string
  color: string
  gridColumn: number // Number of columns this card spans (1-12)
  rowId: number // To group cards by row
}

// Default cards with grid positioning
const defaultCards: DashboardCardData[] = [
  {
    id: "card-1",
    title: "Analytics",
    content: "Your analytics overview",
    color: "bg-blue-50 dark:bg-blue-950",
    gridColumn: 6, // Half of the 12-column grid
    rowId: 1,
  },
  {
    id: "card-2",
    title: "Recent Activity",
    content: "Your recent activities",
    color: "bg-green-50 dark:bg-green-950",
    gridColumn: 6,
    rowId: 1,
  },
  {
    id: "card-3",
    title: "Tasks",
    content: "Your pending tasks",
    color: "bg-purple-50 dark:bg-purple-950",
    gridColumn: 4,
    rowId: 2,
  },
  {
    id: "card-4",
    title: "Messages",
    content: "Your recent messages",
    color: "bg-amber-50 dark:bg-amber-950",
    gridColumn: 4,
    rowId: 2,
  },
  {
    id: "card-5",
    title: "Calendar",
    content: "Upcoming events",
    color: "bg-rose-50 dark:bg-rose-950",
    gridColumn: 4,
    rowId: 2,
  },
  {
    id: "card-6",
    title: "Notes",
    content: "Your saved notes",
    color: "bg-cyan-50 dark:bg-cyan-950",
    gridColumn: 12, // Full width
    rowId: 3,
  },
]

export default function Dashboard() {
  const [cards, setCards] = useState<DashboardCardData[]>([])
  const [loaded, setLoaded] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [nextId, setNextId] = useState(7) // For generating new card IDs
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [dragOverRow, setDragOverRow] = useState<number | null>(null)
  const rowRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Load saved layout from localStorage on component mount
  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboardLayout")
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout)
        setCards(parsed)

        // Find the highest ID to set nextId correctly
        const highestId = Math.max(
          ...parsed.map((card: DashboardCardData) => Number.parseInt(card.id.replace("card-", ""), 10) || 0),
        )
        setNextId(highestId + 1)
      } catch (e) {
        console.error("Error parsing saved layout", e)
        setCards(defaultCards)
      }
    } else {
      setCards(defaultCards)
    }
    setLoaded(true)
  }, [])

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    if (loaded && cards.length > 0) {
      localStorage.setItem("dashboardLayout", JSON.stringify(cards))
    }
  }, [cards, loaded])

  // Group cards by row for rendering
  const getRowsWithCards = () => {
    const rows: { [key: number]: DashboardCardData[] } = {}

    // Group cards by rowId
    cards.forEach((card) => {
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

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (!editMode) return

    e.dataTransfer.setData("cardId", cardId)
    setDraggedCard(cardId)

    // Set a ghost image (optional)
    const card = cards.find((c) => c.id === cardId)
    if (card) {
      e.dataTransfer.setData("text/plain", card.title)
    }

    // For better UX, set effectAllowed
    e.dataTransfer.effectAllowed = "move"
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, rowId: number) => {
    if (!editMode) return

    e.preventDefault()
    setDragOverRow(rowId)
    e.dataTransfer.dropEffect = "move"
  }

  // Handle drag end
  const handleDragEnd = () => {
    if (!editMode) return

    setDraggedCard(null)
    setDragOverRow(null)
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetRowId: number) => {
    if (!editMode) return

    e.preventDefault()
    const cardId = e.dataTransfer.getData("cardId")

    if (!cardId) return

    moveCard(cardId, targetRowId)
    setDraggedCard(null)
    setDragOverRow(null)
  }

  // Move card to a different row
  const moveCard = (cardId: string, targetRowId: number) => {
    setCards((prevCards) => {
      const updatedCards = [...prevCards]
      const cardIndex = updatedCards.findIndex((card) => card.id === cardId)

      if (cardIndex === -1) return prevCards

      const card = { ...updatedCards[cardIndex] }
      const sourceRowId = card.rowId

      // Don't do anything if moving to the same row
      if (sourceRowId === targetRowId) return prevCards

      // Remove the card from its original position
      updatedCards.splice(cardIndex, 1)

      // Update the card's rowId
      card.rowId = targetRowId

      // Get all cards in the destination row
      const cardsInDestRow = updatedCards.filter((c) => c.rowId === targetRowId)

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
        updatedCards.forEach((c) => {
          if (c.rowId === targetRowId) {
            c.gridColumn = columnsPerCard
          }
        })

        // Give the moved card the extra columns if any
        card.gridColumn = columnsPerCard + extraColumns
      }

      // Add the card to the end of the array
      updatedCards.push(card)

      return updatedCards
    })
  }

  // Toggle card size
  const resizeCard = (cardId: string, increase: boolean) => {
    setCards(
      cards.map((card) => {
        if (card.id === cardId) {
          // Find all cards in the same row
          const cardsInSameRow = cards.filter((c) => c.rowId === card.rowId && c.id !== cardId)
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
      }),
    )
  }

  // Add a new card
  const addCard = () => {
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
    }

    setCards([...cards, newCard])
    setNextId(nextId + 1)
  }

  // Remove a card
  const removeCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId))
  }

  // Create a new row
  const createNewRow = () => {
    // Find the highest rowId
    const highestRowId = Math.max(...cards.map((card) => card.rowId), 0)
    return highestRowId + 1
  }

  if (!loaded) {
    return <div className="flex justify-center p-12">Loading your dashboard...</div>
  }

  const rows = getRowsWithCards()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            {editMode ? <Save size={16} /> : <PlusCircle size={16} />}
            {editMode ? "Save Layout" : "Edit Layout"}
          </Button>

          {editMode && (
            <Button variant="outline" size="sm" onClick={addCard} className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add Card
            </Button>
          )}
        </div>

        {editMode && (
          <div className="text-sm text-muted-foreground">Drag cards between rows to reorganize your dashboard</div>
        )}
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div
            key={`row-${row.rowId}`}
            ref={(el) => (rowRefs.current[row.rowId] = el)}
            className={`grid grid-cols-12 gap-4 min-h-[100px] ${
              dragOverRow === row.rowId ? "bg-primary/5 ring-2 ring-primary/20 rounded-lg" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, row.rowId)}
            onDrop={(e) => handleDrop(e, row.rowId)}
          >
            {row.cards.map((card) => (
              <div
                key={card.id}
                draggable={editMode}
                onDragStart={(e) => handleDragStart(e, card.id)}
                onDragEnd={handleDragEnd}
                style={{ gridColumn: `span ${card.gridColumn}` }}
                className={`
                  ${editMode ? "transition-all duration-200 hover:ring-2 hover:ring-primary/30 cursor-move" : ""} 
                  ${draggedCard === card.id ? "opacity-50" : ""}
                  h-full
                `}
              >
                <DashboardCard
                  title={card.title}
                  content={card.content}
                  color={card.color}
                  isEditing={editMode}
                  size={card.gridColumn}
                  onIncreaseSize={() => resizeCard(card.id, true)}
                  onDecreaseSize={() => resizeCard(card.id, false)}
                  onRemove={() => editMode && removeCard(card.id)}
                  canIncrease={
                    card.gridColumn <
                    12 - row.cards.filter((c) => c.id !== card.id).reduce((sum, c) => sum + c.gridColumn, 0)
                  }
                  canDecrease={card.gridColumn > 1}
                />
              </div>
            ))}
          </div>
        ))}

        {/* Empty row for dropping cards */}
        {editMode && (
          <div
            className={`min-h-[100px] border-2 border-dashed border-muted rounded-lg p-4 flex items-center justify-center ${
              dragOverRow === createNewRow() ? "bg-primary/5 border-primary/40" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, createNewRow())}
            onDrop={(e) => handleDrop(e, createNewRow())}
          >
            <div className="text-center text-muted-foreground">
              {dragOverRow === createNewRow() ? "Drop to create a new row" : "Drag cards here to create a new row"}
            </div>
          </div>
        )}

        {/* Row selection for moving cards (alternative to drag and drop) */}
        {editMode && rows.length > 0 && (
          <div className="mt-8 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-medium mb-4">Move Cards Between Rows</h3>
            <div className="space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center gap-4">
                  <div className="font-medium w-1/4 truncate">{card.title}</div>
                  <div className="flex-1">
                    <select
                      className="w-full p-2 rounded-md border"
                      value={card.rowId}
                      onChange={(e) => moveCard(card.id, Number(e.target.value))}
                    >
                      {rows.map((row) => (
                        <option key={row.rowId} value={row.rowId}>
                          Row {row.rowId}
                        </option>
                      ))}
                      <option value={Math.max(...rows.map((row) => row.rowId)) + 1}>New Row</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
