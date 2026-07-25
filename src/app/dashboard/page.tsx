"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { IndianRupee, PackageOpen, TrendingUp, AlertTriangle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

const dailySalesData = [
  { date: "1st", sales: 45000 },
  { date: "5th", sales: 52000 },
  { date: "10th", sales: 38000 },
  { date: "15th", sales: 65000 },
  { date: "20th", sales: 48000 },
  { date: "25th", sales: 71000 },
  { date: "30th", sales: 85000 },
]

const monthlySalesData = [
  { month: "Jan", sales: 1200000 },
  { month: "Feb", sales: 1100000 },
  { month: "Mar", sales: 1350000 },
  { month: "Apr", sales: 1500000 },
  { month: "May", sales: 1800000 },
  { month: "Jun", sales: 2100000 },
]

const topSellingStyles = [
  { id: 1, name: "Classic Navy Blazer", variants: "4 Sizes, 2 Colors", sold: 145, revenue: 435000 },
  { id: 2, name: "Slim Fit Chinos", variants: "5 Sizes, 3 Colors", sold: 120, revenue: 180000 },
  { id: 3, name: "Linen Summer Shirt", variants: "3 Sizes, 4 Colors", sold: 98, revenue: 147000 },
]

const lowStockAlerts = [
  { id: 1, name: "Denim Jacket - XL / Blue", stock: 2, threshold: 5 },
  { id: 2, name: "Cotton V-Neck - S / White", stock: 1, threshold: 10 },
  { id: 3, name: "Formal Trousers - 32 / Black", stock: 0, threshold: 5 },
]

export default function DashboardPage() {
  const supabase = createClient()
  const [todaySales, setTodaySales] = useState(0)
  const [monthlySales, setMonthlySales] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [liveLowStockAlerts, setLiveLowStockAlerts] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // 1. Total Products
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    setTotalProducts(productCount || 0)

    // 2. Low Stock Alerts (threshold < 5 for demo)
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, size, color, stock_qty, products(name)')
      .lt('stock_qty', 5)
    
    if (variants) {
      setLowStockCount(variants.length)
      setLiveLowStockAlerts(variants.map(v => ({
        id: v.id,
        name: `${(v.products as any)?.name || 'Unknown'} - ${v.size} / ${v.color}`,
        stock: v.stock_qty,
        threshold: 5
      })))
    }

    // 3. Sales (Today & Month) - basic sum
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const { data: invoices } = await supabase
      .from('invoices')
      .select('grand_total, created_at')
      .gte('created_at', firstDayOfMonth.toISOString())
      
    if (invoices) {
      let tSales = 0
      let mSales = 0
      invoices.forEach(inv => {
        mSales += Number(inv.grand_total)
        if (new Date(inv.created_at) >= today) {
          tSales += Number(inv.grand_total)
        }
      })
      setTodaySales(tSales)
      setMonthlySales(mSales)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Calculated from live invoices</p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Calculated from live invoices</p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active in inventory</p>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount} Items</div>
            <p className="text-xs text-muted-foreground">require immediate reorder</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader>
            <CardTitle>Daily Sales (Last 30 Days)</CardTitle>
            <CardDescription>A comparison of daily revenue performance.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySalesData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Variants that are below the minimum threshold.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {liveLowStockAlerts.length > 0 ? liveLowStockAlerts.map(alert => (
                <div key={alert.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.name}</p>
                    <p className="text-sm text-destructive">
                      Stock: {alert.stock} / {alert.threshold}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground p-4">All stock levels look good!</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-1" x-chunk="dashboard-01-chunk-6">
          <CardHeader>
            <CardTitle>Top Selling Styles</CardTitle>
            <CardDescription>Highest revenue generating products this month.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
              {topSellingStyles.map(style => (
                <div key={style.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{style.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {style.sold} units sold
                    </p>
                  </div>
                  <div className="font-medium">₹{style.revenue.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-7">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Year-to-date sales performance.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySalesData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/100000}L`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" strokeWidth={2} activeDot={{ r: 8 }} className="stroke-primary" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
