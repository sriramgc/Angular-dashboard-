import { Component, type OnInit, type OnDestroy, ViewEncapsulation } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import type { Subscription } from "rxjs"
import { type GridsterConfig, type GridsterItem, GridsterModule } from "angular-gridster2"

import  { DashboardService } from "../../services/dashboard.service"
import { DashboardCardComponent } from "../dashboard-card/dashboard-card.component"
import type { GridsterCard } from "../../models/dashboard.model"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, GridsterModule, DashboardCardComponent],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
  encapsulation: ViewEncapsulation.None, // This allows our styles to affect gridster
})
export class DashboardComponent implements OnInit, OnDestroy {
  cards: GridsterCard[] = []
  editMode = false
  options: GridsterConfig = {}

  private subscriptions: Subscription[] = []

  constructor(public dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.options = this.dashboardService.gridsterOptions

    this.subscriptions.push(
      this.dashboardService.cards$.subscribe((cards) => {
        this.cards = cards
        console.log("Cards loaded:", cards) // Debug log
      }),
      this.dashboardService.editMode$.subscribe((mode) => {
        this.editMode = mode
        // Update options when edit mode changes
        this.options = this.dashboardService.gridsterOptions
        console.log("Edit mode:", mode) // Debug log
      }),
    )

    // Force edit mode on for debugging
    setTimeout(() => {
      if (this.cards.length === 0) {
        console.warn("No cards loaded, forcing default cards")
        this.dashboardService.resetToDefaultCards()
      }

      // Enable edit mode by default for testing
      if (!this.editMode) {
        this.dashboardService.toggleEditMode()
      }
    }, 500)
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  onItemChange(item: GridsterItem): void {
    console.log("Item changed:", item) // Debug log

    // Find the card and update it
    const updatedCard = this.cards.find((card) => card.id === (item as GridsterCard).id)
    if (updatedCard) {
      // Update legacy properties for backward compatibility
      // Update legacy properties for backward compatibility
      updatedCard["gridColumn"] = item.cols
      updatedCard["rowId"] = Math.floor(item.y / 2) + 1

      this.dashboardService.updateCard(updatedCard)
    }
  }

  removeItem(item: GridsterCard): void {
    this.dashboardService.removeCard(item.id)
  }
}
