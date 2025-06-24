<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between p-6 pb-0">
        <h3 class="text-lg font-semibold text-primary">Invoice Settings</h3>
        <div class="flex items-center gap-2">
          <i class="pi pi-receipt text-primary"></i>
          <Button
            v-if="!isEditing"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            text
            @click="startEditing"
            v-tooltip.top="'Edit invoice settings'"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!-- Display Mode -->
      <div v-if="!isEditing" class="space-y-4">
        <div class="flex justify-between">
          <span class="text-muted-color font-medium">Default Tax Rate:</span>
          <span class="font-semibold">{{ profile?.default_tax_rate || 21 }}%</span>
        </div>
        <div v-if="profile?.default_payment_terms" class="flex justify-between">
          <span class="text-muted-color font-medium">Payment Terms:</span>
          <span class="text-right max-w-xs">{{ profile.default_payment_terms }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-color font-medium">Logo:</span>
          <span v-if="profile?.logo_url" class="text-green-600">
            <i class="pi pi-check mr-1"></i>Configured
          </span>
          <span v-else class="text-muted-color">Not configured</span>
        </div>

        <!-- Logo Preview -->
        <div v-if="profile?.logo_url" class="pt-3 border-t">
          <div class="text-sm text-muted-color mb-2">Current Logo:</div>
          <img :src="profile.logo_url" alt="Business logo" class="max-h-16 max-w-32 object-contain border rounded" />
        </div>

        <!-- Settings Summary -->
        <div class="pt-3 border-t">
          <div class="flex items-center gap-2">
            <i class="pi pi-info-circle text-blue-600"></i>
            <span class="text-sm text-blue-600">These settings will be used as defaults for new invoices</span>
          </div>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else>
        <Form
          v-slot="$form"
          :resolver="resolver"
          :initialValues="editData"
          @submit="onSubmit"
          class="space-y-4"
        >
          <!-- Default Tax Rate -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <InputNumber
                id="default_tax_rate"
                name="default_tax_rate"
                mode="decimal"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                :min="0"
                :max="100"
                suffix="%"
                fluid
                :invalid="$form.default_tax_rate?.invalid"
              />
              <label for="default_tax_rate">Default Tax Rate</label>
            </FloatLabel>
            <Message v-if="$form.default_tax_rate?.invalid" severity="error" size="small">
              {{ $form.default_tax_rate.error?.message }}
            </Message>
            <small class="text-muted-color">Standard VAT rate in Belgium is 21%</small>
          </div>

          <!-- Default Payment Terms -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <Textarea
                id="default_payment_terms"
                name="default_payment_terms"
                rows="3"
                fluid
                :invalid="$form.default_payment_terms?.invalid"
              />
              <label for="default_payment_terms">Default Payment Terms</label>
            </FloatLabel>
            <Message v-if="$form.default_payment_terms?.invalid" severity="error" size="small">
              {{ $form.default_payment_terms.error?.message }}
            </Message>
            <small class="text-muted-color">This text will appear on all your invoices by default</small>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              outlined
              @click="cancelEditing"
            />
            <Button
              type="submit"
              label="Save Changes"
              :loading="saving"
              icon="pi pi-check"
            />
          </div>
        </Form>
      </div>
    </template>
  </Card>
</template>

<script>
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";

export default {
  name: "InvoiceSettingsCard",

  props: {
    profile: {
      type: Object,
      default: null,
    },
  },

  emits: ["update", "error"],

  data() {
    return {
      isEditing: false,
      saving: false,
      editData: {},
      currentLogoUrl: null,
    };
  },

  computed: {
    resolver() {
      return zodResolver(
        z.object({
          default_tax_rate: z.number().min(0).max(100).optional(),
          default_payment_terms: z.string().optional(),
          logo_url: z.string().url().optional().or(z.literal('')),
        })
      );
    },
  },

  watch: {
    'profile.logo_url': {
      immediate: true,
      handler(newUrl) {
        this.currentLogoUrl = newUrl;
      }
    }
  },

  methods: {
    startEditing() {
      this.isEditing = true;
      this.currentLogoUrl = this.profile?.logo_url;
      this.editData = {
        default_tax_rate: this.profile?.default_tax_rate || 21.00,
        default_payment_terms: this.profile?.default_payment_terms || 'Payment due within 30 days',
        logo_url: this.profile?.logo_url || '',
      };
    },

    cancelEditing() {
      this.isEditing = false;
      this.editData = {};
      this.currentLogoUrl = this.profile?.logo_url;
    },

    async onSubmit({ valid, values }) {
      if (!valid) return;

      this.saving = true;
      try {
        // Clean data
        const cleanedData = this.prepareData(values);

        // Emit update event to parent
        this.$emit('update', cleanedData);

        this.isEditing = false;
        this.editData = {};
      } catch (error) {
        this.$emit('error', error);
      } finally {
        this.saving = false;
      }
    },

    prepareData(values) {
      const cleaned = { ...values };

      // Convert empty strings to null for optional fields
      if (cleaned.default_payment_terms === '' || cleaned.default_payment_terms === undefined) {
        cleaned.default_payment_terms = 'Payment due within 30 days';
      }

      if (cleaned.logo_url === '' || cleaned.logo_url === undefined) {
        cleaned.logo_url = null;
      }

      if (!cleaned.default_tax_rate) {
        cleaned.default_tax_rate = 21.00;
      }

      return cleaned;
    },

    onLogoSelect(event) {
      // TODO: Implement file upload to Supabase Storage
      console.log('Logo selected:', event.files[0]);
      this.$toast.add({
        severity: 'info',
        summary: 'Upload Not Available',
        detail: 'Logo upload functionality will be available in a future update',
        life: 4000
      });
    },

    onLogoError(event) {
      console.error('Logo upload error:', event);
      this.$toast.add({
        severity: 'error',
        summary: 'Upload Error',
        detail: 'Failed to upload logo. Please try again.',
        life: 5000
      });
    },

    onLogoUrlChange(event) {
      const url = event.target.value;
      if (url && this.isValidUrl(url)) {
        this.currentLogoUrl = url;
      } else if (!url) {
        this.currentLogoUrl = null;
      }
    },

    removeLogo() {
      this.currentLogoUrl = null;
      this.editData.logo_url = '';
    },

    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    },
  },
};
</script>
