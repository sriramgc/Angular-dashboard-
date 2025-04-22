import Dashboard from "@/components/dashboard"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Personalized Dashboard</h1>
      <p className="mb-6 text-muted-foreground">
        Customize your dashboard with drag-and-drop cards. Cards in the same row maintain consistent height.
      </p>
      <Dashboard />
    </div>
  )
}
