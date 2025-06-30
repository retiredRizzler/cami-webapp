<template>
  <div class="welcome-container min-h-screen bg-gradient-to-br from-primary-50 to-surface-50 p-3 sm:p-6">
    <!-- Toast for notifications -->
    <Toast />

    <!-- Welcome Header -->
    <div class="max-w-7xl mx-auto">
      <!-- Hero Section -->
      <div class="text-center mb-8 sm:mb-12">
        <div class="mb-6">
          <!-- Logo and Brand -->
          <div class="flex items-center justify-center gap-4 mb-6">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="sm:w-10 sm:h-10">
                <path d="M17.5 0L35 10V30L17.5 40L0 30V10L17.5 0Z" fill="white"/>
                <circle cx="17.5" cy="20" r="8" fill="#6366f1"/>
                <rect x="13.5" y="16" width="8" height="8" rx="2" fill="white"/>
              </svg>
            </div>
            <div class="text-left">
              <h1 class="text-3xl sm:text-4xl font-bold text-primary-700">CamInvoice</h1>
              <p class="text-primary-600 text-sm sm:text-base">Facturation Auto-École</p>
            </div>
          </div>

          <h2 class="text-2xl sm:text-3xl font-bold text-surface-900 mb-4">
            Bienvenue, {{ userName }} ! 👋
          </h2>
          <p class="text-lg text-surface-600 max-w-2xl mx-auto">
            Gérez facilement vos clients et factures d'auto-école.
            Commencez par configurer votre profil ou créez directement votre premier client.
          </p>
        </div>
      </div>

      <!-- Profile Status Alert (if incomplete) -->
      <div v-if="!profileStatus.isComplete" class="mb-8">
        <Card class="max-w-4xl mx-auto border-l-4 border-l-amber-500">
          <template #content>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="pi pi-exclamation-triangle text-amber-600 text-xl"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-surface-900 mb-2">
                  {{ profileStatus.hasProfile ? 'Complétez votre profil' : 'Configurez votre profil instructeur' }}
                </h3>
                <p class="text-surface-600 mb-3">
                  {{ profileStatus.hasProfile
                    ? `Votre profil est complété à ${profileStatus.completionPercentage}%. Complétez-le pour que vos informations apparaissent sur vos factures.`
                    : 'Configurez vos informations commerciales pour générer des factures professionnelles avec vos données.' }}
                </p>
                <div class="flex items-center gap-4">
                  <ProgressBar
                    :value="profileStatus.completionPercentage"
                    class="flex-1 max-w-md h-2"
                    :severity="profileStatus.completionPercentage > 70 ? 'success' : profileStatus.completionPercentage > 30 ? 'warning' : 'danger'"
                  />
                  <Button
                    label="Configurer mon profil"
                    icon="pi pi-user"
                    @click="goToProfile"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Actions Grid -->
      <div class="max-w-6xl mx-auto mb-12">
        <h3 class="text-xl font-semibold text-surface-900 mb-6 text-center">Actions Rapides</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Create New Customer -->
          <Card class="quick-action-card hover:shadow-xl transition-all duration-300 cursor-pointer h-full" @click="goToCustomers">
            <template #content>
              <div class="text-center p-6">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="pi pi-user-plus text-blue-600 text-2xl"></i>
                </div>
                <h4 class="text-lg font-semibold text-surface-900 mb-2">Nouveau Client</h4>
                <p class="text-surface-600 text-sm mb-4">
                  Ajoutez un nouvel élève ou une entreprise
                </p>
                <div class="flex items-center justify-center gap-2 text-blue-600 font-medium">
                  <span>Ajouter un client</span>
                  <i class="pi pi-arrow-right text-sm"></i>
                </div>
              </div>
            </template>
          </Card>

          <!-- Create New Invoice -->
          <Card class="quick-action-card hover:shadow-xl transition-all duration-300 cursor-pointer h-full" @click="goToInvoices">
            <template #content>
              <div class="text-center p-6">
                <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="pi pi-receipt text-emerald-600 text-2xl"></i>
                </div>
                <h4 class="text-lg font-semibold text-surface-900 mb-2">Nouvelle Facture</h4>
                <p class="text-surface-600 text-sm mb-4">
                  Créez et envoyez une facture pour vos services de formation
                </p>
                <div class="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                  <span>Créer une facture</span>
                  <i class="pi pi-arrow-right text-sm"></i>
                </div>
              </div>
            </template>
          </Card>

          <!-- Configure Profile -->
          <Card class="quick-action-card hover:shadow-xl transition-all duration-300 cursor-pointer h-full" @click="goToProfile">
            <template #content>
              <div class="text-center p-6">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="pi pi-user text-purple-600 text-2xl"></i>
                </div>
                <h4 class="text-lg font-semibold text-surface-900 mb-2">Mon Profil</h4>
                <p class="text-surface-600 text-sm mb-4">
                  Configurez vos informations commerciales et bancaires
                </p>
                <div class="flex items-center justify-center gap-2 text-purple-600 font-medium">
                  <span>Gérer mon profil</span>
                  <i class="pi pi-arrow-right text-sm"></i>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Status Overview -->
      <div class="max-w-6xl mx-auto mb-12">
        <h3 class="text-xl font-semibold text-surface-900 mb-6 text-center">Aperçu de votre activité</h3>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card class="text-center">
            <template #content>
              <div class="p-4">
                <div class="text-2xl font-bold text-primary mb-1">{{ stats.totalCustomers }}</div>
                <div class="text-sm text-surface-600">Clients</div>
              </div>
            </template>
          </Card>

          <Card class="text-center">
            <template #content>
              <div class="p-4">
                <div class="text-2xl font-bold text-emerald-600 mb-1">{{ stats.totalInvoices }}</div>
                <div class="text-sm text-surface-600">Factures</div>
              </div>
            </template>
          </Card>

          <Card class="text-center">
            <template #content>
              <div class="p-4">
                <div class="text-2xl font-bold text-blue-600 mb-1">€{{ stats.totalRevenue }}</div>
                <div class="text-sm text-surface-600">Chiffre d'affaires</div>
              </div>
            </template>
          </Card>

          <Card class="text-center">
            <template #content>
              <div class="p-4">
                <div class="text-2xl font-bold text-orange-600 mb-1">{{ stats.pendingInvoices }}</div>
                <div class="text-sm text-surface-600">En attente</div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Getting Started Guide -->
      <Card class="max-w-4xl mx-auto">
        <template #header>
          <div class="p-6 pb-0">
            <h3 class="text-xl font-semibold text-surface-900 flex items-center gap-2">
              <i class="pi pi-lightbulb text-primary"></i>
              Guide de démarrage
            </h3>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <div class="flex items-start gap-4 p-4 rounded-lg bg-surface-50">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h4 class="font-semibold text-surface-900 mb-1">Configurez votre profil</h4>
                <p class="text-surface-600 text-sm">
                  Renseignez vos informations commerciales, bancaires et de contact pour personnaliser vos factures.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-lg bg-surface-50">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h4 class="font-semibold text-surface-900 mb-1">Ajoutez vos premiers clients</h4>
                <p class="text-surface-600 text-sm">
                  Créez des fiches pour vos élèves individuels et vos clients entreprises.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-lg bg-surface-50">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h4 class="font-semibold text-surface-900 mb-1">Créez votre première facture</h4>
                <p class="text-surface-600 text-sm">
                  Sélectionnez un client, ajoutez vos prestations et générez un PDF professionnel.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-surface-200">
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                label="Commencer maintenant"
                icon="pi pi-play"
                @click="startOnboarding"
                size="large"
                class="flex-1 sm:flex-none"
              />
              <Button
                label="Explorer l'application"
                icon="pi pi-eye"
                severity="secondary"
                outlined
                @click="exploreApp"
                size="large"
                class="flex-1 sm:flex-none"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Footer Message -->
      <div class="text-center mt-12 text-surface-500">
        <p class="text-sm">
          Besoin d'aide ? Consultez la documentation ou contactez le support.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ProfileService } from '@/services/ProfileService.js'
