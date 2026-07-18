"use client"

import { useState } from "react"
import { Plus, Trash, Save, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { mockSuppliers, mockPurchases, PurchaseBill, PurchaseItem } from "@/lib/mock-data"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseBill[]>(mockPurchases)
  const [supplierId, setSupplierId] = useState("")
  const [invoiceNo, setInvoiceNo] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [cashPaid, setCashPaid] = useState<number>(0)

  // Temporary state for adding a new item
  const [newItemName, setNewItemName] = useState("")
  const [newItemQty, setNewItemQty] = useState<number>(1)
  const [newItemRate, setNewItemRate] = useState<number>(0)
  const [newItemGst, setNewItemGst] = useState<number>(18) // Default 18% GST

  const handleAddItem = () => {
    if (!newItemName || newItemQty <= 0 || newItemRate < 0) return
    const item: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      quantity: newItemQty,
      rate: newItemRate,
      gstPercent: newItemGst,
    }
    setItems([...items, item])
    setNewItemName("")
    setNewItemQty(1)
    setNewItemRate(0)
    setNewItemGst(18)
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const totalGst = items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.gstPercent / 100)), 0)
  const grandTotal = subtotal + totalGst
  const balanceDue = grandTotal - cashPaid

  const handleSaveBill = () => {
    if (!supplierId || !invoiceNo || items.length === 0) {
      alert("Please select a supplier, enter an invoice number, and add at least one item.")
      return
    }

    const newBill: PurchaseBill = {
      id: `PB${Math.floor(Math.random() * 1000)}`,
      invoiceNo,
      supplierId,
      date,
      items,
      subtotal,
      totalGst,
      grandTotal,
      cashPaid,
    }

    setPurchases([newBill, ...purchases])
    
    // Reset form
    setSupplierId("")
    setInvoiceNo("")
    setItems([])
    setCashPaid(0)
    alert("Purchase bill saved successfully!")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Entry (Inward GST)</h1>
        <p className="text-muted-foreground">Log incoming stock bills, calculate GST, and track payments.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Bill Details and Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
              <CardDescription>Enter the supplier invoice information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <select
                  id="supplier"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Supplier</option>
                  {mockSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Invoice No.</Label>
                <Input
                  id="invoiceNo"
                  placeholder="INV-2026-001"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Add products purchased in this bill.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Item Row */}
              <div className="grid gap-3 sm:grid-cols-12 mb-6 items-end bg-muted/50 p-4 rounded-lg">
                <div className="sm:col-span-4 space-y-2">
                  <Label>Item Name</Label>
                  <Input 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)} 
                    placeholder="Product name" 
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Qty</Label>
                  <Input 
                    type="number" 
                    value={newItemQty} 
                    onChange={(e) => setNewItemQty(Number(e.target.value))} 
                    min="1" 
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Rate</Label>
                  <Input 
                    type="number" 
                    value={newItemRate} 
                    onChange={(e) => setNewItemRate(Number(e.target.value))} 
                    min="0" 
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>GST %</Label>
                  <Input 
                    type="number" 
                    value={newItemGst} 
                    onChange={(e) => setNewItemGst(Number(e.target.value))} 
                    min="0" 
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Button onClick={handleAddItem} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Item</th>
                      <th className="px-4 py-3 font-medium text-right">Qty</th>
                      <th className="px-4 py-3 font-medium text-right">Rate</th>
                      <th className="px-4 py-3 font-medium text-right">GST %</th>
                      <th className="px-4 py-3 font-medium text-right">Total</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => {
                      const lineTotal = item.quantity * item.rate * (1 + item.gstPercent / 100)
                      return (
                        <tr key={item.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">${item.rate.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{item.gstPercent}%</td>
                          <td className="px-4 py-3 text-right font-medium">${lineTotal.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No items added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount (Subtotal)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total GST</span>
                <span className="font-medium">${totalGst.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Grand Total</span>
                  <span className="text-2xl font-bold text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cashPaid" className="text-sm font-semibold">Cash Paid / Outflow</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cashPaid"
                      type="number"
                      className="pl-8 text-lg font-medium"
                      value={cashPaid}
                      onChange={(e) => setCashPaid(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg flex justify-between items-center ${balanceDue > 0 ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                  <span className="font-semibold">Balance Due to Supplier</span>
                  <span className="text-xl font-bold">${Math.max(0, balanceDue).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBill} className="w-full gap-2" size="lg">
                <Save className="h-5 w-5" /> Save Purchase Bill
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* History Section */}
      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Invoice No</th>
                    <th className="px-4 py-3 font-medium">Supplier</th>
                    <th className="px-4 py-3 font-medium text-right">Grand Total</th>
                    <th className="px-4 py-3 font-medium text-right">Cash Paid</th>
                    <th className="px-4 py-3 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {purchases.map((bill) => {
                    const supplier = mockSuppliers.find(s => s.id === bill.supplierId)
                    const bal = bill.grandTotal - bill.cashPaid
                    return (
                      <tr key={bill.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">{bill.date}</td>
                        <td className="px-4 py-3 font-medium">{bill.invoiceNo}</td>
                        <td className="px-4 py-3">{supplier?.name || "Unknown"}</td>
                        <td className="px-4 py-3 text-right font-medium">${bill.grandTotal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">${bill.cashPaid.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-destructive font-medium">${Math.max(0, bal).toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
