<template>
  <div class="relative">
    <!-- Mobile Floating Action Header - Uniquement visible sur mobile -->
    <div v-if="isMobile" class="sticky top-0 z-10 p-3 mb-4 -mx-4 -mt-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="pi pi-receipt text-primary"></i>
          <span class="font-medium text-sm">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Facture</span>
        </div>
        <div class="flex gap-2">
          <Button
            type="button"
            label="Annuler"
            severity="secondary"
            outlined
            @click="$emit('cancel')"
            size="small"
            class="px-3"
          />
          <Button
            type="submit"
            :label="isEditing ? 'Sauvegarder' : 'Créer'"
            :loading="loading"
            icon="pi pi-check"
            size="small"
            class="px-3"
            @click="submitForm"
          />
        </div>
      </div>
    </div>

    <!-- Formulaire principal -->
    <div class="p-4">
      <Form
        ref="invoiceForm"
        v-slot="$form"
        :resolver="resolver"
        :initialValues="initialValues"
        @submit="onFormSubmit"
        class="flex flex-col gap-6"
      >
        <!-- Informations d'en-tête de la facture -->
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
              <label for="customer_id">Client *</label>
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
                :manualInput="false"
                @update:modelValue="onInvoiceDateChange"
              />
              <label for="invoice_date">Date de facture *</label>
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
                :manualInput="false"
                @update:modelValue="onDueDateChange"
              />
              <label for="due_date">Date d'échéance</label>
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
              <label for="status">Statut</label>
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
                @update:modelValue="onTaxRateChange"
              />
              <label for="tax_rate">Taux de TVA (%)</label>
            </FloatLabel>
            <Message v-if="$form.tax_rate?.invalid" severity="error" size="small">
              {{ $form.tax_rate.error?.message }}
            </Message>
          </div>
        </div>

        <!-- Section des services de facture -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Services de la facture</h3>
            <Button
              type="button"
              icon="pi pi-plus"
              label="Ajouter un service"
              size="small"
              @click="addItem"
            />
          </div>

          <!-- Liste des services -->
          <div v-if="invoiceItems.length > 0" class="space-y-4">
            <div
              v-for="(item, index) in invoiceItems"
              :key="index"
              class="border rounded p-4 bg-surface-50"
            >
              <!-- Sélection du type de service -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div class="md:col-span-2">
                  <FloatLabel variant="on">
                    <Select
                      v-model="item.service_type_id"
                      :options="serviceTypes"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Sélectionner un type de service"
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
                                  translatePricingType(slotProps.option.pricing_type)
                                }}
                                • {{ translateCategory(slotProps.option.category) }}
                              </div>
                            </div>
                          </div>
                          <Tag
                            :value="translatePricingType(slotProps.option.pricing_type)"
                            :severity="getPricingTypeSeverity(slotProps.option.pricing_type)"
                            size="small"
                          />
                        </div>
                      </template>

                      <template #header>
                        <div class="font-medium p-3 border-b">Types de services disponibles</div>
                      </template>

                      <template #footer>
                        <div class="p-3 border-t">
                          <Button
                            label="Ajouter un nouveau type de service"
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

              <!-- Détails de le service -->
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
                      @update:modelValue="calculateItemTotal(index)"
                    />
                    <label>Quantité</label>
                  </FloatLabel>
                </div>

                <div>
                  <FloatLabel variant="on">
                    <InputNumber
                      v-model="item.unit_price"
                      mode="currency"
                      currency="EUR"
                      locale="fr-FR"
                      fluid
                      @update:modelValue="calculateItemTotal(index)"
                    />
                    <label>Prix unitaire</label>
                  </FloatLabel>
                </div>
              </div>

              <!-- Détails supplémentaires -->
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
                    <label>Durée</label>
                  </FloatLabel>
                </div>

                <div>
                  <FloatLabel variant="on">
                    <DatePicker
                      v-model="item.service_date"
                      fluid
                      dateFormat="dd/mm/yy"
                      :manualInput="false"
                      @update:modelValue="(newDate) => onServiceDateChange(index, newDate)"
                    />
                    <label>Date de service</label>
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
                    v-tooltip.top="'Supprimer le service'"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- État vide -->
          <div v-else class="text-center py-8 border-2 border-dashed border-surface-300 rounded">
            <i class="pi pi-plus text-2xl text-muted-color mb-2"></i>
            <p class="text-muted-color">
              Aucun service ajouté. Cliquez sur "Ajouter un service" pour commencer.
            </p>
          </div>
        </div>

        <!-- Totaux de la facture -->
        <div v-if="invoiceItems.length > 0" class="border-t pt-4">
          <div class="flex justify-end">
            <div class="w-80 space-y-2">
              <div class="flex justify-between">
                <span>Sous-total :</span>
                <span>€{{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span>TVA ({{ currentTaxRate }}%) :</span>
                <span>€{{ taxAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total TTC :</span>
                <span>€{{ totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes et conditions de paiement -->
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
              <label for="payment_terms">Conditions de paiement</label>
            </FloatLabel>
            <Message v-if="$form.payment_terms?.invalid" severity="error" size="small">
              {{ $form.payment_terms.error?.message }}
            </Message>
          </div>
        </div>

        <!-- Actions du formulaire - Masquer sur mobile car dans le header -->
        <div :class="isMobile ? 'hidden' : 'flex justify-end gap-2 pt-4 border-t'">
          <Button
            type="button"
            label="Annuler"
            severity="secondary"
            outlined
            @click="$emit('cancel')"
          />
          <Button
            type="submit"
            :label="isEditing ? 'Modifier la facture' : 'Créer la facture'"
            :loading="loading"
            icon="pi pi-check"
          />
        </div>
      </Form>

      <!-- Dialogue d'ajout de type de service -->
      <Dialog
        v-model:visible="showAddServiceDialog"
        header="Ajouter un nouveau type de service"
        modal
        class="w-full max-w-md"
        :closable="true"
      >
        <ServiceTypeForm @save="onServiceTypeSaved" @cancel="closeAddServiceDialog" />
      </Dialog>
    </div>

    <!-- Zone de sécurité mobile pour éviter que les boutons soient cachés -->
    <div v-if="isMobile" class="mobile-safe-area"></div>
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
      isMobile: false,

      customers: [],
      serviceTypes: [],
      invoiceItems: [],
      currentTaxRate: 21.0,

      // Variables locales pour les dates (fix timezone)
      invoiceDateLocal: null,
      dueDateLocal: null,

      statusOptions: [
        { label: "Brouillon", value: "draft" },
        { label: "Envoyée", value: "sent" },
        { label: "Payée", value: "paid" },
        { label: "Annulée", value: "cancelled" },
      ],

      // Services instances
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
        payment_terms: "Paiement dû dans les 30 jours",
      };

      if (this.invoice) {
        Object.keys(baseValues).forEach((key) => {
          const value = this.invoice[key];
          if (value !== undefined && value !== null) {
            if (key === "invoice_date" || key === "due_date") {
              baseValues[key] = this.convertToLocalDate(value);
            } else {
              baseValues[key] = value;
            }
          }
        });

        this.currentTaxRate = this.invoice.tax_rate || 21.0;

        if (this.invoice.invoice_items) {
          this.invoiceItems = this.invoice.invoice_items.map((item) => ({
            ...item,
            service_date: item.service_date ? this.convertToLocalDate(item.service_date) : null,
          }));
        }

        // Initialiser les dates locales
        this.invoiceDateLocal = baseValues.invoice_date;
        this.dueDateLocal = baseValues.due_date;
      } else {
        // Pour un nouveau formulaire
        this.invoiceDateLocal = now;
        this.dueDateLocal = dueDate;
      }

      return baseValues;
    },

    resolver() {
      return zodResolver(
        z
          .object({
            customer_id: z.string().min(1, { message: "Le client est obligatoire" }),
            invoice_date: z.date({ required_error: "La date de facture est obligatoire" }),
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
              message: "La date d'échéance doit être postérieure à la date de facture",
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
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },

  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },

    // Méthode pour soumettre depuis le header mobile
    submitForm() {
      if (this.$refs.invoiceForm) {
        // Déclencher la soumission du formulaire
        const form = this.$refs.invoiceForm.$el;
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    },

    async loadCustomers() {
      this.customersLoading = true;
      try {
        this.customers = await this.invoicesService.getCustomersForInvoice();
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        this.showToast("error", "Erreur", "Échec du chargement des clients");
      } finally {
        this.customersLoading = false;
      }
    },

    async loadServiceTypes() {
      this.serviceTypesLoading = true;
      try {
        this.serviceTypes = await this.serviceTypesService.getServiceTypes();
      } catch (error) {
        console.error("Erreur lors du chargement des types de services:", error);
        this.showToast("error", "Erreur", "Échec du chargement des types de services");
      } finally {
        this.serviceTypesLoading = false;
      }
    },

    /**
     * Convertit une date en date locale sans décalage timezone
     */
    convertToLocalDate(date) {
      if (!date) return null;

      // Si c'est déjà un objet Date, créer une nouvelle date locale
      if (date instanceof Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }

      // Si c'est une string, la parser correctement
      if (typeof date === "string") {
        const parts = date.split("-");
        if (parts.length === 3) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
      }

      return date;
    },

    /**
     * Convertit une date locale en format ISO string (YYYY-MM-DD)
     */
    convertToISODateString(date) {
      if (!date) return null;

      // Assurer qu'on a un objet Date
      const dateObj = date instanceof Date ? date : new Date(date);

      // Utiliser les méthodes locales pour éviter les problèmes de timezone
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },

    /**
     * Gestion du changement de date de facture
     */
    onInvoiceDateChange(newDate) {
      console.log("Date de facture changée:", newDate);
      this.invoiceDateLocal = this.convertToLocalDate(newDate);

      // Auto-calculer la due date (30 jours après)
      if (this.invoiceDateLocal && !this.dueDateLocal) {
        const dueDate = new Date(this.invoiceDateLocal);
        dueDate.setDate(dueDate.getDate() + 30);
        this.dueDateLocal = dueDate;
      }
    },

    /**
     * Gestion du changement de date d'échéance
     */
    onDueDateChange(newDate) {
      console.log("Date d'échéance changée:", newDate);
      this.dueDateLocal = this.convertToLocalDate(newDate);
    },

    /**
     * Gestion du changement de date de service pour un service
     */
    onServiceDateChange(index, newDate) {
      this.invoiceItems[index].service_date = this.convertToLocalDate(newDate);
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
      const unitPrice = parseFloat(item.unit_price) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      item.total_price = unitPrice * quantity;
    },

    onTaxRateChange(value) {
      // Extraction de la valeur numérique seulement
      const numericValue =
        typeof value === "object" && value !== null
          ? value.value !== undefined
            ? value.value
            : parseFloat(value.formattedValue || 0)
          : parseFloat(value) || 0;

      this.currentTaxRate = numericValue;
      console.log("Taux de TVA changé à:", this.currentTaxRate);
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
      this.showToast("success", "Succès", "Type de service ajouté avec succès");
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

    translatePricingType(pricingType) {
      const translations = {
        hourly: "horaire",
        fixed: "fixe",
        monthly: "mensuel",
      };
      return translations[pricingType] || pricingType;
    },

    translateCategory(category) {
      const translations = {
        individual_lesson: "leçon individuelle",
        corporate_service: "service d'entreprise",
        monthly_contract: "contrat mensuel",
      };
      return translations[category] || category;
    },

    prepareInvoiceData(formValues) {
      const invoiceData = {
        ...formValues,
        // Utiliser les dates locales converties au lieu des dates du formulaire
        invoice_date: this.convertToISODateString(this.invoiceDateLocal || formValues.invoice_date),
        due_date: this.convertToISODateString(this.dueDateLocal || formValues.due_date),
        tax_rate: parseFloat(this.currentTaxRate) || 21.0,
      };

      const itemsData = this.invoiceItems.map((item) => ({
        ...item,
        service_date: item.service_date ? this.convertToISODateString(item.service_date) : null,
        unit_price: parseFloat(item.unit_price) || 0,
        quantity: parseFloat(item.quantity) || 0,
        total_price: parseFloat(item.total_price) || 0,
      }));

      console.log("Données de facture préparées:", invoiceData);
      return { invoice: invoiceData, items: itemsData };
    },

    validateItems() {
      if (this.invoiceItems.length === 0) {
        this.showToast("warn", "Attention", "Veuillez ajouter au moins un service à la facture");
        return false;
      }

      const itemErrors = [];
      this.invoiceItems.forEach((item, index) => {
        if (!item.description || item.description.trim() === "") {
          itemErrors.push(`Service ${index + 1} : La description est obligatoire`);
        }
        if (!item.unit_price || item.unit_price <= 0) {
          itemErrors.push(`Service ${index + 1} : Un prix unitaire valide est obligatoire`);
        }
        if (!item.quantity || item.quantity <= 0) {
          itemErrors.push(`Service ${index + 1} : Une quantité valide est obligatoire`);
        }
      });

      if (itemErrors.length > 0) {
        this.showToast("error", "Erreur de validation", itemErrors.join(", "));
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
        console.error("Erreur de soumission du formulaire:", error);
        this.showToast(
          "error",
          "Erreur",
          "Une erreur s'est produite lors de la sauvegarde de la facture"
        );
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

<style scoped>
/* Header flottant mobile avec ombre et backdrop blur */
@media (max-width: 768px) {
  .sticky.top-0 {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.95);
  }

  /* Amélioration des cibles tactiles sur mobile */
  .p-button {
    min-height: 48px;
    font-size: 16px; /* Empêcher le zoom sur iOS */
  }

  .p-button-sm {
    min-height: 40px;
    font-size: 14px;
  }

  /* Amélioration des champs de saisie pour mobile */
  .p-inputtext,
  .p-textarea,
  .p-inputnumber-input,
  .p-datepicker-input {
    min-height: 48px;
    font-size: 16px; /* Empêcher le zoom sur iOS */
  }

  /* Zone de sécurité mobile pour éviter que le contenu soit caché */
  .mobile-safe-area {
    height: 80px; /* Espace pour la barre d'URL mobile */
    padding-bottom: env(safe-area-inset-bottom, 0px); /* Support iPhone avec notch */
  }

  /* Amélioration de l'espacement sur mobile */
  .gap-6 {
    gap: 1rem;
  }

  .gap-4 {
    gap: 0.75rem;
  }

  /* Amélioration du padding pour mobile */
  .p-4 {
    padding: 1rem;
  }

  /* Select et dropdown améliorés pour mobile */
  .p-select {
    min-height: 48px;
  }

  .p-select .p-select-label {
    padding: 0.75rem;
    font-size: 16px;
  }

  /* DatePicker amélioré pour mobile */
  .p-datepicker-input {
    padding: 0.75rem;
  }

  /* Amélioration des messages d'erreur */
  .p-message {
    font-size: 14px;
    margin-top: 0.25rem;
  }

  /* Amélioration de la grille responsive */
  .grid.grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .grid.grid-cols-1.md\:grid-cols-4 {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  /* Amélioration des cards de services sur mobile */
  .border.rounded.p-4.bg-surface-50 {
    padding: 1rem;
    border-radius: 0.5rem;
  }

  /* État vide amélioré pour mobile */
  .text-center.py-8 {
    padding: 2rem 1rem;
  }

  /* Totaux de facture responsive */
  .w-80 {
    width: 100%;
    max-width: 20rem;
  }
}

/* Amélioration des transitions et animations */
.sticky.top-0 {
  transition: all 0.3s ease;
}

/* Focus states améliorés pour l'accessibilité */
.p-button:focus-visible,
.p-inputtext:focus-visible,
.p-textarea:focus-visible,
.p-select:focus-visible,
.p-datepicker:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Amélioration des hover states sur desktop */
@media (min-width: 769px) {
  .p-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .border.rounded.p-4.bg-surface-50:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
  }
}

/* Amélioration du scrolling sur mobile */
@media (max-width: 768px) {
  .relative {
    -webkit-overflow-scrolling: touch;
  }

  /* Amélioration des dialogues sur mobile */
  .p-dialog {
    margin: 0 !important;
    max-height: 100vh;
    border-radius: 0;
  }

  .p-dialog-content {
    padding: 0 !important;
  }
}

/* Support des nouvelles unités CSS viewport (Safari iOS 15.4+) */
@supports (height: 100dvh) {
  @media (max-width: 768px) {
    .mobile-safe-area {
      height: calc(100dvh - 100vh + 80px);
    }
  }
}

/* Support des zones sécurisées (iPhone avec notch) */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (max-width: 768px) {
    .mobile-safe-area {
      padding-bottom: calc(env(safe-area-inset-bottom) + 20px);
    }
  }
}

/* Amélioration de la lisibilité des textes */
.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

.text-muted-color {
  color: var(--p-surface-600);
}

/* Amélioration des icônes */
.pi {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .pi {
    font-size: 0.875rem;
  }
}

/* Amélioration des tags */
.p-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Amélioration des tooltips sur mobile */
@media (max-width: 768px) {
  .p-tooltip {
    font-size: 14px;
    padding: 0.5rem;
  }
}

/* Amélioration de la zone de drop pour les services */
.border-2.border-dashed {
  border-width: 2px;
  border-style: dashed;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.border-2.border-dashed:hover {
  border-color: var(--p-primary-color);
  background-color: var(--p-primary-50);
}

/* Amélioration des formulaires imbriqués */
.space-y-4 > * + * {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .space-y-4 > * + * {
    margin-top: 0.75rem;
  }
}

/* Amélioration des boutons de suppression */
.p-button[severity="danger"] {
  transition: all 0.2s ease;
}

.p-button[severity="danger"]:hover {
  transform: scale(1.05);
}

/* Amélioration de la section totaux */
.border-t.pt-4 {
  border-top: 1px solid var(--p-surface-200);
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .border-t.pt-4 {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .flex.justify-end {
    justify-content: center;
  }
}

/* Amélioration des labels flottants */
.p-floatlabel {
  position: relative;
}

.p-floatlabel label {
  transition: all 0.2s ease;
}

/* Responsive pour les très petits écrans */
@media (max-width: 480px) {
  .p-4 {
    padding: 0.75rem;
  }

  .sticky.top-0 {
    padding: 0.75rem;
    margin: -0.75rem -0.75rem 1rem -0.75rem;
  }

  .p-button-sm .px-3 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
