<template>
  <div id="app" class="min-h-screen bg-surface-50">
    <!-- Loading Overlay -->
    <div
      v-if="isInitializing"
      class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div class="text-center space-y-4">
        <ProgressSpinner strokeWidth="3" />
        <div class="text-lg font-medium text-surface-700">
          Chargement de l'application...
        </div>
        <div class="text-sm text-surface-500">
          Préparation de votre espace de travail
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <SideBar />

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'blur-sm': isInitializing }">
      <!-- Top Navigation Bar - Mobile Responsive -->
      <header v-if="authStore.user" class="bg-white border-b border-surface-200 sticky top-0 z-40 shadow-sm">
        <!-- Mobile Header -->
        <div class="md:hidden">
          <div class="flex items-center justify-between p-3">
            <!-- Left: Page Title (Compact) -->
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <div class="w-6 h-6 bg-primary-100 rounded-md flex items-center justify-center flex-shrink-0">
                <i :class="currentPageIcon" class="text-primary-600 text-sm"></i>
              </div>
              <div class="min-w-0 flex-1">
                <h1 class="text-lg font-semibold text-surface-900 truncate">
                  {{ currentPageTitle }}
                </h1>
              </div>
            </div>

            <!-- Right: Mobile Actions -->
            <div class="flex items-center gap-1">
              <!-- Quick Actions -->
              <Button
                icon="pi pi-plus"
                @click="toggleQuickActions"
                variant="text"
                rounded
                size="small"
                class="w-8 h-8"
                v-tooltip.bottom="'Quick Actions'"
              />
            </div>
          </div>
        </div>

        <!-- Desktop Header -->
        <div class="hidden md:block">
          <div class="flex items-center justify-between px-6 py-4">
            <!-- Page Title Area -->
            <div class="flex items-center gap-4 ml-16">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i :class="currentPageIcon" class="text-primary-600"></i>
                </div>
                <div>
                  <h1 class="text-xl font-bold text-surface-900">
                    {{ currentPageTitle }}
                  </h1>
                  <p class="text-sm text-surface-600">
                    {{ currentPageDescription }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Right Side Actions (Desktop) -->
            <div class="flex items-center gap-3">
              <!-- Quick Actions Menu -->
              <Button
                icon="pi pi-plus"
                label="Nouveau"
                @click="toggleQuickActions"
                v-tooltip.bottom="'Actions rapides'"
              />

              <!-- User Menu -->
              <div v-if="authStore.user" class="flex items-center gap-2">
                <Button
                  icon="pi pi-user"
                  variant="text"
                  rounded
                  @click="this.$router.push({name: 'profile'})"
                  v-tooltip.bottom="'Mon compte'"
                />
              </div>
            </div>
          </div>

          <!-- Breadcrumb Navigation (Desktop Only) -->
          <div class="px-6 pb-3" v-if="breadcrumbs.length > 1">
            <Breadcrumb :model="breadcrumbs" class="bg-transparent p-0">
              <template #item="{ item, props }">
                <router-link
                  v-if="item.route"
                  v-bind="props.action"
                  :to="item.route"
                  class="text-primary-600 hover:text-primary-700"
                >
                  <span :class="item.icon" v-if="item.icon"></span>
                  <span class="ml-2">{{ item.label }}</span>
                </router-link>
                <span v-else v-bind="props.action" class="text-surface-600">
                  <span :class="item.icon" v-if="item.icon"></span>
                  <span class="ml-2">{{ item.label }}</span>
                </span>
              </template>
            </Breadcrumb>
          </div>
        </div>
      </header>

      <!-- Page Content Container - Mobile Responsive -->
      <main class="flex-1 p-3 sm:p-6">
        <div class="max-w-7xl mx-auto">
          <!-- Page Content with Smooth Transitions -->
          <transition name="page" mode="out-in">
            <RouterView v-slot="{ Component, route }">
              <component
                :is="Component"
                :key="route.path"
                class="animate-fade-in"
              />
            </RouterView>
          </transition>
        </div>
      </main>

      <!-- Footer - Mobile Responsive -->
      <footer class="bg-white flex items-center border-t border-surface-200 mt-auto">
        <div class="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <!-- Mobile Footer -->
          <div class="md:hidden text-center">
            <div class="text-xs text-surface-600 space-y-1">
              <div>© 2025 Driving School Pro</div>
              <div class="flex items-center justify-center gap-1">
                <div class="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>

          <!-- Desktop Footer -->
          <div class="hidden md:flex items-center justify-between text-sm text-surface-600">
            <div class="flex items-center gap-4">
              <span>© 2025 Driving School Pro</span>
              <Divider layout="vertical" class="h-4" />
              <span>Version 1.0.0</span>
              <Divider layout="vertical" class="h-4" />
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span>Système opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Global Overlays -->
    <ConfirmDialog />

    <!-- Quick Actions Overlay Panel - Mobile Responsive -->
    <OverlayPanel ref="quickActionsPanel" :class="isMobile ? 'w-72' : 'w-80'">
      <div class="space-y-4">
        <div class="font-semibold text-surface-900 border-b border-surface-200 pb-2">
          Actions rapides
        </div>
        <div class="grid grid-cols-2 gap-3">
          <Button
            label="Nouvelle facture"
            icon="pi pi-receipt"
            @click="quickAction('invoices')"
            class="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
            outlined
          />
          <Button
            label="Nouveau client"
            icon="pi pi-user-plus"
            @click="quickAction('customers')"
            class="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm"
            outlined
          />
        </div>
      </div>
    </OverlayPanel>

    <!-- Notifications Panel - Mobile Responsive -->
    <OverlayPanel ref="notificationsPanel" :class="isMobile ? 'w-80 max-w-[90vw]' : 'w-96'">
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-surface-200 pb-2">
          <span class="font-semibold text-surface-900">Notifications</span>
          <Button
            label="Tout marquer comme lu"
            variant="text"
            size="small"
            @click="markAllAsRead"
            class="text-xs"
          />
        </div>
        <div class="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
          <div
            v-for="notification in recentNotifications"
            :key="notification.id"
            class="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors"
            :class="{ 'bg-primary-50': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                 :class="getNotificationIconClass(notification.type)">
              <i :class="getNotificationIcon(notification.type)" class="text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-surface-900">
                {{ notification.title }}
              </div>
              <div class="text-xs text-surface-600 mt-1 line-clamp-2">
                {{ notification.message }}
              </div>
              <div class="text-xs text-surface-500 mt-2">
                {{ formatRelativeTime(notification.createdAt) }}
              </div>
            </div>
            <div v-if="!notification.read" class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
          </div>
          <div v-if="recentNotifications.length === 0" class="text-center py-8 text-surface-500">
            <i class="pi pi-bell text-3xl mb-3 block"></i>
            <div class="text-sm">Aucune notification</div>
          </div>
        </div>
      </div>
    </OverlayPanel>

    <!-- Mobile Bottom Navigation (Optional - For Future) -->
    <!--
    <div v-if="isMobile && authStore.user" class="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-200 z-30">
      <div class="grid grid-cols-4 gap-1 p-2">
        <Button
          icon="pi pi-home"
          @click="$router.push('/dashboard')"
          variant="text"
          class="flex-col gap-1 text-xs h-12"
          :class="{ 'text-primary': $route.name === 'dashboard' }"
        >
          <span>Home</span>
        </Button>
        <Button
          icon="pi pi-users"
          @click="$router.push('/customers')"
          variant="text"
          class="flex-col gap-1 text-xs h-12"
          :class="{ 'text-primary': $route.name === 'customers' }"
        >
          <span>Clients</span>
        </Button>
        <Button
          icon="pi pi-receipt"
          @click="$router.push('/invoices')"
          variant="text"
          class="flex-col gap-1 text-xs h-12"
          :class="{ 'text-primary': $route.name === 'invoices' }"
        >
          <span>Factures</span>
        </Button>
        <Button
          icon="pi pi-user"
          @click="$router.push('/profile')"
          variant="text"
          class="flex-col gap-1 text-xs h-12"
          :class="{ 'text-primary': $route.name === 'profile' }"
        >
          <span>Profil</span>
        </Button>
      </div>
    </div>
    -->
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import { mapStores } from 'pinia';
import { useAuthStore } from '@/stores/AuthStore';

export default {
  name: 'App',
  components: {
    SideBar
  },
  data() {
    return {
      isInitializing: true,
      globalSearch: '',
      unreadNotifications: 3,
      showMobileSearch: false,
      isMobile: false,
      recentNotifications: [
        {
          id: 1,
          type: 'success',
          title: 'Facture payée',
          message: 'La facture #2024-001 a été payée par Jean Dupont',
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          read: false
        },
        {
          id: 2,
          type: 'warning',
          title: 'Leçon rappel',
          message: 'Leçon prévue avec Marie Martin dans 1 heure',
          createdAt: new Date(Date.now() - 1000 * 60 * 60),
          read: false
        },
        {
          id: 3,
          type: 'info',
          title: 'Nouveau message',
          message: 'Pierre Durand a envoyé un message',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: true
        }
      ]
    }
  },
  computed: {
    ...mapStores(useAuthStore),
    currentPageTitle() {
      const titles = {
        'dashboard': 'Tableau de bord',
        'customers': 'Gestion des clients',
        'invoices': 'Facturation',
        'lessons': 'Planning des leçons',
        'reports': 'Rapports',
        'profile': 'Mon Profil',
        'settings': 'Paramètres'
      };
      return titles[this.$route.name] || 'Driving School Pro';
    },
    currentPageDescription() {
      const descriptions = {
        'dashboard': 'Vue d\'ensemble de votre activité',
        'customers': 'Gérez vos clients et leurs informations',
        'invoices': 'Créez et suivez vos factures',
        'lessons': 'Planifiez et organisez vos cours',
        'reports': 'Analysez vos performances',
        'profile': 'Gérez vos informations d\'instructeur',
        'settings': 'Configurez votre application'
      };
      return descriptions[this.$route.name] || 'Gestion professionnelle de votre auto-école';
    },
    currentPageIcon() {
      const icons = {
        'dashboard': 'pi pi-home',
        'customers': 'pi pi-users',
        'invoices': 'pi pi-receipt',
        'lessons': 'pi pi-calendar',
        'reports': 'pi pi-chart-line',
        'profile': 'pi pi-user',
        'settings': 'pi pi-cog'
      };
      return icons[this.$route.name] || 'pi pi-home';
    },
    breadcrumbs() {
      const route = this.$route;
      const breadcrumbs = [
        { label: 'Accueil', icon: 'pi pi-home', route: { name: 'dashboard' } }
      ];

      if (route.name !== 'dashboard') {
        breadcrumbs.push({
          label: this.currentPageTitle,
          icon: this.currentPageIcon
        });
      }

      return breadcrumbs;
    }
  },
  async created() {
    await this.authStore.init();
    this.isInitializing = false;
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  mounted() {
    this.$primevue.config.ripple = true;
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },

    toggleMobileSearch() {
      this.showMobileSearch = !this.showMobileSearch;
      if (this.showMobileSearch) {
        this.$nextTick(() => {
          this.$refs.mobileSearchInput?.$el.focus();
        });
      }
    },

    hideMobileSearchOnEmpty() {
      if (!this.globalSearch.trim()) {
        setTimeout(() => {
          this.showMobileSearch = false;
        }, 200);
      }
    },

    toggleQuickActions(event) {
      this.$refs.quickActionsPanel.toggle(event);
    },
    toggleNotifications(event) {
      this.$refs.notificationsPanel.toggle(event);
    },
    toggleUserMenu(event) {
      // Implementation for user menu
    },
    quickAction(action) {
      this.$refs.quickActionsPanel.hide();
      this.$router.push({ name: action });
      this.$toast.add({
        severity: 'info',
        summary: 'Navigation',
        detail: 'Redirection vers ' + action,
        life: 2000
      });
    },
    performGlobalSearch() {
      if (this.globalSearch.trim()) {
        this.$toast.add({
          severity: 'info',
          summary: 'Recherche',
          detail: `Recherche pour: ${this.globalSearch}`,
          life: 3000
        });
        if (this.isMobile) {
          this.showMobileSearch = false;
        }
      }
    },
    markAllAsRead() {
      this.recentNotifications.forEach(n => n.read = true);
      this.unreadNotifications = 0;
      this.$toast.add({
        severity: 'success',
        summary: 'Notifications',
        detail: 'Toutes les notifications ont été marquées comme lues',
        life: 2000
      });
    },
    handleNotificationClick(notification) {
      if (!notification.read) {
        notification.read = true;
        this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
      }
      this.$refs.notificationsPanel.hide();
    },
    getNotificationIcon(type) {
      const icons = {
        'success': 'pi pi-check',
        'warning': 'pi pi-exclamation-triangle',
        'error': 'pi pi-times',
        'info': 'pi pi-info'
      };
      return icons[type] || 'pi pi-info';
    },
    getNotificationIconClass(type) {
      const classes = {
        'success': 'bg-success-100 text-success-600',
        'warning': 'bg-warning-100 text-warning-600',
        'error': 'bg-danger-100 text-danger-600',
        'info': 'bg-info-100 text-info-600'
      };
      return classes[type] || 'bg-info-100 text-info-600';
    },
    formatRelativeTime(date) {
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
      if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
      if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
      return 'À l\'instant';
    },
    openSupport() {
      this.$toast.add({
        severity: 'info',
        summary: 'Support',
        detail: 'Ouverture du centre d\'aide...',
        life: 2000
      });
    },
    openDocs() {
      this.$toast.add({
        severity: 'info',
        summary: 'Documentation',
        detail: 'Ouverture de la documentation...',
        life: 2000
      });
    }
  }
}
</script>

<style scoped>
.main-content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Mobile responsive improvements */
@media (max-width: 768px) {
  .p-button {
    min-height: 44px;
  }

  .p-button-sm {
    min-height: 36px;
  }

  .p-inputtext {
    min-height: 44px;
    font-size: 16px;
  }

  /* Better touch targets */
  .p-button.w-8.h-8 {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Custom scrollbar for notifications */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: var(--p-surface-100);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--p-surface-300);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--p-surface-400);
}

/* Line clamp for text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions for mobile search */
.p-inputtext {
  transition: all 0.2s ease;
}

/* Enhanced mobile header */
@media (max-width: 768px) {
  header {
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.95);
  }
}

/* Better mobile overlay panels */
@media (max-width: 768px) {
  .p-overlaypanel {
    max-width: 90vw;
    margin: 0 auto;
  }
}

/* Focus states for accessibility */
.p-button:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}
</style>
