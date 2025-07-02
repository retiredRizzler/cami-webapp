// src/services/InvoicesService.js
import { supabase } from "@/lib/supabaseClient.js";
import { InvoicePDFService } from "./InvoicePDFService.js";
import { InvoiceHTMLPDFService } from "./InvoiceHTMLPDFService.js";

export class InvoicesService {
  /**
   * Get all invoices for the current user with customer and items data
   */
  async getInvoices() {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          customer:customers(
            id,
            client_type,
            first_name,
            last_name,
            company_name,
            email,
            phone
          ),
          invoice_items:invoice_items(
            id,
            description,
            service_date,
            duration_hours,
            unit_price,
            quantity,
            total_price,
            service_type_id,
            service_types(
              id,
              name,
              category
            )
          )
        `
        )
        .order("invoice_date", { ascending: false });

      if (error) throw error;

      // Add computed fields for display
      const invoicesWithDisplay = data.map((invoice) => this._enhanceInvoiceData(invoice));
      return invoicesWithDisplay;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  }

  /**
   * Get a single invoice by ID with full details
   */
  async getInvoice(id) {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          customer:customers(*),
          invoice_items:invoice_items(
            *,
            service_types(*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return this._enhanceInvoiceData(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }

  // Ajouter cette méthode dans la classe InvoicesService
/**
 * Génère un nouveau numéro de facture côté client
 * Format: YYYY-MM-NNNN (ex: 2025-01-0001)
 */
async generateInvoiceNumber() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const prefix = `${year}-${month}-`

    // Récupérer toutes les factures de l'utilisateur pour ce mois
    const { data: existingInvoices, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('user_id', user.id)
      .like('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })

    if (error) throw error

    // Calculer le prochain numéro
    let nextNumber = 1
    if (existingInvoices && existingInvoices.length > 0) {
      // Extraire le numéro de la dernière facture du mois
      const lastInvoice = existingInvoices[0]
      const lastNumberMatch = lastInvoice.invoice_number.match(/(\d{4})$/)
      if (lastNumberMatch) {
        nextNumber = parseInt(lastNumberMatch[1]) + 1
      }
    }

    // Formater le numéro final
    const paddedNumber = String(nextNumber).padStart(4, '0')
    return `${prefix}${paddedNumber}`

  } catch (error) {
    console.error('Error generating invoice number:', error)
    throw new Error('Failed to generate invoice number')
  }
}


/**
 * Génère un numéro de facture unique avec retry en cas de conflit
 */
async generateUniqueInvoiceNumber(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const candidateNumber = await this.generateInvoiceNumber()

      // Vérifier que le numéro n'existe pas déjà
      const { data: existing, error } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_number', candidateNumber)
        .single()

      if (error && error.code === 'PGRST116') {
        // Aucune facture trouvée avec ce numéro, c'est bon
        return candidateNumber
      } else if (!error && existing) {
        // Le numéro existe déjà, on retry
        console.warn(`Invoice number ${candidateNumber} already exists, retrying... (attempt ${attempt})`)
        if (attempt === maxRetries) {
          throw new Error('Could not generate unique invoice number after multiple attempts')
        }
        // Attendre un peu avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 100))
        continue
      } else if (error) {
        throw error
      }

      return candidateNumber
    } catch (error) {
      if (attempt === maxRetries) throw error
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

  /**
   * Create a new invoice with items
   */
  async createInvoiceWithItems(invoiceData, itemsData) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Validate input data
    const invoiceValidation = this.validateInvoiceData(invoiceData)
    if (!invoiceValidation.isValid) {
      throw new Error(`Invoice validation failed: ${invoiceValidation.errors.join(', ')}`)
    }

    // Validate items if provided
    if (itemsData && itemsData.length > 0) {
      for (let i = 0; i < itemsData.length; i++) {
        const itemValidation = this.validateInvoiceItemData(itemsData[i])
        if (!itemValidation.isValid) {
          throw new Error(`Item ${i + 1} validation failed: ${itemValidation.errors.join(', ')}`)
        }
      }
    }

    // Generate invoice number côté client
    const invoiceNumber = await this.generateUniqueInvoiceNumber()

    // Prepare invoice data with calculated totals
    const totals = this._calculateTotals(itemsData || [], invoiceData.tax_rate || 21.0)

    const dataToInsert = {
      ...invoiceData,
      user_id: user.id,
      invoice_number: invoiceNumber,
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      due_date: invoiceData.due_date || this._calculateDueDate(invoiceData.invoice_date),
      status: invoiceData.status || 'draft',
      tax_rate: invoiceData.tax_rate || 21.0,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total_amount: totals.totalAmount,
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([dataToInsert])
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Add items if provided
    if (itemsData && itemsData.length > 0) {
      const itemsToInsert = itemsData.map((item) => ({
        ...this._prepareItemData(item),
        invoice_id: invoice.id,
      }))

      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert)
      if (itemsError) throw itemsError
    }

    // Return the complete invoice
    return await this.getInvoice(invoice.id)
  } catch (error) {
    console.error('Error creating invoice with items:', error)
    throw error
  }
}

  /**
   * Update an existing invoice with items
   */
  async updateInvoiceWithItems(id, invoiceData, itemsData) {
    try {
      // Validate input data
      const invoiceValidation = this.validateInvoiceData(invoiceData);
      if (!invoiceValidation.isValid) {
        throw new Error(`Invoice validation failed: ${invoiceValidation.errors.join(", ")}`);
      }

      // Validate items if provided
      if (itemsData && itemsData.length > 0) {
        for (let i = 0; i < itemsData.length; i++) {
          const itemValidation = this.validateInvoiceItemData(itemsData[i]);
          if (!itemValidation.isValid) {
            throw new Error(`Item ${i + 1} validation failed: ${itemValidation.errors.join(", ")}`);
          }
        }
      }

      // Calculate totals
      const totals = this._calculateTotals(itemsData || [], invoiceData.tax_rate || 21.0);

      const dataToUpdate = {
        ...invoiceData,
        tax_rate: invoiceData.tax_rate || 21.0,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.totalAmount,
        updated_at: new Date().toISOString(),
      };

      // Update invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .update(dataToUpdate)
        .eq("id", id)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Handle items update if provided
      if (itemsData !== undefined) {
        // Delete existing items first
        const { error: deleteError } = await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", id);

        if (deleteError) throw deleteError;

        // Insert new items if any
        if (itemsData.length > 0) {
          const itemsToInsert = itemsData.map((item) => ({
            ...this._prepareItemData(item),
            invoice_id: id,
          }));

          const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);

          if (itemsError) throw itemsError;
        }
      }

      // Return the complete updated invoice
      return await this.getInvoice(id);
    } catch (error) {
      console.error("Error updating invoice with items:", error);
      throw error;
    }
  }

  /**
   * Delete an invoice and all its items (handled by CASCADE)
   */
  async deleteInvoice(id) {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }

  /**
   * Add an item to an existing invoice
   */
  async addInvoiceItem(invoiceId, itemData) {
    try {
      const itemValidation = this.validateInvoiceItemData(itemData);
      if (!itemValidation.isValid) {
        throw new Error(`Item validation failed: ${itemValidation.errors.join(", ")}`);
      }

      const dataToInsert = {
        ...this._prepareItemData(itemData),
        invoice_id: invoiceId,
      };

      const { data, error } = await supabase
        .from("invoice_items")
        .insert([dataToInsert])
        .select(
          `
          *,
          service_types(*)
        `
        )
        .single();

      if (error) throw error;

      // Recalculate invoice totals
      await this._recalculateInvoiceTotals(invoiceId);

      return data;
    } catch (error) {
      console.error("Error adding invoice item:", error);
      throw error;
    }
  }

  /**
   * Update a specific invoice item
   */
  async updateInvoiceItem(itemId, itemData) {
    try {
      const itemValidation = this.validateInvoiceItemData(itemData);
      if (!itemValidation.isValid) {
        throw new Error(`Item validation failed: ${itemValidation.errors.join(", ")}`);
      }

      const dataToUpdate = this._prepareItemData(itemData);

      const { data, error } = await supabase
        .from("invoice_items")
        .update(dataToUpdate)
        .eq("id", itemId)
        .select(
          `
          *,
          service_types(*),
          invoice_id
        `
        )
        .single();

      if (error) throw error;

      // Recalculate invoice totals
      await this._recalculateInvoiceTotals(data.invoice_id);

      return data;
    } catch (error) {
      console.error("Error updating invoice item:", error);
      throw error;
    }
  }

  /**
   * Delete an invoice item
   */
  async deleteInvoiceItem(itemId) {
    try {
      // Get the invoice_id before deletion for recalculation
      const { data: item } = await supabase
        .from("invoice_items")
        .select("invoice_id")
        .eq("id", itemId)
        .single();

      const { error } = await supabase.from("invoice_items").delete().eq("id", itemId);

      if (error) throw error;

      // Recalculate invoice totals if we have the invoice_id
      if (item?.invoice_id) {
        await this._recalculateInvoiceTotals(item.invoice_id);
      }

      return true;
    } catch (error) {
      console.error("Error deleting invoice item:", error);
      throw error;
    }
  }

  /**
   * Get all customers formatted for invoice creation dropdown
   */
  async getCustomersForInvoice() {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, client_type, first_name, last_name, company_name, email")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((customer) => ({
        ...customer,
        display_name:
          customer.client_type === "company"
            ? customer.company_name
            : `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
        label:
          customer.client_type === "company"
            ? `${customer.company_name} (${customer.email})`
            : `${customer.first_name || ""} ${customer.last_name || ""} (${customer.email})`.trim(),
      }));
    } catch (error) {
      console.error("Error fetching customers for invoice:", error);
      throw error;
    }
  }

  /**
   * Get invoice statistics for dashboard
   */
  async getInvoiceStats() {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("status, total_amount, invoice_date, due_date");

      if (error) throw error;

      const now = new Date();
      const overdueInvoices = data.filter(
        (i) =>
          i.status !== "paid" &&
          i.status !== "cancelled" &&
          i.due_date &&
          new Date(i.due_date) < now
      );

      const stats = {
        total_invoices: data.length,
        draft_invoices: data.filter((i) => i.status === "draft").length,
        sent_invoices: data.filter((i) => i.status === "sent").length,
        paid_invoices: data.filter((i) => i.status === "paid").length,
        overdue_invoices: overdueInvoices.length,
        cancelled_invoices: data.filter((i) => i.status === "cancelled").length,
        total_revenue: data
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0),
        pending_amount: data
          .filter((i) => i.status === "sent" || i.status === "draft")
          .reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0),
        overdue_amount: overdueInvoices.reduce(
          (sum, i) => sum + parseFloat(i.total_amount || 0),
          0
        ),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      throw error;
    }
  }

  /**
   * Update invoice status only
   */
  async updateInvoiceStatus(invoiceId, newStatus) {
    try {
      if (!["draft", "sent", "paid", "overdue", "cancelled"].includes(newStatus)) {
        throw new Error("Invalid status");
      }

      const { data, error } = await supabase
        .from("invoices")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  }

  /**
   * Generate and download PDF for an invoice
   */
  async generateInvoicePDF(invoiceId) {
    try {
      // Get complete invoice data
      const invoiceData = await this.getInvoice(invoiceId);

      // Get instructor profile data
      const instructorData = await this._getInstructorProfile();

      // Generate PDF
      const pdfService = new InvoicePDFService();
      const pdf = await pdfService.generateInvoicePDF(invoiceData, instructorData);

      // Generate filename
      const filename = `facture_${invoiceData.invoice_number}.pdf`;

      // Download PDF
      pdfService.downloadPDF(filename);

      return { success: true, filename };
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      throw error;
    }
  }

  /**
   * Generate PDF blob for email attachment
   */
  async generateInvoicePDFBlob(invoiceId) {
    try {
      const invoiceData = await this.getInvoice(invoiceId);
      const instructorData = await this._getInstructorProfile();

      const pdfService = new InvoicePDFService();
      await pdfService.generateInvoicePDF(invoiceData, instructorData);

      return {
        blob: pdfService.getPDFBlob(),
        filename: `facture_${invoiceData.invoice_number}.pdf`,
      };
    } catch (error) {
      console.error("Error generating PDF blob:", error);
      throw error;
    }
  }

  /**
   * Generate HTML-based PDF for an invoice
   * @param {string} invoiceId - Invoice ID
   */
  // Replace the complex method with this simple one:
  async generateHTMLInvoicePDF(invoiceId) {
    try {
      const invoiceData = await this.getInvoice(invoiceId);
      const instructorData = await this._getInstructorProfile();

      // Always use the simplified service
      const pdfService = new InvoiceHTMLPDFService();
      const pdf = await pdfService.generateInvoicePDF(invoiceData, instructorData);

      const filename = `facture_${invoiceData.invoice_number}.pdf`;
      pdfService.downloadPDF(pdf, filename);

      return { success: true, filename, method: "html-string" };
    } catch (error) {
      console.error("Error generating HTML invoice PDF:", error);
      throw new Error(`PDF Generation failed: ${error.message}`);
    }
  }

  /**
   * Generate HTML PDF blob for email attachment
   * @param {string} invoiceId - Invoice ID
   */
  async generateHTMLInvoicePDFBlob(invoiceId) {
    try {
      const invoiceData = await this.getInvoice(invoiceId);
      const instructorData = await this._getInstructorProfile();

      const pdfService = new InvoiceHTMLPDFService();

      const pdf = await pdfService.generateInvoicePDF(invoiceData, instructorData);

      return {
        blob: pdfService.getPDFBlob(pdf),
        filename: `facture_${invoiceData.invoice_number}.pdf`,
      };
    } catch (error) {
      console.error("Error generating HTML PDF blob:", error);
      throw error;
    }
  }

  /**
   * Preview HTML invoice in new window
   * @param {string} invoiceId - Invoice ID
   */
  async previewHTMLInvoice(invoiceId) {
    try {
      const invoiceData = await this.getInvoice(invoiceId);
      const instructorData = await this._getInstructorProfile();

      const pdfService =  new InvoiceHTMLPDFService();

      const pdf = await pdfService.generateInvoicePDF(invoiceData, instructorData);

      // Use preview method if available
      if (pdfService.previewPDF) {
        pdfService.previewPDF(pdf);
      } else {
        // Fallback: download the PDF
        const filename = `facture_${invoiceData.invoice_number}_preview.pdf`;
        pdfService.downloadPDF(pdf, filename);
      }

      return { success: true, method: "preview" };
    } catch (error) {
      console.error("Error previewing HTML invoice:", error);
      throw error;
    }
  }

  /**
   * Get instructor profile for PDF generation
   */
  async _getInstructorProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("instructor_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no profile exists, create a basic one or use defaults
        if (error.code === "PGRST116") {
          return this._getDefaultInstructorProfile(user);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching instructor profile:", error);
      throw error;
    }
  }

  /**
   * Get default instructor profile if none exists
   */
  _getDefaultInstructorProfile(user) {
    return {
      business_name: "Driving School Pro",
      first_name: user.user_metadata?.name?.split(" ")[0] || "Instructor",
      last_name: user.user_metadata?.name?.split(" ").slice(1).join(" ") || "",
      email: user.email,
      phone: null,
      address: null,
      city: null,
      postal_code: null,
      country: "Belgium",
      vat_number: null,
      license_number: null,
      iban: null,
      bic: null,
      bank_name: null,
    };
  }

  /**
   * Private method to enhance invoice data with computed fields
   */
  _enhanceInvoiceData(invoice) {
    const now = new Date();
    const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
    const isOverdue =
      invoice.status !== "paid" && invoice.status !== "cancelled" && dueDate && dueDate < now;

    return {
      ...invoice,
      customer_name:
        invoice.customer?.client_type === "company"
          ? invoice.customer.company_name
          : `${invoice.customer?.first_name || ""} ${invoice.customer?.last_name || ""}`.trim(),
      items_count: invoice.invoice_items?.length || 0,
      status_display: this.getStatusDisplay(invoice.status),
      overdue: isOverdue,
      days_overdue: isOverdue ? Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)) : 0,
    };
  }

  /**
   * Private method to prepare item data for database insertion
   */
  _prepareItemData(item) {
    const unitPrice = parseFloat(item.unit_price) || 0;
    const quantity = parseFloat(item.quantity) || 1;
    const totalPrice = unitPrice * quantity;

    return {
      service_type_id: item.service_type_id || null,
      description: item.description?.trim() || "",
      service_date: item.service_date || null,
      duration_hours: parseFloat(item.duration_hours) || null,
      unit_price: unitPrice,
      quantity: quantity,
      total_price: totalPrice,
    };
  }

  /**
   * Private method to calculate invoice totals
   */
  _calculateTotals(items, taxRate) {
    const subtotal = items.reduce((sum, item) => {
      const unitPrice = parseFloat(item.unit_price) || 0;
      const quantity = parseFloat(item.quantity) || 1;
      return sum + unitPrice * quantity;
    }, 0);

    const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  /**
   * Private method to recalculate invoice totals after item changes
   */
  async _recalculateInvoiceTotals(invoiceId) {
    try {
      // Get current invoice and items
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select("tax_rate")
        .eq("id", invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      const { data: items, error: itemsError } = await supabase
        .from("invoice_items")
        .select("unit_price, quantity")
        .eq("invoice_id", invoiceId);

      if (itemsError) throw itemsError;

      // Calculate new totals
      const totals = this._calculateTotals(items, invoice.tax_rate);

      // Update invoice
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          subtotal: totals.subtotal,
          tax_amount: totals.taxAmount,
          total_amount: totals.totalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error recalculating invoice totals:", error);
      throw error;
    }
  }

  /**
   * Private method to calculate due date (30 days from invoice date)
   */
  _calculateDueDate(invoiceDate) {
    if (!invoiceDate) return null;

    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  }

  /**
   * Validate invoice data
   */
  validateInvoiceData(data) {
    const errors = [];

    if (!data.customer_id || typeof data.customer_id !== "string") {
      errors.push("Valid customer is required");
    }

    if (!data.invoice_date) {
      errors.push("Invoice date is required");
    }

    if (
      data.due_date &&
      data.invoice_date &&
      new Date(data.due_date) < new Date(data.invoice_date)
    ) {
      errors.push("Due date must be after invoice date");
    }

    if (data.tax_rate !== undefined) {
      const taxRate = parseFloat(data.tax_rate);
      if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        errors.push("Tax rate must be between 0 and 100");
      }
    }

    if (data.status && !["draft", "sent", "paid", "overdue", "cancelled"].includes(data.status)) {
      errors.push("Invalid status");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate invoice item data
   */
  validateInvoiceItemData(data) {
    const errors = [];

    if (!data.description || typeof data.description !== "string" || !data.description.trim()) {
      errors.push("Description is required");
    }

    const unitPrice = parseFloat(data.unit_price);
    if (isNaN(unitPrice) || unitPrice < 0) {
      errors.push("Valid unit price is required");
    }

    const quantity = parseFloat(data.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push("Quantity must be greater than 0");
    }

    if (data.duration_hours !== undefined && data.duration_hours !== null) {
      const duration = parseFloat(data.duration_hours);
      if (isNaN(duration) || duration < 0) {
        errors.push("Duration must be 0 or greater");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get status display text
   */
  getStatusDisplay(status) {
    const statusMap = {
      draft: "Draft",
      sent: "Sent",
      paid: "Paid",
      overdue: "Overdue",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  }

  /**
   * Get status severity for UI components
   */
  getStatusSeverity(status, isOverdue = false) {
    if (isOverdue) return "danger";

    const severityMap = {
      draft: "secondary",
      sent: "warning",
      paid: "success",
      overdue: "danger",
      cancelled: "secondary",
    };
    return severityMap[status] || "secondary";
  }
}
