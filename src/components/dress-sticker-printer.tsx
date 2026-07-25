"use client"

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import JsBarcode from 'jsbarcode'
import { Printer, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'

interface DressStickerPrinterProps {
  product?: {
    name?: string
    brand?: string
    size?: string
    color?: string
    fabric?: string
    model?: string
    work?: string
    price?: number
    barcode?: string
  }
}

export function DressStickerPrinter({ product }: DressStickerPrinterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [brand, setBrand] = useState(product?.brand || "SULAF")
  const [size, setSize] = useState(product?.size || "M")
  const [color, setColor] = useState(product?.color || "BLACK")
  const [fabric, setFabric] = useState(product?.fabric || "NIDHA")
  const [model, setModel] = useState(product?.model || "FARASH - BN")
  const [work, setWork] = useState(product?.work || "EMB")
  const [price, setPrice] = useState(product?.price?.toString() || "1599")
  const [barcode, setBarcode] = useState(product?.barcode || "MD-0001")
  
  // Custom boxes configuration
  const [boxes, setBoxes] = useState(['TW', 'BD', 'HW', 'BT', 'BC'])
  
  // Mode selection
  const [pairMode, setPairMode] = useState<"A" | "B" | "C">("A") // A: Product+Box, B: Product+Product, C: Box+Box
  const [printCopies, setPrintCopies] = useState(1)

  const barcodeLeftRef = useRef<SVGSVGElement>(null)
  const barcodeRightRef = useRef<SVGSVGElement>(null)

  // Generate barcodes when data changes
  useEffect(() => {
    if (barcode && isOpen) {
      const renderBarcode = (ref: React.RefObject<SVGSVGElement | null>) => {
        if (ref.current) {
          try {
            JsBarcode(ref.current, barcode, {
              format: "CODE128",
              width: 1.5,
              height: 25,
              displayValue: false,
              margin: 0,
              background: "transparent",
              lineColor: "#000"
            })
          } catch (e) {
            console.error("Invalid barcode", e)
          }
        }
      }
      
      // Give the DOM a moment to render the SVG elements before attaching JsBarcode
      setTimeout(() => {
        if (pairMode === "A" || pairMode === "B") renderBarcode(barcodeLeftRef)
        if (pairMode === "B") renderBarcode(barcodeRightRef)
      }, 50)
    }
  }, [barcode, pairMode, isOpen, brand, size, color, fabric, model, work, price, boxes])

  const handlePrint = () => {
    window.print()
  }

  // Sub-component to render a single sticker (Product Print style with scannable barcode)
  const ProductSticker = ({ barcodeRef }: { barcodeRef: React.RefObject<SVGSVGElement | null> }) => (
    <div className="flex flex-col justify-between p-[2mm] bg-white text-black font-sans box-border overflow-hidden h-[25mm] w-[42mm]">
      <div className="flex justify-between items-start">
        <div className="font-bold text-[14px] leading-tight max-w-[65%] uppercase break-words">{brand}</div>
        <div className="font-bold text-[18px] leading-tight">{size}</div>
      </div>
      
      <div className="flex justify-between items-end mt-[1mm]">
        <div className="flex flex-col text-[10px] leading-tight uppercase font-medium">
          <div>{color}</div>
          <div>{fabric}</div>
          <div className="mt-[1mm]">{model}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="font-bold text-[16px] leading-tight">₹{price}</div>
          <div className="flex mt-[1mm] border border-black h-[5mm]">
            {boxes.map((box, i) => (
              <div key={i} className={`flex items-center justify-center text-[7px] font-bold px-[1px] ${i < boxes.length - 1 ? 'border-r border-black' : ''}`}>
                {box}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-[1mm] flex flex-col items-center w-full">
        <svg ref={barcodeRef} className="w-full h-[6mm]"></svg>
        <div className="text-[9px] font-bold mt-[1px] leading-none">{barcode}</div>
      </div>
    </div>
  )

  // Sub-component to render a single sticker (Box Print style with text/work instead of scannable barcode)
  const BoxSticker = () => (
    <div className="flex flex-col justify-between p-[2mm] bg-white text-black font-sans box-border overflow-hidden h-[25mm] w-[42mm]">
      <div className="flex justify-between items-start">
        <div className="font-bold text-[14px] leading-tight max-w-[65%] uppercase break-words">{brand}</div>
        <div className="font-bold text-[18px] leading-tight">{size}</div>
      </div>
      
      <div className="flex justify-between mt-[1mm] h-full">
        <div className="flex flex-col text-[10px] leading-tight uppercase font-medium">
          <div>{color}</div>
          <div>{fabric}</div>
          <div className="mt-[1.5mm]">{model}</div>
          <div className="mt-[1.5mm]">{work}</div>
        </div>
        <div className="flex flex-col items-end justify-between h-full">
          <div className="font-bold text-[18px] leading-tight mt-[1mm]">₹{price}</div>
          <div className="flex mt-[2mm] border-[1.5px] border-black h-[5mm]">
            {boxes.map((box, i) => (
              <div key={i} className={`flex items-center justify-center text-[7px] font-bold px-[2px] ${i < boxes.length - 1 ? 'border-r-[1.5px] border-black' : ''}`}>
                {box}
              </div>
            ))}
          </div>
          <div className="text-[12px] font-bold mt-[1mm] self-end">{barcode}</div>
        </div>
      </div>
    </div>
  )

  // The 88x25 Row wrapper
  const StickerRow = () => (
    <div className="flex w-[88mm] h-[25mm] bg-white mx-auto print:mx-0 overflow-hidden break-inside-avoid">
      <div className="w-[42mm] h-[25mm]">
        {pairMode === "C" ? <BoxSticker /> : <ProductSticker barcodeRef={barcodeLeftRef} />}
      </div>
      <div className="w-[4mm] h-[25mm] bg-transparent"></div>
      <div className="w-[42mm] h-[25mm]">
        {pairMode === "B" ? <ProductSticker barcodeRef={barcodeRightRef} /> : <BoxSticker />}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2" size="sm" />}>
        <Printer className="h-4 w-4" /> Print Sticker
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print 2-Up Barcode Stickers (88mm x 25mm)</DialogTitle>
          <DialogDescription>
            Configure dress fields and print onto dual thermal label rolls.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 py-4">
          
          {/* Form Controls */}
          <div className="space-y-4 border-r pr-6">
            <h3 className="font-medium text-sm text-muted-foreground">Dress Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Brand / Name</Label>
                <Input value={brand} onChange={e => setBrand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Barcode / SKU Code</Label>
                <Input value={barcode} onChange={e => setBarcode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input value={color} onChange={e => setColor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fabric</Label>
                <Input value={fabric} onChange={e => setFabric(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Model / Design</Label>
                <Input value={model} onChange={e => setModel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Work (for Box Tag)</Label>
                <Input value={work} onChange={e => setWork(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <Input value={size} onChange={e => setSize(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>
            
            <div className="pt-4 space-y-2 border-t mt-4">
              <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Layout Settings
              </h3>
              <Label>Pair Mode</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={pairMode}
                onChange={e => setPairMode(e.target.value as "A" | "B" | "C")}
              >
                <option value="A">Mode A (Product Tag + Box Tag)</option>
                <option value="B">Mode B (Product Tag + Product Tag)</option>
                <option value="C">Mode C (Box Tag + Box Tag)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Inspection Grid Boxes (Comma separated)</Label>
              <Input 
                value={boxes.join(', ')} 
                onChange={e => setBoxes(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Quantity (Rows of 2)</Label>
              <Input type="number" min="1" value={printCopies} onChange={e => setPrintCopies(parseInt(e.target.value) || 1)} />
            </div>
          </div>
          
          {/* Live Preview Area */}
          <div className="flex flex-col items-center bg-gray-100 p-6 rounded-md relative overflow-hidden">
            <h3 className="font-medium text-sm text-muted-foreground mb-6 self-start">Live Preview</h3>
            
            <div className="shadow-lg border border-gray-300 bg-white rounded overflow-hidden">
              <StickerRow />
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              The preview reflects exact dimensions (88mm width x 25mm height).<br/>
              Ensure your printer paper size matches.
            </p>
          </div>
          
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print {printCopies * 2} Stickers
          </Button>
        </DialogFooter>

        {/* Global Print CSS Injected when modal is open */}
        {isOpen && (
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { size: 88mm 25mm; margin: 0; padding: 0; }
              
              /* App Router doesn't use #__next, hide all body children except our print section */
              body > :not(.print-section) { 
                display: none !important; 
              }
              
              /* Also reset body padding/margin to prevent extra space */
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }

              .print-section {
                display: block !important;
                position: absolute;
                left: 0;
                top: 0;
                width: 88mm;
                margin: 0;
                padding: 0;
              }

              .print-row {
                width: 88mm;
                height: 25mm;
                overflow: hidden;
                page-break-after: always;
              }
            }
          `}} />
        )}
      </DialogContent>

      {/* Hidden print payload portaled to body to avoid nesting height issues */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="print-section hidden print:block">
          {Array.from({ length: printCopies }).map((_, idx) => (
            <div key={idx} className="print-row">
              <StickerRow />
            </div>
          ))}
        </div>,
        document.body
      )}
    </Dialog>
  )
}
