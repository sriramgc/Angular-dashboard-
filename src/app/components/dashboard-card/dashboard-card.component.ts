import {
  Component,
  Input,
  Output,
  EventEmitter,
  type ElementRef,
  ViewChild,
  type AfterViewInit,
  type NgZone,
} from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-dashboard-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard-card.component.html",
  styleUrls: ["./dashboard-card.component.css"],
})
export class DashboardCardComponent implements AfterViewInit {
  @Input() title = ""
  @Input() content = ""
  @Input() color = "bg-card"
  @Input() isEditing = false
  @Input() size = 1
  @Input() height = 200 // Default height in pixels
  @Input() canIncrease = true
  @Input() canDecrease = true
  @Input() rowId = 1
  @Input() containerWidth = 1200 // Default container width

  @Output() increaseSize = new EventEmitter<void>()
  @Output() decreaseSize = new EventEmitter<void>()
  @Output() remove = new EventEmitter<void>()
  @Output() resize = new EventEmitter<{ width: number; height: number }>()

  @ViewChild("cardElement") cardElement!: ElementRef

  // Resize state
  isResizing = false
  resizeDirection = ""
  startX = 0
  startY = 0
  startWidth = 0
  startHeight = 0
  startColumnSize = 0

  // Column width calculation
  singleColumnWidth = 0
  gridGap = 16 // Default gap between grid items (1rem = 16px)

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Calculate the width of a single column based on container width
    this.calculateColumnWidth()
  }

  calculateColumnWidth(): void {
    // Calculate the width of a single column
    // Total available width = container width - (11 * grid gap)
    // Single column width = Total available width / 12
    this.singleColumnWidth = (this.containerWidth - 11 * this.gridGap) / 12
  }

  onResizeStart(event: MouseEvent, direction: string): void {
    if (!this.isEditing) return

    this.isResizing = true
    this.resizeDirection = direction
    this.startX = event.clientX
    this.startY = event.clientY

    const cardEl = this.cardElement.nativeElement
    this.startWidth = cardEl.offsetWidth
    this.startHeight = cardEl.offsetHeight
    this.startColumnSize = this.size

    // Recalculate column width in case container size changed
    this.calculateColumnWidth()

    // Add event listeners for resize
    // Using NgZone.runOutsideAngular for better performance during drag
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener("mousemove", this.onResizeMove)
      document.addEventListener("mouseup", this.onResizeEnd)
    })

    // Prevent default to avoid text selection during resize
    event.preventDefault()
  }

  onResizeMove = (event: MouseEvent): void => {
    if (!this.isResizing) return

    const deltaX = event.clientX - this.startX
    const deltaY = event.clientY - this.startY

    let newWidth = this.startWidth
    let newHeight = this.startHeight

    // Handle different resize directions
    if (this.resizeDirection.includes("e")) {
      newWidth = this.startWidth + deltaX
    }
    if (this.resizeDirection.includes("s")) {
      newHeight = this.startHeight + deltaY
    }
    if (this.resizeDirection.includes("w")) {
      newWidth = this.startWidth - deltaX
    }
    if (this.resizeDirection.includes("n")) {
      newHeight = this.startHeight - deltaY
    }

    // Calculate new column size based on width
    // This is more proportional to the drag distance
    const totalColumnWidth = this.singleColumnWidth * 12 + 11 * this.gridGap
    const widthRatio = newWidth / totalColumnWidth
    const newColumnSize = Math.max(1, Math.min(12, Math.round(widthRatio * 12)))

    // Run change detection inside Angular zone
    this.ngZone.run(() => {
      // Only emit if the size has changed
      if (newColumnSize !== this.size || newHeight !== this.height) {
        this.resize.emit({
          width: newColumnSize,
          height: Math.max(100, newHeight), // Minimum height of 100px
        })
      }
    })
  }

  onResizeEnd = (): void => {
    this.isResizing = false

    // Remove event listeners
    document.removeEventListener("mousemove", this.onResizeMove)
    document.removeEventListener("mouseup", this.onResizeEnd)

    // Run final update inside Angular zone
    this.ngZone.run(() => {
      // Final update if needed
    })
  }
}
