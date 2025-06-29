<template>
  <div>
    <!-- Enhanced Hamburger Button - Mobile Responsive -->
    <div class="fixed top-3 left-3 z-50 md:top-4 md:left-4">
      <Button
        icon="pi pi-bars"
        variant="text"
        raised
        rounded
        @click="visible = true"
        v-tooltip.right="'Menu principal'"
        aria-label="Ouvrir le menu principal"
        class="w-10 h-10 sm:w-11 sm:h-11"
        :pt="{
          root: {
            class: 'shadow-lg backdrop-blur-sm bg-white/95',
          },
        }"
      />
    </div>

    <!-- Enhanced Drawer - Mobile Responsive -->
    <Drawer
      v-model:visible="visible"
      class="sidebar-drawer"
      :style="isMobile ? 'width: 100vw; max-width: 320px;' : ''"
      :pt="{
        root: { class: 'z-[1000]' },
        content: { class: 'p-0' },
      }"
    >
      <template #container="{ closeCallback }">
        <div class="flex flex-col h-full bg-white">
          <!-- Enhanced Header - Mobile Responsive -->
          <div
            class="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 shrink-0 border-b border-surface-200"
          >
            <div class="flex items-center gap-2 sm:gap-3">
              <div
                class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-lg sm:rounded-xl"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 35 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  class="sm:w-6 sm:h-6"
                >
                  <image
                    xlink:href="@/icons/driving-school-svgrepo-com.svg"
                    width="20"
                    height="20"
                    class="sm:w-6 sm:h-6"
                  />
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-base sm:text-lg text-primary leading-tight"
                  >CamInvoice</span
                >
                <span class="text-xs text-surface-600"
                  >Gestionnaire de factures pour auto-école</span
                >
              </div>
            </div>
            <Button
              type="button"
              @click="closeCallback"
              icon="pi pi-times"
              variant="text"
              rounded
              size="small"
              v-tooltip.left="'Fermer le menu'"
              aria-label="Fermer le menu"
              class="w-8 h-8 sm:w-9 sm:h-9"
            />
          </div>

          <!-- Enhanced Navigation Menu - Mobile Responsive -->
          <div class="overflow-y-auto flex-1 px-3 sm:px-4 py-4 sm:py-6">
            <div class="space-y-1 sm:space-y-2">
              <!-- Dashboard -->
              <div
                @click="navigateTo('lessons')"
                class="nav-item"
                :class="{ 'nav-item-active': isActiveRoute('dashboard') }"
                role="button"
                tabindex="0"
                @keypress.enter="navigateTo('dashboard')"
                v-ripple
              >
                <i class="pi pi-home text-lg"></i>
                <div class="flex-1 min-w-0">
                  <span class="font-medium text-sm sm:text-base">Tableau de bord</span>
                  <div class="text-xs text-surface-500 mt-0.5 hidden sm:block">Vue d'ensemble</div>
                </div>
                <Tag value="Bientôt" severity="info" class="text-xs hidden sm:inline-flex" />
                <div class="w-2 h-2 bg-info-500 rounded-full sm:hidden"></div>
              </div>

              <!-- Customers -->
              <div
                @click="navigateTo('customers')"
                class="nav-item"
                :class="{ 'nav-item-active': isActiveRoute('customers') }"
                role="button"
                tabindex="0"
                @keypress.enter="navigateTo('customers')"
                v-ripple
              >
                <i class="pi pi-users text-lg"></i>
                <div class="flex-1 min-w-0">
                  <span class="font-medium text-sm sm:text-base">Clients</span>
                  <div class="text-xs text-surface-500 mt-0.5 hidden sm:block">
                    Gestion des clients
                  </div>
                </div>
              </div>

              <!-- Invoices -->
              <div
                @click="navigateTo('invoices')"
                class="nav-item"
                :class="{ 'nav-item-active': isActiveRoute('invoices') }"
                role="button"
                tabindex="0"
                @keypress.enter="navigateTo('invoices')"
                v-ripple
              >
                <i class="pi pi-receipt text-lg"></i>
                <div class="flex-1 min-w-0">
                  <span class="font-medium text-sm sm:text-base">Factures</span>
                  <div class="text-xs text-surface-500 mt-0.5 hidden sm:block">
                    Facturation et paiements
                  </div>
                </div>
              </div>

              <!-- Lessons -->
              <div
                @click="navigateTo('lessons')"
                class="nav-item"
                :class="{ 'nav-item-active': isActiveRoute('lessons') }"
                role="button"
                tabindex="0"
                @keypress.enter="navigateTo('lessons')"
                v-ripple
              >
                <i class="pi pi-calendar text-lg"></i>
                <div class="flex-1 min-w-0">
                  <span class="font-medium text-sm sm:text-base">Leçons</span>
                  <div class="text-xs text-surface-500 mt-0.5 hidden sm:block">
                    Planning et cours
                  </div>
                </div>
                <Tag value="Bientôt" severity="info" class="text-xs hidden sm:inline-flex" />
                <div class="w-2 h-2 bg-info-500 rounded-full sm:hidden"></div>
              </div>

              <!-- Profile -->
              <div
                @click="navigateTo('profile')"
                class="nav-item"
                :class="{ 'nav-item-active': isActiveRoute('profile') }"
                role="button"
                tabindex="0"
                @keypress.enter="navigateTo('profile')"
                v-ripple
              >
                <i class="pi pi-user text-lg"></i>
                <div class="flex-1 min-w-0">
                  <span class="font-medium text-sm sm:text-base">Mon Profil</span>
                  <div class="text-xs text-surface-500 mt-0.5 hidden sm:block">
                    Informations personnelles
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions - Mobile Responsive -->
            <Divider class="my-4 sm:my-6" />
            <div class="space-y-2 sm:space-y-3">
              <div
                class="px-1 sm:px-2 text-xs font-semibold text-surface-500 uppercase tracking-wider"
              >
                Actions rapides
              </div>
              <Button
                label="Nouvelle facture"
                icon="pi pi-plus"
                @click="navigateTo('invoices')"
                class="w-full justify-start text-sm"
                outlined
                size="small"
                :pt="{
                  root: { class: 'h-10 sm:h-auto' },
                  label: { class: 'text-sm' },
                }"
              />
              <Button
                label="Ajouter un client"
                icon="pi pi-user-plus"
                @click="navigateTo('customers')"
                class="w-full justify-start text-sm"
                outlined
                size="small"
                :pt="{
                  root: { class: 'h-10 sm:h-auto' },
                  label: { class: 'text-sm' },
                }"
              />
            </div>
          </div>

          <!-- Enhanced User Profile Section - Mobile Responsive -->
          <div class="border-t border-surface-200 p-3 sm:p-4 bg-surface-25">
            <Button
              v-if="!authStore.user"
              @click="navigateTo('login')"
              label="Se connecter"
              icon="pi pi-sign-in"
              class="w-full justify-center h-12"
              size="large"
            />
            <div v-else class="space-y-3">
              <!-- User Info Card - Mobile Responsive -->
              <div
                class="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white border border-surface-200 shadow-sm"
              >
                <Avatar
                  v-if="authStore.user.user_metadata?.avatar_url"
                  :image="authStore.user.user_metadata.avatar_url"
                  shape="circle"
                  :size="isMobile ? 'normal' : 'large'"
                  class="border-2 border-primary-200 flex-shrink-0"
                />
                <Avatar
                  v-else
                  :label="authStore.user.user_metadata?.name?.charAt(0) || 'U'"
                  shape="circle"
                  :size="isMobile ? 'normal' : 'large'"
                  class="bg-primary-500 text-white flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-xs sm:text-sm truncate">
                    {{ authStore.user.user_metadata?.name || "Utilisateur" }}
                  </div>
                  <div class="text-xs text-surface-600 truncate">
                    {{ isMobile ? "Instructeur" : "Instructeur Automobile" }}
                  </div>
                </div>
              </div>

              <!-- User Actions - Mobile Responsive -->
              <div class="flex justify-center">
                <Button
                  @click="handleLogout"
                  label="Se déconnecter"
                  icon="pi pi-sign-out"
                  v-tooltip.top="'Se déconnecter'"
                  severity="contrast"
                  variant="outlined"
                  size="small"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/AuthStore";
