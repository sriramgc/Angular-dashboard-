import {
  Component,
  type OnInit,
  type OnDestroy,
  type ElementRef,
  ViewChild,
  type AfterViewInit,
  HostListener,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { DragDropModule } from "@angular/cdk/drag-drop"
import { FormsModule } from "@angular/forms"
import type { Subscription } from "rxjs"

import type { DashboardService } from "../../services/dashboard.service"
import { DashboardCardComponent } from "../dashboard-card/dashboard-card.component"
import type { DashboardCardData, DashboardRow } from "../../models/dashboard.model"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, DashboardCardComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  cards: DashboardCardData[] = []
  rows: DashboardRow[] = []
  editMode = false
  draggedCard: string | null = null
  dragOverRow: number | null = null
  containerWidth = 1200 // Default container width

  @ViewChild("dashboardContainer") dashboardContainer!: ElementRef

  private subscriptions: Subscription[] = []

  constructor(public dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.dashboardService.cards$.subscribe((cards) => {
        this.cards = cards
        this.rows = this.dashboardService.getRowsWithCards()
      }),
      this.dashboardService.editMode$.subscribe((mode) => {
        this.editMode = mode
      }),
    )
  }

  ngAfterViewInit(): void {
    // Get the actual container width
    this.updateContainerWidth()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  // Update container width when window is resized
  @HostListener("window:resize")
  onResize(): void {
    this.updateContainerWidth()
  }

  updateContainerWidth(): void {
    if (this.dashboardContainer && this.dashboardContainer.nativeElement) {
      this.containerWidth = this.dashboardContainer.nativeElement.offsetWidth
    }
  }

  onDragStart(event: DragEvent, cardId: string): void {
    if (!this.editMode) return

    if (event.dataTransfer) {
      event.dataTransfer.setData("cardId", cardId)
      this.draggedCard = cardId

      // Set a ghost image (optional)
      const card = this.cards.find((c) => c.id === cardId)
      if (card) {
        event.dataTransfer.setData("text/plain", card.title)
      }

      // For better UX, set effectAllowed
      event.dataTransfer.effectAllowed = "move"
    }
  }

  onDragOver(event: DragEvent, rowId: number): void {
    if (!this.editMode) return

    event.preventDefault()
    this.dragOverRow = rowId
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move"
    }
  }

  onDragEnd(): void {
    if (!this.editMode) return

    this.draggedCard = null
    this.dragOverRow = null
  }

  onDrop(event: DragEvent, targetRowId: number): void {
    if (!this.editMode) return

    event.preventDefault()
    if (event.dataTransfer) {
      const cardId = event.dataTransfer.getData("cardId")

      if (!cardId) return

      this.dashboardService.moveCard(cardId, targetRowId)
      this.draggedCard = null
      this.dragOverRow = null
    }
  }

  getCardStyle(card: DashboardCardData): any {
    return {
      "grid-column": `span ${card.gridColumn}`,
      height: card.height ? `${card.height}px` : "auto",
    }
  }

  canIncreaseCardSize(card: DashboardCardData): boolean {
    const cardsInSameRow = this.cards.filter((c) => c.rowId === card.rowId && c.id !== card.id)
    const totalOtherColumns = cardsInSameRow.reduce((sum, c) => sum + c.gridColumn, 0)
    return card.gridColumn < 12 - totalOtherColumns
  }

  createNewRow(): number {
    return this.dashboardService.createNewRow()
  }

  onCardResize(cardId: string, dimensions: { width: number; height: number }): void {
    this.dashboardService.resizeCardByDrag(cardId, dimensions)
  }
}
