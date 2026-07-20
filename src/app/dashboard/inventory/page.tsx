"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useRole } from "@/lib/role-context"

// Define Product interface since we are removing mock-data
export interface Product {
  id: string
  name: string
  barcode: string
  category: string
  price: number // Maps to selling_price
  buying_price: number
  wholesale_price: number
  stock: number
  variant_id?: string
}

export default function InventoryPage() {
  const { role } = useRole()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "", barcode: "", price: 0, buying_price: 0, wholesale_price: 0, stock: 0, category: "Apparel"
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    // We join products and product_variants to match our UI
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, category,
        product_variants ( id, barcode, selling_price, buying_price, wholesale_price, stock_qty )
      `)

    if (error) {
      console.error('Error fetching products:', error)
    } else if (data) {
      const formatted: Product[] = data.map((p: any) => {
        const variant = p.product_variants?.[0] || {}
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          barcode: variant.barcode || '',
          price: variant.selling_price || 0,
          buying_price: variant.buying_price || 0,
          wholesale_price: variant.wholesale_price || 0,
          stock: variant.stock_qty || 0,
          variant_id: variant.id
        }
      })
      setProducts(formatted)
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.barcode) return
    
    if (editingProductId) {
      // 1. Update products
      await supabase.from('products').update({ name: newProduct.name, category: newProduct.category || "Apparel" }).eq('id', editingProductId)
      
      // 2. Update product_variants
      if (newProduct.variant_id) {
        await supabase.from('product_variants').update({
          barcode: newProduct.barcode,
          mrp: Number(newProduct.price),
          selling_price: Number(newProduct.price),
          buying_price: Number(newProduct.buying_price),
          wholesale_price: Number(newProduct.wholesale_price),
          stock_qty: Number(newProduct.stock)
        }).eq('id', newProduct.variant_id)
      }
      
      fetchProducts()
      setIsDialogOpen(false)
      setEditingProductId(null)
      setNewProduct({ name: "", barcode: "", price: 0, buying_price: 0, wholesale_price: 0, stock: 0, category: "Apparel" })
      return
    }

    // 1. Insert into products
    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .insert([{ name: newProduct.name, category: newProduct.category || "Apparel" }])
      .select()
      .single()

    if (prodErr || !prodData) {
      console.error("Error creating product:", prodErr)
      return
    }

    // 2. Insert into product_variants
    const { error: varErr } = await supabase
      .from('product_variants')
      .insert([{
        product_id: prodData.id,
        size: 'Default',
        color: 'Default',
        sku: `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        barcode: newProduct.barcode,
        mrp: Number(newProduct.price),
        selling_price: Number(newProduct.price),
        buying_price: Number(newProduct.buying_price),
        wholesale_price: Number(newProduct.wholesale_price),
        stock_qty: Number(newProduct.stock)
      }])

    if (varErr) {
      console.error("Error creating variant:", varErr)
    } else {
      fetchProducts() // Refresh list
      setIsDialogOpen(false)
      setNewProduct({ name: "", barcode: "", price: 0, buying_price: 0, wholesale_price: 0, stock: 0, category: "Apparel" })
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your products, stock, and barcodes.</p>
        </div>
        {role === "Admin" && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProductId(null);
              setNewProduct({ name: "", barcode: "", price: 0, buying_price: 0, wholesale_price: 0, stock: 0, category: "Apparel" });
            }
          }}>
            <DialogTrigger render={<Button className="gap-2" />}>
              <Plus className="h-4 w-4" /> Add Product
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProductId ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  Enter the details of the product here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Vintage Denim Jeans"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="barcode" className="text-right">Barcode</Label>
                  <Input
                    id="barcode"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="col-span-3"
                    placeholder="JEANS002"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Retail Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={Number.isNaN(newProduct.price) ? "" : newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="buying_price" className="text-right">Buying Price</Label>
                  <Input
                    id="buying_price"
                    type="number"
                    value={Number.isNaN(newProduct.buying_price) ? "" : newProduct.buying_price}
                    onChange={(e) => setNewProduct({ ...newProduct, buying_price: parseFloat(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="wholesale_price" className="text-right">Wholesale Price</Label>
                  <Input
                    id="wholesale_price"
                    type="number"
                    value={Number.isNaN(newProduct.wholesale_price) ? "" : newProduct.wholesale_price}
                    onChange={(e) => setNewProduct({ ...newProduct, wholesale_price: parseFloat(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={Number.isNaN(newProduct.stock) ? "" : newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="col-span-3"
                    placeholder="Apparel"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSaveProduct}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            A list of all products currently in your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Barcode</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Category</th>
                  <th className="py-3 px-4 text-right font-semibold text-muted-foreground">Buying Price</th>
                  <th className="py-3 px-4 text-right font-semibold text-muted-foreground">Retail Price</th>
                  <th className="py-3 px-4 text-right font-semibold text-muted-foreground">Wholesale Price</th>
                  <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Stock</th>
                  {role === "Admin" && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{product.barcode}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4 text-right">${product.buying_price?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">${product.wholesale_price?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${product.stock < 10 ? 'text-destructive' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    {role === "Admin" && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                        setEditingProductId(product.id)
                        setNewProduct({
                          name: product.name,
                          barcode: product.barcode,
                          price: product.price,
                          buying_price: product.buying_price,
                          wholesale_price: product.wholesale_price,
                          stock: product.stock,
                          category: product.category,
                          variant_id: product.variant_id
                        })
                        setIsDialogOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
