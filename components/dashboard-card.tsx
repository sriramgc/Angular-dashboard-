"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, Maximize2, Minimize2, Trash2 } from "lucide-react"

interface DashboardCardProps {
  title: string
  content: string
  color?: string
  isEditing?: boolean
  size?: number
  onIncreaseSize?: () => void
  onDecreaseSize?: () => void
  onRemove?: () => void
  canIncrease?: boolean
  canDecrease?: boolean
}

export default function DashboardCard({
  title,
  content,
  color = "bg-card",
  isEditing = false,
  size = 1,
  onIncreaseSize,
  onDecreaseSize,
  onRemove,
  canIncrease = true,
  canDecrease = true,
}: DashboardCardProps) {
  return (
    <Card
      className={`${color} transition-all duration-200 hover:shadow-md h-full flex flex-col ${
        isEditing ? "ring-2 ring-primary/20" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {isEditing && (
            <div className="cursor-move text-primary mr-2">
              <GripVertical size={20} />
            </div>
          )}
          <CardTitle className="text-lg font-medium truncate">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDecreaseSize} disabled={!canDecrease}>
                <Minimize2 size={16} />
                <span className="sr-only">Decrease size</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onIncreaseSize} disabled={!canIncrease}>
                <Maximize2 size={16} />
                <span className="sr-only">Increase size</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 size={16} />
                <span className="sr-only">Remove card</span>
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="mb-4">{content}</p>
        <div className="mt-auto h-24 flex items-center justify-center rounded-md bg-background/50">
          {/* Placeholder for card content */}
          <span className="text-sm text-muted-foreground">
            {isEditing ? `${size} column${size > 1 ? "s" : ""}` : "Card Content"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
