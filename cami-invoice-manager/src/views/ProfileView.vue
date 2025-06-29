<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Toast for notifications -->
    <Toast />

    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-primary mb-2">Profil Instructeur</h1>
      <p class="text-muted-color">Gérez vos informations commerciales et paramètres de facturation</p>
    </div>

    <!-- Profile Status Card -->
    <Card class="mb-6">
      <template #content>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <i class="pi pi-user text-2xl text-primary-600"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-surface-900">
                {{ profileStatus.hasProfile ? 'Configuration du Profil' : 'Bienvenue ! Configurez votre profil' }}
              </h3>
              <p class="text-sm text-surface-600 mb-2">
                {{ profileStatus.hasProfile
                    ? `Votre profil est complété à ${profileStatus.completionPercentage}%`
                    : 'Complétez votre profil pour générer des factures professionnelles' }}
              </p>
              <div class="flex items-center gap-2">
                <ProgressBar
                  :value="profileStatus.completionPercentage"
                  class="w-48 h-2"
                  :severity="profileStatus.isComplete ? 'success' : profileStatus.completionPercentage > 50 ? 'warning' : 'danger'"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Missing Fields Alert -->
        <div v-if="profileStatus.missingRequiredFields.length > 0" class="mt-4">
          <Message severity="warn" variant="outlined">
            <template #messageicon>
              <i class="pi pi-exclamation-triangle"></i>
            </template>
            <div>
              <div class="font-medium mb-1">Champs obligatoires manquants :</div>
              <div class="text-sm">{{ profileStatus.missingRequiredFields.join(', ') }}</div>
            </div>
          </Message>
        </div>
      </template>
    </Card>

    <!-- Profile Information Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Business Information Card -->
      <BusinessInfoCard
        :profile="profile"
        @update="handleCardUpdate"
        @error="handleCardError"
      />

      <!-- Address & Contact Card -->
      <AddressContactCard
        :profile="profile"
        @update="handleCardUpdate"
        @error="handleCardError"
      />

      <!-- Banking Information Card -->
      <BankingInfoCard
        :profile="profile"
        @update="handleCardUpdate"
        @error="handleCardError"
      />

      <!-- Invoice Settings Card -->
      <InvoiceSettingsCard
        :profile="profile"
        @update="handleCardUpdate"
        @error="handleCardError"
      />
    </div>

    <!-- Empty State for New Users -->
    <div v-if="!profile && !loading" class="text-center py-12">
      <div class="w-24 h-24 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-user-plus text-3xl text-muted-color"></i>
      </div>
      <h3 class="text-xl font-semibold mb-2">Configurez votre profil d'instructeur</h3>
      <p class="text-muted-color mb-6 max-w-md mx-auto">
        Commencez par configurer vos informations commerciales. Vous pouvez modifier chaque section individuellement
        en utilisant les boutons de modification sur chaque carte.
      </p>
      <Button
        icon="pi pi-arrow-down"
        label="Commencer par les Infos Commerciales"
        size="large"
        @click="scrollToBusinessCard"
      />
    </div>

    <!-- Quick Actions -->
    <div v-if="profile" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Button
        icon="pi pi-refresh"
        label="Réinitialiser Profil"
        severity="danger"
        outlined
        @click="confirmReset"
        class="h-16"
      />
    </div>

    <!-- Profile Completion Tips -->
    <div v-if="profile && !profileStatus.isComplete" class="mt-6">
      <Card>
        <template #header>
          <div class="p-6 pb-0">
            <h3 class="text-lg font-semibold text-primary">💡 Complétez Votre Profil</h3>
          </div>
        </template>
        <template #content>
          <div class="space-y-3">
            <p class="text-sm text-surface-600 mb-4">
              Complétez ces sections pour débloquer toutes les fonctionnalités et créer des factures professionnelles :
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="profileStatus.missingRequiredFields.length > 0">
                <h4 class="font-medium text-red-600 mb-2">Champs Obligatoires</h4>
                <ul class="space-y-1">
                  <li v-for="field in profileStatus.missingRequiredFields" :key="field"
                      class="text-sm flex items-center gap-2">
                    <i class="pi pi-exclamation-circle text-red-500"></i>
                    {{ field }}
                  </li>
                </ul>
              </div>

              <div v-if="profileStatus.missingOptionalFields.length > 0">
                <h4 class="font-medium text-orange-600 mb-2">Champs Recommandés</h4>
                <ul class="space-y-1">
                  <li v-for="field in profileStatus.missingOptionalFields.slice(0, 5)" :key="field"
                      class="text-sm flex items-center gap-2">
                    <i class="pi pi-info-circle text-orange-500"></i>
                    {{ field }}
                  </li>
                </ul>
                <div v-if="profileStatus.missingOptionalFields.length > 5" class="text-xs text-muted-color mt-2">
                  +{{ profileStatus.missingOptionalFields.length - 5 }} champs supplémentaires
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div class="text-center">
        <ProgressSpinner strokeWidth="3" />
        <div class="mt-4 text-lg font-medium">Chargement du profil...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ProfileService } from '@/services/ProfileService.js'
