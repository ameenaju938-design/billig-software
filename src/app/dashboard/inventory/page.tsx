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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { useRole } from "@/lib/role-context"
import { DressStickerPrinter } from "@/components/dress-sticker-printer"

export interface Product {
  id: string
  name: string
  barcode: string
  category: string
  brand: string
  model: string
  model_suffix: string
  work_type: string
  embellishment: string
  fabric: string
  color: string
  size: string
  price: number
  buying_price: number
  wholesale_price: number
  stock: number
  variant_id?: string
}

const ledgers = ["Al ain", "Al Fursan", "Arabian", "Ashiana", "Aysha Pardha", "Azaliya", "Bismi Tirur", "Faza", "Fidha", "Focus Lady Bra", "Green Bags", "Gulf", "Hayath", "Hira Melatur", "Hira PMNA", "Hisab", "Hoorlyn", "IFFA", "Inaam", "Inaam Maftha", "Iris", "Kubsoorath", "Lamis", "Lamiya PP", "Lamiya SP", "Maari Muthu", "Marwa", "Mehfil", "Menha", "Naseera", "Newlook", "Other", "Raihan", "Sulaf", "Varun Socks", "Zahara", "Zain", "Zamzam", "Zanoobiya", "Zeba"]
const productTypes = ["Abhaya", "Kids Abhaya", "Maxi", "Prayer Dress", "Turkey", "Shawl", "Maftha", "Cap", "Fabric", "Prayer Matte"]
const sizes = ["30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "S", "M", "L", "XL", "XXL", "XXXL", "FS", "SP"]
const models = ["KAFTHANI", "FARASH", "BALOON", "PLEET", "UMBRELLA", "OPEN", "BOTTOM OPEN", "PLAIN"]
const workTypes = ["None", "HAND WORK", "BODYWORK", "BOTTOM WORK", "LACE"]
const embellishments = ["None", "EMBROIDARY", "STONE", "FLOWER", "BIG HAND"]
const fabrics = ["NIDHA", "BANYAN", "ZOOM", "LINEN", "IMP NIDHA", "IMP BANYAN", "IMP ZOOM", "IMP LINEN", "DENEIM"]
const colors = ["BLACK", "PEACH", "MAROON", "NAVY BLUE", "SKY BLUE", "BROWN", "ROYAL BLUE", "COFEE", "PISTA", "PURPLE", "ASH", "GRAPE", "GREEN", "PEAKOCK", "YELLOW", "ORANGE", "WHITE", "RED", "PINK"]

export default function InventoryPage() {
  const { role } = useRole()
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  
  const defaultProduct = {
    name: "", barcode: "", price: 0, buying_price: 0, wholesale_price: 0, stock: 0, 
    category: "", brand: "", model: "", model_suffix: "None", work_type: "None", 
    embellishment: "None", fabric: "", color: "", size: ""
  };
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>(defaultProduct)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, category, brand, model, model_suffix, work_type, embellishment, fabric,
        product_variants ( id, barcode, color, size, selling_price, buying_price, wholesale_price, stock_qty )
      `)

    if (error) {
      console.error('Error fetching products:', error)
    } else if (data) {
      const formatted: Product[] = data.map((p: any) => {
        const variant = p.product_variants?.[0] || {}
        return {
          id: p.id,
          name: p.name,
          category: p.category || '',
          brand: p.brand || '',
          model: p.model || '',
          model_suffix: p.model_suffix || '',
          work_type: p.work_type || '',
          embellishment: p.embellishment || '',
          fabric: p.fabric || '',
          color: variant.color || '',
          size: variant.size || '',
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
    // Basic validation
    if (!newProduct.category || !newProduct.brand || !newProduct.model || !newProduct.fabric || !newProduct.color || !newProduct.size) {
      alert("Please fill all required fields marked with *");
      return;
    }
    
    // Auto-generate barcode if blank
    const finalBarcode = newProduct.barcode || `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    // Auto-generate name based on attributes
    const finalName = newProduct.name || `${newProduct.brand} ${newProduct.model} ${newProduct.fabric}`;

    if (editingProductId) {
      await supabase.from('products').update({ 
        name: finalName, 
        category: newProduct.category,
        brand: newProduct.brand,
        model: newProduct.model,
        model_suffix: newProduct.model_suffix,
        work_type: newProduct.work_type,
        embellishment: newProduct.embellishment,
        fabric: newProduct.fabric
      }).eq('id', editingProductId)
      
      if (newProduct.variant_id) {
        await supabase.from('product_variants').update({
          barcode: finalBarcode,
          color: newProduct.color,
          size: newProduct.size,
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
      setNewProduct(defaultProduct)
      return
    }

    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .insert([{ 
        name: finalName, 
        category: newProduct.category,
        brand: newProduct.brand,
        model: newProduct.model,
        model_suffix: newProduct.model_suffix,
        work_type: newProduct.work_type,
        embellishment: newProduct.embellishment,
        fabric: newProduct.fabric 
      }])
      .select()
      .single()

    if (prodErr || !prodData) {
      console.error("Error creating product:", prodErr)
      return
    }

    const { error: varErr } = await supabase
      .from('product_variants')
      .insert([{
        product_id: prodData.id,
        size: newProduct.size,
        color: newProduct.color,
        sku: `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        barcode: finalBarcode,
        mrp: Number(newProduct.price),
        selling_price: Number(newProduct.price),
        buying_price: Number(newProduct.buying_price),
        wholesale_price: Number(newProduct.wholesale_price),
        stock_qty: Number(newProduct.stock)
      }])

    if (varErr) {
      console.error("Error creating product variant:", varErr)
    }

    fetchProducts()
    setIsDialogOpen(false)
    setNewProduct(defaultProduct)
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
          <div className="flex gap-2">
            <DressStickerPrinter />
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingProductId(null);
                setNewProduct(defaultProduct);
              }
            }}>
              <DialogTrigger render={<Button className="gap-2" />}>
                <Plus className="h-4 w-4" /> Add Product
              </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingProductId ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  Enter the detailed specifications of the product here.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-6 py-4">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Product Code</Label>
                    <Input id="barcode" value={newProduct.barcode} onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })} placeholder="Leave blank to auto-generate" />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Type *</Label>
                    <Select value={newProduct.category || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                      <SelectContent>{productTypes.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model_suffix">Model Suffix</Label>
                    <Input id="model_suffix" value={newProduct.model_suffix} onChange={(e) => setNewProduct({ ...newProduct, model_suffix: e.target.value })} placeholder="None" />
                  </div>
                  <div className="space-y-2">
                    <Label>Embellishment</Label>
                    <Select value={newProduct.embellishment || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, embellishment: v })}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>{embellishments.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color *</Label>
                    <Select value={newProduct.color || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, color: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Color" /></SelectTrigger>
                      <SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Unit Price *</Label>
                    <Input id="price" type="number" value={Number.isNaN(newProduct.price) ? "" : newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buying_price">Buying Price</Label>
                    <Input id="buying_price" type="number" value={Number.isNaN(newProduct.buying_price) ? "" : newProduct.buying_price} onChange={(e) => setNewProduct({ ...newProduct, buying_price: parseFloat(e.target.value) })} />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ledger (Brand/Source) *</Label>
                    <Select value={newProduct.brand || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, brand: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Ledger" /></SelectTrigger>
                      <SelectContent>{ledgers.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model *</Label>
                    <Select value={newProduct.model || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, model: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger>
                      <SelectContent>{models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Work Type</Label>
                    <Select value={newProduct.work_type || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, work_type: v })}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>{workTypes.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fabric *</Label>
                    <Select value={newProduct.fabric || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, fabric: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Fabric" /></SelectTrigger>
                      <SelectContent>{fabrics.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Size *</Label>
                    <Select value={newProduct.size || undefined} onValueChange={(v) => setNewProduct({ ...newProduct, size: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Size" /></SelectTrigger>
                      <SelectContent>{sizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Quantity In Stock *</Label>
                    <Input id="stock" type="number" value={Number.isNaN(newProduct.stock) ? "" : newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wholesale_price">Wholesale Price</Label>
                    <Input id="wholesale_price" type="number" value={Number.isNaN(newProduct.wholesale_price) ? "" : newProduct.wholesale_price} onChange={(e) => setNewProduct({ ...newProduct, wholesale_price: parseFloat(e.target.value) })} />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" onClick={handleSaveProduct}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
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
                  <th className="px-4 py-3 font-medium">Name / Brand</th>
                  <th className="px-4 py-3 font-medium">Barcode</th>
                  <th className="py-3 px-4 font-semibold text-muted-foreground">Category</th>
                  <th className="py-3 px-4 text-right font-semibold text-muted-foreground">Retail Price</th>
                  <th className="py-3 px-4 text-center font-semibold text-muted-foreground">Stock</th>
                  {role === "Admin" && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="group hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.brand} • {product.model}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{product.barcode}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4 text-right">₹{product.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${product.stock < 10 ? 'text-destructive' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    {role === "Admin" && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DressStickerPrinter product={{ 
                        name: product.name, 
                        barcode: product.barcode, 
                        price: product.price,
                        brand: product.brand,
                        model: product.model,
                        fabric: product.fabric,
                        work: product.work_type,
                        size: product.size,
                        color: product.color
                      }} />
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
                          brand: product.brand,
                          model: product.model,
                          model_suffix: product.model_suffix,
                          work_type: product.work_type,
                          embellishment: product.embellishment,
                          fabric: product.fabric,
                          color: product.color,
                          size: product.size,
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
