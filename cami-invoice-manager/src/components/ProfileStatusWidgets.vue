<template>
  <Card class="profile-status-widget">
    <template #content>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center"
               :class="statusIconClass">
            <i :class="statusIcon"></i>
          </div>
          <div>
            <div class="font-medium text-sm">Profile Status</div>
            <div class="text-xs text-muted-color">{{ statusText }}</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-lg font-bold" :class="progressColor">{{ completionPercentage }}%</div>
            <ProgressBar
              :value="completionPercentage"
              class="w-16 h-1"
              :severity="progressSeverity"
            />
          </div>

          <Button
            icon="pi pi-external-link"
            size="small"
            severity="secondary"
            text
            @click="goToProfile"
            v-tooltip.top="'Manage profile'"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script>
import { ProfileService } from '@/services/ProfileService.js'

export default {
  name: 'ProfileStatusWidget',

  data() {
    return {
      completionPercentage: 0,
      isComplete: false,
      hasProfile: false,
      profileService: new ProfileService()
    }
  },

  computed: {
    statusIcon() {
      if (!this.hasProfile) return 'pi pi-user-plus'
      if (this.isComplete) return 'pi pi-check-circle'
      if (this.completionPercentage > 50) return 'pi pi-exclamation-triangle'
      return 'pi pi-times-circle'
    },

    statusIconClass() {
      if (!this.hasProfile) return 'bg-gray-100 text-gray-600'
      if (this.isComplete) return 'bg-green-100 text-green-600'
      if (this.completionPercentage > 50) return 'bg-yellow-100 text-yellow-600'
      return 'bg-red-100 text-red-600'
    },

    statusText() {
      if (!this.hasProfile) return 'Profile not created'
      if (this.isComplete) return 'Profile complete'
      if (this.completionPercentage > 50) return 'Profile nearly complete'
      return 'Profile incomplete'
    },

    progressColor() {
      if (this.isComplete) return 'text-green-600'
      if (this.completionPercentage > 50) return 'text-yellow-600'
      return 'text-red-600'
    },

    progressSeverity() {
      if (this.isComplete) return 'success'
      if (this.completionPercentage > 50) return 'warning'
      return 'danger'
    }
  },

  async created() {
    await this.loadProfileStatus()
  },

  methods: {
    async loadProfileStatus() {
      try {
        const status = await this.profileService.getProfileCompletionStatus()
        this.completionPercentage = status.completionPercentage
        this.isComplete = status.isComplete
        this.hasProfile = status.hasProfile
      } catch (error) {
        console.error('Error loading profile status:', error)
        // Set safe defaults
        this.completionPercentage = 0
        this.isComplete = false
        this.hasProfile = false
      }
    },

    goToProfile() {
      this.$router.push({ name: 'profile' })
    }
  }
}
</script>

<style scoped>
.profile-status-widget {
  transition: all 0.3s ease;
}

.profile-status-widget:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