import BusinessInfoCard from '@/components/profile/BusinessInfoCard.vue'
import AddressContactCard from '@/components/profile/AddressContactCard.vue'
import BankingInfoCard from '@/components/profile/BankingInfoCard.vue'
import InvoiceSettingsCard from '@/components/profile/InvoiceSettingsCard.vue'

export default {
  name: 'ProfileView',
  components: {
    BusinessInfoCard,
    AddressContactCard,
    BankingInfoCard,
    InvoiceSettingsCard
  },

  data() {
    return {
      profile: null,
      profileStatus: {
        isComplete: false,
        completionPercentage: 0,
        missingRequiredFields: [],
        missingOptionalFields: [],
        hasProfile: false
      },
      loading: false,

      // Service instance
      profileService: new ProfileService()
    }
  },

  async created() {
    await this.loadProfile()
  },

  methods: {
    async loadProfile() {
      this.loading = true
      try {
        this.profile = await this.profileService.getProfile()
        this.profileStatus = await this.profileService.getProfileCompletionStatus()
      } catch (error) {
        console.error('Error loading profile:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec du chargement du profil instructeur',
          life: 5000
        })
      } finally {
        this.loading = false
      }
    },

    async handleCardUpdate(cardData) {
      try {
        // Merge the card data with existing profile
        const updatedData = {
          ...this.profile,
          ...cardData
        }

        // Save the updated profile
        const savedProfile = await this.profileService.saveProfile(updatedData)

        this.$toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Profil mis à jour avec succès',
          life: 3000
        })

        // Update local data and refresh status
        this.profile = savedProfile
        this.profileStatus = await this.profileService.getProfileCompletionStatus()

      } catch (error) {
        console.error('Error updating profile:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour du profil. Veuillez réessayer.',
          life: 5000
        })
      }
    },

    handleCardError(error) {
      console.error('Card error:', error)
      this.$toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur s\'est produite lors de la mise à jour du profil',
        life: 5000
      })
    },

    async previewInvoice() {
      if (!this.profileStatus.isComplete) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Profil Incomplet',
          detail: 'Veuillez compléter tous les champs obligatoires avant l\'aperçu',
          life: 4000
        })
        return
      }

      // TODO: Implement invoice preview with current profile data
      this.$toast.add({
        severity: 'info',
        summary: 'Fonctionnalité Bientôt Disponible',
        detail: 'L\'aperçu de facture avec vos données de profil sera bientôt disponible',
        life: 3000
      })
    },

    exportProfile() {
      if (!this.profile) return

      // Create downloadable JSON of profile data
      const dataStr = JSON.stringify(this.profile, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `profil-instructeur-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      this.$toast.add({
        severity: 'success',
        summary: 'Export Terminé',
        detail: 'Données du profil exportées avec succès',
        life: 3000
      })
    },

    duplicateSettings() {
      // TODO: Implement settings duplication/templates
      this.$toast.add({
        severity: 'info',
        summary: 'Fonctionnalité Bientôt Disponible',
        detail: 'Les modèles de profil et la duplication seront bientôt disponibles',
        life: 3000
      })
    },

    confirmReset() {
      this.$confirm.require({
        message: 'Êtes-vous sûr de vouloir réinitialiser votre profil d\'instructeur ? Cette action supprimera définitivement toutes vos informations commerciales et ne peut pas être annulée.',
        header: 'Réinitialiser Profil',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: 'Annuler',
          severity: 'secondary',
          outlined: true
        },
        acceptProps: {
          label: 'Réinitialiser Profil',
          severity: 'danger'
        },
        accept: () => {
          this.resetProfile()
        }
      })
    },

    async resetProfile() {
      try {
        await this.profileService.deleteProfile()

        this.$toast.add({
          severity: 'success',
          summary: 'Profil Réinitialisé',
          detail: 'Votre profil instructeur a été réinitialisé avec succès',
          life: 3000
        })

        this.profile = null
        await this.loadProfile() // Refresh status
      } catch (error) {
        console.error('Error resetting profile:', error)
        this.$toast.add({
          severity: 'error',
          summary: 'Échec de la Réinitialisation',
          detail: 'Échec de la réinitialisation du profil. Veuillez réessayer.',
          life: 5000
        })
      }
    },

    scrollToBusinessCard() {
      // Scroll to the business info card
      const businessCard = document.querySelector('.grid .lg\\:grid-cols-2 > div:first-child')
      if (businessCard) {
        businessCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }
}
</script>
