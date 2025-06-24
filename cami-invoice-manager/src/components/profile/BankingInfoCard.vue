<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between p-6 pb-0">
        <h3 class="text-lg font-semibold text-primary">Banking Information</h3>
        <div class="flex items-center gap-2">
          <i class="pi pi-credit-card text-primary"></i>
          <Button
            v-if="!isEditing"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            text
            @click="startEditing"
            v-tooltip.top="'Edit banking information'"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!-- Display Mode -->
      <div v-if="!isEditing" class="space-y-4">
        <div v-if="profile?.bank_name" class="flex justify-between">
          <span class="text-muted-color font-medium">Bank Name:</span>
          <span>{{ profile.bank_name }}</span>
        </div>
        <div v-if="profile?.iban" class="flex justify-between">
          <span class="text-muted-color font-medium">IBAN:</span>
          <span class="font-mono text-sm">{{ formatIBAN(profile.iban) }}</span>
        </div>
        <div v-if="profile?.bic" class="flex justify-between">
          <span class="text-muted-color font-medium">BIC/SWIFT:</span>
          <span class="font-mono">{{ profile.bic }}</span>
        </div>

        <!-- Banking completeness indicator -->
        <div v-if="hasBankingInfo" class="pt-3 border-t">
          <div class="flex items-center gap-2">
            <i class="pi pi-check-circle text-green-600"></i>
            <span class="text-sm text-green-600 font-medium">Banking information complete</span>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!hasBankingInfo" class="text-center py-6 text-muted-color">
          <i class="pi pi-credit-card text-2xl mb-2 block"></i>
          <p class="mb-3">No banking information configured</p>
          <Button
            label="Add Banking Info"
            icon="pi pi-plus"
            size="small"
            @click="startEditing"
          />
          <div class="mt-3">
            <Message severity="info" variant="outlined">
              <template #messageicon>
                <i class="pi pi-info-circle"></i>
              </template>
              <div class="text-sm">
                Add your banking details to include payment information on invoices
              </div>
            </Message>
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
          <!-- Bank Name -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <InputText
                id="bank_name"
                name="bank_name"
                fluid
                :invalid="$form.bank_name?.invalid"
              />
              <label for="bank_name">Bank Name</label>
            </FloatLabel>
            <Message v-if="$form.bank_name?.invalid" severity="error" size="small">
              {{ $form.bank_name.error?.message }}
            </Message>
          </div>

          <!-- IBAN -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <InputText
                id="iban"
                name="iban"
                placeholder="BE68 5390 0754 7034"
                fluid
                :invalid="$form.iban?.invalid"
                class="font-mono"
              />
              <label for="iban">IBAN</label>
            </FloatLabel>
            <Message v-if="$form.iban?.invalid" severity="error" size="small">
              {{ $form.iban.error?.message }}
            </Message>
            <small class="text-muted-color">International Bank Account Number</small>
          </div>

          <!-- BIC -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <InputText
                id="bic"
                name="bic"
                placeholder="KREDBEBB"
                fluid
                :invalid="$form.bic?.invalid"
                class="font-mono"
              />
              <label for="bic">BIC/SWIFT Code</label>
            </FloatLabel>
            <Message v-if="$form.bic?.invalid" severity="error" size="small">
              {{ $form.bic.error?.message }}
            </Message>
            <small class="text-muted-color">Bank Identifier Code</small>
          </div>

          <!-- Info Message -->
          <Message severity="info" variant="outlined">
            <template #messageicon>
              <i class="pi pi-info-circle"></i>
            </template>
            <div class="text-sm">
              <strong>Banking Information:</strong> This information will appear on your invoices
              for payment processing. All fields are optional but recommended for professional invoicing.
            </div>
          </Message>

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
  name: "BankingInfoCard",

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
    };
  },

  computed: {
    hasBankingInfo() {
      return this.profile?.bank_name || this.profile?.iban || this.profile?.bic;
    },

    resolver() {
      return zodResolver(
        z.object({
          bank_name: z.string().optional(),

          iban: z.string().optional().refine((val) => {
            if (!val || val.trim() === '') return true
            const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/
            return ibanRegex.test(val.replace(/\s/g, '').toUpperCase())
          }, { message: 'Please enter a valid IBAN' }),

          bic: z.string().optional().refine((val) => {
            if (!val || val.trim() === '') return true
            const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
            return bicRegex.test(val.replace(/\s/g, '').toUpperCase())
          }, { message: 'Please enter a valid BIC/SWIFT code' }),
        })
      );
    },
  },

  methods: {
    startEditing() {
      this.isEditing = true;
      this.editData = {
        bank_name: this.profile?.bank_name || '',
        iban: this.profile?.iban || '',
        bic: this.profile?.bic || '',
      };
    },

    cancelEditing() {
      this.isEditing = false;
      this.editData = {};
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
      Object.keys(cleaned).forEach(field => {
        if (cleaned[field] === '' || cleaned[field] === undefined) {
          cleaned[field] = null;
        }
      });

      // Format IBAN and BIC to uppercase without spaces
      if (cleaned.iban) {
        cleaned.iban = cleaned.iban.replace(/\s/g, '').toUpperCase();
      }

      if (cleaned.bic) {
        cleaned.bic = cleaned.bic.replace(/\s/g, '').toUpperCase();
      }

      return cleaned;
    },

    formatIBAN(iban) {
      if (!iban) return '';
      // Format IBAN with spaces every 4 characters
      return iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    },
  },
};
</script>
