import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { DashboardComponent } from "./components/dashboard/dashboard.component"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Dynamic Angular Dashboard"
}
