"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

export default function SettingsPage() {
  const [storeName, setStoreName] = useState("StyleBill")
  const [storeAddress, setStoreAddress] = useState("123 Fashion Street, NY 10001")
  const [storePhone, setStorePhone] = useState("(555) 123-4567")
  const [taxRate, setTaxRate] = useState("10")
  const [currency, setCurrency] = useState("USD")

  const handleSave = () => {
    // In a real app, you would submit this to an API
    alert("Settings saved successfully! (Mock)")
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            These details will appear on your receipts and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="storeAddress">Store Address</Label>
            <Input
              id="storeAddress"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="storePhone">Store Phone Number</Label>
            <Input
              id="storePhone"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>
            Configure tax rates and currency for your Point of Sale.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </div>
          <div className="grid gap-2 max-w-sm">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
