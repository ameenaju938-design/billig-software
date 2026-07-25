"use client"

import { Sidebar } from "@/components/sidebar"
import { Bell, Search, User, ShieldAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRole, Role } from "@/lib/role-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, setRole } = useRole()

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form className="ml-auto flex-1 sm:flex-initial">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, orders, customers..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>
            </form>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8 sm:ml-0">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <select 
                className="text-sm border-none bg-transparent font-medium cursor-pointer focus:outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="Admin">Admin Mode</option>
                <option value="Staff">Staff Mode</option>
              </select>
            </div>
            <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 ml-2">
              <User className="h-4 w-4" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