import { CustomersService } from '@/services/CustomersService.js'
import { InvoicesService } from '@/services/InvoicesService.js'
import { useAuthStore } from '@/stores/AuthStore.js'
import { mapStores } from 'pinia'

export default {
  name: 'WelcomeView',

  data() {
    return {
      profileStatus: {
        isComplete: false,
        completionPercentage: 0,
        hasProfile: false
      },
      stats: {
        totalCustomers: 0,
        totalInvoices: 0,
        totalRevenue: '0',
        pendingInvoices: 0
      },

      // Services
      profileService: new ProfileService(),
      customersService: new CustomersService(),
      invoicesService: new InvoicesService()
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    userName() {
      return this.authStore.user?.user_metadata?.name || 'Instructeur'
    }
  },

  async created() {
    await this.loadData()
  },

  methods: {
    async loadData() {
      try {
        // Load profile status
        this.profileStatus = await this.profileService.getProfileCompletionStatus()

        // Load basic stats
        await Promise.all([
          this.loadCustomersStats(),
          this.loadInvoicesStats()
        ])
      } catch (error) {
        console.error('Error loading welcome data:', error)
      }
    },

    async loadCustomersStats() {
      try {
        const customers = await this.customersService.getCustomers()
        this.stats.totalCustomers = customers.length
      } catch (error) {
        console.error('Error loading customers stats:', error)
      }
    },

    async loadInvoicesStats() {
      try {
        const invoiceStats = await this.invoicesService.getInvoiceStats()
        this.stats.totalInvoices = invoiceStats.total_invoices
        this.stats.totalRevenue = Math.round(invoiceStats.total_revenue || 0).toString()
        this.stats.pendingInvoices = invoiceStats.sent_invoices + invoiceStats.overdue_invoices
      } catch (error) {
        console.error('Error loading invoices stats:', error)
      }
    },

    // Navigation methods
    goToProfile() {
      this.$router.push({ name: 'profile' })
    },

    goToCustomers() {
      this.$router.push({ name: 'customers' })
    },

    goToInvoices() {
      this.$router.push({ name: 'invoices' })
    },

    // Onboarding actions
    startOnboarding() {
      if (!this.profileStatus.hasProfile) {
        this.$toast.add({
          severity: 'info',
          summary: 'Démarrage',
          detail: 'Commençons par configurer votre profil instructeur',
          life: 3000
        })
        this.goToProfile()
      } else if (this.stats.totalCustomers === 0) {
        this.$toast.add({
          severity: 'info',
          summary: 'Étape suivante',
          detail: 'Ajoutons votre premier client',
          life: 3000
        })
        this.goToCustomers()
      } else {
        this.$toast.add({
          severity: 'info',
          summary: 'Prêt !',
          detail: 'Créons votre première facture',
          life: 3000
        })
        this.goToInvoices()
      }
    },

    exploreApp() {
      this.$toast.add({
        severity: 'info',
        summary: 'Exploration',
        detail: 'Découvrez toutes les fonctionnalités disponibles',
        life: 3000
      })

      // Navigate to the most appropriate section
      if (this.stats.totalCustomers > 0) {
        this.goToCustomers()
      } else {
        this.goToProfile()
      }
    }
  }
}
</script>

<style scoped>
.welcome-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--p-primary-50) 0%, var(--p-surface-50) 100%);
}

.quick-action-card {
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.quick-action-card:active {
  transform: translateY(-2px);
}

/* Mobile responsive improvements */
@media (max-width: 768px) {
  .welcome-container {
    padding: 1rem;
  }

  .grid {
    gap: 1rem;
  }

  .quick-action-card {
    margin-bottom: 0.5rem;
  }
}

/* Animation for cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quick-action-card {
  animation: fadeInUp 0.6s ease-out;
}

.quick-action-card:nth-child(2) {
  animation-delay: 0.1s;
}

.quick-action-card:nth-child(3) {
  animation-delay: 0.2s;
}

/* Gradient hover effect for action cards */
.quick-action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(99, 102, 241, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
}

.quick-action-card:hover::before {
  opacity: 1;
}

.quick-action-card .p-card-body {
  position: relative;
  z-index: 1;
}
</style>
