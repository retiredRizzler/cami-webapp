<template>
  <div class="p-3 sm:p-6 max-w-7xl mx-auto">
    <!-- Toast for notifications -->
    <Toast />

    <!-- Page Header -->
    <div class="mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-primary mb-2">Invoice Management</h1>
      <p class="text-muted-color text-sm sm:text-base">Manage invoices for your students and corporate clients</p>
    </div>

    <!-- Stats Cards - Responsive Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-primary">{{ stats.total_invoices || 0 }}</div>
            <div class="text-xs sm:text-sm text-muted-color">Total Invoices</div>
          </div>
          <i class="pi pi-receipt text-lg sm:text-xl text-primary"></i>
        </div>
      </div>

      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-green-600">
              € {{ (stats.total_revenue || 0).toFixed(0) }}
            </div>
            <div class="text-xs sm:text-sm text-muted-color">Total Revenue</div>
          </div>
          <i class="pi pi-euro text-lg sm:text-xl text-green-600"></i>
        </div>
      </div>

      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-orange-500">
              € {{ (stats.pending_amount || 0).toFixed(0) }}
            </div>
            <div class="text-xs sm:text-sm text-muted-color">Pending Amount</div>
          </div>
          <i class="pi pi-clock text-lg sm:text-xl text-orange-500"></i>
        </div>
      </div>

      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-red-500">{{ stats.overdue_invoices || 0 }}</div>
            <div class="text-xs sm:text-sm text-muted-color">Overdue Invoices</div>
          </div>
          <i class="pi pi-exclamation-triangle text-lg sm:text-xl text-red-500"></i>
        </div>
      </div>
    </div>

    <!-- Action Bar - Mobile Responsive -->
    <div class="mb-4 sm:mb-6">
      <!-- Mobile Layout -->
      <div class="flex flex-col gap-3 sm:hidden">
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Create Invoice"
            @click="openCreateDialog"
            severity="primary"
            class="flex-1"
            size="small"
          />
          <Button
            icon="pi pi-refresh"
            @click="loadInvoices"
            severity="secondary"
            outlined
            size="small"
          />
        </div>

        <!-- Mobile Search -->
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="globalFilter"
            placeholder="Search invoices..."
            @input="onGlobalFilter"
            fluid
            size="small"
            class="text-base"
          />
        </IconField>

        <!-- Mobile Filter -->
        <div class="flex gap-2">
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Statuses"
            @change="onStatusFilterChange"
            fluid
            size="small"
            class="text-base"
          />
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden sm:flex justify-between items-center">
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Create Invoice"
            @click="openCreateDialog"
            severity="primary"
          />
          <Button
            icon="pi pi-refresh"
            label="Refresh"
            @click="loadInvoices"
            severity="secondary"
            outlined
          />
        </div>

        <!-- Desktop Filters -->
        <div class="flex gap-2 items-center">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="globalFilter"
              placeholder="Search invoices..."
              @input="onGlobalFilter"
              class="w-64"
            />
          </IconField>
          <label class="text-sm font-medium">Filter by Status:</label>
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Statuses"
            @change="onStatusFilterChange"
            class="w-40"
          />
        </div>
        <Button
            :label="viewMode === 'cards' ? 'Table' : 'Cards'"
            :icon="viewMode === 'cards' ? 'pi pi-table' : 'pi pi-th-large'"
            @click="toggleViewMode"
            severity="secondary"
            outlined
            size="small"
          />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <ProgressSpinner />
    </div>

    <!-- Mobile Cards View -->
    <div v-else-if="viewMode === 'cards' || isMobile" class="space-y-3">
      <div
        v-for="invoice in filteredInvoices"
        :key="invoice.id"
        class="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden"
      >
        <!-- Card Header -->
        <div class="p-4 border-b border-surface-100">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                :label="getInitials(invoice.customer_name)"
                shape="circle"
                size="large"
                :style="{ backgroundColor: getAvatarColor(invoice.customer_name) }"
                class="flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="font-semibold text-surface-900 truncate">{{ invoice.invoice_number }}</div>
                <div class="text-sm text-muted-color truncate">{{ invoice.customer_name }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <Tag
                    :value="invoice.status_display"
                    :severity="getStatusSeverity(invoice.status, invoice.overdue)"
                    size="small"
                  />
                  <span v-if="invoice.overdue && invoice.days_overdue > 0" class="text-xs text-red-500">
                    {{ invoice.days_overdue }}d overdue
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <div class="font-bold text-lg text-surface-900">€{{ (invoice.total_amount || 0).toFixed(2) }}</div>
              <Button
                icon="pi pi-ellipsis-v"
                @click="toggleInvoiceActions($event, invoice)"
                variant="text"
                size="small"
                class="w-8 h-8"
              />
            </div>
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-4 space-y-3">
          <!-- Dates and Info -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-muted-color">Invoice Date</div>
              <div class="font-medium">{{ formatDate(invoice.invoice_date) }}</div>
            </div>
            <div>
              <div class="text-muted-color">Due Date</div>
              <div class="font-medium">{{ formatDate(invoice.due_date) }}</div>
            </div>
          </div>

          <!-- Contact Info -->
          <div v-if="invoice.customer?.email" class="flex items-center gap-2 text-sm">
            <i class="pi pi-envelope text-muted-color w-4"></i>
            <span class="truncate">{{ invoice.customer.email }}</span>
            <Button
              icon="pi pi-external-link"
              @click="openEmail(invoice.customer.email)"
              variant="text"
              size="small"
              class="w-6 h-6 ml-auto flex-shrink-0"
            />
          </div>

          <!-- Invoice Details -->
          <div class="grid grid-cols-3 gap-4 pt-3 border-t border-surface-100 text-sm">
            <div class="text-center">
              <div class="text-lg font-semibold text-primary">{{ invoice.items_count || 0 }}</div>
              <div class="text-xs text-muted-color">Items</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-emerald-600">€{{ (invoice.subtotal || 0).toFixed(0) }}</div>
              <div class="text-xs text-muted-color">Subtotal</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-orange-600">€{{ (invoice.tax_amount || 0).toFixed(0) }}</div>
              <div class="text-xs text-muted-color">VAT</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State for Cards -->
      <div v-if="filteredInvoices.length === 0" class="text-center py-12">
        <div class="max-w-sm mx-auto">
          <i class="pi pi-receipt text-6xl text-muted-color mb-4 block"></i>
          <h3 class="text-lg font-medium mb-2">No invoices found</h3>
          <p class="text-muted-color mb-6 text-sm">
            {{ globalFilter ? 'Try adjusting your search terms' : 'Start by creating your first invoice' }}
          </p>
          <Button
            icon="pi pi-plus"
            label="Create Invoice"
            @click="openCreateDialog"
            class="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>

    <!-- Desktop DataTable View -->
    <div v-else-if="!isMobile" class="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <DataTable
        v-model:expandedRows="expandedRows"
        :value="filteredInvoices"
        dataKey="id"
        :loading="loading"
        @rowExpand="onRowExpand"
        @rowCollapse="onRowCollapse"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 60rem"
        class="border-0"
        :pt="{
          header: { class: 'border-0 bg-surface-50' },
          table: { class: 'border-0' },
          bodyRow: { class: 'hover:bg-surface-50 transition-colors' }
        }"
      >
        <template #header>
          <div class="flex flex-wrap justify-between gap-2 p-4">
            <div class="flex gap-2">
              <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" size="small" />
              <Button
                text
                icon="pi pi-minus"
                label="Collapse All"
                @click="collapseAll"
                size="small"
              />
            </div>
          </div>
        </template>

        <!-- Expandable Column -->
        <Column expander style="width: 3rem" />

        <!-- Invoice Number -->
        <Column field="invoice_number" header="Invoice #" sortable style="width: 10rem">
          <template #body="{ data }">
            <div class="font-medium text-primary">{{ data.invoice_number }}</div>
          </template>
        </Column>

        <!-- Customer -->
        <Column field="customer_name" header="Customer" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar
                :label="getInitials(data.customer_name)"
                shape="circle"
                size="small"
                :style="{ backgroundColor: getAvatarColor(data.customer_name) }"
              />
              <div>
                <div class="font-medium">{{ data.customer_name }}</div>
                <div class="text-sm text-muted-color">{{ data.customer?.email }}</div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Date -->
        <Column field="invoice_date" header="Date" sortable style="width: 8rem">
          <template #body="{ data }">
            <div class="text-sm">
              <div>{{ formatDate(data.invoice_date) }}</div>
              <div v-if="data.due_date" class="text-muted-color">
                Due: {{ formatDate(data.due_date) }}
              </div>
            </div>
          </template>
        </Column>

        <!-- Status -->
        <Column field="status" header="Status" sortable style="width: 8rem">
          <template #body="{ data }">
            <Tag
              :value="data.status_display"
              :severity="getStatusSeverity(data.status, data.overdue)"
            />
            <div v-if="data.overdue && data.days_overdue > 0" class="text-xs text-red-500 mt-1">
              {{ data.days_overdue }} days overdue
            </div>
          </template>
        </Column>

        <!-- Items -->
        <Column header="Items" style="width: 6rem">
          <template #body="{ data }">
            <div class="text-sm text-center">
              <i class="pi pi-list mr-1"></i>
              {{ data.items_count }}
            </div>
          </template>
        </Column>

        <!-- Amount -->
        <Column field="total_amount" header="Amount" sortable style="width: 8rem">
          <template #body="{ data }">
            <div class="font-medium text-right">€{{ (data.total_amount || 0).toFixed(2) }}</div>
            <div v-if="data.tax_amount > 0" class="text-xs text-muted-color text-right">
              +€{{ data.tax_amount.toFixed(2) }} VAT
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" style="width: 12rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-eye"
                size="small"
                severity="info"
                text
                @click="viewInvoice(data)"
                v-tooltip.top="'View'"
              />
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="secondary"
                text
                @click="openEditDialog(data)"
                v-tooltip.top="'Edit'"
              />
              <SplitButton
                :model="getActionItems(data)"
                size="small"
                severity="success"
                text
                icon="pi pi-check"
                @click="markAsPaid(data)"
                v-tooltip.top="'Mark as Paid'"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                @click="confirmDelete(data)"
                v-tooltip.top="'Delete'"
              />
            </div>
          </template>
        </Column>

        <!-- Row Expansion Template -->
        <template #expansion="{ data }">
          <div class="p-4 bg-surface-50">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Invoice Details -->
              <div>
                <h6 class="font-medium mb-3 text-primary">Invoice Details</h6>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-color">Customer Type:</span>
                    <Tag
                      :value="data.customer?.client_type === 'individual' ? 'Student' : 'Company'"
                      :severity="data.customer?.client_type === 'individual' ? 'secondary' : 'info'"
                      size="small"
                    />
                  </div>
                  <div v-if="data.customer?.phone" class="flex justify-between">
                    <span class="text-muted-color">Phone:</span>
                    <span>{{ data.customer.phone }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-color">Subtotal:</span>
                    <span>€{{ (data.subtotal || 0).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-color">VAT ({{ data.tax_rate }}%):</span>
                    <span>€{{ (data.tax_amount || 0).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>€{{ (data.total_amount || 0).toFixed(2) }}</span>
                  </div>
                  <div v-if="data.notes" class="flex justify-between">
                    <span class="text-muted-color">Notes:</span>
                    <span class="text-right max-w-xs">{{ data.notes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-color">Created:</span>
                    <span>{{ formatDate(data.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Invoice Items -->
              <div>
                <h6 class="font-medium mb-3 text-primary">Invoice Items</h6>
                <div v-if="data.invoice_items && data.invoice_items.length > 0" class="space-y-3">
                  <div
                    v-for="item in data.invoice_items"
                    :key="item.id"
                    class="border rounded p-3 bg-surface-0"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <div class="font-medium">{{ item.description }}</div>
                        <div v-if="item.service_type" class="text-xs text-muted-color">
                          {{ item.service_type.name }}
                        </div>
                        <div v-if="item.service_date" class="text-xs text-muted-color">
                          Date: {{ formatDate(item.service_date) }}
                        </div>
                        <div v-if="item.duration_hours" class="text-xs text-muted-color">
                          Duration: {{ item.duration_hours }}h
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-medium">€{{ item.total_price.toFixed(2) }}</div>
                        <div class="text-xs text-muted-color">
                          {{ item.quantity }}x €{{ item.unit_price.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted-color text-sm">No items added yet</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <template #empty>
          <div class="text-center py-8">
            <i class="pi pi-receipt text-4xl text-muted-color mb-4"></i>
            <h3 class="text-lg font-medium mb-2">No invoices yet</h3>
            <p class="text-muted-color mb-4">Start by creating your first invoice</p>
            <Button icon="pi pi-plus" label="Create Invoice" @click="openCreateDialog" />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Invoice Form Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit Invoice' : 'Create New Invoice'"
      modal
      :class="isMobile ? 'w-full h-full m-0' : 'w-full max-w-4xl'"
      :style="isMobile ? 'height: 100vh; max-height: 100vh' : ''"
      :closable="true"
      :pt="{
        root: isMobile ? 'fixed inset-0' : '',
        content: isMobile ? 'h-full overflow-y-auto' : ''
      }"
    >
      <InvoiceForm
        :invoice="selectedInvoice"
        :is-editing="isEditing"
        @save="handleSave"
        @cancel="closeDialog"
      />
    </Dialog>

    <!-- Invoice View Dialog -->
    <Dialog
      v-model:visible="showViewDialog"
      header="Invoice Details"
      modal
      :class="isMobile ? 'w-full h-full m-0' : 'w-full max-w-4xl'"
      :style="isMobile ? 'height: 100vh; max-height: 100vh' : ''"
      :closable="true"
    >
      <InvoiceView
        v-if="viewingInvoice"
        :invoice="viewingInvoice"
        @edit="openEditFromView"
        @close="closeViewDialog"
      />
    </Dialog>

    <!-- Invoice Details Modal (Mobile) -->
    <Dialog
      v-model:visible="showDetailsDialog"
      header="Invoice Details"
      modal
      :class="isMobile ? 'w-full h-full m-0' : 'w-full max-w-2xl'"
      :style="isMobile ? 'height: 100vh; max-height: 100vh' : ''"
      :closable="true"
    >
      <div v-if="selectedInvoice" class="space-y-6">
        <!-- Invoice Header -->
        <div class="text-center">
          <h3 class="text-xl font-semibold">{{ selectedInvoice.invoice_number }}</h3>
          <p class="text-muted-color">{{ selectedInvoice.customer_name }}</p>
          <Tag
            :value="selectedInvoice.status_display"
            :severity="getStatusSeverity(selectedInvoice.status, selectedInvoice.overdue)"
            class="mt-2"
          />
        </div>

        <!-- Invoice Summary -->
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-surface-50 rounded-lg">
            <div class="text-2xl font-bold text-primary">€{{ (selectedInvoice.total_amount || 0).toFixed(2) }}</div>
            <div class="text-sm text-muted-color">Total Amount</div>
          </div>
          <div class="text-center p-4 bg-surface-50 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">{{ selectedInvoice.items_count || 0 }}</div>
            <div class="text-sm text-muted-color">Items</div>
          </div>
          <div class="text-center p-4 bg-surface-50 rounded-lg">
            <div class="text-2xl font-bold text-emerald-600">€{{ (selectedInvoice.tax_amount || 0).toFixed(2) }}</div>
            <div class="text-sm text-muted-color">VAT</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <Button
            label="View Details"
            icon="pi pi-eye"
            @click="viewFromDetails"
            severity="info"
            class="flex-1"
          />
          <Button
            label="Edit Invoice"
            icon="pi pi-pencil"
            @click="editFromDetails"
            severity="primary"
            class="flex-1"
          />
        </div>
      </div>
    </Dialog>

    <!-- Invoice Actions Menu -->
    <OverlayPanel ref="invoiceActionsPanel" class="w-48">
      <div class="space-y-2" v-if="selectedInvoice">
        <Button
          label="View Details"
          icon="pi pi-eye"
          @click="viewInvoice(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Button
          label="Edit Invoice"
          icon="pi pi-pencil"
          @click="openEditDialog(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Button
          label="Generate PDF"
          icon="pi pi-file-pdf"
          @click="downloadHTMLInvoicePDF(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Divider />
        <Button
          label="Mark as Paid"
          icon="pi pi-check"
          @click="markAsPaid(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
          :disabled="selectedInvoice.status === 'paid'"
        />
        <Button
          label="Send Email"
          icon="pi pi-envelope"
          @click="sendByEmail(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Divider />
        <Button
          label="Delete Invoice"
          icon="pi pi-trash"
          @click="confirmDelete(selectedInvoice)"
          variant="text"
          severity="danger"
          class="w-full justify-start"
          size="small"
        />
      </div>
    </OverlayPanel>
  </div>
</template>

<script>
import { InvoicesService } from "@/services/InvoicesService.js";
import InvoiceForm from "@/components/InvoiceForm.vue";

export default {
  name: "InvoicesView",
  components: {
    InvoiceForm,
    // InvoiceView
  },

  data() {
    return {
      invoices: [],
      filteredInvoices: [],
      expandedRows: {},
      loading: false,
      statsLoading: false,
      globalFilter: "",
      statusFilter: null,

      // Mobile-specific state
      viewMode: 'cards', // 'cards' or 'table'
      showDetailsDialog: false,
      isMobile: false,

      // Stats
      stats: {
        total_invoices: 0,
        total_revenue: 0,
        pending_amount: 0,
        overdue_invoices: 0,
      },

      // Dialog state
      showDialog: false,
      showViewDialog: false,
      selectedInvoice: null,
      viewingInvoice: null,
      isEditing: false,

      // Filter options
      statusOptions: [
        { label: "All Statuses", value: null },
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Paid", value: "paid" },
        { label: "Overdue", value: "overdue" },
        { label: "Cancelled", value: "cancelled" },
      ],

      // Service instance
      invoicesService: new InvoicesService(),
    };
  },

  async created() {
    await Promise.all([this.loadInvoices(), this.loadStats()]);
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile)
  },

  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768
      if (this.isMobile) {
        this.viewMode = 'cards'
      }
    },

    toggleViewMode() {
      this.viewMode = this.viewMode === 'cards' ? 'table' : 'cards'
    },

    async loadInvoices() {
      this.loading = true;
      try {
        this.invoices = await this.invoicesService.getInvoices();
        this.applyFilters();
      } catch (error) {
        console.error("Error loading invoices:", error);
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load invoices",
          life: 5000,
        });
      } finally {
        this.loading = false;
      }
    },

    async loadStats() {
      this.statsLoading = true;
      try {
        this.stats = await this.invoicesService.getInvoiceStats();
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        this.statsLoading = false;
      }
    },

    applyFilters() {
      let filtered = [...this.invoices];

      // Apply status filter
      if (this.statusFilter) {
        if (this.statusFilter === "overdue") {
          filtered = filtered.filter((invoice) => invoice.overdue);
        } else {
          filtered = filtered.filter((invoice) => invoice.status === this.statusFilter);
        }
      }

      // Apply global filter
      if (this.globalFilter) {
        const searchTerm = this.globalFilter.toLowerCase();
        filtered = filtered.filter(
          (invoice) =>
            invoice.invoice_number.toLowerCase().includes(searchTerm) ||
            invoice.customer_name.toLowerCase().includes(searchTerm) ||
            (invoice.customer?.email || "").toLowerCase().includes(searchTerm) ||
            (invoice.notes || "").toLowerCase().includes(searchTerm)
        );
      }

      this.filteredInvoices = filtered;
    },

    onStatusFilterChange() {
      this.applyFilters();
    },

    onGlobalFilter() {
      this.applyFilters();
    },

    openCreateDialog() {
      this.selectedInvoice = null;
      this.isEditing = false;
      this.showDialog = true;
    },

    openEditDialog(invoice) {
      this.selectedInvoice = { ...invoice };
      this.isEditing = true;
      this.showDialog = true;
      this.hideAllPanels();
    },

    openEditFromView() {
      this.closeViewDialog();
      this.openEditDialog(this.viewingInvoice);
    },

    closeDialog() {
      this.showDialog = false;
      this.selectedInvoice = null;
      this.isEditing = false;
    },

    async viewInvoice(invoice) {
      try {
        this.viewingInvoice = await this.invoicesService.getInvoice(invoice.id);
        this.showViewDialog = true;
        this.hideAllPanels();
      } catch (error) {
        console.error("Error loading invoice details:", error);
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load invoice details",
          life: 5000,
        });
      }
    },

    closeViewDialog() {
      this.showViewDialog = false;
      this.viewingInvoice = null;
    },

    showInvoiceDetails(invoice) {
      this.selectedInvoice = invoice;
      this.showDetailsDialog = true;
      this.hideAllPanels();
    },

    editFromDetails() {
      this.showDetailsDialog = false;
      this.openEditDialog(this.selectedInvoice);
    },

    viewFromDetails() {
      this.showDetailsDialog = false;
      this.viewInvoice(this.selectedInvoice);
    },

    toggleInvoiceActions(event, invoice) {
      this.selectedInvoice = invoice;
      this.$refs.invoiceActionsPanel.toggle(event);
    },

    hideAllPanels() {
      if (this.$refs.invoiceActionsPanel) {
        this.$refs.invoiceActionsPanel.hide();
      }
    },

    async handleSave(formData) {
      try {
        const { invoice, items } = formData;

        if (this.isEditing) {
          await this.invoicesService.updateInvoiceWithItems(
            this.selectedInvoice.id,
            invoice,
            items
          );
          this.$toast.add({
            severity: "success",
            summary: "Success",
            detail: "Invoice updated successfully",
            life: 3000,
          });
        } else {
          await this.invoicesService.createInvoiceWithItems(invoice, items);
          this.$toast.add({
            severity: "success",
            summary: "Success",
            detail: "Invoice created successfully",
            life: 3000,
          });
        }

        await Promise.all([this.loadInvoices(), this.loadStats()]);
        this.closeDialog();
      } catch (error) {
        console.error("Error saving invoice:", error);
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: this.isEditing ? "Failed to update invoice" : "Failed to create invoice",
          life: 5000,
        });
      }
    },

    confirmDelete(invoice) {
      this.hideAllPanels();
      this.$confirm.require({
        message: `Are you sure you want to delete invoice ${invoice.invoice_number}? This action cannot be undone and will permanently remove all associated data.`,
        header: "Delete Invoice",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
          label: "Cancel",
          severity: "secondary",
          outlined: true,
        },
        acceptProps: {
          label: "Delete",
          severity: "danger",
        },
        accept: () => {
          this.deleteInvoice(invoice.id, invoice.invoice_number);
        },
      });
    },

    async deleteInvoice(invoiceId, invoiceNumber) {
      try {
        await this.invoicesService.deleteInvoice(invoiceId);
        this.$toast.add({
          severity: "success",
          summary: "Invoice Deleted",
          detail: `Invoice ${invoiceNumber} has been successfully deleted`,
          life: 3000,
        });
        await Promise.all([this.loadInvoices(), this.loadStats()]);
      } catch (error) {
        console.error("Error deleting invoice:", error);
        this.$toast.add({
          severity: "error",
          summary: "Delete Failed",
          detail: "Failed to delete invoice. Please try again.",
          life: 5000,
        });
      }
    },

    async markAsPaid(invoice) {
      if (invoice.status === "paid") return;

      try {
        await this.invoicesService.updateInvoiceStatus(invoice.id, "paid");
        this.$toast.add({
          severity: "success",
          summary: "Status Updated",
          detail: `Invoice ${invoice.invoice_number} marked as paid`,
          life: 3000,
        });
        await Promise.all([this.loadInvoices(), this.loadStats()]);
        this.hideAllPanels();
      } catch (error) {
        console.error("Error updating invoice status:", error);
        this.$toast.add({
          severity: "error",
          summary: "Update Failed",
          detail: "Failed to update invoice status. Please try again.",
          life: 5000,
        });
      }
    },

    getActionItems(invoice) {
      const items = [];

      if (invoice.status === "draft") {
        items.push({
          label: "Mark as Sent",
          icon: "pi pi-send",
          command: () => this.updateStatus(invoice.id, "sent"),
        });
      }

      if (invoice.status === "sent") {
        items.push({
          label: "Mark as Paid",
          icon: "pi pi-check",
          command: () => this.updateStatus(invoice.id, "paid"),
        });
      }

      if (invoice.status !== "cancelled") {
        items.push({
          label: "Cancel Invoice",
          icon: "pi pi-times",
          command: () => this.updateStatus(invoice.id, "cancelled"),
        });
      }

      items.push({
        separator: true,
      });

      items.push({
        label: 'Generate PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.downloadHTMLInvoicePDF(invoice),
      })

      items.push({
        label: "Send by Email",
        icon: "pi pi-envelope",
        command: () => this.sendByEmail(invoice),
      });

      return items;
    },

    async updateStatus(invoiceId, newStatus) {
      try {
        await this.invoicesService.updateInvoiceStatus(invoiceId, newStatus);
        this.$toast.add({
          severity: "success",
          summary: "Status Updated",
          detail: `Invoice status updated to ${newStatus}`,
          life: 3000,
        });
        await Promise.all([this.loadInvoices(), this.loadStats()]);
      } catch (error) {
        console.error("Error updating status:", error);
        this.$toast.add({
          severity: "error",
          summary: "Update Failed",
          detail: "Failed to update invoice status",
          life: 5000,
        });
      }
    },

    /**
     * Generate and download PDF for an invoice
     */
    async downloadInvoicePDF(invoice) {
      try {
        // Show loading state
        this.$toast.add({
          severity: "info",
          summary: "PDF Generation",
          detail: "Generating PDF, please wait...",
          life: 3000,
        });

        // Generate PDF
        await this.invoicesService.generateInvoicePDF(invoice.id);

        // Success message
        this.$toast.add({
          severity: "success",
          summary: "PDF Generated",
          detail: `Invoice ${invoice.invoice_number} downloaded successfully`,
          life: 3000,
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        this.$toast.add({
          severity: "error",
          summary: "PDF Generation Failed",
          detail: "Failed to generate PDF. Please try again.",
          life: 5000,
        });
      }
    },

    /**
     * Generate and download HTML-based PDF for an invoice
     */
    async downloadHTMLInvoicePDF(invoice) {
      try {
        // Show loading state
        this.$toast.add({
          severity: "info",
          summary: "PDF Generation",
          detail: "Generating professional PDF, please wait...",
          life: 3000,
        });

        // Generate PDF using HTML method
        const result = await this.invoicesService.generateHTMLInvoicePDF(
          invoice.id
        );

        // Success message
        this.$toast.add({
          severity: "success",
          summary: "PDF Generated",
          detail: `Invoice ${invoice.invoice_number} downloaded successfully (${result.method})`,
          life: 4000,
        });
        this.hideAllPanels();
      } catch (error) {
        console.error("Error generating HTML PDF:", error);
        this.$toast.add({
          severity: "error",
          summary: "PDF Generation Failed",
          detail: "Failed to generate PDF. Please try again.",
          life: 5000,
        });
      }
    },

    /**
     * Preview HTML invoice in new window
     */
    async previewHTMLInvoice(invoice) {
      try {
        this.$toast.add({
          severity: "info",
          summary: "Preview",
          detail: "Opening invoice preview...",
          life: 2000,
        });

        await this.invoicesService.previewHTMLInvoice(invoice.id);
      } catch (error) {
        console.error("Error previewing invoice:", error);
        this.$toast.add({
          severity: "error",
          summary: "Preview Failed",
          detail: "Failed to open preview. Please try again.",
          life: 5000,
        });
      }
    },

    // Communication methods
    openEmail(email) {
      if (email) {
        window.open(`mailto:${email}`, '_blank')
        this.$toast.add({
          severity: 'info',
          summary: 'Email',
          detail: `Opening email to ${email}...`,
          life: 2000
        })
      }
      this.hideAllPanels()
    },

    sendByEmail(invoice) {
      // TODO: Implement email sending
      this.$toast.add({
        severity: "info",
        summary: "Feature Coming Soon",
        detail: "Email sending will be available soon",
        life: 3000,
      });
      this.hideAllPanels();
    },

    // DataTable methods
    expandAll() {
      this.expandedRows = this.filteredInvoices.reduce((acc, invoice) => {
        acc[invoice.id] = true;
        return acc;
      }, {});
    },

    collapseAll() {
      this.expandedRows = {};
    },

    onRowExpand(event) {
      console.log("Row expanded:", event.data.invoice_number);
    },

    onRowCollapse(event) {
      console.log("Row collapsed:", event.data.invoice_number);
    },

    // Utility methods
    getInitials(name) {
      if (!name) return "??";
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    },

    getAvatarColor(name) {
      if (!name) return "#6b7280";
      const colors = [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#eab308",
        "#84cc16",
        "#22c55e",
        "#10b981",
        "#14b8a6",
        "#06b6d4",
        "#0ea5e9",
        "#3b82f6",
        "#6366f1",
        "#8b5cf6",
        "#a855f7",
        "#d946ef",
        "#ec4899",
      ];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    },

    getStatusSeverity(status, isOverdue = false) {
      return this.invoicesService.getStatusSeverity(status, isOverdue);
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
};
</script>

<style scoped>
/* Smooth transitions */
.transition-all {
  transition: all 0.3s ease;
}

/* Touch-friendly sizing */
@media (max-width: 768px) {
  .p-button {
    min-height: 44px;
    font-size: 16px;
  }

  .p-button-sm {
    min-height: 36px;
  }

  .p-inputtext {
    min-height: 44px;
    font-size: 16px;
  }
}

/* Mobile-first responsive grid */
.grid {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .grid {
    gap: 1rem;
  }
}

/* Smooth animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-3 > * + * {
  animation: fadeIn 0.3s ease;
}

/* Custom scrollbar for mobile */
@media (max-width: 768px) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Focus states for accessibility */
.p-button:focus-visible,
.p-inputtext:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Enhanced DataTable styling */
.p-datatable .p-datatable-tbody > tr:hover {
  background-color: var(--p-surface-100);
}

/* Better card styling */
.card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
