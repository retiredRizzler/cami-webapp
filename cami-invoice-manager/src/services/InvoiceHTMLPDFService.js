// src/services/InvoiceHTMLPDFService.js
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export class InvoiceHTMLPDFService {
  /**
   * Generate PDF from HTML string template
   * @param {Object} invoiceData - Invoice data
   * @param {Object} instructorData - Instructor data
   * @returns {Promise<jsPDF>} PDF document
   */
  async generateInvoicePDF(invoiceData, instructorData) {
    try {
      console.log('Generating HTML invoice PDF...')

      // Create HTML template
      const htmlTemplate = this._createHTMLTemplate(invoiceData, instructorData)

      // Create temporary container
      const tempContainer = document.createElement('div')
      tempContainer.innerHTML = htmlTemplate
      tempContainer.style.position = 'fixed'
      tempContainer.style.top = '-9999px'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = '210mm'
      tempContainer.style.background = 'white'
      tempContainer.style.zIndex = '-1000'

      document.body.appendChild(tempContainer)

      // Wait for rendering
      await this._wait(500)

      console.log('Converting HTML to canvas...')

      // Convert to PDF
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: this._mmToPx(210),
        height: this._mmToPx(297)
      })

      console.log('Creating PDF from canvas...')

      // Create PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)

      // Cleanup
      document.body.removeChild(tempContainer)

      console.log('HTML invoice PDF generated successfully')
      return pdf

    } catch (error) {
      console.error('Error generating HTML PDF:', error)
      throw new Error(`PDF Generation failed: ${error.message}`)
    }
  }

  /**
   * Create HTML template string
   */
  _createHTMLTemplate(invoiceData, instructorData) {
    const customerName = this._getCustomerName(invoiceData.customer)
    const items = invoiceData.invoice_items || []

    return `
      <div style="width: 210mm; min-height: 297mm; background: white; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; position: relative; margin: 0; padding: 0; color: #374151; line-height: 1.5;">

        <!-- Header Section -->
        <div style="padding: 1.5rem 3.5rem;">
          <table style="width: 100%; border-collapse: collapse; border-spacing: 0;">
            <tbody>
              <tr>
                <td style="width: 100%; vertical-align: top;">
                  <div>
                    <h1 style="font-size: 1.5rem; font-weight: 700; color: #5c6ac4; margin: 0 0 0.25rem 0;">${instructorData?.business_name || 'Driving School Pro'}</h1>
                    <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">École de conduite professionnelle</p>
                  </div>
                </td>
                <td style="vertical-align: top;">
                  <div style="font-size: 0.875rem;">
                    <table style="border-collapse: collapse; border-spacing: 0;">
                      <tbody>
                        <tr>
                          <td style="border-right: 1px solid #e5e7eb; padding-right: 1rem;">
                            <div>
                              <p style="white-space: nowrap; color: #94a3b8; text-align: right; margin: 0;">Date</p>
                              <p style="white-space: nowrap; font-weight: 700; color: #5c6ac4; text-align: right; margin: 0;">${this._formatDate(invoiceData.invoice_date)}</p>
                            </div>
                          </td>
                          <td style="padding-left: 1rem;">
                            <div>
                              <p style="white-space: nowrap; color: #94a3b8; text-align: right; margin: 0;">Facture #</p>
                              <p style="white-space: nowrap; font-weight: 700; color: #5c6ac4; text-align: right; margin: 0;">${invoiceData.invoice_number}</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Address Section -->
        <div style="background-color: #f1f5f9; padding: 1.5rem 3.5rem; font-size: 0.875rem;">
          <table style="width: 100%; border-collapse: collapse; border-spacing: 0;">
            <tbody>
              <tr>
                <td style="width: 50%; vertical-align: top;">
                  <div style="color: #525252;">
                    <p style="font-weight: 700; margin: 0 0 0.25rem 0;">${instructorData?.business_name || 'Driving School Pro'}</p>
                    ${instructorData?.vat_number ? `<p style="margin: 0.125rem 0;">TVA: ${instructorData.vat_number}</p>` : ''}
                    ${instructorData?.license_number ? `<p style="margin: 0.125rem 0;">Licence: ${instructorData.license_number}</p>` : ''}
                    ${instructorData?.address ? `<p style="margin: 0.125rem 0;">${instructorData.address}</p>` : ''}
                    ${this._getCityInfo(instructorData) ? `<p style="margin: 0.125rem 0;">${this._getCityInfo(instructorData)}</p>` : ''}
                    ${instructorData?.country ? `<p style="margin: 0.125rem 0;">${instructorData.country}</p>` : ''}
                  </div>
                </td>
                <td style="width: 50%; vertical-align: top; text-align: right;">
                  <div style="color: #525252;">
                    <p style="font-weight: 700; margin: 0 0 0.25rem 0;">${customerName}</p>
                    ${invoiceData.customer?.client_type === 'company' && invoiceData.customer?.contact_person ? `<p style="margin: 0.125rem 0;">Contact: ${invoiceData.customer.contact_person}</p>` : ''}
                    ${invoiceData.customer?.vat_number ? `<p style="margin: 0.125rem 0;">TVA: ${invoiceData.customer.vat_number}</p>` : ''}
                    ${invoiceData.customer?.address ? `<p style="margin: 0.125rem 0;">${invoiceData.customer.address}</p>` : ''}
                    ${this._getCityInfo(invoiceData.customer) ? `<p style="margin: 0.125rem 0;">${this._getCityInfo(invoiceData.customer)}</p>` : ''}
                    ${invoiceData.customer?.country ? `<p style="margin: 0.125rem 0;">${invoiceData.customer.country}</p>` : ''}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Items Table -->
        <div style="padding: 2.5rem 3.5rem; font-size: 0.875rem; color: #404040;">
          <table style="width: 100%; border-collapse: collapse; border-spacing: 0;">
            <thead>
              <tr>
                <th style="border-bottom: 2px solid #5c6ac4; padding-bottom: 0.75rem; padding-left: 0.75rem; font-weight: 700; color: #5c6ac4; text-align: left;">#</th>
                <th style="border-bottom: 2px solid #5c6ac4; padding-bottom: 0.75rem; padding-left: 0.5rem; font-weight: 700; color: #5c6ac4; text-align: left;">Description du service</th>
                <th style="border-bottom: 2px solid #5c6ac4; padding-bottom: 0.75rem; padding-left: 0.5rem; font-weight: 700; color: #5c6ac4; text-align: right;">Prix</th>
                <th style="border-bottom: 2px solid #5c6ac4; padding-bottom: 0.75rem; padding-left: 0.5rem; font-weight: 700; color: #5c6ac4; text-align: center;">Qté.</th>
                <th style="border-bottom: 2px solid #5c6ac4; padding-bottom: 0.75rem; padding-left: 0.5rem; font-weight: 700; color: #5c6ac4; text-align: center;">TVA</th>
                <th style="border-bottom: 2px solid #5c6ac4; padding-bottom: 0.75rem; padding-left: 0.5rem; font-weight: 700; color: #5c6ac4; text-align: right;">Sous-total</th>
                <th style="border-bottom: 2px solid #5c6ac4; padding-bottom: 0.75rem; padding-left: 0.5rem; padding-right: 0.75rem; font-weight: 700; color: #5c6ac4; text-align: right;">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0.5rem; padding-left: 0.75rem;">${index + 1}.</td>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0.5rem;">
                    <div>${item.description || 'Service non spécifié'}</div>
                    ${item.service_date ? `<div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Date: ${this._formatDate(item.service_date)}</div>` : ''}
                    ${item.duration_hours ? `<div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Durée: ${item.duration_hours}h</div>` : ''}
                  </td>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0.5rem; text-align: right;">€${(item.unit_price || 0).toFixed(2)}</td>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0.5rem; text-align: center;">${item.quantity || 1}</td>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0.5rem; text-align: center;">${invoiceData.tax_rate || 21}%</td>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0.5rem; text-align: right;">€${(item.total_price || 0).toFixed(2)}</td>
                  <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem 0.5rem; padding-right: 0.75rem; text-align: right;">€${((item.total_price || 0) * (1 + (invoiceData.tax_rate || 21) / 100)).toFixed(2)}</td>
                </tr>
              `).join('')}

              <!-- Totals Row -->
              <tr>
                <td colspan="7">
                  <table style="width: 100%; border-collapse: collapse; border-spacing: 0;">
                    <tbody>
                      <tr>
                        <td style="width: 100%;"></td>
                        <td>
                          <table style="width: 100%; border-collapse: collapse; border-spacing: 0;">
                            <tbody>
                              <tr>
                                <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem;">
                                  <div style="white-space: nowrap; color: #94a3b8;">Total HT:</div>
                                </td>
                                <td style="border-bottom: 1px solid #e5e7eb; padding: 0.75rem; text-align: right;">
                                  <div style="white-space: nowrap; font-weight: 700; color: #5c6ac4;">€${(invoiceData.subtotal || 0).toFixed(2)}</div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0.75rem;">
                                  <div style="white-space: nowrap; color: #94a3b8;">TVA (${invoiceData.tax_rate || 21}%):</div>
                                </td>
                                <td style="padding: 0.75rem; text-align: right;">
                                  <div style="white-space: nowrap; font-weight: 700; color: #5c6ac4;">€${(invoiceData.tax_amount || 0).toFixed(2)}</div>
                                </td>
                              </tr>
                              <tr>
                                <td style="background-color: #5c6ac4; padding: 0.75rem;">
                                  <div style="white-space: nowrap; font-weight: 700; color: white;">Total TTC:</div>
                                </td>
                                <td style="background-color: #5c6ac4; padding: 0.75rem; text-align: right;">
                                  <div style="white-space: nowrap; font-weight: 700; color: white;">€${(invoiceData.total_amount || 0).toFixed(2)}</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Payment Details -->
        <div style="padding: 0 3.5rem; font-size: 0.875rem; color: #404040; margin-bottom: 2.5rem;">
          <p style="color: #5c6ac4; font-weight: 700; margin: 0 0 0.5rem 0;">INFORMATIONS DE PAIEMENT</p>
          ${instructorData?.bank_name ? `<p style="margin: 0.25rem 0;">Banque: ${instructorData.bank_name}</p>` : ''}
          ${instructorData?.bic ? `<p style="margin: 0.25rem 0;">Code BIC: ${instructorData.bic}</p>` : ''}
          ${instructorData?.iban ? `<p style="margin: 0.25rem 0;">IBAN: ${instructorData.iban}</p>` : ''}
          <p style="margin: 0.25rem 0;">Référence de paiement: ${invoiceData.invoice_number}</p>
        </div>

        <!-- Notes Section -->
        ${invoiceData.notes ? `
          <div style="padding: 0 3.5rem 2.5rem 3.5rem; font-size: 0.875rem; color: #404040;">
            <p style="color: #5c6ac4; font-weight: 700; margin: 0 0 0.5rem 0;">Notes</p>
            <p style="font-style: italic; margin: 0;">${invoiceData.notes}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <footer style="position: fixed; bottom: 0; left: 0; background-color: #f1f5f9; width: 100%; color: #525252; text-align: center; font-size: 0.75rem; padding: 0.75rem 0;">
          ${instructorData?.business_name ? `<span>${instructorData.business_name}</span>` : ''}
          <span style="color: #cbd5e1; padding: 0 0.5rem;">|</span>
          ${instructorData?.email ? `<span>${instructorData.email}</span>` : ''}
          <span style="color: #cbd5e1; padding: 0 0.5rem;">|</span>
          ${instructorData?.phone ? `<span>${instructorData.phone}</span>` : ''}
        </footer>
      </div>
    `
  }

  /**
   * Download PDF with filename
   */
  downloadPDF(pdf, filename) {
    if (!pdf) {
      throw new Error('PDF not provided')
    }

    try {
      pdf.save(filename)
      console.log('PDF downloaded successfully:', filename)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      throw new Error('Failed to download PDF')
    }
  }

  /**
   * Get PDF as blob for further processing
   */
  getPDFBlob(pdf) {
    if (!pdf) {
      throw new Error('PDF not provided')
    }

    return pdf.output('blob')
  }

  /**
   * Preview PDF in new window
   */
  previewPDF(pdf) {
    if (!pdf) {
      throw new Error('PDF not provided')
    }

    try {
      const pdfDataUri = pdf.output('datauristring')
      const newWindow = window.open()
      newWindow.document.write(`
        <html>
          <head>
            <title>Invoice Preview</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              iframe { width: 100%; height: 90vh; border: 1px solid #ccc; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { color: #5c6ac4; margin: 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Invoice Preview</h1>
              <p>Right-click the PDF to save or print</p>
            </div>
            <iframe src="${pdfDataUri}" type="application/pdf"></iframe>
          </body>
        </html>
      `)
      newWindow.document.close()
    } catch (error) {
      console.error('Error previewing PDF:', error)
      throw new Error('Failed to preview PDF')
    }
  }

  // Helper methods
  _getCustomerName(customer) {
    if (!customer) return 'Client non spécifié'
    return customer.client_type === 'company'
      ? customer.company_name || 'Société'
      : `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Client'
  }

  _getCityInfo(entity) {
    if (!entity) return ''
    return `${entity.postal_code || ''} ${entity.city || ''}`.trim()
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

  _mmToPx(mm) {
    return Math.round(mm * 3.779528)
  }

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
