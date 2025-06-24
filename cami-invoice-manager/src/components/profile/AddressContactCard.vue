<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between p-6 pb-0">
        <h3 class="text-lg font-semibold text-primary">Address & Contact</h3>
        <div class="flex items-center gap-2">
          <i class="pi pi-map-marker text-primary"></i>
          <Button
            v-if="!isEditing"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            text
            @click="startEditing"
            v-tooltip.top="'Edit address and contact information'"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!-- Display Mode -->
      <div v-if="!isEditing" class="space-y-4">
        <div v-if="profile?.address" class="flex justify-between">
          <span class="text-muted-color font-medium">Address:</span>
          <span class="text-right max-w-xs">{{ profile.address }}</span>
        </div>
        <div v-if="profile?.city || profile?.postal_code" class="flex justify-between">
          <span class="text-muted-color font-medium">City:</span>
          <span>{{ profile.postal_code }} {{ profile.city }}</span>
        </div>
        <div v-if="profile?.country" class="flex justify-between">
          <span class="text-muted-color font-medium">Country:</span>
          <span>{{ profile.country }}</span>
        </div>

        <!-- Empty state -->
        <div v-if="!hasAddressInfo" class="text-center py-6 text-muted-color">
          <i class="pi pi-map-marker text-2xl mb-2 block"></i>
          <p class="mb-3">No address information configured</p>
          <Button
            label="Add Address"
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
          <!-- Address -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <Textarea
                id="address"
                name="address"
                rows="2"
                fluid
                :invalid="$form.address?.invalid"
              />
              <label for="address">Street Address</label>
            </FloatLabel>
            <Message v-if="$form.address?.invalid" severity="error" size="small">
              {{ $form.address.error?.message }}
            </Message>
          </div>

          <!-- City and Postal Code -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="city"
                  name="city"
                  fluid
                  :invalid="$form.city?.invalid"
                />
                <label for="city">City</label>
              </FloatLabel>
              <Message v-if="$form.city?.invalid" severity="error" size="small">
                {{ $form.city.error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText
                  id="postal_code"
                  name="postal_code"
                  fluid
                  :invalid="$form.postal_code?.invalid"
                />
                <label for="postal_code">Postal Code</label>
              </FloatLabel>
              <Message v-if="$form.postal_code?.invalid" severity="error" size="small">
                {{ $form.postal_code.error?.message }}
              </Message>
            </div>
          </div>

          <!-- Country -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <Select
                id="country"
                name="country"
                :options="countries"
                optionLabel="label"
                optionValue="value"
                fluid
                :invalid="$form.country?.invalid"
              />
              <label for="country">Country</label>
            </FloatLabel>
            <Message v-if="$form.country?.invalid" severity="error" size="small">
              {{ $form.country.error?.message }}
            </Message>
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
  name: "AddressContactCard",

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

      countries: [
        { label: "Belgium", value: "Belgium" },
        { label: "Netherlands", value: "Netherlands" },
        { label: "France", value: "France" },
        { label: "Germany", value: "Germany" },
        { label: "Luxembourg", value: "Luxembourg" },
        { label: "United Kingdom", value: "United Kingdom" },
        { label: "Other", value: "Other" },
      ],
    };
  },

  computed: {
    hasAddressInfo() {
      return this.profile?.address || this.profile?.city || this.profile?.postal_code || this.profile?.country;
    },

    resolver() {
      return zodResolver(
        z.object({
          address: z.string().optional(),
          city: z.string().optional(),
          postal_code: z.string().optional(),
          country: z.string().optional(),
        })
      );
    },
  },

  methods: {
    startEditing() {
      this.isEditing = true;
      this.editData = {
        address: this.profile?.address || '',
        city: this.profile?.city || '',
        postal_code: this.profile?.postal_code || '',
        country: this.profile?.country || 'Belgium',
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

      // Ensure default country
      if (!cleaned.country) {
        cleaned.country = 'Belgium';
      }

      return cleaned;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
};
</script>