import { mapStores } from "pinia";

export default {
  name: "SideBar",
  data() {
    return {
      visible: false,
      isMobile: false,
    };
  },
  computed: {
    ...mapStores(useAuthStore),
    currentRoute() {
      return this.$route.name;
    },
  },
  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 640; // sm breakpoint
    },
    async handleLogout() {
      await this.authStore.logout();
      this.navigateTo("login");
    },
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
      this.visible = false; // Close drawer on mobile after navigation

      // Haptic feedback on mobile (if supported)
      if (this.isMobile && "vibrate" in navigator) {
        navigator.vibrate(50);
      }
    },
    isActiveRoute(routeName) {
      return this.currentRoute === routeName;
    },
  },
};
</script>

<style scoped>
/* Navigation Item Base Styles */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: var(--p-surface-100);
}

.nav-item-active {
  background-color: var(--p-primary-50);
  border-left: 4px solid var(--p-primary-500);
  color: var(--p-primary-700);
}

/* Mobile Responsive Navigation Items */
@media (max-width: 640px) {
  .nav-item {
    padding: 0.5rem 0.625rem;
    gap: 0.5rem;
    min-height: 44px; /* Touch-friendly target */
  }

  .nav-item i {
    font-size: 1rem;
  }
}

/* Enhanced Drawer Styling */
.sidebar-drawer {
  backdrop-filter: blur(8px);
}

/* Smooth animations */
.nav-item {
  transform: translateX(0);
  transition: all 0.2s ease;
}

.nav-item:hover {
  transform: translateX(4px);
}

.nav-item-active {
  transform: translateX(0);
}

/* Mobile-specific styles */
@media (max-width: 640px) {
  .nav-item:hover {
    transform: translateX(2px);
  }

  /* Better touch targets */
  .p-button {
    min-height: 44px;
  }

  .p-button-sm {
    min-height: 40px;
  }
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--p-surface-300);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--p-surface-400);
}

/* Focus states for accessibility */
.nav-item:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Enhanced ripple effect */
.p-ripple {
  overflow: hidden;
  position: relative;
}

/* Better avatar sizing on mobile */
@media (max-width: 640px) {
  .p-avatar {
    width: 32px !important;
    height: 32px !important;
    font-size: 14px !important;
  }
}

/* Smooth drawer opening */
.p-drawer-content {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Mobile hamburger button enhancement */
@media (max-width: 768px) {
  .fixed.top-3.left-3 .p-button {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(2px);
  }
}

/* Tag dots for mobile */
@media (max-width: 640px) {
  .w-2.h-2 {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Grid button improvements */
.grid-cols-3 .p-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Better spacing on mobile */
@media (max-width: 640px) {
  .space-y-1 > * + * {
    margin-top: 0.25rem;
  }

  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }
}
</style>
