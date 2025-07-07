<template>
  <div class="p-4">
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
          />
          <label for="name">Nom du service *</label>
        </FloatLabel>
        <Message v-if="$form.name?.invalid" severity="error" size="small">
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <FloatLabel variant="on">
          <Textarea
            id="description"
            name="description"
            rows="2"
            fluid
            :invalid="$form.description?.invalid"
          />
          <label for="description">Description</label>
        </FloatLabel>
        <Message v-if="$form.description?.invalid" severity="error" size="small">
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
            />
            <label for="category">Catégorie *</label>
          </FloatLabel>
          <Message v-if="$form.category?.invalid" severity="error" size="small">
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
            />
            <label for="pricing_type">Pricing Type *</label>
          </FloatLabel>
          <Message v-if="$form.pricing_type?.invalid" severity="error" size="small">
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
              showButtons
              :min="0"
              fluid
              :invalid="$form.unit_price?.invalid"
            />
            <label for="unit_price">Unit Price *</label>
          </FloatLabel>
          <Message v-if="$form.unit_price?.invalid" severity="error" size="small">
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
              suffix="h"
              showButtons
              fluid
              :invalid="$form.default_duration_hours?.invalid"
            />
            <label for="default_duration_hours">Default Duration</label>
          </FloatLabel>
          <Message v-if="$form.default_duration_hours?.invalid" severity="error" size="small">
            {{ $form.default_duration_hours.error?.message }}
          </Message>
        </div>
      </div>

      <!-- Recurring Option -->
      <div class="flex items-center gap-2">
        <Checkbox
          id="is_recurring"
          name="is_recurring"
          binary
        />
        <label for="is_recurring" class="text-sm">Service récurent</label>
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
          label="Add Service Type"
          :loading="loading"
          icon="pi pi-check"
        />
      </div>
    </Form>
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

  emits: ["save", "cancel"],

  computed: {
    ...mapStores(useAuthStore),

    initialValues() {
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
          name: z.string().min(1, { message: 'Service name is required' }),
          description: z.string().optional(),
          category: z.enum(['individual_lesson', 'corporate_service', 'monthly_contract'], {
            errorMap: () => ({ message: 'Please select a category' })
          }),
          pricing_type: z.enum(['hourly', 'fixed', 'monthly'], {
            errorMap: () => ({ message: 'Please select a pricing type' })
          }),
          unit_price: z.number().min(0.01, { message: 'Unit price must be greater than 0' }),
          default_duration_hours: z.number().min(0).optional(),
          is_recurring: z.boolean().optional()
        })
      );
    }
  },

  data() {
    return {
      loading: false,

      categoryOptions: [
        { label: "Leçon individuelle", value: "individual_lesson" },
        { label: "Service d'entreprise", value: "corporate_service" },
        { label: "Contrat mensuel", value: "monthly_contract" }
      ],

      pricingTypeOptions: [
        { label: "Horaire", value: "hourly" },
        { label: "Prix Fixe", value: "fixed" },
        { label: "Mensuel", value: "monthly" }
      ],

      // Service instance
      serviceTypesService: new ServiceTypesService()
    };
  },

  methods: {
    async onFormSubmit({ valid, values }) {
      if (!valid) {
        return;
      }

      if (!this.authStore.user) {
        this.$toast.add({
          severity: "error",
          summary: "Authentication Error",
          detail: "Please log in to create service types",
          life: 5000,
        });
        return;
      }

      this.loading = true;

      try {
        const data = await this.serviceTypesService.createServiceType(values, this.authStore.user.id);
        this.$emit("save", data);
      } catch (error) {
        console.error("Error creating service type:", error);
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to create service type",
          life: 5000,
        });
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
