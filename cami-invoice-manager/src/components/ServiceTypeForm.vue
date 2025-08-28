<template>
  <div class="p-4 sm:p-6">
    <!-- Form Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-surface-900 mb-2">
        {{ serviceType ? 'Modifier le type de service' : 'Nouveau type de service' }}
      </h3>
      <p class="text-sm text-surface-600">
        {{ serviceType
          ? 'Modifiez les informations de ce type de service'
          : 'Créez un nouveau type de service pour vos factures'
        }}
      </p>
    </div>

    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4"
    >
      <!-- Service Name -->
      <div class="flex flex-col gap-1">
        <FloatLabel variant="on">
          <InputText
            id="name"
            name="name"
            fluid
            :invalid="$form.name?.invalid"
            :disabled="loading"
          />
          <label for="name">Nom du service *</label>
        </FloatLabel>
        <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <FloatLabel variant="on">
          <Textarea
            id="description"
            name="description"
            rows="3"
            fluid
            :invalid="$form.description?.invalid"
            :disabled="loading"
          />
          <label for="description">Description</label>
        </FloatLabel>
        <Message v-if="$form.description?.invalid" severity="error" size="small" variant="simple">
          {{ $form.description.error?.message }}
        </Message>
      </div>

      <!-- Category and Pricing Type -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <Select
              id="category"
              name="category"
              :options="categoryOptions"
              optionLabel="label"
              optionValue="value"
              fluid
              :invalid="$form.category?.invalid"
              :disabled="loading"
            />
            <label for="category">Catégorie *</label>
          </FloatLabel>
          <Message v-if="$form.category?.invalid" severity="error" size="small" variant="simple">
            {{ $form.category.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <Select
              id="pricing_type"
              name="pricing_type"
              :options="pricingTypeOptions"
              optionLabel="label"
              optionValue="value"
              fluid
              :invalid="$form.pricing_type?.invalid"
              :disabled="loading"
            />
            <label for="pricing_type">Type de tarification *</label>
          </FloatLabel>
          <Message v-if="$form.pricing_type?.invalid" severity="error" size="small" variant="simple">
            {{ $form.pricing_type.error?.message }}
          </Message>
        </div>
      </div>

      <!-- Unit Price and Duration -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <InputNumber
              id="unit_price"
              name="unit_price"
              mode="currency"
              currency="EUR"
              locale="fr-FR"
              fluid
              :invalid="$form.unit_price?.invalid"
              :disabled="loading"
              :allowEmpty="false"
            />
            <label for="unit_price">Prix unitaire *</label>
          </FloatLabel>
          <Message v-if="$form.unit_price?.invalid" severity="error" size="small" variant="simple">
            {{ $form.unit_price.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <InputNumber
              id="default_duration_hours"
              name="default_duration_hours"
              mode="decimal"
              :minFractionDigits="1"
              :maxFractionDigits="2"
              :min="0"
              :step="0.5"
              suffix=" h"
              showButtons
              fluid
              :invalid="$form.default_duration_hours?.invalid"
              :disabled="loading"
              :allowEmpty="true"
              placeholder="1,0 h"
            />
            <label for="default_duration_hours">Durée par défaut</label>
          </FloatLabel>
          <Message v-if="$form.default_duration_hours?.invalid" severity="error" size="small" variant="simple">
            {{ $form.default_duration_hours.error?.message }}
          </Message>
          <small class="text-xs text-surface-500 mt-1">
            Laissez vide pour une durée flexible
          </small>
        </div>
      </div>

      <!-- Recurring Option -->
      <div class="flex items-center gap-3 p-4 bg-surface-50 rounded-lg">
        <Checkbox
          id="is_recurring"
          name="is_recurring"
          binary
          :disabled="loading"
        />
        <div class="flex-1">
          <label for="is_recurring" class="text-sm font-medium cursor-pointer">
            Service récurrent
          </label>
          <p class="text-xs text-surface-600 mt-1">
            Cochez si ce service se répète régulièrement (ex: cours mensuels)
          </p>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          label="Annuler"
          severity="secondary"
          outlined
          @click="handleCancel"
          :disabled="loading"
          class="order-2 sm:order-1"
        />
        <Button
          type="submit"
          :label="serviceType ? 'Modifier le service' : 'Créer le service'"
          :loading="loading"
          icon="pi pi-check"
          class="order-1 sm:order-2"
        />
      </div>
    </Form>

    <!-- Loading Overlay for mobile -->
    <div v-if="loading && isMobile" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg text-center">
        <ProgressSpinner strokeWidth="3" />
        <div class="mt-3 text-sm font-medium">
          {{ serviceType ? 'Modification en cours...' : 'Création en cours...' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { ServiceTypesService } from '@/services/ServiceTypesService.js';
import { useAuthStore } from '@/stores/AuthStore.js';
import { mapStores } from 'pinia';

export default {
  name: "ServiceTypeForm",

  props: {
    serviceType: {
      type: Object,
      default: null
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },

  emits: ["save", "cancel", "error"],

  computed: {
    ...mapStores(useAuthStore),

    initialValues() {
      if (this.serviceType) {
        return {
          name: this.serviceType.name || "",
          description: this.serviceType.description || "",
          category: this.serviceType.category || "individual_lesson",
          pricing_type: this.serviceType.pricing_type || "hourly",
          unit_price: parseFloat(this.serviceType.unit_price) || 45.00,
          default_duration_hours: this.serviceType.default_duration_hours ? parseFloat(this.serviceType.default_duration_hours) : 1.0,
          is_recurring: Boolean(this.serviceType.is_recurring) || false
        };
      }

      return {
        name: "",
        description: "",
        category: "individual_lesson",
        pricing_type: "hourly",
        unit_price: 45.00,
        default_duration_hours: 1.0,
        is_recurring: false
      };
    },

    resolver() {
      return zodResolver(
        z.object({
          name: z.string()
            .min(1, { message: 'Le nom du service est obligatoire' })
            .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' }),
          description: z.string()
            .max(500, { message: 'La description ne peut pas dépasser 500 caractères' })
            .optional(),
          category: z.enum(['individual_lesson', 'corporate_service', 'monthly_contract'], {
            errorMap: () => ({ message: 'Veuillez sélectionner une catégorie' })
          }),
          pricing_type: z.enum(['hourly', 'fixed', 'monthly'], {
            errorMap: () => ({ message: 'Veuillez sélectionner un type de tarification' })
          }),
          unit_price: z.coerce.number()
            .min(0.01, { message: 'Le prix doit être supérieur à 0' })
            .max(9999.99, { message: 'Le prix ne peut pas dépasser 9999,99 €' }),
          default_duration_hours: z.coerce.number()
            .min(0, { message: 'La durée ne peut pas être négative' })
            .max(24, { message: 'La durée ne peut pas dépasser 24 heures' })
            .nullable()
            .optional(),
          is_recurring: z.boolean().optional()
        })
      );
    },

    isMobile() {
      return window.innerWidth < 768;
    }
  },

  data() {
    return {
      loading: false,

      categoryOptions: [
        {
          label: "Leçon individuelle",
          value: "individual_lesson"
        },
        {
          label: "Service d'entreprise",
          value: "corporate_service"
        },
        {
          label: "Contrat mensuel",
          value: "monthly_contract"
        }
      ],

      pricingTypeOptions: [
        {
          label: "Horaire",
          value: "hourly"
        },
        {
          label: "Prix fixe",
          value: "fixed"
        },
        {
          label: "Mensuel",
          value: "monthly"
        }
      ],

      // Service instance
      serviceTypesService: new ServiceTypesService()
    };
  },

  methods: {
    async onFormSubmit({ valid, values }) {
      if (!valid) {
        this.showValidationToast();
        return;
      }

      // Authentication check
      if (!this.authStore.user) {
        this.showAuthenticationError();
        return;
      }

      this.loading = true;

      try {
        let result;
        const cleanedValues = this.prepareDataForSubmission(values);

        if (this.isEditing && this.serviceType) {
          result = await this.serviceTypesService.updateServiceType(
            this.serviceType.id,
            cleanedValues
          );

          this.showSuccessToast('Service modifié avec succès');
        } else {
          result = await this.serviceTypesService.createServiceType(
            cleanedValues,
            this.authStore.user.id
          );

          this.showSuccessToast('Service créé avec succès');
        }

        this.$emit("save", result);

      } catch (error) {
        console.error("Error saving service type:", error);
        this.handleSubmissionError(error);
        this.$emit("error", error);
      } finally {
        this.loading = false;
      }
    },

    prepareDataForSubmission(values) {
      const cleaned = { ...values };

      // Handle optional fields
      if (!cleaned.description || cleaned.description.trim() === '') {
        cleaned.description = null;
      } else {
        cleaned.description = cleaned.description.trim();
      }

      if (!cleaned.default_duration_hours || cleaned.default_duration_hours === 0) {
        cleaned.default_duration_hours = null;
      }

      // Ensure numeric values are properly formatted
      cleaned.unit_price = Math.round(cleaned.unit_price * 100) / 100;

      if (cleaned.default_duration_hours) {
        cleaned.default_duration_hours = Math.round(cleaned.default_duration_hours * 100) / 100;
      }

      return cleaned;
    },

    handleCancel() {
      if (this.loading) return;
      this.$emit("cancel");
    },

    // Toast notification methods
    showValidationToast() {
      this.$toast.add({
        severity: "warn",
        summary: "Formulaire invalide",
        detail: "Veuillez corriger les erreurs avant de continuer",
        life: 4000,
      });
    },

    showAuthenticationError() {
      this.$toast.add({
        severity: "error",
        summary: "Erreur d'authentification",
        detail: "Veuillez vous reconnecter pour créer un type de service",
        life: 5000,
      });
    },

    showSuccessToast(message) {
      this.$toast.add({
        severity: "success",
        summary: "Succès",
        detail: message,
        life: 3000,
      });
    },

    handleSubmissionError(error) {
      let errorMessage = "Une erreur inattendue s'est produite";

      if (error.message) {
        if (error.message.includes('validation')) {
          errorMessage = "Erreur de validation des données";
        } else if (error.message.includes('duplicate')) {
          errorMessage = "Un service avec ce nom existe déjà";
        } else if (error.message.includes('network')) {
          errorMessage = "Erreur de connexion. Vérifiez votre internet.";
        } else if (error.message.includes('unauthorized')) {
          errorMessage = "Vous n'êtes pas autorisé à effectuer cette action";
        } else {
          errorMessage = error.message;
        }
      }

      this.$toast.add({
        severity: "error",
        summary: this.isEditing ? "Erreur de modification" : "Erreur de création",
        detail: errorMessage,
        life: 6000,
      });
    }
  },

  mounted() {
    // Handle window resize for mobile detection
    this.handleResize = () => {
      this.$forceUpdate();
    };
    window.addEventListener('resize', this.handleResize);
  },

  unmounted() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
  }
}
</script>

<style scoped>
/* Enhanced mobile styles */
@media (max-width: 768px) {
  .p-button {
    min-height: 44px;
    font-size: 16px;
  }

  .p-inputtext,
  .p-inputnumber-input,
  .p-select-label {
    min-height: 44px;
    font-size: 16px;
  }

  .p-textarea {
    font-size: 16px;
  }
}

/* Loading overlay for mobile */
.fixed.inset-0 {
  z-index: 9999;
}

/* Improved form spacing on mobile */
@media (max-width: 640px) {
  .grid.grid-cols-1.md\:grid-cols-2.gap-4 {
    gap: 1rem;
  }
}

/* Better visual hierarchy */
.p-message {
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Enhanced checkbox area */
.bg-surface-50 {
  border: 1px solid var(--p-surface-200);
  transition: background-color 0.2s ease;
}

.bg-surface-50:hover {
  background-color: var(--p-surface-100);
}

/* Focus states for accessibility */
.p-checkbox:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

.p-button:focus-visible,
.p-inputtext:focus-visible,
.p-select:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}
</style>
