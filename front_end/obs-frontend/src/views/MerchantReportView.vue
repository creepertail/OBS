<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

interface SalesReport {
  merchantId: string
  merchantName: string
  period: {
    startDate: string
    endDate: string
    description: string
  }
  summary: {
    totalRevenue: number
    totalQuantity: number
    totalOrders: number
    averageOrderValue: number
  }
  monthlySales: Array<{
    month: string
    totalQuantity: number
    totalRevenue: number
  }>
}

const report = ref<SalesReport | null>(null)
const loading = ref(true)
const errorMsg = ref('')
const token = localStorage.getItem('accessToken')

onMounted(async () => {
  await fetchSalesReport()
})

async function fetchSalesReport() {
  try {
    loading.value = true
    errorMsg.value = ''

    if (!token) {
      errorMsg.value = '請先登入商家帳號'
      return
    }

    const res = await axios.get<SalesReport>(
      'http://localhost:3000/reports/merchants/sales',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    report.value = res.data
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message || '取得銷售報表失敗'
    console.error(e)
  } finally {
    loading.value = false
  }
}

/* 格式化金額 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

/* 格式化月份 */
function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-')
  return `${year}年${monthNum}月`
}

/* 計算最高收入月份 */
const maxRevenueMonth = computed(() => {
  if (!report.value?.monthlySales.length) return null
  return report.value.monthlySales.reduce((max, current) =>
    current.totalRevenue > max.totalRevenue ? current : max
  )
})

/* 計算圖表的最大值用於比例 */
const maxRevenue = computed(() => {
  if (!report.value?.monthlySales.length) return 0
  return Math.max(...report.value.monthlySales.map(m => m.totalRevenue))
})

/* 計算每個月的收入百分比 */
function getRevenuePercentage(revenue: number): number {
  if (!maxRevenue.value) return 0
  return (revenue / maxRevenue.value) * 100
}
</script>

<template>
  <div class="merchant-report-container">
    <div class="report-header">
      <h1>銷售報表</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMsg" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      <p>{{ errorMsg }}</p>
      <button @click="fetchSalesReport" class="retry-btn">重試</button>
    </div>

    <!-- Report Content -->
    <div v-else-if="report" class="report-content">
      <!-- Merchant Info -->
      <div class="merchant-info">
        <h2>{{ report.merchantName }}</h2>
        <p class="period-text">
          {{ report.period.description }}
          ({{ new Date(report.period.startDate).toLocaleDateString('zh-TW') }} - 
          {{ new Date(report.period.endDate).toLocaleDateString('zh-TW') }})
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card revenue">
          <div class="card-icon">
            <i class="pi pi-dollar"></i>
          </div>
          <div class="card-content">
            <h3>總收入</h3>
            <p class="card-value">{{ formatCurrency(report.summary.totalRevenue) }}</p>
          </div>
        </div>

        <div class="summary-card orders">
          <div class="card-icon">
            <i class="pi pi-shopping-cart"></i>
          </div>
          <div class="card-content">
            <h3>總訂單數</h3>
            <p class="card-value">{{ report.summary.totalOrders.toLocaleString() }}</p>
          </div>
        </div>

        <div class="summary-card quantity">
          <div class="card-icon">
            <i class="pi pi-box"></i>
          </div>
          <div class="card-content">
            <h3>總銷售數量</h3>
            <p class="card-value">{{ report.summary.totalQuantity.toLocaleString() }}</p>
          </div>
        </div>

        <div class="summary-card average">
          <div class="card-icon">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="card-content">
            <h3>平均訂單金額</h3>
            <p class="card-value">{{ formatCurrency(report.summary.averageOrderValue) }}</p>
          </div>
        </div>
      </div>

      <!-- Monthly Sales Chart -->
      <div class="chart-section">
        <h3>月度銷售趨勢</h3>
        <div class="chart-container">
          <div
            v-for="month in report.monthlySales"
            :key="month.month"
            class="chart-bar-wrapper"
          >
            <div class="chart-bar-container">
              <div
                class="chart-bar"
                :style="{ height: `${getRevenuePercentage(month.totalRevenue)}%` }"
                :class="{ 'highest': month.month === maxRevenueMonth?.month }"
              >
                <span class="bar-value">{{ formatCurrency(month.totalRevenue) }}</span>
              </div>
            </div>
            <span class="chart-label">{{ formatMonth(month.month) }}</span>
          </div>
        </div>
      </div>

      <!-- Monthly Sales Table -->
      <div class="table-section">
        <h3>月度銷售明細</h3>
        <div class="table-wrapper">
          <table class="sales-table">
            <thead>
              <tr>
                <th>月份</th>
                <th>銷售數量</th>
                <th>銷售金額</th>
                <th>佔比</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="month in report.monthlySales"
                :key="month.month"
                :class="{ 'highlight': month.month === maxRevenueMonth?.month }"
              >
                <td class="month-cell">
                  {{ formatMonth(month.month) }}
                  <span v-if="month.month === maxRevenueMonth?.month" class="badge">最高</span>
                </td>
                <td class="number-cell">{{ month.totalQuantity.toLocaleString() }}</td>
                <td class="currency-cell">{{ formatCurrency(month.totalRevenue) }}</td>
                <td class="percentage-cell">
                  <div class="percentage-bar-container">
                    <div
                      class="percentage-bar"
                      :style="{ width: `${getRevenuePercentage(month.totalRevenue)}%` }"
                    ></div>
                    <span class="percentage-text">
                      {{ getRevenuePercentage(month.totalRevenue).toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.merchant-report-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f5f7fa;
  min-height: 100vh;
}

.report-header {
  margin-bottom: 2rem;
}

.report-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

/* Loading State */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #666;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0e0;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: #c33;
}

