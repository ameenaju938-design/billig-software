"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRole } from "@/lib/role-context"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  FileText,
  Truck,
  CreditCard,
  Bell,
  PackagePlus
} from "lucide-react"

export function Sidebar() {
  const { role } = useRole()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(path)
  }

  const getLinkClass = (path: string) => {
    const baseClass = "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
    return isActive(path) 
      ? `${baseClass} bg-muted text-primary font-medium`
      : `${baseClass} text-muted-foreground font-medium`
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Shop Inventory POS</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm lg:px-4 gap-1">
          <Link
            href="/dashboard"
            className={getLinkClass("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/billing"
            className={getLinkClass("/dashboard/billing")}
          >
            <ShoppingCart className="h-4 w-4" />
            Billing (POS)
          </Link>
          <Link
            href="/dashboard/inventory"
            className={getLinkClass("/dashboard/inventory")}
          >
            <Package className="h-4 w-4" />
            Inventory
          </Link>
          <Link
            href="/dashboard/customers"
            className={getLinkClass("/dashboard/customers")}
          >
            <Users className="h-4 w-4" />
            Customers
          </Link>
          
          {role === "Admin" && (
            <>
              <Link
                href="/dashboard/reports"
                className={getLinkClass("/dashboard/reports")}
              >
                <FileText className="h-4 w-4" />
                Reports
              </Link>
              <Link
                href="/dashboard/suppliers"
                className={getLinkClass("/dashboard/suppliers")}
              >
                <Truck className="h-4 w-4" />
                Suppliers
              </Link>
              <Link
                href="/dashboard/purchases"
                className={getLinkClass("/dashboard/purchases")}
              >
                <PackagePlus className="h-4 w-4" />
                Purchases (Inward)
              </Link>
              <Link
                href="/dashboard/expenses"
                className={getLinkClass("/dashboard/expenses")}
              >
                <CreditCard className="h-4 w-4" />
                Expenses
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <nav className="grid items-start text-sm gap-1">
          {role === "Admin" && (
            <Link
              href="/dashboard/settings"
              className={getLinkClass("/dashboard/settings")}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          )}
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary font-medium"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </nav>
      </div>
    </div>
  )
}
