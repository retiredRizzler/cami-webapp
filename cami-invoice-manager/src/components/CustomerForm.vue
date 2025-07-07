<template>
  <div class="relative">
    <!-- Mobile Floating Action Header - Uniquement visible sur mobile -->
    <div v-if="isMobile" class="sticky top-0 z-10 bg-white border-b border-surface-200 p-3 mb-4 -mx-3 -mt-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="pi pi-users text-primary"></i>
          <span class="font-medium text-sm">{{ isEditing ? 'Modifier' : 'Nouveau' }} Client</span>
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
    <div class="p-3 sm:p-4">
      <Form
        ref="customerForm"
        v-slot="$form"
        :resolver="resolver"
        :initialValues="initialValues"
        @submit="onFormSubmit"
        class="flex flex-col gap-4 sm:gap-6"
      >
        <!-- Sélection du type de client -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-sm">Type de client</label>
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

        <!-- Champs de formulaire dynamiques basés sur le type de client -->
        <div class="grid grid-cols-1 gap-4 sm:gap-4 md:grid-cols-2">

          <!-- Champs pour particuliers -->
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
                <label for="first_name">Prénom *</label>
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
                <label for="last_name">Nom *</label>
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
                <label for="license_type">Type de permis</label>
              </FloatLabel>
              <Message v-if="$form.license_type?.invalid" severity="error" size="small">
                {{ $form.license_type.error?.message }}
              </Message>
            </div>
          </template>

          <!-- Champs pour entreprises -->
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
                <label for="company_name">Nom de l'entreprise *</label>
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
                <label for="contact_person">Personne de contact</label>
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
                <label for="vat_number">Numéro de TVA *</label>
              </FloatLabel>
              <small class="text-muted-color text-xs mt-1">Format belge : BE + 10 chiffres</small>
              <Message v-if="$form.vat_number?.invalid" severity="error" size="small">
                {{ $form.vat_number.error?.message }}
              </Message>
            </div>
          </template>

          <!-- Champs communs - Toujours pleine largeur sur mobile -->
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
              <label for="email">Adresse e-mail *</label>
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
              <label for="phone">Numéro de téléphone</label>
            </FloatLabel>
            <small class="text-muted-color text-xs mt-1">Inclure l'indicatif pays pour les numéros internationaux</small>
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
              <label for="city">Ville</label>
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
              <label for="postal_code">Code postal</label>
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
                placeholder="Sélectionner un pays"
                fluid
                :invalid="$form.country?.invalid"
                class="text-base"
              />
              <label for="country">Pays</label>
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
              <label for="address">Adresse</label>
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
              Optionnel : Toute information spéciale concernant {{ currentClientType === 'company' ? 'cette entreprise' : 'cet élève' }}
            </small>
            <Message v-if="$form.notes?.invalid" severity="error" size="small">
              {{ $form.notes.error?.message }}
            </Message>
          </div>
        </div>

        <!-- Actions du formulaire - Masquer sur mobile car dans le header -->
        <div :class="isMobile ? 'hidden' : 'flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t'">
          <Button
            type="button"
            label="Annuler"
            severity="secondary"
            outlined
            @click="$emit('cancel')"
            class="w-full sm:w-auto"
          />
          <Button
            type="submit"
            :label="isEditing ? 'Modifier le client' : 'Créer le client'"
            :loading="loading"
            icon="pi pi-check"
            class="w-full sm:w-auto"
          />
        </div>
      </Form>
    </div>

    <!-- Zone de sécurité mobile pour éviter que les boutons soient cachés -->
    <div v-if="isMobile" class="mobile-safe-area"></div>
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
      isMobile: false,

      clientTypeOptions: [
        { label: "Élève particulier", value: "individual" },
        { label: "Entreprise", value: "company" },
      ],

      licenseTypes: [
        { label: "Permis provisoire", value: "learner" },
        { label: "Permis B (Voiture)", value: "B" },
        { label: "Permis A (Moto)", value: "A" },
        { label: "Permis C (Camion)", value: "C" },
        { label: "Permis D (Bus)", value: "D" },
        { label: "Permis BE (Voiture + remorque)", value: "BE" },
        { label: "Permis AM (Cyclomoteur)", value: "AM" },
      ],

      countries: [
        { label: "Belgique", value: "Belgium" },
        { label: "Pays-Bas", value: "Netherlands" },
        { label: "France", value: "France" },
        { label: "Allemagne", value: "Germany" },
        { label: "Luxembourg", value: "Luxembourg" },
        { label: "Royaume-Uni", value: "United Kingdom" },
        { label: "Autre", value: "Other" },
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
            errorMap: () => ({ message: 'Veuillez sélectionner un type de client' })
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
            .pipe(z.string().min(1, { message: 'L\'email est obligatoire' }).email({ message: 'Veuillez saisir une adresse email valide' })),

          phone: nullableString().refine((val) => {
            if (!val || val.trim() === '') return true
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/
            return phoneRegex.test(val)
          }, { message: 'Veuillez saisir un numéro de téléphone valide' }),

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
          message: "Veuillez remplir tous les champs obligatoires",
          path: ["client_type"]
        })
      )
    },
  },

  created() {
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
      if (this.$refs.customerForm) {
        // Déclencher la soumission du formulaire
        const form = this.$refs.customerForm.$el;
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    },

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
        console.log('Échec de la validation du formulaire');
        return;
      }

      if (!values) {
        console.error('Les valeurs sont indéfinies');
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Données du formulaire manquantes',
          life: 5000
        });
        return;
      }

      this.loading = true;

      try {
        const cleanedData = this.prepareDataForSubmission(values);
        console.log('Valeurs originales du formulaire:', values);
        console.log('Données nettoyées pour soumission:', cleanedData);
        this.$emit("save", cleanedData);
      } catch (error) {
        console.error("Erreur de soumission du formulaire:", error);
        this.$toast.add({
          severity: "error",
          summary: "Erreur",
          detail: "Une erreur s'est produite lors de la sauvegarde du client",
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
  .p-select {
    min-height: 48px;
    font-size: 16px; /* Empêcher le zoom sur iOS */
  }

  /* Zone de sécurité mobile pour éviter que le contenu soit caché */
  .mobile-safe-area {
    height: 80px; /* Espace pour la barre d'URL mobile */
    padding-bottom: env(safe-area-inset-bottom, 0px); /* Support iPhone avec notch */
  }

  /* Amélioration de l'espacement sur mobile */
  .gap-4 {
    gap: 1rem;
  }

  /* Amélioration du padding pour mobile */
  .p-3 {
    padding: 0.75rem;
  }

  /* SelectButton amélioré sur mobile */
  .p-selectbutton .p-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    min-height: 48px;
  }

  /* Select amélioré pour mobile */
  .p-select .p-select-label {
    padding: 0.75rem;
    font-size: 16px;
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
}

/* Amélioration des transitions et animations */
.sticky.top-0 {
  transition: all 0.3s ease;
}

/* Transitions de focus fluides */
.p-inputtext:focus,
.p-textarea:focus,
.p-select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--p-primary-color-rgb), 0.15);
  transition: all 0.2s ease;
}

/* Meilleur style d'état d'erreur */
.p-invalid {
  border-color: var(--p-red-500) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--p-red-500-rgb), 0.2) !important;
}

/* Style de message amélioré */
.p-message {
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Focus visible pour l'accessibilité */
.p-button:focus-visible,
.p-inputtext:focus-visible,
.p-textarea:focus-visible,
.p-select:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Transitions fluides pour les champs dynamiques */
.grid > div {
  transition: opacity 0.2s ease;
}

/* Amélioration du petit texte */
small {
  line-height: 1.4;
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

/* Amélioration des hover states sur desktop */
@media (min-width: 769px) {
  .p-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* Amélioration du scrolling sur mobile */
@media (max-width: 768px) {
  .relative {
    -webkit-overflow-scrolling: touch;
  }
}

/* Responsive pour les très petits écrans */
@media (max-width: 480px) {
  .p-3 {
    padding: 0.5rem;
  }

  .sticky.top-0 {
    padding: 0.75rem;
    margin: -0.5rem -0.5rem 1rem -0.5rem;
  }

  .p-button-sm .px-3 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
