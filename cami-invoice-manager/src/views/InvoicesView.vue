<template>
  <div class="p-3 sm:p-6 max-w-7xl mx-auto">
    <!-- Toast pour les notifications -->
    <Toast />

    <!-- En-tête de page -->
    <div class="mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-primary mb-2">Gestion des factures</h1>
      <p class="text-muted-color text-sm sm:text-base">Gérez les factures de vos élèves et clients d'entreprise</p>
    </div>

    <!-- Cartes de statistiques - Grille responsive -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-primary">{{ stats.total_invoices || 0 }}</div>
            <div class="text-xs sm:text-sm text-muted-color">Total factures</div>
          </div>
          <i class="pi pi-receipt text-lg sm:text-xl text-primary"></i>
        </div>
      </div>

      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-green-600">
              € {{ (stats.total_revenue || 0).toFixed(2) }}
            </div>
            <div class="text-xs sm:text-sm text-muted-color">Revenus totaux</div>
          </div>
          <i class="pi pi-euro text-lg sm:text-xl text-green-600"></i>
        </div>
      </div>

      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-orange-500">
              € {{ (stats.pending_amount || 0).toFixed(2) }}
            </div>
            <div class="text-xs sm:text-sm text-muted-color">Montant en attente</div>
          </div>
          <i class="pi pi-clock text-lg sm:text-xl text-orange-500"></i>
        </div>
      </div>

      <div class="card p-3 sm:p-4">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xl sm:text-2xl font-bold text-red-500">{{ stats.overdue_invoices || 0 }}</div>
            <div class="text-xs sm:text-sm text-muted-color">Factures en retard</div>
          </div>
          <i class="pi pi-exclamation-triangle text-lg sm:text-xl text-red-500"></i>
        </div>
      </div>
    </div>

    <!-- Barre d'actions - Mobile responsive -->
    <div class="mb-4 sm:mb-6">
      <!-- Layout mobile -->
      <div class="flex flex-col gap-3 sm:hidden">
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Créer une facture"
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

        <!-- Recherche mobile -->
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="globalFilter"
            placeholder="Rechercher des factures..."
            @input="onGlobalFilter"
            fluid
            size="small"
            class="text-base"
          />
        </IconField>

        <!-- Filtre mobile -->
        <div class="flex gap-2">
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tous les statuts"
            @change="onStatusFilterChange"
            fluid
            size="small"
            class="text-base"
          />
        </div>
      </div>

      <!-- Layout desktop -->
      <div class="hidden sm:flex justify-between items-center">
        <div class="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Créer une facture"
            @click="openCreateDialog"
            severity="primary"
          />
          <Button
            icon="pi pi-refresh"
            label="Actualiser"
            @click="loadInvoices"
            severity="secondary"
            outlined
          />
        </div>

        <!-- Filtres desktop -->
        <div class="flex gap-2 items-center">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="globalFilter"
              placeholder="Rechercher des factures..."
              @input="onGlobalFilter"
              class="w-64"
            />
          </IconField>
          <label class="text-sm font-medium">Filtrer par statut :</label>
          <Select
            v-model="statusFilter"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tous les statuts"
            @change="onStatusFilterChange"
            class="w-40"
          />
        </div>
        <Button
            :label="viewMode === 'cards' ? 'Tableau' : 'Cartes'"
            :icon="viewMode === 'cards' ? 'pi pi-table' : 'pi pi-th-large'"
            @click="toggleViewMode"
            severity="secondary"
            outlined
            size="small"
          />
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <ProgressSpinner />
    </div>

    <!-- Vue cartes mobile -->
    <div v-else-if="viewMode === 'cards' || isMobile" class="space-y-3">
      <div
        v-for="invoice in filteredInvoices"
        :key="invoice.id"
        class="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden"
      >
        <!-- En-tête de carte -->
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
                    :value="translateStatus(invoice.status)"
                    :severity="getStatusSeverity(invoice.status, invoice.overdue)"
                    size="small"
                  />
                  <span v-if="invoice.overdue && invoice.days_overdue > 0" class="text-xs text-red-500">
                    {{ invoice.days_overdue }}j en retard
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

        <!-- Contenu de carte -->
        <div class="p-4 space-y-3">
          <!-- Dates et infos -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-muted-color">Date de facture</div>
              <div class="font-medium">{{ formatDate(invoice.invoice_date) }}</div>
            </div>
            <div>
              <div class="text-muted-color">Date d'échéance</div>
              <div class="font-medium">{{ formatDate(invoice.due_date) }}</div>
            </div>
          </div>

          <!-- Info contact -->
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

          <!-- Détails facture -->
          <div class="grid grid-cols-3 gap-4 pt-3 border-t border-surface-100 text-sm">
            <div class="text-center">
              <div class="text-lg font-semibold text-primary">{{ invoice.items_count || 0 }}</div>
              <div class="text-xs text-muted-color">Articles</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-emerald-600">€{{ (invoice.subtotal || 0).toFixed(2) }}</div>
              <div class="text-xs text-muted-color">Sous-total</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-orange-600">€{{ (invoice.tax_amount || 0).toFixed(2) }}</div>
              <div class="text-xs text-muted-color">TVA</div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="flex gap-2 pt-3 border-t border-surface-100">
            <!-- Bouton de téléchargement PDF principal -->
            <Button
              label="PDF"
              icon="pi pi-file-pdf"
              @click="downloadHTMLInvoicePDF(invoice)"
              size="small"
              class="flex-1 btn-pdf-download"
            />

            <!-- Bouton de statut avec toggle -->
            <SplitButton
              :label="getStatusButtonLabel(invoice.status)"
              :icon="getStatusIcon(invoice.status)"
              :severity="getStatusButtonSeverity(invoice.status)"
              size="small"
              class="flex-1"
              :model="getStatusActions(invoice)"
              @click="toggleMainStatus(invoice)"
            />

            <Button
              icon="pi pi-pencil"
              @click="openEditDialog(invoice)"
              severity="secondary"
              outlined
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- État vide pour les cartes -->
      <div v-if="filteredInvoices.length === 0" class="text-center py-12">
        <div class="max-w-sm mx-auto">
          <i class="pi pi-receipt text-6xl text-muted-color mb-4 block"></i>
          <h3 class="text-lg font-medium mb-2">Aucune facture trouvée</h3>
          <p class="text-muted-color mb-6 text-sm">
            {{ globalFilter ? 'Essayez d\'ajuster vos termes de recherche' : 'Commencez par créer votre première facture' }}
          </p>
          <Button
            icon="pi pi-plus"
            label="Créer une facture"
            @click="openCreateDialog"
            class="w-full sm:w-auto"
          />
        </div>
      </div>
    </div>

    <!-- Vue DataTable desktop -->
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
              <Button text icon="pi pi-plus" label="Tout développer" @click="expandAll" size="small" />
              <Button
                text
                icon="pi pi-minus"
                label="Tout réduire"
                @click="collapseAll"
                size="small"
              />
            </div>
          </div>
        </template>

        <!-- Colonne extensible -->
        <Column expander style="width: 3rem" />

        <!-- Numéro de facture -->
        <Column field="invoice_number" header="N° facture" sortable style="width: 10rem">
          <template #body="{ data }">
            <div class="font-medium text-primary">{{ data.invoice_number }}</div>
          </template>
        </Column>

        <!-- Client -->
        <Column field="customer_name" header="Client" sortable>
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
                Échéance : {{ formatDate(data.due_date) }}
              </div>
            </div>
          </template>
        </Column>

        <!-- Statut -->
        <Column field="status" header="Statut" sortable style="width: 8rem">
          <template #body="{ data }">
            <Tag
              :value="translateStatus(data.status)"
              :severity="getStatusSeverity(data.status, data.overdue)"
            />
            <div v-if="data.overdue && data.days_overdue > 0" class="text-xs text-red-500 mt-1">
              {{ data.days_overdue }} jours en retard
            </div>
          </template>
        </Column>

        <!-- Articles -->
        <Column header="Articles" style="width: 6rem">
          <template #body="{ data }">
            <div class="text-sm text-center">
              <i class="pi pi-list mr-1"></i>
              {{ data.items_count }}
            </div>
          </template>
        </Column>

        <!-- Montant -->
        <Column field="total_amount" header="Montant" sortable style="width: 8rem">
          <template #body="{ data }">
            <div class="font-medium text-right">€{{ (data.total_amount || 0).toFixed(2) }}</div>
            <div v-if="data.tax_amount > 0" class="text-xs text-muted-color text-right">
              +€{{ data.tax_amount.toFixed(2) }} TVA
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" style="width: 16rem">
          <template #body="{ data }">
            <div class="flex gap-1">
              <!-- Bouton PDF principal -->
              <Button
                icon="pi pi-file-pdf"
                size="small"
                @click="downloadHTMLInvoicePDF(data)"
                v-tooltip.top="'Télécharger PDF'"
                class="btn-pdf-download"
              />

              <!-- Bouton de statut avec menu -->
              <SplitButton
                :icon="getStatusIcon(data.status)"
                size="small"
                :severity="getStatusButtonSeverity(data.status)"
                :model="getStatusActions(data)"
                v-tooltip.top="'Changer le statut'"
              />

              <Button
                icon="pi pi-pencil"
                size="small"
                severity="secondary"
                text
                @click="openEditDialog(data)"
                v-tooltip.top="'Modifier'"
              />

              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                @click="confirmDelete(data)"
                v-tooltip.top="'Supprimer'"
              />
            </div>
          </template>
        </Column>

        <!-- Template d'expansion de ligne -->
        <template #expansion="{ data }">
          <div class="p-4 bg-surface-50">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Détails facture -->
              <div>
                <h6 class="font-medium mb-3 text-primary">Détails de la facture</h6>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-color">Type de client :</span>
                    <Tag
                      :value="data.customer?.client_type === 'individual' ? 'Étudiant' : 'Entreprise'"
                      :severity="data.customer?.client_type === 'individual' ? 'secondary' : 'info'"
                      size="small"
                    />
                  </div>
                  <div v-if="data.customer?.phone" class="flex justify-between">
                    <span class="text-muted-color">Téléphone :</span>
                    <span>{{ data.customer.phone }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-color">Sous-total :</span>
                    <span>€{{ (data.subtotal || 0).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-color">TVA ({{ data.tax_rate }}%) :</span>
                    <span>€{{ (data.tax_amount || 0).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between font-medium border-t pt-2">
                    <span>Total :</span>
                    <span>€{{ (data.total_amount || 0).toFixed(2) }}</span>
                  </div>
                  <div v-if="data.notes" class="flex justify-between">
                    <span class="text-muted-color">Notes :</span>
                    <span class="text-right max-w-xs">{{ data.notes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-color">Créée le :</span>
                    <span>{{ formatDate(data.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Articles de facture -->
              <div>
                <h6 class="font-medium mb-3 text-primary">Articles de la facture</h6>
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
                          Date : {{ formatDate(item.service_date) }}
                        </div>
                        <div v-if="item.duration_hours" class="text-xs text-muted-color">
                          Durée : {{ item.duration_hours }}h
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
                <div v-else class="text-muted-color text-sm">Aucun article ajouté</div>
              </div>
            </div>
          </div>
        </template>

        <!-- État vide -->
        <template #empty>
          <div class="text-center py-8">
            <i class="pi pi-receipt text-4xl text-muted-color mb-4"></i>
            <h3 class="text-lg font-medium mb-2">Aucune facture</h3>
            <p class="text-muted-color mb-4">Commencez par créer votre première facture</p>
            <Button icon="pi pi-plus" label="Créer une facture" @click="openCreateDialog" />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Dialogue de formulaire de facture -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Modifier la facture' : 'Créer une nouvelle facture'"
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

    <!-- Menu d'actions de facture -->
    <OverlayPanel ref="invoiceActionsPanel" class="w-48">
      <div class="space-y-2" v-if="selectedInvoice">
        <Button
          label="Modifier"
          icon="pi pi-pencil"
          @click="openEditDialog(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Button
          label="Dupliquer"
          icon="pi pi-copy"
          @click="duplicateInvoice(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Divider />
        <Button
          label="Envoyer par email"
          icon="pi pi-envelope"
          @click="sendByEmail(selectedInvoice)"
          variant="text"
          class="w-full justify-start"
          size="small"
        />
        <Divider />
        <Button
          label="Supprimer"
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

      // État spécifique mobile
      viewMode: 'cards', // 'cards' ou 'table'
      isMobile: false,

      // Stats
      stats: {
        total_invoices: 0,
        total_revenue: 0,
        pending_amount: 0,
        overdue_invoices: 0,
      },

      // État dialogue
      showDialog: false,
      selectedInvoice: null,
      isEditing: false,

      // Options de filtre
      statusOptions: [
        { label: "Tous les statuts", value: null },
        { label: "Brouillon", value: "draft" },
        { label: "Envoyée", value: "sent" },
        { label: "Payée", value: "paid" },
        { label: "En retard", value: "overdue" },
        { label: "Annulée", value: "cancelled" },
      ],

      // Instance de service
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
        console.error("Erreur lors du chargement des factures:", error);
        this.$toast.add({
          severity: "error",
          summary: "Erreur",
          detail: "Échec du chargement des factures",
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
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        this.statsLoading = false;
      }
    },

    applyFilters() {
      let filtered = [...this.invoices];

      // Appliquer le filtre de statut
      if (this.statusFilter) {
        if (this.statusFilter === "overdue") {
          filtered = filtered.filter((invoice) => invoice.overdue);
        } else {
          filtered = filtered.filter((invoice) => invoice.status === this.statusFilter);
        }
      }

      // Appliquer le filtre global
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

    closeDialog() {
      this.showDialog = false;
      this.selectedInvoice = null;
      this.isEditing = false;
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
            summary: "Succès",
            detail: "Facture modifiée avec succès",
            life: 3000,
          });
        } else {
          await this.invoicesService.createInvoiceWithItems(invoice, items);
          this.$toast.add({
            severity: "success",
            summary: "Succès",
            detail: "Facture créée avec succès",
            life: 3000,
          });
        }

        await Promise.all([this.loadInvoices(), this.loadStats()]);
        this.closeDialog();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de la facture:", error);
        this.$toast.add({
          severity: "error",
          summary: "Erreur",
          detail: this.isEditing ? "Échec de la modification de la facture" : "Échec de la création de la facture",
          life: 5000,
        });
      }
    },

    confirmDelete(invoice) {
      this.hideAllPanels();
      this.$confirm.require({
        message: `Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoice_number} ? Cette action ne peut pas être annulée et supprimera définitivement toutes les données associées.`,
        header: "Supprimer la facture",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
          label: "Annuler",
          severity: "secondary",
          outlined: true,
        },
        acceptProps: {
          label: "Supprimer",
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
          summary: "Facture supprimée",
          detail: `La facture ${invoiceNumber} a été supprimée avec succès`,
          life: 3000,
        });
        await Promise.all([this.loadInvoices(), this.loadStats()]);
      } catch (error) {
        console.error("Erreur lors de la suppression de la facture:", error);
        this.$toast.add({
          severity: "error",
          summary: "Échec de la suppression",
          detail: "Impossible de supprimer la facture. Veuillez réessayer.",
          life: 5000,
        });
      }
    },

    // ===== NOUVELLES MÉTHODES POUR LES BOUTONS DE STATUT =====

    /**
     * Obtient le label du bouton principal de statut
     */
    getStatusButtonLabel(status) {
      const labels = {
        draft: "Brouillon",
        sent: "Envoyée",
        paid: "Payée",
        overdue: "En retard",
        cancelled: "Annulée"
      };
      return labels[status] || status;
    },

    /**
     * Obtient l'icône du bouton de statut
     */
    getStatusIcon(status) {
      const icons = {
        draft: "pi pi-file-edit",
        sent: "pi pi-send",
        paid: "pi pi-check-circle",
        overdue: "pi pi-exclamation-triangle",
        cancelled: "pi pi-times-circle"
      };
      return icons[status] || "pi pi-circle";
    },

    /**
     * Obtient la sévérité du bouton de statut
     */
    getStatusButtonSeverity(status) {
      const severities = {
        draft: "secondary",
        sent: "secondary",
        paid: "warning",
        overdue: "danger",
        cancelled: "secondary"
      };
      return severities[status] || "secondary";
    },

    /**
     * Obtient les actions du menu déroulant de statut
     */
    getStatusActions(invoice) {
      const actions = [];

      // Actions selon l'état actuel
      if (invoice.status !== 'draft') {
        actions.push({
          label: "Marquer comme brouillon",
          icon: "pi pi-file-edit",
          command: () => this.updateStatus(invoice.id, "draft"),
        });
      }

      if (invoice.status !== 'sent') {
        actions.push({
          label: "Marquer comme envoyée",
          icon: "pi pi-send",
          command: () => this.updateStatus(invoice.id, "sent"),
        });
      }

      if (invoice.status !== 'paid') {
        actions.push({
          label: "Marquer comme payée",
          icon: "pi pi-check-circle",
          command: () => this.updateStatus(invoice.id, "paid"),
        });
      }

      if (invoice.status !== 'cancelled') {
        actions.push({
          label: "Annuler la facture",
          icon: "pi pi-times-circle",
          command: () => this.updateStatus(invoice.id, "cancelled"),
        });
      }

      return actions;
    },

    async updateStatus(invoiceId, newStatus) {
      try {
        await this.invoicesService.updateInvoiceStatus(invoiceId, newStatus);

        const statusMessages = {
          draft: "brouillon",
          sent: "envoyée",
          paid: "payée",
          cancelled: "annulée"
        };

        this.$toast.add({
          severity: "success",
          summary: "Statut mis à jour",
          detail: `Facture marquée comme ${statusMessages[newStatus]}`,
          life: 3000,
        });

        await Promise.all([this.loadInvoices(), this.loadStats()]);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        this.$toast.add({
          severity: "error",
          summary: "Échec de la mise à jour",
          detail: "Impossible de mettre à jour le statut de la facture",
          life: 5000,
        });
      }
    },

    // ===== MÉTHODES DE TÉLÉCHARGEMENT PDF =====

    /**
     * Génère et télécharge un PDF HTML pour une facture
     */
    async downloadHTMLInvoicePDF(invoice) {
      try {
        // Afficher l'état de chargement
        this.$toast.add({
          severity: "info",
          summary: "Génération PDF",
          detail: "Génération du PDF professionnel, veuillez patienter...",
          life: 3000,
        });

        // Générer le PDF en utilisant la méthode HTML
        const result = await this.invoicesService.generateHTMLInvoicePDF(invoice.id);

        // Message de succès
        this.$toast.add({
          severity: "success",
          summary: "PDF généré",
          detail: `Facture ${invoice.invoice_number} téléchargée avec succès`,
          life: 4000,
        });
        this.hideAllPanels();
      } catch (error) {
        console.error("Erreur lors de la génération du PDF HTML:", error);
        this.$toast.add({
          severity: "error",
          summary: "Échec de la génération PDF",
          detail: "Impossible de générer le PDF. Veuillez réessayer.",
          life: 5000,
        });
      }
    },

    // ===== AUTRES MÉTHODES =====

    async duplicateInvoice(invoice) {
      try {
        // Créer une copie de la facture avec un nouveau numéro
        const duplicateData = {
          ...invoice,
          invoice_number: null, // Sera généré automatiquement
          status: 'draft',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: null, // Sera calculé automatiquement
          created_at: null,
          updated_at: null
        };

        // Supprimer l'ID pour créer une nouvelle facture
        delete duplicateData.id;

        this.selectedInvoice = duplicateData;
        this.isEditing = false;
        this.showDialog = true;
        this.hideAllPanels();

        this.$toast.add({
          severity: "info",
          summary: "Duplication",
          detail: "Facture dupliquée. Vous pouvez maintenant la modifier.",
          life: 3000,
        });
      } catch (error) {
        console.error("Erreur lors de la duplication:", error);
        this.$toast.add({
          severity: "error",
          summary: "Échec de la duplication",
          detail: "Impossible de dupliquer la facture.",
          life: 5000,
        });
      }
    },

    // Méthodes de communication
    openEmail(email) {
      if (email) {
        window.open(`mailto:${email}`, '_blank')
        this.$toast.add({
          severity: 'info',
          summary: 'Email',
          detail: `Ouverture de l'email vers ${email}...`,
          life: 2000
        })
      }
      this.hideAllPanels()
    },

    sendByEmail(invoice) {
      // TODO: Implémenter l'envoi d'email
      this.$toast.add({
        severity: "info",
        summary: "Fonctionnalité à venir",
        detail: "L'envoi d'emails sera bientôt disponible",
        life: 3000,
      });
      this.hideAllPanels();
    },

    // Méthodes DataTable
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
      console.log("Ligne développée:", event.data.invoice_number);
    },

    onRowCollapse(event) {
      console.log("Ligne réduite:", event.data.invoice_number);
    },

    // Méthodes utilitaires
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

    translateStatus(status) {
      const translations = {
        draft: "Brouillon",
        sent: "Envoyée",
        paid: "Payée",
        overdue: "En retard",
        cancelled: "Annulée"
      };
      return translations[status] || status;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
};
</script>

<style scoped>
/* Taille adaptée au tactile pour mobile */
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

/* Grille responsive mobile-first */
.grid {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .grid {
    gap: 1rem;
  }
}

/* Barre de défilement personnalisée pour mobile */
@media (max-width: 768px) {
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
}

/* Scrollbar personnalisée pour desktop */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--p-surface-100);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--p-surface-300);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--p-surface-400);
}

/* États de focus pour l'accessibilité */
.p-button:focus-visible,
.p-inputtext:focus-visible,
.p-select:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Style amélioré du DataTable */
.p-datatable .p-datatable-tbody > tr:hover {
  background-color: var(--p-surface-100);
}

/* Style des cartes de statistiques avec hover uniquement */
.card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Style pour les panneaux overlay */
.p-overlaypanel {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--p-surface-200);
}

/* Responsive pour les panneaux overlay */
@media (max-width: 768px) {
  .p-overlaypanel {
    max-width: 90vw;
    margin: 0 auto;
  }
}

/* Style pour les lignes développées dans DataTable */
.p-datatable .p-datatable-row-expansion {
  background: var(--p-surface-50);
  border-left: 4px solid var(--p-primary-color);
}

/* Style responsive pour les actions des cartes */
@media (max-width: 640px) {
  .flex.gap-2.pt-3 .p-button {
    flex: 1;
    justify-content: center;
    font-size: 0.875rem;
  }
}

.btn-pdf-download {
  background-color: #6366f1; /* Indigo moderne */
  border-color: #6366f1;
  color: white;
}

.btn-status-paid {
  background-color: #10b981; /* Vert emerald discret */
  border-color: #10b981;
  color: white;
}

/* Amélioration de la lisibilité du texte */
.text-muted-color {
  color: var(--p-surface-600);
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

/* Style pour les messages de validation */
.p-message {
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Responsive breakpoints personnalisés */
@media (min-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
