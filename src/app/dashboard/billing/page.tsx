"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Printer, Trash2, Plus, Minus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Product } from "@/app/dashboard/inventory/page"

interface CartItem extends Product {
  quantity: number;
}

export default function BillingPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, category,
        product_variants ( id, barcode, selling_price, stock_qty )
      `)

    if (data) {
      const formatted: Product[] = data.map((p: any) => {
        const variant = p.product_variants?.[0] || {}
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          barcode: variant.barcode || '',
          price: variant.selling_price || 0,
          stock: variant.stock_qty || 0
        }
      })
      setProducts(formatted)
    }
  }

  // Focus the search/scan input on load for immediate scanning
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  // Handle searching
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    const results = products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.barcode.toLowerCase().includes(lowerQuery)
    )
    setSearchResults(results)
  }, [searchQuery, products])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setSearchQuery("") // Clear search after adding
    if (searchInputRef.current) {
      searchInputRef.current.focus() // Refocus for next scan
    }
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Barcode scanners typically send an 'Enter' key after the barcode
    if (e.key === "Enter" && searchQuery) {
      const product = products.find(
        (p) => p.barcode.toLowerCase() === searchQuery.toLowerCase()
      )
      if (product) {
        addToCart(product)
      }
    }
  }

  const handlePrint = () => {
    window.print()
    // Optionally clear cart after a successful print/checkout
    // setCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxRate = 0.1 // 10% tax
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left Column: Search & Cart (Hidden during print) */}
      <div className="flex-1 space-y-6 print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Point of Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Scan barcode or search product name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md lg:w-[calc(100%-400px)]">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-muted"
                    onClick={() => addToCart(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Barcode: {product.barcode}
                      </p>
                    </div>
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Order</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                Cart is empty. Scan or search to add items.
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <div className="w-20 text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Order Summary & Printable Invoice */}
      <div className="w-full lg:w-[350px]">
        {/* Screen Version of Summary */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handlePrint}
              disabled={cart.length === 0}
            >
              <Printer className="h-5 w-5" />
              Complete & Print
            </Button>
          </CardFooter>
        </Card>

        {/* Print-Only Invoice Layout */}
        <div className="hidden print:block text-black bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">StyleBill</h1>
            <p className="text-gray-500">123 Fashion Street, NY 10001</p>
            <p className="text-gray-500">Tel: (555) 123-4567</p>
            <div className="mt-4 border-b-2 border-black border-dashed"></div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Invoice / Receipt</h2>
          <p className="mb-6">Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          
          <table className="w-full mb-8 text-left">
            <thead>
              <tr className="border-b border-black">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3">{item.name}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-3 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-black pt-2 mt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-center border-t-2 border-black border-dashed pt-8">
            <p className="font-semibold text-lg">Thank you for shopping with us!</p>
            <p className="text-sm mt-2">Returns accepted within 30 days with receipt.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
