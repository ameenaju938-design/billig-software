/**
 * Microprinter Configuration & Formatting Utility Module
 * Supports 58mm / 80mm POS Thermal Receipt Printers & Thermal Sticker Label Printers
 */

// Load or default configuration
const DEFAULT_PRINTER_CONFIG = {
  activeProfile: "58mm_thermal",
  storeInfo: {
    name: "AL AIN BOUTIQUE",
    address: "Main Street, City Center",
    phone: "+91 9876543210",
    taxId: "GSTIN123456789",
    footerMessage: "Thank you for shopping with us!"
  },
  profiles: {
    "58mm_thermal": {
      name: "58mm Thermal Microprinter (POS Receipt)",
      type: "receipt",
      widthMm: 58,
      paddingMm: 2,
      fontSizePx: 11,
      fontFamily: "Courier New, monospace"
    },
    "80mm_thermal": {
      name: "80mm Thermal Receipt Printer",
      type: "receipt",
      widthMm: 80,
      paddingMm: 4,
      fontSizePx: 12,
      fontFamily: "Arial, sans-serif"
    },
    "label_100x25": {
      name: "100mm x 25mm Thermal Sticker Label",
      type: "label",
      widthMm: 100,
      heightMm: 25,
      paddingMm: 2,
      fontSizePx: 12,
      fontFamily: "Arial, sans-serif"
    },
    "label_50x25": {
      name: "50mm x 25mm Single Barcode Tag",
      type: "label",
      widthMm: 50,
      heightMm: 25,
      paddingMm: 2,
      fontSizePx: 11,
      fontFamily: "Arial, sans-serif"
    }
  }
};

class MicroprinterManager {
  constructor(config = DEFAULT_PRINTER_CONFIG) {
    this.config = config;
  }

  getActiveProfile() {
    return this.config.profiles[this.config.activeProfile] || this.config.profiles["58mm_thermal"];
  }

  setProfile(profileKey) {
    if (this.config.profiles[profileKey]) {
      this.config.activeProfile = profileKey;
    }
  }

  /**
   * Generates dynamic @page & media print CSS based on current printer profile
   */
  generatePrintCSS() {
    const profile = this.getActiveProfile();
    const width = `${profile.widthMm}mm`;
    const height = profile.heightMm ? `${profile.heightMm}mm` : "auto";
    const padding = `${profile.paddingMm || 2}mm`;
    const font = profile.fontFamily || "Courier New, monospace";
    const fontSize = `${profile.fontSizePx || 11}px`;

    return `
      @media print {
        @page {
          size: ${width} ${height};
          margin: 0;
        }
        html, body {
          width: ${width};
          margin: 0;
          padding: 0;
          background: #fff;
          color: #000;
          font-family: ${font};
          font-size: ${fontSize};
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        .print-container {
          width: ${width};
          padding: ${padding};
          box-sizing: border-box;
        }
        .receipt-divider {
          border-bottom: 1px dashed #000;
          margin: 4px 0;
        }
        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
      }
    `;
  }

  /**
   * Formats HTML output for 58mm / 80mm receipt printing
   */
  renderReceiptHTML(receiptData) {
    const profile = this.getActiveProfile();
    const store = this.config.storeInfo;
    const items = receiptData.items || [];
    const total = receiptData.total || 0;
    const invoiceNo = receiptData.invoiceNo || "INV-" + Date.now().toString().slice(-6);
    const date = receiptData.date || new Date().toLocaleString();

    let itemsHTML = items.map(item => `
      <div class="flex-between">
        <span>${item.name} x${item.qty || 1}</span>
        <span>₹${(item.price * (item.qty || 1)).toFixed(2)}</span>
      </div>
    `).join('');

    return `
      <div class="print-container">
        <div class="text-center bold" style="font-size: 14px;">${store.name}</div>
        <div class="text-center" style="font-size: 10px;">${store.address}</div>
        <div class="text-center" style="font-size: 10px;">Tel: ${store.phone}</div>
        ${store.taxId ? `<div class="text-center" style="font-size: 10px;">GST: ${store.taxId}</div>` : ''}
        
        <div class="receipt-divider"></div>
        
        <div class="flex-between" style="font-size: 10px;">
          <span>Invoice: ${invoiceNo}</span>
          <span>${date}</span>
        </div>
        
        <div class="receipt-divider"></div>
        
        ${itemsHTML}
        
        <div class="receipt-divider"></div>
        
        <div class="flex-between bold" style="font-size: 13px;">
          <span>TOTAL</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
        
        <div class="receipt-divider"></div>
        <div class="text-center" style="font-size: 10px; margin-top: 8px;">${store.footerMessage}</div>
      </div>
    `;
  }

  /**
   * Formats HTML output for label/sticker thermal printing
   */
  renderLabelHTML(product) {
    const profile = this.getActiveProfile();
    const width = profile.widthMm;
    const height = profile.heightMm || 25;

    return `
      <div class="print-container" style="height: ${height}mm; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="flex-between bold">
          <span>${this.config.storeInfo.name}</span>
          <span>Size: ${product.size || 'Free'}</span>
        </div>
        <div class="flex-between">
          <span>${product.color || 'Standard'}</span>
          <span>${product.material || ''}</span>
        </div>
        <div class="flex-between bold" style="font-size: 13px;">
          <span>Code: ${product.code || 'PRD-01'}</span>
          <span>₹ ${product.price || 0}</span>
        </div>
      </div>
    `;
  }

  /**
   * Injects print stylesheet and opens browser print dialog for microprinter
   */
  print(contentHTML) {
    let styleEl = document.getElementById('microprinter-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'microprinter-style';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = this.generatePrintCSS();

    const containerEl = document.getElementById('microprinter-output') || document.body;
    const originalContent = containerEl.innerHTML;

    // Create printable wrapper
    const printWrapper = document.createElement('div');
    printWrapper.className = 'microprinter-print-area';
    printWrapper.innerHTML = contentHTML;

    document.body.appendChild(printWrapper);
    window.print();
    document.body.removeChild(printWrapper);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MicroprinterManager, DEFAULT_PRINTER_CONFIG };
}