.error-message i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #2980b9;
}

/* Report Content */
.report-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Merchant Info */
.merchant-info {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.merchant-info h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.period-text {
  color: #7f8c8d;
  margin: 0;
  font-size: 0.95rem;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.summary-card.revenue .card-icon {
  background: #e8f5e9;
  color: #4caf50;
}

.summary-card.orders .card-icon {
  background: #e3f2fd;
  color: #2196f3;
}

.summary-card.quantity .card-icon {
  background: #fff3e0;
  color: #ff9800;
}

.summary-card.average .card-icon {
  background: #f3e5f5;
  color: #9c27b0;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
}

.card-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
}

/* Chart Section */
.chart-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.chart-section h3 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 300px;
  gap: 1rem;
  padding: 1rem 0;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.chart-bar-container {
  width: 100%;
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  width: 100%;
  max-width: 80px;
  background: linear-gradient(to top, #3498db, #5dade2);
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
}

.chart-bar:hover {
  background: linear-gradient(to top, #2980b9, #3498db);
  transform: scaleY(1.02);
}

.chart-bar.highest {
  background: linear-gradient(to top, #e74c3c, #ec7063);
}

.bar-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.chart-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-align: center;
  font-weight: 500;
}

/* Table Section */
.table-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.table-wrapper {
  overflow-x: auto;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
}

.sales-table thead {
  background: #f8f9fa;
}

.sales-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
}

.sales-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.sales-table tbody tr:hover {
  background: #f8f9fa;
}

.sales-table tbody tr.highlight {
  background: #fff3cd;
}

.sales-table tbody tr.highlight:hover {
  background: #ffe69c;
}

.sales-table td {
  padding: 1rem;
}

.month-cell {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background: #e74c3c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.number-cell {
  text-align: right;
  color: #34495e;
}

.currency-cell {
  text-align: right;
  color: #27ae60;
  font-weight: 600;
}

.percentage-cell {
  min-width: 200px;
}

.percentage-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.percentage-bar {
  height: 24px;
  background: linear-gradient(to right, #3498db, #5dade2);
  border-radius: 4px;
  transition: width 0.5s ease;
  min-width: 2px;
}

.percentage-text {
  font-weight: 600;
  color: #7f8c8d;
  min-width: 50px;
  text-align: right;
}

/* Responsive Design */
@media (max-width: 768px) {
  .merchant-report-container {
    padding: 1rem;
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
    gap: 0.5rem;
  }

  .chart-bar-container {
    height: 200px;
  }

  .chart-bar {
    max-width: 40px;
  }

  .bar-value {
    font-size: 0.65rem;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }

  .chart-label {
    font-size: 0.75rem;
  }

  .sales-table {
    font-size: 0.9rem;
  }

  .sales-table th,
  .sales-table td {
    padding: 0.75rem 0.5rem;
  }

  .percentage-bar-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .percentage-text {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .card-value {
    font-size: 1.5rem;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
}
</style>
