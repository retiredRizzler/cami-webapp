<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between p-6 pb-0">
        <h3 class="text-lg font-semibold text-primary">Business Information</h3>
        <div class="flex items-center gap-2">
          <i class="pi pi-building text-primary"></i>
          <Button
            v-if="!isEditing"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            text
            @click="startEditing"
            v-tooltip.top="'Edit business information'"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!-- Display Mode -->
      <div v-if="!isEditing" class="space-y-4">
        <div v-if="profile?.business_name" class="flex justify-between">
          <span class="text-muted-color font-medium">Business Name:</span>
          <span class="font-semibold">{{ profile.business_name }}</span>
        </div>
        <div v-if="profile?.first_name || profile?.last_name" class="flex justify-between">
          <span class="text-muted-color font-medium">Owner:</span>
          <span>{{ profile.first_name }} {{ profile.last_name }}</span>
        </div>
        <div v-if="profile?.email" class="flex justify-between">
          <span class="text-muted-color font-medium">Email:</span>
          <span>{{ profile.email }}</span>
        </div>
        <div v-if="profile?.phone" class="flex justify-between">
          <span class="text-muted-color font-medium">Phone:</span>
          <span>{{ profile.phone }}</span>
        </div>
        <div v-if="profile?.vat_number" class="flex justify-between">
          <span class="text-muted-color font-medium">VAT Number:</span>
          <span>{{ profile.vat_number }}</span>
        </div>
        <div v-if="profile?.license_number" class="flex justify-between">
          <span class="text-muted-color font-medium">License Number:</span>
          <span>{{ profile.license_number }}</span>
        </div>

        <!-- Empty state for new profiles -->
        <div v-if="!profile" class="text-center py-6 text-muted-color">
          <i class="pi pi-building text-2xl mb-2 block"></i>
          <p class="mb-3">No business information configured</p>
          <Button
            label="Add Business Info"
            icon="pi pi-plus"
            size="small"
            @click="startEditing"
          />
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
          <!-- Business Name -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <InputText
                id="business_name"
                name="business_name"
                fluid
                :invalid="$form.business_name?.invalid"
              />
              <label for="business_name">Business/School Name *</label>
            </FloatLabel>
            <Message v-if="$form.business_name?.invalid" severity="error" size="small">
              {{ $form.business_name.error?.message }}
            </Message>
          </div>

          <!-- Name Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="first_name"
                  name="first_name"
                  fluid
                  :invalid="$form.first_name?.invalid"
                />
                <label for="first_name">First Name *</label>
              </FloatLabel>
              <Message v-if="$form.first_name?.invalid" severity="error" size="small">
                {{ $form.first_name.error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="last_name"
                  name="last_name"
                  fluid
                  :invalid="$form.last_name?.invalid"
                />
                <label for="last_name">Last Name *</label>
              </FloatLabel>
              <Message v-if="$form.last_name?.invalid" severity="error" size="small">
                {{ $form.last_name.error?.message }}
              </Message>
            </div>
          </div>

          <!-- Contact Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="email"
                  name="email"
                  type="email"
                  fluid
                  :invalid="$form.email?.invalid"
                />
                <label for="email">Email Address *</label>
              </FloatLabel>
              <Message v-if="$form.email?.invalid" severity="error" size="small">
                {{ $form.email.error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="phone"
                  name="phone"
                  fluid
                  :invalid="$form.phone?.invalid"
                />
                <label for="phone">Phone Number</label>
              </FloatLabel>
              <Message v-if="$form.phone?.invalid" severity="error" size="small">
                {{ $form.phone.error?.message }}
              </Message>
            </div>
          </div>

          <!-- Professional Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="vat_number"
                  name="vat_number"
                  placeholder="BE0123456789"
                  fluid
                  :invalid="$form.vat_number?.invalid"
                />
                <label for="vat_number">VAT Number</label>
              </FloatLabel>
              <Message v-if="$form.vat_number?.invalid" severity="error" size="small">
                {{ $form.vat_number.error?.message }}
              </Message>
              <small class="text-muted-color">Format: BE followed by 10 digits</small>
            </div>

            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="license_number"
                  name="license_number"
                  fluid
                  :invalid="$form.license_number?.invalid"
                />
                <label for="license_number">Instructor License</label>
              </FloatLabel>
              <Message v-if="$form.license_number?.invalid" severity="error" size="small">
                {{ $form.license_number.error?.message }}
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
  name: "BusinessInfoCard",

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
    resolver() {
      return zodResolver(
        z.object({
          business_name: z.string().min(1, { message: 'Business name is required' }),
          first_name: z.string().min(1, { message: 'First name is required' }),
          last_name: z.string().min(1, { message: 'Last name is required' }),
          email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' }),

          phone: z.string().optional().refine((val) => {
            if (!val || val.trim() === '') return true
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/
            return phoneRegex.test(val)
          }, { message: 'Please enter a valid phone number' }),

          vat_number: z.string().optional().refine((val) => {
            if (!val || val.trim() === '') return true
            const vatRegex = /^BE[0-9]{10}$/
            return vatRegex.test(val.replace(/\s/g, '').toUpperCase())
          }, { message: 'Belgian VAT format: BE followed by 10 digits' }),

          license_number: z.string().optional(),
        })
      );
    },
  },

  methods: {
    startEditing() {
      this.isEditing = true;
      this.editData = {
        business_name: this.profile?.business_name || '',
        first_name: this.profile?.first_name || '',
        last_name: this.profile?.last_name || '',
        email: this.profile?.email || '',
        phone: this.profile?.phone || '',
        vat_number: this.profile?.vat_number || '',
        license_number: this.profile?.license_number || '',
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
      ['phone', 'vat_number', 'license_number'].forEach(field => {
        if (cleaned[field] === '' || cleaned[field] === undefined) {
          cleaned[field] = null;
        }
      });

      // Format VAT number
      if (cleaned.vat_number) {
        cleaned.vat_number = cleaned.vat_number.replace(/\s/g, '').toUpperCase();
      }

      return cleaned;
    },
  },
};
</script>
