<template>
  <div class="p-3 sm:p-6 max-w-7xl mx-auto">
    <!-- Toast for notifications -->
    <Toast />

    <!-- Page Header - Optimisé mobile -->
    <div class="mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-primary mb-2">Customer Management</h1>
      <p class="text-muted-color text-sm sm:text-base">Manage your students and corporate clients</p>
    </div>

    <!-- Quick Stats - Cards responsives -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div class="card-stat p-3 sm:p-4">
        <div class="text-left">
          <div class="text-xl sm:text-2xl font-bold text-primary">{{ customers.length }}</div>
          <div class="text-xs sm:text-sm text-muted-color">Total Clients</div>
        </div>
      </div>
      <div class="card-stat p-3 sm:p-4">
        <div class="text-left">
          <div class="text-xl sm:text-2xl font-bold text-blue-600">{{ individualCount }}</div>
          <div class="text-xs sm:text-sm text-muted-color">Students</div>
        </div>
      </div>
      <div class="card-stat p-3 sm:p-4">
        <div class="text-left">
          <div class="text-xl sm:text-2xl font-bold text-emerald-600">{{ companyCount }}</div>
          <div class="text-xs sm:text-sm text-muted-color">Companies</div>
        </div>
      </div>
      <div class="card-stat p-3 sm:p-4">
        <div class="text-left">
          <div class="text-xl sm:text-2xl font-bold text-orange-600">€ {{ totalRevenue.toFixed(0) }}</div>
          <div class="text-xs sm:text-sm text-muted-color">Revenue</div>
        </div>
      </div>
    </div>

    <!-- Action Bar - Responsive -->
    <div class="mb-4 sm:mb-6">
      <!-- Mobile: Stack vertically -->
      <div class="flex flex-col gap-3 sm:hidden">
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Add Customer"
            @click="openCreateDialog"
            severity="primary"
            class="flex-1"
            size="small"
          />
          <Button
            icon="pi pi-refresh"
            @click="loadCustomers"
            severity="secondary"
            outlined
            size="small"
          />
        </div>
        <!-- Mobile Search -->
        <div class="relative">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="globalFilter"
              placeholder="Search customers..."
              @input="onGlobalFilter"
              fluid
              size="small"
            />
          </IconField>
        </div>
        <!-- Mobile Filters -->
        <div class="flex gap-2">
          <Button
            :label="showFilters ? 'Hide Filters' : 'Filters'"
            icon="pi pi-filter"
            @click="showFilters = !showFilters"
            severity="secondary"
            outlined
            size="small"
            class="flex-1"
          />
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

      <!-- Desktop: Horizontal layout -->
      <div class="hidden sm:flex justify-between items-center">
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Add New Customer"
            @click="openCreateDialog"
            severity="primary"
          />
          <Button
            icon="pi pi-refresh"
            label="Refresh"
            @click="loadCustomers"
            severity="secondary"
            outlined
          />
        </div>
        <div class="flex gap-2 items-center">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="globalFilter"
              placeholder="Search customers..."
              @input="onGlobalFilter"
              class="w-64"
            />
          </IconField>
          <Button
            :icon="viewMode === 'cards' ? 'pi pi-table' : 'pi pi-th-large'"
            @click="toggleViewMode"
            severity="secondary"
            outlined
            v-tooltip="viewMode === 'cards' ? 'Table View' : 'Card View'"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Filters Panel -->
    <div v-if="showFilters" class="sm:hidden mb-4 p-4 bg-surface-50 rounded-xl border border-surface-200">
      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium block mb-2">Client Type</label>
          <Select
            v-model="typeFilter"
            :options="typeFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Types"
            @change="onFilterChange"
            fluid
            size="small"
          />
        </div>
        <div class="flex gap-2">
          <Button
            label="Clear Filters"
            @click="clearFilters"
            severity="secondary"
            outlined
            size="small"
            class="flex-1"
          />
          <Button
            label="Apply"
            @click="showFilters = false"
            severity="primary"
            size="small"
            class="flex-1"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <ProgressSpinner />
    </div>

    <!-- Mobile Cards View -->
    <div v-else-if="viewMode === 'cards' || isMobile" class="space-y-3">
      <div
        v-for="customer in filteredCustomers"
        :key="customer.id"
        class="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden"
      >
        <!-- Card Header -->
        <div class="p-4 border-b border-surface-100">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                :label="getInitials(customer.display_name)"
                shape="circle"
                size="large"
                :style="{ backgroundColor: getAvatarColor(customer.display_name) }"
                class="flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="font-semibold text-surface-900 truncate">{{ customer.display_name }}</div>
                <div class="flex items-center gap-2 mt-1">
                  <Tag
                    :value="customer.client_type === 'individual' ? 'Student' : 'Company'"
                    :severity="customer.client_type === 'individual' ? 'secondary' : 'info'"
                    size="small"
                  />
                  <span v-if="customer.license_type" class="text-xs text-muted-color">
                    {{ customer.license_type }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <Button
                icon="pi pi-ellipsis-v"
                @click="toggleCustomerActions($event, customer)"
                variant="text"
                size="small"
                class="w-8 h-8"
              />
            </div>
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-4 space-y-3">
          <!-- Contact Info -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <i class="pi pi-envelope text-muted-color w-4"></i>
              <span class="truncate">{{ customer.email }}</span>
              <Button
                icon="pi pi-external-link"
                @click="openEmail(customer.email)"
                variant="text"
                size="small"
                class="w-6 h-6 ml-auto flex-shrink-0"
              />
            </div>
            <div v-if="customer.phone" class="flex items-center gap-2 text-sm">
              <i class="pi pi-phone text-muted-color w-4"></i>
              <span>{{ customer.phone }}</span>
              <Button
                icon="pi pi-phone"
                @click="callCustomer(customer.phone)"
                variant="text"
                size="small"
                class="w-6 h-6 ml-auto flex-shrink-0"
              />
            </div>
            <div v-if="customer.city || customer.country" class="flex items-center gap-2 text-sm">
              <i class="pi pi-map-marker text-muted-color w-4"></i>
              <span class="text-muted-color truncate">
                {{ [customer.city, customer.country].filter(Boolean).join(', ') }}
              </span>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 pt-3 border-t border-surface-100">
            <div class="text-center">
              <div class="text-lg font-semibold text-primary">{{ customer.total_lessons || 0 }}</div>
              <div class="text-xs text-muted-color">Lessons</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-emerald-600">{{ customer.total_invoices || 0 }}</div>
              <div class="text-xs text-muted-color">Invoices</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-orange-600">€{{ (customer.total_billed || 0).toFixed(0) }}</div>
              <div class="text-xs text-muted-color">Revenue</div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex gap-2 pt-3 border-t border-surface-100">
            <Button
              label="Edit"
              icon="pi pi-pencil"
              @click="openEditDialog(customer)"
              severity="secondary"
              outlined
              size="small"
              class="flex-1"
            />
            <Button
              label="Invoice"
              icon="pi pi-receipt"
              @click="createInvoiceFor(customer)"
              severity="primary"
              outlined
              size="small"
              class="flex-1"
            />
            <Button
              icon="pi pi-ellipsis-h"
              @click="showCustomerDetails(customer)"
              severity="secondary"
              outlined
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Empty State for Cards -->
      <div v-if="filteredCustomers.length === 0" class="text-center py-12">
        <div class="max-w-sm mx-auto">
          <i class="pi pi-users text-6xl text-muted-color mb-4 block"></i>
          <h3 class="text-lg font-medium mb-2">No customers found</h3>
          <p class="text-muted-color mb-6 text-sm">
            {{ globalFilter ? 'Try adjusting your search terms' : 'Start by adding your first customer' }}
          </p>
          <Button
            icon="pi pi-plus"
            label="Add Customer"
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
        :value="filteredCustomers"
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
              <Button
                text
                icon="pi pi-plus"
                label="Expand All"
                @click="expandAll"
                size="small"
              />
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

        <!-- Client Type -->
        <Column field="client_type" header="Type" style="width: 8rem">
          <template #body="{ data }">
            <Tag
              :value="data.client_type === 'individual' ? 'Student' : 'Company'"
              :severity="data.client_type === 'individual' ? 'secondary' : 'info'"
            />
          </template>
        </Column>

        <!-- Name -->
        <Column field="display_name" header="Name" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar
                :label="getInitials(data.display_name)"
                shape="circle"
                size="normal"
                :style="{ backgroundColor: getAvatarColor(data.display_name) }"
              />
              <div>
                <div class="font-medium">{{ data.display_name }}</div>
                <div v-if="data.client_type === 'company' && data.contact_person" class="text-sm text-muted-color">
                  Contact: {{ data.contact_person }}
                </div>
                <div v-if="data.client_type === 'individual' && data.license_type" class="text-sm text-muted-color">
                  License: {{ data.license_type }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Contact Info -->
        <Column header="Contact">
          <template #body="{ data }">
            <div class="text-sm">
              <div class="flex items-center gap-1">
                <i class="pi pi-envelope text-xs"></i>
                <span>{{ data.email }}</span>
              </div>
              <div v-if="data.phone" class="flex items-center gap-1 mt-1">
                <i class="pi pi-phone text-xs"></i>
                <span>{{ data.phone }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Location -->
        <Column header="Location">
          <template #body="{ data }">
            <div v-if="data.city || data.country" class="text-sm">
              <div>{{ data.city }}</div>
              <div class="text-muted-color">{{ data.country }}</div>
            </div>
          </template>
        </Column>

        <!-- Stats -->
        <Column header="Activity" sortable sortField="total_lessons">
          <template #body="{ data }">
            <div class="text-sm">
              <div class="flex items-center gap-1">
                <i class="pi pi-calendar text-xs"></i>
                <span>{{ data.total_lessons || 0 }} lessons</span>
              </div>
              <div class="flex items-center gap-1 mt-1">
                <i class="pi pi-receipt text-xs"></i>
                <span>{{ data.total_invoices || 0 }} invoices</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Revenue -->
        <Column header="Revenue" sortable sortField="total_billed">
          <template #body="{ data }">
            <div class="font-medium">
              €{{ (data.total_billed || 0).toFixed(2) }}
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" style="width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="secondary"
                text
                @click="openEditDialog(data)"
                v-tooltip.top="'Edit'"
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
            <h5 class="mb-4 font-semibold">Customer Details</h5>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Personal/Company Info -->
              <div>
                <h6 class="font-medium mb-3 text-primary">
                  {{ data.client_type === 'company' ? 'Company Information' : 'Personal Information' }}
                </h6>
                <div class="space-y-2 text-sm">
                  <div v-if="data.vat_number" class="flex justify-between">
                    <span class="text-muted-color">VAT Number:</span>
                    <span>{{ data.vat_number }}</span>
                  </div>
                  <div v-if="data.address" class="flex justify-between">
                    <span class="text-muted-color">Address:</span>
                    <span class="text-right max-w-xs">{{ data.address }}</span>
                  </div>
                  <div v-if="data.postal_code" class="flex justify-between">
                    <span class="text-muted-color">Postal Code:</span>
                    <span>{{ data.postal_code }}</span>
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

              <!-- Recent Activity -->
              <div>
                <h6 class="font-medium mb-3 text-primary">Recent Activity</h6>
                <div class="space-y-3">
                  <!-- Recent Invoices -->
                  <div v-if="data.invoices && data.invoices.length > 0">
                    <div class="text-sm font-medium mb-2">Recent Invoices</div>
                    <div class="space-y-1">
                      <div
                        v-for="invoice in data.invoices.slice(0, 3)"
                        :key="invoice.id"
                        class="flex justify-between items-center text-xs"
                      >
                        <span>{{ invoice.invoice_number }}</span>
                        <div class="flex items-center gap-2">
                          <span>€{{ parseFloat(invoice.total_amount).toFixed(2) }}</span>
                          <Tag
                            :value="invoice.status"
                            :severity="getInvoiceStatusSeverity(invoice.status)"
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Recent Lessons -->
                  <div v-if="data.lessons && data.lessons.length > 0">
                    <div class="text-sm font-medium mb-2">Recent Lessons</div>
                    <div class="space-y-1">
                      <div
                        v-for="lesson in data.lessons.slice(0, 3)"
                        :key="lesson.id"
                        class="flex justify-between items-center text-xs"
                      >
                        <span>{{ formatDate(lesson.scheduled_date) }}</span>
                        <div class="flex items-center gap-2">
                          <span>{{ lesson.duration_hours }}h</span>
                          <Tag
                            :value="lesson.status"
                            :severity="getLessonStatusSeverity(lesson.status)"
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- No Activity -->
                  <div v-if="(!data.invoices || data.invoices.length === 0) && (!data.lessons || data.lessons.length === 0)">
                    <p class="text-muted-color text-sm">No recent activity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <template #empty>
          <div class="text-center py-8">
            <i class="pi pi-users text-4xl text-muted-color mb-4"></i>
            <h3 class="text-lg font-medium mb-2">No customers yet</h3>
            <p class="text-muted-color mb-4">Start by adding your first customer</p>
            <Button
              icon="pi pi-plus"
              label="Add Customer"
              @click="openCreateDialog"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Customer Form Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit Customer' : 'Add New Customer'"
      modal
      :class="isMobile ? 'w-full h-full m-0' : 'w-full max-w-2xl'"
      :style="isMobile ? 'height: 100vh; max-height: 100vh' : ''"
      :closable="true"
      :pt="{
        root: isMobile ? 'fixed inset-0' : '',
        content: isMobile ? 'h-full overflow-y-auto' : ''
      }"
    >
      <CustomerForm
        :customer="selectedCustomer"
        :is-editing="isEditing"
        @save="handleSave"
        @cancel="closeDialog"
      />
    </Dialog>

    <!-- Customer Details Modal (Mobile) -->
    <Dialog
      v-model:visible="showDetailsDialog"
      header="Customer Details"
      modal
      :class="isMobile ? 'w-full h-full m-0' : 'w-full max-w-2xl'"
      :style="isMobile ? 'height: 100vh; max-height: 100vh' : ''"
      :closable="true"
    >
      <div v-if="selectedCustomer" class="space-y-6">
        <!-- Customer Header -->
        <div class="text-center">
          <Avatar
            :label="getInitials(selectedCustomer.display_name)"
            shape="circle"
            size="xlarge"
            :style="{ backgroundColor: getAvatarColor(selectedCustomer.display_name) }"
            class="mx-auto mb-4"
          />
          <h3 class="text-xl font-semibold">{{ selectedCustomer.display_name }}</h3>
          <Tag
            :value="selectedCustomer.client_type === 'individual' ? 'Student' : 'Company'"
            :severity="selectedCustomer.client_type === 'individual' ? 'secondary' : 'info'"
            class="mt-2"
          />
        </div>

        <!-- Contact Information -->
        <div class="space-y-4">
          <h4 class="font-medium text-primary">Contact Information</h4>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <i class="pi pi-envelope text-muted-color w-5"></i>
              <span>{{ selectedCustomer.email }}</span>
            </div>
            <div v-if="selectedCustomer.phone" class="flex items-center gap-3">
              <i class="pi pi-phone text-muted-color w-5"></i>
              <span>{{ selectedCustomer.phone }}</span>
            </div>
            <div v-if="selectedCustomer.address" class="flex items-start gap-3">
              <i class="pi pi-map-marker text-muted-color w-5 mt-1"></i>
              <div>
                <div>{{ selectedCustomer.address }}</div>
                <div class="text-muted-color">
                  {{ [selectedCustomer.postal_code, selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="space-y-4">
          <h4 class="font-medium text-primary">Statistics</h4>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center p-4 bg-surface-50 rounded-lg">
              <div class="text-2xl font-bold text-primary">{{ selectedCustomer.total_lessons || 0 }}</div>
              <div class="text-sm text-muted-color">Lessons</div>
            </div>
            <div class="text-center p-4 bg-surface-50 rounded-lg">
              <div class="text-2xl font-bold text-emerald-600">{{ selectedCustomer.total_invoices || 0 }}</div>
              <div class="text-sm text-muted-color">Invoices</div>
            </div>
            <div class="text-center p-4 bg-surface-50 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">€{{ (selectedCustomer.total_billed || 0).toFixed(0) }}</div>
              <div class="text-sm text-muted-color">Revenue</div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <Button
            label="Edit Customer"
            icon="pi pi-pencil"
            @click="editFromDetails"
            severity="primary"
            class="flex-1"
          />
          <Button
            label="Create Invoice"
            icon="pi pi-receipt"
            @click="createInvoiceFromDetails"
            severity="secondary"
            class="flex-1"
          />
        </div>
      </div>
    </Dialog>

    <!-- Customer Actions Menu -->
    <OverlayPanel ref="customerActionsPanel" class="w-48">
      <div class="space-y-2" v-if="selectedCustomer">
        <Button
          label="View Details"
          icon="pi pi-eye"
          @click="showCustomerDetails(selectedCustomer)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Button
          label="Edit Customer"
          icon="pi pi-pencil"
          @click="openEditDialog(selectedCustomer)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Button
          label="Create Invoice"
          icon="pi pi-receipt"
          @click="createInvoiceFor(selectedCustomer)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Divider />
        <Button
          label="Call Customer"
          icon="pi pi-phone"
          @click="callCustomer(selectedCustomer.phone)"
          variant="text"
          class="w-full justify-start"
          size="small"
          :disabled="!selectedCustomer.phone"
        />
        <Button
          label="Send Email"
          icon="pi pi-envelope"
          @click="openEmail(selectedCustomer.email)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Divider />
        <Button
          label="Delete Customer"
          icon="pi pi-trash"
          @click="confirmDelete(selectedCustomer)"
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
import { CustomersService } from '@/services/CustomersService.js'
import CustomerForm from '@/components/CustomerForm.vue'

export default {
  name: 'CustomersView',
  components: {
    CustomerForm
  },

  data() {
    return {
      customers: [],
      filteredCustomers: [],
      expandedRows: {},
      loading: false,
      globalFilter: '',
      typeFilter: null,

      // Mobile-specific state
      viewMode: 'cards', // 'cards' or 'table'
      showFilters: false,
      showDetailsDialog: false,
      isMobile: false,

      // Dialog state
      showDialog: false,
      selectedCustomer: null,
      isEditing: false,

      // Filter options
      typeFilterOptions: [
        { label: "All Types", value: null },
        { label: "Students", value: "individual" },
        { label: "Companies", value: "company" }
      ],

      // Service instance
      customersService: new CustomersService()
    }
  },

  computed: {
    individualCount() {
      return this.customers.filter(c => c.client_type === 'individual').length
    },

    companyCount() {
      return this.customers.filter(c => c.client_type === 'company').length
    },

    totalRevenue() {
      return this.customers.reduce((sum, customer) => sum + (customer.total_billed || 0), 0)
    }
  },

  async created() {
    await this.loadCustomers()
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

    async loadCustomers() {
      this.loading = true
      try {
        this.customers = await this.customersService.getCustomers()
        this.applyFilters()
      } catch (error) {
        console.error('Error loading customers:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load customers',
          life: 5000
        })
      } finally {
        this.loading = false
      }
    },

    applyFilters() {
      let filtered = [...this.customers]

      // Apply type filter
      if (this.typeFilter) {
        filtered = filtered.filter(customer => customer.client_type === this.typeFilter)
      }

      // Apply global filter
      if (this.globalFilter) {
        const searchTerm = this.globalFilter.toLowerCase()
        filtered = filtered.filter(customer =>
          customer.display_name.toLowerCase().includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm) ||
          (customer.phone || '').toLowerCase().includes(searchTerm) ||
          (customer.city || '').toLowerCase().includes(searchTerm) ||
          (customer.company_name || '').toLowerCase().includes(searchTerm) ||
          (customer.first_name || '').toLowerCase().includes(searchTerm) ||
          (customer.last_name || '').toLowerCase().includes(searchTerm)
        )
      }

      this.filteredCustomers = filtered
    },

    onFilterChange() {
      this.applyFilters()
    },

    onGlobalFilter() {
      this.applyFilters()
    },

    clearFilters() {
      this.globalFilter = ''
      this.typeFilter = null
      this.applyFilters()
    },

    openCreateDialog() {
      this.selectedCustomer = null
      this.isEditing = false
      this.showDialog = true
    },

    openEditDialog(customer) {
      this.selectedCustomer = { ...customer }
      this.isEditing = true
      this.showDialog = true
      this.hideAllPanels()
    },

    closeDialog() {
      this.showDialog = false
      this.selectedCustomer = null
      this.isEditing = false
    },

    showCustomerDetails(customer) {
      this.selectedCustomer = customer
      this.showDetailsDialog = true
      this.hideAllPanels()
    },

    editFromDetails() {
      this.showDetailsDialog = false
      this.openEditDialog(this.selectedCustomer)
    },

    createInvoiceFromDetails() {
      this.showDetailsDialog = false
      this.createInvoiceFor(this.selectedCustomer)
    },

    toggleCustomerActions(event, customer) {
      this.selectedCustomer = customer
      this.$refs.customerActionsPanel.toggle(event)
    },

    hideAllPanels() {
      if (this.$refs.customerActionsPanel) {
        this.$refs.customerActionsPanel.hide()
      }
    },

    async handleSave(customerData) {
      try {
        if (this.isEditing) {
          await this.customersService.updateCustomer(this.selectedCustomer.id, customerData)
          this.$toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Customer updated successfully',
            life: 3000
          })
        } else {
          await this.customersService.createCustomer(customerData)
          this.$toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Customer created successfully',
            life: 3000
          })
        }

        await this.loadCustomers()
        this.closeDialog()
      } catch (error) {
        console.error('Error saving customer:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: this.isEditing ? 'Failed to update customer' : 'Failed to create customer',
          life: 5000
        })
      }
    },

    confirmDelete(customer) {
      this.hideAllPanels()
      this.$confirm.require({
        message: `Are you sure you want to delete ${customer.display_name}? This action cannot be undone and will permanently remove all associated data.`,
        header: 'Delete Customer',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: 'Delete',
          severity: 'danger'
        },
        accept: () => {
          this.deleteCustomer(customer.id, customer.display_name)
        }
      })
    },

    async deleteCustomer(customerId, customerName) {
      try {
        await this.customersService.deleteCustomer(customerId)
        this.$toast.add({
          severity: 'success',
          summary: 'Customer Deleted',
          detail: `${customerName} has been successfully deleted`,
          life: 3000
        })
        await this.loadCustomers()
      } catch (error) {
        console.error('Error deleting customer:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: 'Failed to delete customer. Please try again.',
          life: 5000
        })
      }
    },

    // Communication methods
    callCustomer(phone) {
      if (phone) {
        window.open(`tel:${phone}`, '_self')
        this.$toast.add({
          severity: 'info',
          summary: 'Calling',
          detail: `Calling ${phone}...`,
          life: 2000
        })
      }
      this.hideAllPanels()
    },

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

    createInvoiceFor(customer) {
      this.$router.push({
        name: 'invoices',
        query: { customer: customer.id, action: 'create' }
      })
      this.hideAllPanels()
    },

    // DataTable methods (for desktop)
    expandAll() {
      this.expandedRows = this.filteredCustomers.reduce((acc, customer) => {
        acc[customer.id] = true
        return acc
      }, {})
    },

    collapseAll() {
      this.expandedRows = {}
    },

    onRowExpand(event) {
      console.log('Row expanded:', event.data.display_name)
    },

    onRowCollapse(event) {
      console.log('Row collapsed:', event.data.display_name)
    },

    // Utility methods
    getInitials(name) {
      if (!name) return '??'
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    getAvatarColor(name) {
      if (!name) return '#6b7280'
      const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
      ]
      const index = name.charCodeAt(0) % colors.length
      return colors[index]
    },

    getInvoiceStatusSeverity(status) {
      const severityMap = {
        'draft': 'secondary',
        'sent': 'warning',
        'paid': 'success',
        'overdue': 'danger',
        'cancelled': 'secondary'
      }
      return severityMap[status] || 'secondary'
    },

    getLessonStatusSeverity(status) {
      const severityMap = {
        'scheduled': 'info',
        'completed': 'success',
        'cancelled': 'secondary',
        'no_show': 'danger'
      }
      return severityMap[status] || 'secondary'
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }
}
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
  }

  .p-button-sm {
    min-height: 36px;
  }

  .p-inputtext {
    min-height: 44px;
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

.card-stat {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
