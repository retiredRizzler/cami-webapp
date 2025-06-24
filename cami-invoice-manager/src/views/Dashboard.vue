<template>
  <div class="dashboard-container space-y-6">
    <!-- Welcome Section -->
    <Card class="welcome-card">
      <template #content>
        <div class="bg-primary rounded-2xl p-6 text-primary-contrast">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold mb-2">
                ZALAN IS THE GAYEST #nocap 👋
              </h1>
              <p class="opacity-90 mb-4">
                Ceci est une page statique, il ne faut pas se fier aux données qu'elle affiche
              </p>
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <i class="pi pi-calendar"></i>
                  <span>{{ currentDate }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="pi pi-clock"></i>
                  <span>{{ currentTime }}</span>
                </div>
              </div>
            </div>
            <div class="hidden md:block">
              <div class="w-32 h-32 bg-surface-0/10 rounded-full flex items-center justify-center">
                <i class="pi pi-chart-line text-4xl"></i>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="stats-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-surface-900">{{ stats.totalStudents }}</div>
              <div class="text-sm text-surface-600">Élèves actifs</div>
              <div class="flex items-center gap-1 mt-2">
                <i class="pi pi-arrow-up text-xs"></i>
                <span class="text-xs">+12% ce mois</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-users text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stats-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-surface-900">{{ stats.todayLessons }}</div>
              <div class="text-sm text-surface-600">Leçons aujourd'hui</div>
              <div class="flex items-center gap-1 mt-2">
                <i class="pi pi-calendar text-xs"></i>
                <span class="text-xs text-surface-500">{{ stats.remainingLessons }} restantes</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-calendar text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stats-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-surface-900">{{ stats.monthlyRevenue }}€</div>
              <div class="text-sm text-surface-600">Revenus ce mois</div>
              <div class="flex items-center gap-1 mt-2">
                <i class="pi pi-arrow-up text-xs"></i>
                <span class="text-xs">+8% vs mois dernier</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-euro text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stats-card">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-surface-900">{{ stats.pendingInvoices }}</div>
              <div class="text-sm text-surface-600">Factures en attente</div>
              <div class="flex items-center gap-1 mt-2">
                <i class="pi pi-exclamation-circle text-xs"></i>
                <span class="text-xs">{{ stats.overdueInvoices }} en retard</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center">
              <i class="pi pi-receipt text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Section -->
      <div class="lg:col-span-2">
        <Card class="h-full">
          <template #header>
            <div class="flex items-center justify-between p-6 pb-0">
              <div>
                <h3 class="text-lg font-semibold text-surface-900">Revenus mensuels</h3>
                <p class="text-sm text-surface-600">Évolution sur les 6 derniers mois</p>
              </div>
              <div class="flex gap-2">
                <Button
                  icon="pi pi-download"
                  variant="outlined"
                  size="small"
                  v-tooltip="'Exporter les données'"
                />
                <Button
                  icon="pi pi-refresh"
                  variant="outlined"
                  size="small"
                  @click="refreshChartData"
                  v-tooltip="'Actualiser'"
                />
              </div>
            </div>
          </template>
          <template #content>
            <div class="chart-container">
              <canvas ref="revenueChart" class="w-full h-64"></canvas>
            </div>
          </template>
        </Card>
      </div>

      <!-- Today's Schedule -->
      <div class="space-y-6">
        <Card>
          <template #header>
            <div class="flex items-center justify-between p-6 pb-0">
              <h3 class="text-lg font-semibold text-surface-900">Planning d'aujourd'hui</h3>
              <Button
                label="Voir tout"
                variant="text"
                size="small"
                @click="navigateToLessons"
              />
            </div>
          </template>
          <template #content>
            <div class="space-y-4">
              <div
                v-for="lesson in todaySchedule"
                :key="lesson.id"
                class="flex items-center gap-4 p-4 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <div class="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center">
                  <Avatar
                    :label="lesson.studentName.charAt(0)"
                    class="bg-primary text-primary-contrast"
                    size="small"
                  />
                </div>
                <div class="flex-1">
                  <div class="font-medium text-surface-900">{{ lesson.studentName }}</div>
                  <div class="text-sm text-surface-600">{{ lesson.lessonType }}</div>
                  <div class="text-xs text-surface-500">{{ lesson.time }} - {{ lesson.duration }}</div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <Tag
                    :value="lesson.status"
                    :severity="getStatusSeverity(lesson.status)"
                    class="text-xs"
                  />
                  <Button
                    icon="pi pi-phone"
                    variant="text"
                    size="small"
                    @click="callStudent(lesson.studentPhone)"
                    v-tooltip="'Appeler l\'élève'"
                  />
                </div>
              </div>
              <div v-if="todaySchedule.length === 0" class="text-center py-8 text-surface-500">
                <i class="pi pi-calendar text-3xl mb-3 block"></i>
                Aucune leçon prévue aujourd'hui
              </div>
            </div>
          </template>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <template #header>
            <div class="p-6 pb-0">
              <h3 class="text-lg font-semibold text-surface-900">Actions rapides</h3>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-2 gap-3">
              <Button
                label="Nouvelle facture"
                icon="pi pi-receipt"
                @click="quickAction('create-invoice')"
                class="h-16 flex-col gap-2"
                outlined
              />
              <Button
                label="Ajouter élève"
                icon="pi pi-user-plus"
                @click="quickAction('create-customer')"
                class="h-16 flex-col gap-2"
                outlined
              />
              <Button
                label="Planifier leçon"
                icon="pi pi-calendar-plus"
                @click="quickAction('create-lesson')"
                class="h-16 flex-col gap-2"
                outlined
              />
              <Button
                label="Voir rapports"
                icon="pi pi-chart-line"
                @click="quickAction('reports')"
                class="h-16 flex-col gap-2"
                outlined
              />
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Recent Activity & Notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Invoices -->
      <Card>
        <template #header>
          <div class="flex items-center justify-between p-6 pb-0">
            <h3 class="text-lg font-semibold text-surface-900">Factures récentes</h3>
            <Button
              label="Voir toutes"
              variant="text"
              size="small"
              @click="navigateToInvoices"
            />
          </div>
        </template>
        <template #content>
          <div class="space-y-3">
            <div
              v-for="invoice in recentInvoices"
              :key="invoice.id"
              class="flex items-center justify-between p-4 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors cursor-pointer"
              @click="viewInvoice(invoice.id)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center">
                  <i class="pi pi-receipt text-surface-600"></i>
                </div>
                <div>
                  <div class="font-medium text-surface-900">{{ invoice.number }}</div>
                  <div class="text-sm text-surface-600">{{ invoice.customerName }}</div>
                  <div class="text-xs text-surface-500">{{ formatDate(invoice.date) }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-surface-900">{{ invoice.amount }}€</div>
                <Tag
                  :value="invoice.status"
                  :severity="getInvoiceStatusSeverity(invoice.status)"
                  class="text-xs mt-1"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- System Status & Tips -->
      <Card>
        <template #header>
          <div class="p-6 pb-0">
            <h3 class="text-lg font-semibold text-surface-900">État du système</h3>
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <!-- System Status -->
            <div class="flex items-center justify-between p-4 bg-surface-100 rounded-lg border border-surface-200">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span class="font-medium">Système opérationnel</span>
              </div>
              <span class="text-sm text-surface-600">99.9% uptime</span>
            </div>

            <!-- Tips Section -->
            <div class="space-y-3">
              <h4 class="font-medium text-surface-900">💡 Conseils du jour</h4>
              <div class="bg-surface-100 p-4 rounded-lg border border-surface-200">
                <div class="flex items-start gap-3">
                  <i class="pi pi-lightbulb mt-1"></i>
                  <div>
                    <div class="font-medium text-sm">Optimisez vos revenus</div>
                    <div class="text-surface-600 text-xs mt-1">
                      Pensez à envoyer des rappels pour les factures en retard.
                      Cela peut améliorer votre trésorerie de 15% en moyenne.
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-surface-100 p-4 rounded-lg border border-surface-200">
                <div class="flex items-start gap-3">
                  <i class="pi pi-star mt-1"></i>
                  <div>
                    <div class="font-medium text-sm">Fidélisation élèves</div>
                    <div class="text-surface-600 text-xs mt-1">
                      {{ stats.totalStudents }} élèves actifs ! Pensez à leur proposer
                      des cours de perfectionnement.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      currentTime: '',
      stats: {
        totalStudents: 127,
        todayLessons: 8,
        remainingLessons: 3,
        monthlyRevenue: 12450,
        pendingInvoices: 23,
        overdueInvoices: 5
      },
      todaySchedule: [
        {
          id: 1,
          studentName: 'Marie Dubois',
          lessonType: 'Leçon de conduite',
          time: '14:00',
          duration: '1h',
          status: 'Confirmée',
          studentPhone: '+33123456789'
        },
        {
          id: 2,
          studentName: 'Pierre Martin',
          lessonType: 'Code de la route',
          time: '16:30',
          duration: '1h30',
          status: 'En attente',
          studentPhone: '+33123456790'
        },
        {
          id: 3,
          studentName: 'Sophie Laurent',
          lessonType: 'Leçon de conduite',
          time: '18:00',
          duration: '1h',
          status: 'Confirmée',
          studentPhone: '+33123456791'
        }
      ],
      recentInvoices: [
        {
          id: 1,
          number: 'FAC-2025-001',
          customerName: 'Jean Dupont',
          amount: 280,
          status: 'Payée',
          date: new Date(Date.now() - 86400000)
        },
        {
          id: 2,
          number: 'FAC-2025-002',
          customerName: 'Marie Dubois',
          amount: 350,
          status: 'En attente',
          date: new Date(Date.now() - 172800000)
        },
        {
          id: 3,
          number: 'FAC-2025-003',
          customerName: 'Pierre Martin',
          amount: 420,
          status: 'En retard',
          date: new Date(Date.now() - 604800000)
        }
      ]
    }
  },
  computed: {
    userName() {
      return 'Instructeur'; // You can replace this with actual user data
    },
    currentDate() {
      return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  mounted() {
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
    this.initChart();
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  methods: {
    updateTime() {
      this.currentTime = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    initChart() {
      // Simple chart simulation - in real app, use Chart.js or similar
      const canvas = this.$refs.revenueChart;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 256;

        // Draw a simple line chart
        ctx.fillStyle = 'var(--p-surface-0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'var(--p-primary-color)';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const data = [8000, 9500, 11200, 10800, 12450, 13200];
        const points = data.map((value, index) => ({
          x: (index / (data.length - 1)) * (canvas.width - 40) + 20,
          y: canvas.height - 40 - ((value - 7000) / 7000) * (canvas.height - 80)
        }));

        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = 'var(--p-primary-color)';
        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    },
    refreshChartData() {
      this.initChart();
      this.$toast.add({
        severity: 'success',
        summary: 'Données actualisées',
        detail: 'Le graphique a été mis à jour',
        life: 2000
      });
    },
    quickAction(action) {
      this.$router.push({ name: action });
      this.$toast.add({
        severity: 'info',
        summary: 'Navigation',
        detail: `Redirection vers ${action}`,
        life: 2000
      });
    },
    navigateToLessons() {
      this.$router.push({ name: 'lessons' });
    },
    navigateToInvoices() {
      this.$router.push({ name: 'invoices' });
    },
    callStudent(phone) {
      this.$toast.add({
        severity: 'info',
        summary: 'Appel en cours',
        detail: `Appel vers ${phone}`,
        life: 3000
      });
    },
    viewInvoice(id) {
      this.$router.push({ name: 'invoice-detail', params: { id } });
    },
    getStatusSeverity(status) {
      const severities = {
        'Confirmée': 'success',
        'En attente': 'warning',
        'Annulée': 'danger'
      };
      return severities[status] || 'info';
    },
    getInvoiceStatusSeverity(status) {
      const severities = {
        'Payée': 'success',
        'En attente': 'warning',
        'En retard': 'danger'
      };
      return severities[status] || 'info';
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 256px;
  position: relative;
}
</style>
