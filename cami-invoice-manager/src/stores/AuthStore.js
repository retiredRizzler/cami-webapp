// src/stores/AuthStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient.js'

export const useAuthStore = defineStore('auth', {
  state() {
    return {
      user: null,
      isLoading: true
    }
  },
  actions: {
    async init() {
      const { data } = await supabase.auth.getSession()
      this.user = data.session?.user || null
      this.isLoading = false

      supabase.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null
      })
    },
    async loginOAuth() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) {
        throw error;
      }
    },
    async logout() {
      await supabase.auth.signOut()
      this.user = null
    }
  }
})
