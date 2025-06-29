<template>
  <div v-if="authStore.user"> Bienvenue {{ authStore.user.user_metadata.name }}, vous êtes connecté via votre compte google.</div>
  <div v-else class="min-h-screen flex items-center justify-center p-4">
    <!-- Toast container -->
    <Toast />

    <div class="w-full max-w-md">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2">Bienvenue sur CamInvoice</h1>
        <p>Pour l'instant la connexion directe par email et mot de passe est désactivée. Connectez-vous via Google svp.</p>
      </div>

      <!-- Login Card -->
      <div class="card p-6">
        <!-- Google Login Button -->
        <Button
          @click="loginWithGoogle"
          :loading="googleLoading"
          class="w-full mb-6 flex items-center justify-center gap-2"
          severity="secondary"
          outlined
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuez avec Google
        </Button>

        <!-- Divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 border-t"></div>
          <span class="px-4 text-sm">or</span>
          <div class="flex-1 border-t"></div>
        </div>

        <!-- Email/Password Form -->
        <Form
          v-slot="$form"
          :resolver="resolver"
          :initialValues="initialValues"
          @submit="onFormSubmit"
          class="flex flex-col gap-4"
        >
          <!-- Email Field -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <InputText
                id="email"
                name="email"
                type="email"
                fluid
                :invalid="$form.email?.invalid"
                autocomplete="email"
              />
              <label for="email">Email</label>
            </FloatLabel>
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
              {{ $form.email.error?.message }}
            </Message>
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-1">
            <FloatLabel variant="on">
              <Password
                id="password"
                name="password"
                fluid
                :invalid="$form.password?.invalid"
                :feedback="false"
                toggleMask
                autocomplete="current-password"
              />
              <label for="password">Mot de passe</label>
            </FloatLabel>
            <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
              {{ $form.password.error?.message }}
            </Message>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <Checkbox id="remember" v-model="rememberMe" binary />
              <label for="remember" class="text-sm"> Se souvenir de moi </label>
            </div>
            <Button link size="small" class="p-0 text-sm" @click="showForgotPassword">
              Mot de passe oublié?
            </Button>
          </div>

          <!-- Submit Button -->
          <Button type="submit" :loading="loginLoading" class="w-full" label="Sign In" />
        </Form>

        <!-- Sign Up Link -->
        <div class="text-center mt-6 pt-6 border-t">
          <p class="text-sm">
            Pas encore de compte?
            <Button link class="p-0 text-sm font-medium" @click="goToSignUp"> Créez un nouveau compte </Button>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs"></p>
      </div>
    </div>
  </div>
</template>

<script>
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/AuthStore.js";
import { mapStores } from "pinia";

export default {
  name: "LoginView",
  data() {
    return {
      // Form state
      initialValues: {
        email: "",
        password: "",
      },

      // Form validation
      resolver: zodResolver(
        z.object({
          email: z
            .string()
            .min(1, { message: "Email is required." })
            .email({ message: "Please enter a valid email address." }),
          password: z
            .string()
            .min(1, { message: "Password is required." })
            .min(6, { message: "Password must be at least 6 characters." }),
        })
      ),

      // UI state
      loginLoading: false,
      googleLoading: false,
      rememberMe: false,
    };
  },

  computed: {
    ...mapStores(useAuthStore),
  },

  methods: {
    async onFormSubmit({ valid, values }) {
      return
    },

    async loginWithGoogle() {
      this.googleLoading = true;

      try {
        this.authStore.loginOAuth();
        this.$router.push({
          name: 'customers'
        });

      } catch (error) {
        console.error("Google login error:", error);
        this.$toast.add({
          severity: "error",
          summary: "Google Login Failed",
          detail: error.message || "Unable to sign in with Google.",
          life: 5000,
        });
        this.googleLoading = false;
      }
    },

    goToSignUp() {
      this.$router.push("/signup");
    },
  },

  // Check if user is already logged in
  async created() {
    if (this.authStore.user) {
      this.$router.push("/");
    }
  },
};
</script>
