<template>
  <div class="p-4">
    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-6"
    >
      <!-- Invoice Header Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <Select
              id="customer_id"
              name="customer_id"
              :options="customers"
              optionLabel="label"
              optionValue="id"
              filter
              fluid
              :invalid="$form.customer_id?.invalid"
              :loading="customersLoading"
            />
            <label for="customer_id">Customer *</label>
          </FloatLabel>
          <Message v-if="$form.customer_id?.invalid" severity="error" size="small">
            {{ $form.customer_id.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <DatePicker
              id="invoice_date"
              name="invoice_date"
              fluid
              :invalid="$form.invoice_date?.invalid"
              dateFormat="dd/mm/yy"
            />
            <label for="invoice_date">Invoice Date *</label>
          </FloatLabel>
          <Message v-if="$form.invoice_date?.invalid" severity="error" size="small">
            {{ $form.invoice_date.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <DatePicker
              id="due_date"
              name="due_date"
              fluid
              :invalid="$form.due_date?.invalid"
              dateFormat="dd/mm/yy"
            />
            <label for="due_date">Due Date</label>
          </FloatLabel>
          <Message v-if="$form.due_date?.invalid" severity="error" size="small">
            {{ $form.due_date.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <Select
              id="status"
              name="status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              fluid
              :invalid="$form.status?.invalid"
            />
            <label for="status">Status</label>
          </FloatLabel>
          <Message v-if="$form.status?.invalid" severity="error" size="small">
            {{ $form.status.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <InputNumber
              id="tax_rate"
              name="tax_rate"
              mode="decimal"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              suffix="%"
              showButtons
              fluid
              :invalid="$form.tax_rate?.invalid"
              @input="onTaxRateChange"
            />
            <label for="tax_rate">Tax Rate (%)</label>
          </FloatLabel>
          <Message v-if="$form.tax_rate?.invalid" severity="error" size="small">
            {{ $form.tax_rate.error?.message }}
          </Message>
        </div>
      </div>

      <!-- Invoice Items Section -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Invoice Items</h3>
          <Button type="button" icon="pi pi-plus" label="Add Item" size="small" @click="addItem" />
        </div>

        <!-- Items List -->
        <div v-if="invoiceItems.length > 0" class="space-y-4">
          <div
            v-for="(item, index) in invoiceItems"
            :key="index"
            class="border rounded p-4 bg-surface-50"
          >
            <!-- Service Type Selection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div class="md:col-span-2">
                <FloatLabel variant="on">
                  <Select
                    v-model="item.service_type_id"
                    :options="serviceTypes"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select Service Type"
                    filter
                    fluid
                    @change="onServiceTypeChange(index, $event)"
                  >
                    <template #value="slotProps">
                      <div v-if="slotProps.value" class="flex items-center">
                        <i class="pi pi-tag mr-2 text-sm"></i>
                        <div>{{ getServiceTypeName(slotProps.value) }}</div>
                      </div>
                      <span v-else>{{ slotProps.placeholder }}</span>
                    </template>

                    <template #option="slotProps">
                      <div class="flex items-center justify-between w-full">
                        <div class="flex items-center">
                          <i class="pi pi-tag mr-2 text-sm"></i>
                          <div>
                            <div class="font-medium">{{ slotProps.option.name }}</div>
                            <div class="text-xs text-muted-color">
                              €{{ slotProps.option.unit_price }}/{{
                                slotProps.option.pricing_type
                              }}
                              • {{ slotProps.option.category }}
                            </div>
                          </div>
                        </div>
                        <Tag
                          :value="slotProps.option.pricing_type"
                          :severity="getPricingTypeSeverity(slotProps.option.pricing_type)"
                          size="small"
                        />
                      </div>
                    </template>

                    <template #header>
                      <div class="font-medium p-3 border-b">Available Service Types</div>
                    </template>

                    <template #footer>
                      <div class="p-3 border-t">
                        <Button
                          label="Add New Service Type"
                          fluid
                          severity="secondary"
                          text
                          size="small"
                          icon="pi pi-plus"
                          @click="openAddServiceDialog"
                        />
                      </div>
                    </template>
                  </Select>
                  <label></label>
                </FloatLabel>
              </div>
            </div>

            <!-- Item Details -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              <div class="md:col-span-2">
                <FloatLabel variant="on">
                  <InputText v-model="item.description" fluid />
                  <label>Description *</label>
                </FloatLabel>
              </div>

              <div>
                <FloatLabel variant="on">
                  <InputNumber
                    v-model="item.quantity"
                    mode="decimal"
                    :minFractionDigits="0"
                    :maxFractionDigits="2"
                    :min="0.01"
                    fluid
                    @input="calculateItemTotal(index)"
                  />
                  <label>Quantity</label>
                </FloatLabel>
              </div>

              <div>
                <FloatLabel variant="on">
                  <InputNumber
                    v-model="item.unit_price"
                    mode="currency"
                    currency="EUR"
                    locale="de-DE"
                    fluid
                    @input="calculateItemTotal(index)"
                  />
                  <label>Unit Price</label>
                </FloatLabel>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <FloatLabel variant="on">
                  <InputNumber
                    v-model="item.duration_hours"
                    mode="decimal"
                    :minFractionDigits="1"
                    :maxFractionDigits="2"
                    :min="0"
                    suffix="h"
                    fluid
                  />
                  <label>Duration</label>
                </FloatLabel>
              </div>

              <div>
                <FloatLabel variant="on">
                  <DatePicker v-model="item.service_date" fluid dateFormat="dd/mm/yy" />
                  <label>Service Date</label>
                </FloatLabel>
              </div>

              <div class="flex items-center">
                <div class="text-right flex-1">
                  <div class="text-sm text-muted-color">Total</div>
                  <div class="font-bold text-lg">€{{ (item.total_price || 0).toFixed(2) }}</div>
                </div>
              </div>

              <div class="flex justify-end items-center">
                <Button
                  type="button"
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  @click="removeItem(index)"
                  v-tooltip.top="'Remove Item'"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8 border-2 border-dashed border-surface-300 rounded">
          <i class="pi pi-plus text-2xl text-muted-color mb-2"></i>
          <p class="text-muted-color">No items added yet. Click "Add Item" to get started.</p>
        </div>
      </div>

      <!-- Invoice Totals -->
      <div v-if="invoiceItems.length > 0" class="border-t pt-4">
        <div class="flex justify-end">
          <div class="w-80 space-y-2">
            <div class="flex justify-between">
              <span>Subtotal:</span>
              <span>€{{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>VAT ({{ currentTaxRate }}%):</span>
              <span>€{{ taxAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>€{{ totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes and Payment Terms -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <Textarea id="notes" name="notes" rows="3" fluid :invalid="$form.notes?.invalid" />
            <label for="notes">Notes</label>
          </FloatLabel>
          <Message v-if="$form.notes?.invalid" severity="error" size="small">
            {{ $form.notes.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <Textarea
              id="payment_terms"
              name="payment_terms"
              rows="3"
              fluid
              :invalid="$form.payment_terms?.invalid"
            />
            <label for="payment_terms">Payment Terms</label>
          </FloatLabel>
          <Message v-if="$form.payment_terms?.invalid" severity="error" size="small">
            {{ $form.payment_terms.error?.message }}
          </Message>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          @click="$emit('cancel')"
        />
        <Button
          type="submit"
          :label="isEditing ? 'Update Invoice' : 'Create Invoice'"
          :loading="loading"
          icon="pi pi-check"
        />
      </div>
    </Form>

    <!-- Add Service Type Dialog -->
    <Dialog
      v-model:visible="showAddServiceDialog"
      header="Add New Service Type"
      modal
      class="w-full max-w-md"
      :closable="true"
    >
      <ServiceTypeForm @save="onServiceTypeSaved" @cancel="closeAddServiceDialog" />
    </Dialog>
  </div>
</template>

<script>
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { InvoicesService } from "@/services/InvoicesService.js";
import { ServiceTypesService } from "@/services/ServiceTypesService.js";
import ServiceTypeForm from "@/components/ServiceTypeForm.vue";

export default {
  name: "InvoiceForm",

  components: {
    ServiceTypeForm,
  },

  props: {
    invoice: {
      type: Object,
      default: null,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["save", "cancel"],

  data() {
    return {
      loading: false,
      customersLoading: false,
      serviceTypesLoading: false,
      showAddServiceDialog: false,

      customers: [],
      serviceTypes: [],
      invoiceItems: [],
      currentTaxRate: 21.0,

      statusOptions: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Paid", value: "paid" },
        { label: "Cancelled", value: "cancelled" },
      ],

      // Service instances
      invoicesService: new InvoicesService(),
      serviceTypesService: new ServiceTypesService(),
    };
  },

  computed: {
    initialValues() {
      const now = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const baseValues = {
        customer_id: "",
        invoice_date: now,
        due_date: dueDate,
        status: "draft",
        tax_rate: 21.0,
        notes: "",
        payment_terms: "Payment due within 30 days",
      };

      if (this.invoice) {
        Object.keys(baseValues).forEach((key) => {
          const value = this.invoice[key];
          if (value !== undefined && value !== null) {
            if (key === "invoice_date" || key === "due_date") {
              baseValues[key] = value ? new Date(value) : null;
            } else {
              baseValues[key] = value;
            }
          }
        });

        this.currentTaxRate = this.invoice.tax_rate || 21.0;

        if (this.invoice.invoice_items) {
          this.invoiceItems = this.invoice.invoice_items.map((item) => ({
            ...item,
            service_date: item.service_date ? new Date(item.service_date) : null,
          }));
        }
      }

      return baseValues;
    },

    resolver() {
      return zodResolver(
        z
          .object({
            customer_id: z.string().min(1, { message: "Customer is required" }),
            invoice_date: z.date({ required_error: "Invoice date is required" }),
            due_date: z.date().optional(),
            status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
            tax_rate: z.number().min(0).max(100).optional(),
            notes: z.string().optional(),
            payment_terms: z.string().optional(),
          })
          .refine(
            (data) => {
              if (data.due_date && data.invoice_date && data.due_date < data.invoice_date) {
                return false;
              }
              return true;
            },
            {
              message: "Due date must be after invoice date",
              path: ["due_date"],
            }
          )
      );
    },

    subtotal() {
      return this.invoiceItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    },

    taxAmount() {
      return this.subtotal * (this.currentTaxRate / 100);
    },

    totalAmount() {
      return this.subtotal + this.taxAmount;
    },
  },

  async created() {
    await Promise.all([this.loadCustomers(), this.loadServiceTypes()]);
  },

  methods: {
    async loadCustomers() {
      this.customersLoading = true;
      try {
        this.customers = await this.invoicesService.getCustomersForInvoice();
      } catch (error) {
        console.error("Error loading customers:", error);
        this.showToast("error", "Error", "Failed to load customers");
      } finally {
        this.customersLoading = false;
      }
    },

    async loadServiceTypes() {
      this.serviceTypesLoading = true;
      try {
        this.serviceTypes = await this.serviceTypesService.getServiceTypes();
      } catch (error) {
        console.error("Error loading service types:", error);
        this.showToast("error", "Error", "Failed to load service types");
      } finally {
        this.serviceTypesLoading = false;
      }
    },

    addItem() {
      this.invoiceItems.push({
        service_type_id: null,
        description: "",
        service_date: null,
        duration_hours: 1.0,
        unit_price: 0,
        quantity: 1,
        total_price: 0,
      });
    },

    removeItem(index) {
      this.invoiceItems.splice(index, 1);
    },

    onServiceTypeChange(index, event) {
      const serviceType = this.serviceTypes.find((st) => st.id === event.value);
      if (serviceType) {
        this.invoiceItems[index].description = serviceType.name;
        this.invoiceItems[index].unit_price = serviceType.unit_price;
        this.invoiceItems[index].duration_hours = serviceType.default_duration_hours;
        this.calculateItemTotal(index);
      }
    },

    calculateItemTotal(index) {
      const item = this.invoiceItems[index];
      item.total_price = (item.unit_price || 0) * (item.quantity || 1);
    },

    onTaxRateChange(value) {
      this.currentTaxRate = value || 21.0;
    },

    openAddServiceDialog() {
      this.showAddServiceDialog = true;
    },

    closeAddServiceDialog() {
      this.showAddServiceDialog = false;
    },

    async onServiceTypeSaved(newServiceType) {
      this.serviceTypes.push(newServiceType);
      this.serviceTypes.sort((a, b) => a.name.localeCompare(b.name));
      this.showToast("success", "Success", "Service type added successfully");
      this.closeAddServiceDialog();
    },

    getServiceTypeName(serviceTypeId) {
      const serviceType = this.serviceTypes.find((st) => st.id === serviceTypeId);
      return serviceType ? serviceType.name : "";
    },

    getPricingTypeSeverity(pricingType) {
      const severityMap = {
        hourly: "info",
        fixed: "success",
        monthly: "warning",
      };
      return severityMap[pricingType] || "secondary";
    },

    prepareInvoiceData(formValues) {
      const invoiceData = {
        ...formValues,
        invoice_date: formValues.invoice_date
          ? formValues.invoice_date.toISOString().split("T")[0]
          : null,
        due_date: formValues.due_date ? formValues.due_date.toISOString().split("T")[0] : null,
        tax_rate: this.currentTaxRate,
      };

      const itemsData = this.invoiceItems.map((item) => ({
        ...item,
        service_date: item.service_date ? item.service_date.toISOString().split("T")[0] : null,
      }));

      return { invoice: invoiceData, items: itemsData };
    },

    validateItems() {
      if (this.invoiceItems.length === 0) {
        this.showToast("warn", "Warning", "Please add at least one item to the invoice");
        return false;
      }

      const itemErrors = [];
      this.invoiceItems.forEach((item, index) => {
        if (!item.description || item.description.trim() === "") {
          itemErrors.push(`Item ${index + 1}: Description is required`);
        }
        if (!item.unit_price || item.unit_price <= 0) {
          itemErrors.push(`Item ${index + 1}: Valid unit price is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          itemErrors.push(`Item ${index + 1}: Valid quantity is required`);
        }
      });

      if (itemErrors.length > 0) {
        this.showToast("error", "Validation Error", itemErrors.join(", "));
        return false;
      }

      return true;
    },

    async onFormSubmit({ valid, values }) {
      if (!valid || !this.validateItems()) {
        return;
      }

      this.loading = true;

      try {
        this.currentTaxRate = values.tax_rate || 21.0;
        const preparedData = this.prepareInvoiceData(values);
        this.$emit("save", preparedData);
      } catch (error) {
        console.error("Form submission error:", error);
        this.showToast("error", "Error", "An error occurred while saving the invoice");
      } finally {
        this.loading = false;
      }
    },

    showToast(severity, summary, detail) {
      this.$toast.add({ severity, summary, detail, life: 5000 });
    },
  },
};
</script>
