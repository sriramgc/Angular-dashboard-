import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-dashboard-card",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard-card.component.html",
  styleUrls: ["./dashboard-card.component.css"],
})
export class DashboardCardComponent implements OnInit {
  @Input() title = ""
  @Input() content = ""
  @Input() color = "bg-card"
  @Input() isEditing = false
  @Input() size = 1
  @Input() cardType: "default" | "stat" | "chart" | "todo" | "notes" = "default"

  @Output() remove = new EventEmitter<void>()

  // For todo card
  todoItems: { text: string; completed: boolean }[] = [
    { text: "Sample task 1", completed: false },
    { text: "Sample task 2", completed: true },
  ]
  newTodoText = ""

  // For notes card
  notesContent = ""

  // For stat card
  statValue = "89%"
  statDescription = "Increase from last month"
  statTrend = "positive" // or "negative"

  ngOnInit() {
    // Initialize based on cardType
    if (this.cardType === "notes") {
      this.notesContent = this.content || "Write your notes here..."
    }

    console.log("Card initialized:", this.title, this.cardType)
  }

  addTodo(): void {
    if (this.newTodoText.trim()) {
      this.todoItems.push({ text: this.newTodoText, completed: false })
      this.newTodoText = ""
    }
  }

  toggleTodo(index: number): void {
    this.todoItems[index].completed = !this.todoItems[index].completed
  }

  removeTodo(index: number): void {
    this.todoItems.splice(index, 1)
  }

  // Add this method to the DashboardCardComponent class
  getCardClasses(): string[] {
    const classes = [this.color, `${this.cardType}-card`]
    if (this.isEditing) {
      classes.push("ring-2")
      classes.push("ring-primary-20")
    }
    return classes
  }
}
