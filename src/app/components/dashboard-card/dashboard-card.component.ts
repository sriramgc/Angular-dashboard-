import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-dashboard-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard-card.component.html",
  styleUrls: ["./dashboard-card.component.css"],
})
export class DashboardCardComponent {
  @Input() title = ""
  @Input() content = ""
  @Input() color = "bg-card"
  @Input() isEditing = false
  @Input() size = 1
  @Input() canIncrease = true
  @Input() canDecrease = true

  @Output() increaseSize = new EventEmitter<void>()
  @Output() decreaseSize = new EventEmitter<void>()
  @Output() remove = new EventEmitter<void>()
}
