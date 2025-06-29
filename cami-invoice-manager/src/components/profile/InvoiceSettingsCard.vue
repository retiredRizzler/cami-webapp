<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between p-6 pb-0">
        <h3 class="text-lg font-semibold text-primary">Paramètres de Facturation</h3>
        <div class="flex items-center gap-2">
          <i class="pi pi-receipt text-primary"></i>
          <Button
            v-if="!isEditing"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            text
            @click="startEditing"
            v-tooltip.top="'Modifier les paramètres de facturation'"
          />
        </div>
      </div>
    </template>
    <template #content>
      <!-- Display Mode -->
      <div v-if="!isEditing" class="space-y-4">
        <div class="flex justify-between">
          <span class="text-muted-color font-medium">Taux de TVA par Défaut :</span>
          <span class="font-semibold">{{ profile?.default_tax_rate || 21 }}%</span>
        </div>
        <div v-if="profile?.default_payment_terms" class="flex justify-between">
          <span class="text-muted-color font-medium">Conditions de Paiement :</span>
          <span class="text-right max-w-xs">{{ profile.default_payment_terms }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-color font-medium">Logo :</span>
          <span v-if="profile?.logo_url" class="text-green-600">
            <i class="pi pi-check mr-1"></i>Configuré
          </span>
          <span v-else class="text-muted-color">Non configuré</span>
        </div>

        <!-- Logo Preview -->
        <div v-if="profile?.logo_url" class="pt-3 border-t">
          <div class="text-sm text-muted-color mb-2">Logo Actuel :</div>
          <img :src="profile.logo_url" alt="Logo de l'entreprise" class="max-h-16 max-w-32 object-contain border rounded" />
        </div>

        <!-- Settings Summary -->
        <div class="pt-3 border-t">
          <div class="flex items-center gap-2">
            <i class="pi pi-info-circle text-blue-600"></i>
            <span class="text-sm text-blue-600">Ces paramètres seront utilisés par défaut pour les nouvelles factures</span>
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
              <label for="default_tax_rate">Taux de TVA par Défaut</label>
            </FloatLabel>
            <Message v-if="$form.default_tax_rate?.invalid" severity="error" size="small">
              {{ $form.default_tax_rate.error?.message }}
            </Message>
            <small class="text-muted-color">Le taux de TVA standard en Belgique est de 21%</small>
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
              <label for="default_payment_terms">Conditions de Paiement par Défaut</label>
            </FloatLabel>
            <Message v-if="$form.default_payment_terms?.invalid" severity="error" size="small">
              {{ $form.default_payment_terms.error?.message }}
            </Message>
            <small class="text-muted-color">Ce texte apparaîtra sur toutes vos factures par défaut</small>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              label="Annuler"
              severity="secondary"
              outlined
              @click="cancelEditing"
            />
            <Button
              type="submit"
              label="Enregistrer"
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
        default_payment_terms: this.profile?.default_payment_terms || 'Paiement dû sous 30 jours',
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
        cleaned.default_payment_terms = 'Paiement dû sous 30 jours';
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
        summary: 'Téléchargement Non Disponible',
        detail: 'La fonctionnalité de téléchargement de logo sera disponible dans une prochaine mise à jour',
        life: 4000
      });
    },

    onLogoError(event) {
      console.error('Logo upload error:', event);
      this.$toast.add({
        severity: 'error',
        summary: 'Erreur de Téléchargement',
        detail: 'Échec du téléchargement du logo. Veuillez réessayer.',
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
