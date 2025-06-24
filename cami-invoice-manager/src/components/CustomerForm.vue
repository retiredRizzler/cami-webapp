<template>
  <div class="p-3 sm:p-4">
    <Form
      v-slot="$form"
      :resolver="resolver"
      :initialValues="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 sm:gap-6"
    >
      <!-- Client Type Selection -->
      <div class="flex flex-col gap-2">
        <label class="font-medium text-sm">Client Type</label>
        <SelectButton
          name="client_type"
          :options="clientTypeOptions"
          optionLabel="label"
          optionValue="value"
          :disabled="isEditing"
          @change="onClientTypeChange"
          :pt="{
            button: { class: 'text-sm p-3 flex-1' }
          }"
        />
        <Message v-if="$form.client_type?.invalid" severity="error" size="small">
          {{ $form.client_type.error?.message }}
        </Message>
      </div>

      <!-- Dynamic Form Fields Based on Client Type -->
      <div class="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2">

        <!-- Individual Fields -->
        <template v-if="currentClientType === 'individual'">
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <InputText
                id="first_name"
                name="first_name"
                fluid
                :invalid="$form.first_name?.invalid"
                autocomplete="given-name"
                class="text-base"
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
                autocomplete="family-name"
                class="text-base"
              />
              <label for="last_name">Last Name *</label>
            </FloatLabel>
            <Message v-if="$form.last_name?.invalid" severity="error" size="small">
              {{ $form.last_name.error?.message }}
            </Message>
          </div>

          <div class="flex flex-col gap-1 md:col-span-1">
            <FloatLabel variant="on">
              <Select
                id="license_type"
                name="license_type"
                :options="licenseTypes"
                optionLabel="label"
                optionValue="value"
                fluid
                :invalid="$form.license_type?.invalid"
                class="text-base"
              />
              <label for="license_type">License Type</label>
            </FloatLabel>
            <Message v-if="$form.license_type?.invalid" severity="error" size="small">
              {{ $form.license_type.error?.message }}
            </Message>
          </div>
        </template>

        <!-- Company Fields -->
        <template v-if="currentClientType === 'company'">
          <div class="flex flex-col gap-1 md:col-span-2">
            <FloatLabel variant="on">
              <InputText
                id="company_name"
                name="company_name"
                fluid
                :invalid="$form.company_name?.invalid"
                autocomplete="organization"
                class="text-base"
              />
              <label for="company_name">Company Name *</label>
            </FloatLabel>
            <Message v-if="$form.company_name?.invalid" severity="error" size="small">
              {{ $form.company_name.error?.message }}
            </Message>
          </div>

          <div class="flex flex-col gap-1 md:col-span-2">
            <FloatLabel variant="on">
              <InputText
                id="contact_person"
                name="contact_person"
                fluid
                :invalid="$form.contact_person?.invalid"
                autocomplete="name"
                class="text-base"
              />
              <label for="contact_person">Contact Person</label>
            </FloatLabel>
            <Message v-if="$form.contact_person?.invalid" severity="error" size="small">
              {{ $form.contact_person.error?.message }}
            </Message>
          </div>

          <div class="flex flex-col gap-1 md:col-span-1">
            <FloatLabel variant="on">
              <InputText
                id="vat_number"
                name="vat_number"
                fluid
                :invalid="$form.vat_number?.invalid"
                class="text-base"
              />
              <label for="vat_number">VAT Number *</label>
            </FloatLabel>
            <small class="text-muted-color text-xs mt-1">Belgian format: BE + 10 digits</small>
            <Message v-if="$form.vat_number?.invalid" severity="error" size="small">
              {{ $form.vat_number.error?.message }}
            </Message>
          </div>
        </template>

        <!-- Common Fields - Always full width on mobile -->
        <div class="flex flex-col gap-1 md:col-span-2">
          <FloatLabel variant="on">
            <InputText
              id="email"
              name="email"
              type="email"
              fluid
              :invalid="$form.email?.invalid"
              autocomplete="email"
              inputmode="email"
              class="text-base"
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
              autocomplete="tel"
              inputmode="tel"
              class="text-base"
            />
            <label for="phone">Phone Number</label>
          </FloatLabel>
          <small class="text-muted-color text-xs mt-1">Include country code for international numbers</small>
          <Message v-if="$form.phone?.invalid" severity="error" size="small">
            {{ $form.phone.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <InputText
              id="city"
              name="city"
              fluid
              :invalid="$form.city?.invalid"
              autocomplete="address-level2"
              class="text-base"
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
              autocomplete="postal-code"
              inputmode="numeric"
              class="text-base"
            />
            <label for="postal_code">Postal Code</label>
          </FloatLabel>
          <Message v-if="$form.postal_code?.invalid" severity="error" size="small">
            {{ $form.postal_code.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <Select
              id="country"
              name="country"
              :options="countries"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Country"
              fluid
              :invalid="$form.country?.invalid"
              class="text-base"
            />
            <label for="country">Country</label>
          </FloatLabel>
          <Message v-if="$form.country?.invalid" severity="error" size="small">
            {{ $form.country.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1 md:col-span-2">
          <FloatLabel variant="on">
            <Textarea
              id="address"
              name="address"
              rows="2"
              fluid
              :invalid="$form.address?.invalid"
              autocomplete="street-address"
              class="text-base"
            />
            <label for="address">Address</label>
          </FloatLabel>
          <Message v-if="$form.address?.invalid" severity="error" size="small">
            {{ $form.address.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1 md:col-span-2">
          <FloatLabel variant="on">
            <Textarea
              id="notes"
              name="notes"
              rows="3"
              fluid
              :invalid="$form.notes?.invalid"
              class="text-base"
            />
            <label for="notes">Notes</label>
          </FloatLabel>
          <small class="text-muted-color text-xs mt-1">
            Optional: Any special information about this {{ currentClientType === 'company' ? 'company' : 'student' }}
          </small>
          <Message v-if="$form.notes?.invalid" severity="error" size="small">
            {{ $form.notes.error?.message }}
          </Message>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          @click="$emit('cancel')"
          class="w-full sm:w-auto"
        />
        <Button
          type="submit"
          :label="isEditing ? 'Update Customer' : 'Create Customer'"
          :loading="loading"
          icon="pi pi-check"
          class="w-full sm:w-auto"
        />
      </div>
    </Form>
  </div>
</template>

<script>
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";

export default {
  name: "CustomerForm",

  props: {
    customer: {
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
      currentClientType: "individual",

      clientTypeOptions: [
        { label: "Individual Student", value: "individual" },
        { label: "Company", value: "company" },
      ],

      licenseTypes: [
        { label: "Learner Permit", value: "learner" },
        { label: "Class B (Car)", value: "B" },
        { label: "Class A (Motorcycle)", value: "A" },
        { label: "Class C (Truck)", value: "C" },
        { label: "Class D (Bus)", value: "D" },
        { label: "Class BE (Car + Trailer)", value: "BE" },
        { label: "Class AM (Moped)", value: "AM" },
      ],

      countries: [
        { label: "Belgium", value: "Belgium" },
        { label: "Netherlands", value: "Netherlands" },
        { label: "France", value: "France" },
        { label: "Germany", value: "Germany" },
        { label: "Luxembourg", value: "Luxembourg" },
        { label: "United Kingdom", value: "United Kingdom" },
        { label: "Other", value: "Other" },
      ],

      fieldDefinitions: {
        individual: {
          required: ['client_type', 'first_name', 'last_name', 'email'],
          optional: ['license_type', 'phone', 'address', 'city', 'postal_code', 'country', 'notes'],
          excluded: ['company_name', 'contact_person', 'vat_number']
        },
        company: {
          required: ['client_type', 'company_name', 'vat_number', 'email'],
          optional: ['contact_person', 'phone', 'address', 'city', 'postal_code', 'country', 'notes'],
          excluded: ['first_name', 'last_name', 'license_type']
        }
      }
    };
  },

  computed: {
    initialValues() {
      const baseValues = {
        client_type: "individual",
        first_name: "",
        last_name: "",
        license_type: "",
        company_name: "",
        contact_person: "",
        vat_number: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: "Belgium",
        notes: "",
      };

      if (this.customer) {
        Object.keys(baseValues).forEach((key) => {
          const value = this.customer[key];
          if (value !== undefined && value !== null) {
            baseValues[key] = value;
          } else if (value === null) {
            baseValues[key] = "";
          }
        });
        this.currentClientType = this.customer.client_type || "individual";
      }

      return baseValues;
    },

    resolver() {
      const nullableString = () => z
        .union([z.string(), z.null(), z.undefined()])
        .transform(val => val === null || val === undefined ? undefined : val)
        .optional()

      return zodResolver(
        z.object({
          client_type: z.enum(['individual', 'company'], {
            errorMap: () => ({ message: 'Please select a client type' })
          }),

          first_name: nullableString(),
          last_name: nullableString(),
          license_type: nullableString(),
          company_name: nullableString(),
          contact_person: nullableString(),
          vat_number: nullableString(),

          email: z
            .union([z.string(), z.null()])
            .transform(val => val === null ? '' : val)
            .pipe(z.string().min(1, { message: 'Email is required' }).email({ message: 'Please enter a valid email address' })),

          phone: nullableString().refine((val) => {
            if (!val || val.trim() === '') return true
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/
            return phoneRegex.test(val)
          }, { message: 'Please enter a valid phone number' }),

          address: nullableString(),
          city: nullableString(),
          postal_code: nullableString(),
          country: nullableString(),
          notes: nullableString()
        }).refine((data) => {
          if (data.client_type === 'individual') {
            return data.first_name && data.first_name.trim() !== '' &&
                   data.last_name && data.last_name.trim() !== ''
          }
          if (data.client_type === 'company') {
            return data.company_name && data.company_name.trim() !== '' &&
                   data.vat_number && data.vat_number.trim() !== ''
          }
          return true
        }, {
          message: "Please fill in all required fields",
          path: ["client_type"]
        })
      )
    },
  },

  methods: {
    onClientTypeChange(event) {
      this.currentClientType = event.value;
    },

    prepareDataForSubmission(formValues) {
      const clientType = formValues.client_type;
      const fieldDef = this.fieldDefinitions[clientType];
      const cleanedData = { ...formValues };

      fieldDef.excluded.forEach(field => {
        delete cleanedData[field];
      });

      [...fieldDef.required, ...fieldDef.optional].forEach(field => {
        if (cleanedData.hasOwnProperty(field)) {
          const value = cleanedData[field];
          if (fieldDef.optional.includes(field) && (value === '' || value === undefined)) {
            cleanedData[field] = null;
          }
        }
      });

      return cleanedData;
    },

    async onFormSubmit({ valid, values }) {
      if (!valid) {
        console.log('Form validation failed');
        return;
      }

      if (!values) {
        console.error('Values is undefined');
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Form data is missing',
          life: 5000
        });
        return;
      }

      this.loading = true;

      try {
        const cleanedData = this.prepareDataForSubmission(values);
        console.log('Original form values:', values);
        console.log('Cleaned data for submission:', cleanedData);
        this.$emit("save", cleanedData);
      } catch (error) {
        console.error("Form submission error:", error);
        this.$toast.add({
          severity: "error",
          summary: "Error",
          detail: "An error occurred while saving the customer",
          life: 5000,
        });
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Mobile-first responsive improvements */
@media (max-width: 768px) {
  /* Ensure proper touch targets on mobile */
  .p-inputtext,
  .p-textarea,
  .p-select {
    min-height: 48px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .p-button {
    min-height: 48px;
    font-size: 16px;
  }

  /* Better spacing on mobile */
  .gap-4 {
    gap: 1rem;
  }

  /* Improved SelectButton on mobile */
  .p-selectbutton .p-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

/* Smooth focus transitions */
.p-inputtext:focus,
.p-textarea:focus,
.p-select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.15);
  transition: all 0.2s ease;
}

/* Better error state styling */
.p-invalid {
  border-color: var(--p-red-500) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--p-red-500-rgb), 0.2) !important;
}

/* Enhanced message styling */
.p-message {
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Improved button styling on mobile */
@media (max-width: 640px) {
  .flex-col-reverse .p-button {
    order: 1;
  }

  .flex-col-reverse .p-button:first-child {
    order: 2;
  }
}

/* Better form field spacing */
.flex.flex-col.gap-1 {
  gap: 0.25rem;
}

/* Small text improvements */
small {
  line-height: 1.4;
}

/* Focus visible for accessibility */
.p-button:focus-visible,
.p-inputtext:focus-visible,
.p-textarea:focus-visible,
.p-select:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Smooth transitions for dynamic fields */
.grid > div {
  transition: opacity 0.2s ease;
}
</style>
