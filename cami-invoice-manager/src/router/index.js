import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/AuthStore.js";

// Import all components directly (no lazy loading)
import LoginView from "@/views/LoginView.vue";
import Dashboard from "@/views/Dashboard.vue";
import CustomersView from "@/views/CustomersView.vue";
import InvoicesView from "@/views/InvoicesView.vue";
import ProfileView from "@/views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      redirect: "/customers",
      meta: {
        title: "Home"
      }
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
        title: "Tableau de bord"
      }
    },
    {
      path: "/customers",
      name: "customers",
      component: CustomersView,
      meta: {
        requiresAuth: true,
        title: "Clients"
      },
    },
    {
      path: "/invoices",
      name: "invoices",
      component: InvoicesView,
      meta: {
        requiresAuth: true,
        title: "Factures"
      },
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
      meta: {
        requiresAuth: true,
        title: "Profil"
      },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - CamInvoice` : 'CamInvoice'

  const authStore = useAuthStore();

  if (authStore.isLoading) {
    await authStore.init();
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.user) {
      console.log("Accès refusé : authentification requise");
      next({
        name: "login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
