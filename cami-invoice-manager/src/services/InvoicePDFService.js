import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export class InvoicePDFService {
  constructor() {
    this.pdf = null
    this.currentY = 0

    // Teal geometric color palette
    this.colors = {
      primary: [72, 150, 150],      // Main teal
      primaryDark: [58, 120, 120],  // Darker teal
      primaryLight: [118, 194, 194], // Lighter teal
      white: [255, 255, 255],       // Pure white
      black: [33, 37, 41],          // Text black
      gray: [108, 117, 125],        // Medium gray
      lightGray: [248, 249, 250],   // Light background
      border: [222, 226, 230]       // Border gray
    }

    this.pageWidth = 210 // A4 width in mm
    this.pageHeight = 297 // A4 height in mm
  }

  async generateInvoicePDF(invoiceData, instructorData) {
    try {
      console.log('Generating geometric teal invoice...')

      if (!invoiceData?.invoice_number) {
        throw new Error('Invalid invoice data')
      }

      this.pdf = new jsPDF('portrait', 'mm', 'a4')

      // Create the geometric design
      this._addGeometricHeader(instructorData, invoiceData)
      this._addCompanySection(instructorData)
      this._addInvoiceToSection(invoiceData.customer, invoiceData)
      this._addItemsTable(invoiceData.invoice_items || [])
      this._addTotalsSection(invoiceData)
      this._addPaymentSection(instructorData)
      this._addGeometricFooter(instructorData)

      return this.pdf
    } catch (error) {
      console.error('PDF generation error:', error)
      throw error
    }
  }

  _addGeometricHeader(instructorData, invoiceData) {
    // Main teal header background - larger and more impactful
    this.pdf.setFillColor(...this.colors.primary)
    this.pdf.rect(0, 0, this.pageWidth, 40, 'F')

    // Geometric triangular elements - better positioned
    this.pdf.setFillColor(...this.colors.primaryDark)

    // Large diagonal accent in top right
    this.pdf.triangle(this.pageWidth - 50, 0, this.pageWidth, 0, this.pageWidth, 30, 'F')

    // Small decorative triangles (top right corner)
    this.pdf.setFillColor(...this.colors.white)
    for (let i = 0; i < 3; i++) {
      const x = this.pageWidth - 15 + (i * 3)
      const y = 8 + (i * 2)
      this.pdf.triangle(x, y, x + 2, y, x + 1, y + 2, 'F')
    }

    // INVOICE badge with geometric design
    this._createInvoiceBadge(invoiceData)

    this.currentY = 50
  }

  _createInvoiceBadge(invoiceData) {
    const badgeX = this.pageWidth - 90
    const badgeY = 45
    const badgeWidth = 80
    const badgeHeight = 30

    // Badge background with rounded corners effect
    this.pdf.setFillColor(...this.colors.primary)
    this.pdf.rect(badgeX, badgeY, badgeWidth, badgeHeight, 'F')

    // Geometric accent triangle
    this.pdf.setFillColor(...this.colors.primaryDark)
    this.pdf.triangle(badgeX, badgeY, badgeX + 20, badgeY, badgeX, badgeY + 20, 'F')

    // Small decorative triangles in badge
    this.pdf.setFillColor(...this.colors.white)
    for (let i = 0; i < 3; i++) {
      const x = badgeX + badgeWidth - 12 + (i * 3)
      const y = badgeY + 5 + (i * 1.5)
      this.pdf.triangle(x, y, x + 2, y, x + 1, y + 2, 'F')
    }

    // Badge text - better positioned
    this.pdf.setTextColor(...this.colors.white)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(16)
    this.pdf.text('FACTURE', badgeX + 25, badgeY + 12)

    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(10)
    this.pdf.text(`Facture N° : ${invoiceData.invoice_number}`, badgeX + 25, badgeY + 22)
  }

  _addCompanySection(instructorData) {
    // Company logo area with better proportions
    this.pdf.setFillColor(...this.colors.lightGray)
    this.pdf.rect(20, this.currentY, 30, 25, 'F')

    // Geometric logo with better design
    this.pdf.setFillColor(...this.colors.primary)
    this.pdf.circle(35, this.currentY + 12.5, 10, 'F')

    this.pdf.setTextColor(...this.colors.white)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(9)
    this.pdf.text('AUTO', 35, this.currentY + 10, { align: 'center' })
    this.pdf.text('ÉCOLE', 35, this.currentY + 16, { align: 'center' })

    // Company name with better spacing
    this.pdf.setTextColor(...this.colors.black)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(18)
    this.pdf.text(instructorData?.business_name || 'Driving School Pro', 55, this.currentY + 15)

    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(...this.colors.gray)
    this.pdf.text('École de conduite professionnelle', 55, this.currentY + 22)

    this.currentY += 40
  }

  _addInvoiceToSection(customer, invoiceData) {
    // INVOICE TO header with proper spacing
    this.pdf.setFillColor(...this.colors.primary)
    this.pdf.rect(20, this.currentY, 120, 10, 'F')

    this.pdf.setTextColor(...this.colors.white)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(11)
    this.pdf.text('FACTURÉ À', 25, this.currentY + 7)

    // Date section (right side) - better positioned
    this.pdf.setTextColor(...this.colors.black)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(10)
    this.pdf.text(`Date : ${this._formatDate(invoiceData.invoice_date)}`, this.pageWidth - 70, this.currentY + 7)

    this.currentY += 18

    // Customer details with better formatting
    if (!customer) {
      this.pdf.setTextColor(...this.colors.gray)
      this.pdf.text('Client non spécifié', 25, this.currentY)
      this.currentY += 25
      return
    }

    this.pdf.setTextColor(...this.colors.black)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(12)

    // Customer name
    const customerName = customer.client_type === 'company'
      ? customer.company_name || 'Société'
      : `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Client'

    this.pdf.text(`Nom : ${customerName}`, 25, this.currentY)
    this.currentY += 8

    // Address with better formatting
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(...this.colors.gray)

    if (customer.address) {
      this.pdf.text(`Adresse : ${customer.address}`, 25, this.currentY)
      this.currentY += 6

      const cityInfo = `${customer.postal_code || ''} ${customer.city || ''}`.trim()
      if (cityInfo) {
        this.pdf.text(`          ${cityInfo}`, 25, this.currentY)
        this.currentY += 6
      }
    }

    // Additional contact info
    if (customer.email) {
      this.pdf.text(`Email : ${customer.email}`, 25, this.currentY)
      this.currentY += 6
    }

    if (customer.phone) {
      this.pdf.text(`Tél : ${customer.phone}`, 25, this.currentY)
      this.currentY += 6
    }

    if (customer.vat_number) {
      this.pdf.text(`TVA : ${customer.vat_number}`, 25, this.currentY)
      this.currentY += 6
    }

    this.currentY += 10
  }

  _addItemsTable(items) {
    if (!items || items.length === 0) {
      this._addEmptyItemsSection()
      return
    }

    // Table with better structure
    const tableStartY = this.currentY

    // Use autoTable for better rendering
    const tableData = items.map(item => [
      item.description || 'Service non spécifié',
      `€${(item.unit_price || 0).toFixed(2)}`,
      (item.quantity || 1).toString(),
      `€${(item.total_price || 0).toFixed(2)}`
    ])

    try {
      autoTable(this.pdf, {
        startY: tableStartY,
        head: [['DESCRIPTION PRESTATIONS', 'PRIX', 'QTÉ.', 'TOTAL']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
          textColor: this.colors.black,
          lineColor: this.colors.border,
          lineWidth: 0.3
        },
        headStyles: {
          fillColor: this.colors.primary,
          textColor: this.colors.white,
          fontStyle: 'bold',
          fontSize: 11
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: 100 }, // Description
          1: { cellWidth: 25, halign: 'center' }, // Price
          2: { cellWidth: 20, halign: 'center' }, // Quantity
          3: { cellWidth: 25, halign: 'right' } // Total
        },
        margin: { left: 20, right: 20 }
      })

      this.currentY = this.pdf.lastAutoTable.finalY + 15
    } catch (error) {
      console.error('Table generation error:', error)
      this._addEmptyItemsSection()
    }
  }

  _addEmptyItemsSection() {
    this.pdf.setFillColor(...this.colors.lightGray)
    this.pdf.rect(20, this.currentY, 170, 30, 'F')

    this.pdf.setTextColor(...this.colors.gray)
    this.pdf.setFont('helvetica', 'italic')
    this.pdf.setFontSize(10)
    this.pdf.text('Aucune prestation facturée', 105, this.currentY + 20, { align: 'center' })

    this.currentY += 40
  }

  _addTotalsSection(invoiceData) {
    const totalsX = 120
    const totalsWidth = 70

    const subtotal = invoiceData.subtotal || 0
    const taxRate = invoiceData.tax_rate || 21
    const taxAmount = invoiceData.tax_amount || 0
    const total = invoiceData.total_amount || 0

    // Totals with clean right alignment
    this.pdf.setTextColor(...this.colors.black)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(11)

    let totalsY = this.currentY + 10

    // Subtotal
    this.pdf.text('Sous-total', totalsX, totalsY)
    this.pdf.text(`€${subtotal.toFixed(2)}`, totalsX + totalsWidth, totalsY, { align: 'right' })
    totalsY += 8

    // Tax
    this.pdf.text(`TVA (${taxRate}%)`, totalsX, totalsY)
    this.pdf.text(`€${taxAmount.toFixed(2)}`, totalsX + totalsWidth, totalsY, { align: 'right' })
    totalsY += 12

    // Total with highlighted background
    this.pdf.setFillColor(...this.colors.primary)
    this.pdf.rect(totalsX - 2, totalsY - 6, totalsWidth + 4, 12, 'F')

    this.pdf.setTextColor(...this.colors.white)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(12)
    this.pdf.text('TOTAL :', totalsX, totalsY)
    this.pdf.text(`€${total.toFixed(2)}`, totalsX + totalsWidth, totalsY, { align: 'right' })

    this.currentY = totalsY + 20
  }

  _addPaymentSection(instructorData) {
    // Payment information header
    this.pdf.setTextColor(...this.colors.black)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setFontSize(12)
    this.pdf.text('INFORMATIONS DE PAIEMENT :', 20, this.currentY)

    this.currentY += 12

    // Payment details in clean layout
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(10)

    // Left column labels
    this.pdf.setTextColor(...this.colors.gray)
    this.pdf.text('Compte', 20, this.currentY)
    this.pdf.text('Titulaire', 20, this.currentY + 8)
    this.pdf.text('Banque', 20, this.currentY + 16)

    // Right column values
    this.pdf.setTextColor(...this.colors.black)
    this.pdf.text(instructorData?.iban || 'IBAN à fournir', 60, this.currentY)
    this.pdf.text(instructorData?.business_name || 'Driving School Pro', 60, this.currentY + 8)
    this.pdf.text(instructorData?.bank_name || 'Banque à préciser', 60, this.currentY + 16)

    // Authorized signature section (right side)
    this.pdf.setTextColor(...this.colors.gray)
    this.pdf.setFont('helvetica', 'italic')
    this.pdf.setFontSize(10)
    this.pdf.text('Signature autorisée', this.pageWidth - 70, this.currentY + 8)

    this.currentY += 35
  }

  _addGeometricFooter(instructorData) {
    const footerY = this.pageHeight - 35

    // Geometric footer background
    this.pdf.setFillColor(...this.colors.primary)
    this.pdf.rect(0, footerY, this.pageWidth, 35, 'F')

    // Geometric triangular elements in footer
    this.pdf.setFillColor(...this.colors.primaryDark)
    this.pdf.triangle(0, footerY, 30, footerY, 15, footerY + 20, 'F')
    this.pdf.triangle(this.pageWidth - 30, footerY + 35, this.pageWidth, footerY + 35, this.pageWidth - 15, footerY + 15, 'F')

    // Footer content
    this.pdf.setTextColor(...this.colors.white)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setFontSize(8)

    const footerInfo = [
      instructorData?.phone || '+32 XXX XX XX XX',
      instructorData?.email || 'contact@ecole-conduite.be',
      instructorData?.address || 'Adresse de l\'école',
      instructorData?.vat_number || 'TVA: BE XXXX.XXX.XXX'
    ]

    let infoX = 40
    footerInfo.forEach(info => {
      this.pdf.text(info, infoX, footerY + 20)
      infoX += 35
    })

    // Small geometric decorations
    this.pdf.setFillColor(...this.colors.primaryLight)
    for (let i = 0; i < 3; i++) {
      const x = 10 + (i * 5)
      this.pdf.triangle(x, footerY + 10, x + 3, footerY + 10, x + 1.5, footerY + 13, 'F')
    }

    for (let i = 0; i < 3; i++) {
      const x = this.pageWidth - 20 + (i * 3)
      this.pdf.triangle(x, footerY + 25, x + 2, footerY + 25, x + 1, footerY + 27, 'F')
    }
  }

  // Helper method for triangles
  triangle(x1, y1, x2, y2, x3, y3, style) {
    this.pdf.lines([[x2 - x1, y2 - y1], [x3 - x2, y3 - y2], [x1 - x3, y1 - y3]], x1, y1, [1, 1], style, true)
  }

  downloadPDF(filename) {
    if (!this.pdf) throw new Error('PDF not generated')
    this.pdf.save(filename)
  }

  getPDFBlob() {
    if (!this.pdf) throw new Error('PDF not generated')
    return this.pdf.output('blob')
  }

  _formatDate(dateString) {
    if (!dateString) return 'Date non spécifiée'
    try {
      return new Date(dateString).toLocaleDateString('fr-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'Date invalide'
    }
  }
}
