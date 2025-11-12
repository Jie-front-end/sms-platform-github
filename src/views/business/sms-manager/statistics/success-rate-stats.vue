<template>
  <div class="success-rate-stats">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row" :gutter="16">
        <a-form-item label="统计类型" class="smart-query-form-item">
          <a-radio-group v-model:value="queryForm.statsType" @change="handleStatsTypeChange">
            <a-radio-button value="day">按日</a-radio-button>
            <a-radio-button value="week">按周</a-radio-button>
            <a-radio-button value="month">按月</a-radio-button>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="日期范围" class="smart-query-form-item">
          <a-range-picker
            v-model:value="queryForm.dateRange"
            :format="dateFormat"
            :picker="queryForm.statsType === 'month' ? 'month' : queryForm.statsType === 'week' ? 'week' : 'date'"
            @change="handleDateChange"
          />
        </a-form-item>

        <a-form-item label="签名名称" class="smart-query-form-item">
          <SignSelect
            v-model:value="queryForm.signName"
            placeholder="请选择签名名称"
            style="width: 160px;"
            allowClear
          />
        </a-form-item>

        <a-form-item label="模板代码" class="smart-query-form-item">
          <a-input
            v-model:value="queryForm.templateName"
            placeholder="请点击选择模板"
            readonly
            style="width: 200px;"
            allowClear
            @click="showTemplateModal"
            @clear="handleTemplateClear"
          >
            <template #suffix>
              <SearchOutlined style="cursor: pointer; color: #1890ff" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item class="smart-query-form-item">
          <a-button type="primary" @click="queryStats">
            <template #icon><SearchOutlined /></template>
            查询
          </a-button>
          <a-button @click="resetQuery" class="smart-margin-left10">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>

    <!-- 成功率告警提示 -->
    <a-alert
      v-if="overview.successRate < 90"
      message="成功率告警"
      :description="`当前成功率为 ${overview.successRate}%，低于正常水平（90%），请及时检查发送情况！`"
      type="warning"
      show-icon
      closable
      style="margin-bottom: 16px;"
    />

    <!-- 统计概览卡片 -->
    <a-row :gutter="16" style="margin-bottom: 16px;">
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="平均成功率"
            :value="overview.successRate"
            :precision="2"
            suffix="%"
            :value-style="{ color: getSuccessRateColor(overview.successRate) }"
          >
            <template #prefix>
              <PercentageOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="最高成功率"
            :value="overview.maxRate"
            :precision="2"
            suffix="%"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <ArrowUpOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="最低成功率"
            :value="overview.minRate"
            :precision="2"
            suffix="%"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #prefix>
              <ArrowDownOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="稳定性"
            :value="overview.stability"
            suffix=""
            :value-style="{ color: overview.stability === '优' ? '#52c41a' : overview.stability === '良' ? '#1890ff' : '#faad14' }"
          >
            <template #prefix>
              <StockOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- ECharts 图表 -->
    <a-card :bordered="false" style="margin-bottom: 16px;">
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </a-card>

    <!-- 数据表格 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="currentPageData"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="key"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'successRate'">
            <a-progress
              :percent="parseFloat(record.successRate)"
              :status="getProgressStatus(record.successRate)"
              :stroke-color="getSuccessRateColor(record.successRate)"
            />
          </template>
        </template>
      </a-table>
    </a-card>
  </div>

  <!-- 模板选择弹窗 -->
  <TemplateSelectModal ref="templateModalRef" :signName="queryForm.signName" @select="handleTemplateSelect" />
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  SearchOutlined,
  ReloadOutlined,
  PercentageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  StockOutlined
} from '@ant-design/icons-vue'
import { statisticsApi } from '/@/api/business/sms-manager/statistics-api'
import SignSelect from '/@/components/business/sign-select/index.vue'
import TemplateSelectModal from '/@/components/business/template-select-modal/index.vue'

// 模板选择弹窗引用
const templateModalRef = ref(null)

// 查询表单
const queryForm = reactive({
  statsType: 'day', // day-按日, week-按周, month-按月
  dateRange: [dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')], // 默认最近7天
  signName: '南宁交通物流集团', // 默认签名
  templateCode: '',
  templateName: '' // 用于显示模板名称
})

// 日期格式
const dateFormat = computed(() => {
  switch (queryForm.statsType) {
    case 'month':
      return 'YYYY-MM'
    case 'week':
      return 'YYYY-wo'
    default:
      return 'YYYY-MM-DD'
  }
})

// 统计概览
const overview = reactive({
  successRate: 0,
  maxRate: 0,
  minRate: 0,
  stability: '优', // 优、良、中、差
})

// 表格列定义（动态）
const columns = computed(() => {
  const baseColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'key',
      width: 150,
    },
    {
      title: '总发送量',
      dataIndex: 'totalSent',
      key: 'totalSent',
      width: 120,
      align: 'right',
    },
    {
      title: '成功数',
      dataIndex: 'successSent',
      key: 'successSent',
      width: 120,
      align: 'right',
    },
    {
      title: '失败数',
      dataIndex: 'failedSent',
      key: 'failedSent',
      width: 120,
      align: 'right',
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 200,
      align: 'center',
    },
  ]

  return baseColumns
})

// 表格数据
const tableData = ref([])
const allTableData = ref([]) // 保存所有数据用于前端分页
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
})

// 计算当前页的数据
const currentPageData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return allTableData.value.slice(start, end)
})

// 图表实例
const chartRef = ref(null)
let chartInstance = null

// 获取成功率颜色
const getSuccessRateColor = (rate) => {
  if (rate >= 95) return '#52c41a'
  if (rate >= 90) return '#1890ff'
  if (rate >= 85) return '#faad14'
  return '#ff4d4f'
}

// 获取进度条状态
const getProgressStatus = (rate) => {
  if (rate >= 95) return 'success'
  if (rate >= 90) return 'normal'
  if (rate >= 85) return 'active'
  return 'exception'
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option = {
    title: {
      text: '成功率趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].name + '<br/>'
        params.forEach(item => {
          result += `${item.marker}${item.seriesName}: ${item.value}%<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['成功率'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: 'value',
      name: '成功率（%）',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: '成功率',
        type: 'line',
        smooth: true,
        data: [],
        itemStyle: {
          color: '#1890ff',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
          ]),
        },
        markLine: {
          silent: true,
          data: [
            { yAxis: 95, label: { formatter: '优秀线: 95%' }, lineStyle: { color: '#52c41a' } },
            { yAxis: 90, label: { formatter: '正常线: 90%' }, lineStyle: { color: '#faad14' } },
          ],
        },
      },
    ],
  }

  chartInstance.setOption(option)
}

// 更新图表数据
const updateChart = (data) => {
  if (!chartInstance) return

  const xAxisData = data.map(item => item.date)
  const successRates = data.map(item => parseFloat(item.successRate))

  chartInstance.setOption({
    xAxis: {
      data: xAxisData,
    },
    series: [
      { data: successRates },
    ],
  })
}

// 查询统计数据
const queryStats = async () => {
  try {
    loading.value = true

    const params = {
      startDate: queryForm.dateRange[0].format('YYYY-MM-DD'),
      endDate: queryForm.dateRange[1].format('YYYY-MM-DD'),
      timeType: queryForm.statsType, // day, week, month
    }

    // 添加可选参数
    if (queryForm.signName) {
      params.signName = queryForm.signName
    }
    if (queryForm.templateCode) {
      params.templateCode = queryForm.templateCode
    }

    // 同时调用概览和详情接口
    const [overviewRes, detailRes] = await Promise.all([
      statisticsApi.getStatisticsOverview(params),
      statisticsApi.getStatisticsDetail(params)
    ])

    // 更新概览数据
    if (overviewRes.data) {
      const successRate = parseFloat((overviewRes.data.successRate || '0%').replace('%', ''))
      overview.successRate = successRate.toFixed(2)
    }

    // 更新表格和图表数据
    if (detailRes.data && detailRes.data.length > 0) {
      // 转换数据格式
      allTableData.value = detailRes.data.map(item => ({
        key: item.statisticsTime,
        date: item.statisticsTime,
        totalSent: item.totalCount || 0,
        successSent: item.successCount || 0,
        failedSent: item.failCount || 0,
        successRate: parseFloat((item.successRate || '0%').replace('%', '')).toFixed(2)
      }))

      pagination.total = allTableData.value.length
      pagination.current = 1 // 重置到第一页

      // 计算概览的最大值和最小值
      const rates = allTableData.value.map(item => parseFloat(item.successRate))
      if (rates.length > 0) {
        overview.maxRate = Math.max(...rates).toFixed(2)
        overview.minRate = Math.min(...rates).toFixed(2)

        // 计算稳定性（基于方差）
        const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length
        const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) / rates.length
        if (variance < 5) overview.stability = '优'
        else if (variance < 10) overview.stability = '良'
        else if (variance < 20) overview.stability = '中'
        else overview.stability = '差'
      }

      // 更新图表（使用全部数据）
      updateChart(allTableData.value)
    } else {
      allTableData.value = []
      pagination.total = 0
      pagination.current = 1
      // 清空图表数据
      updateChart([])
    }
  } catch (error) {
    message.error('查询失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryForm.statsType = 'day'
  queryForm.dateRange = [dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]
  queryForm.signName = '南宁交通物流集团'
  queryForm.templateCode = ''
  queryForm.templateName = ''
  pagination.current = 1
  queryStats()
}

// 统计类型变化
const handleStatsTypeChange = () => {
  // 根据统计类型调整默认日期范围
  switch (queryForm.statsType) {
    case 'week':
      queryForm.dateRange = [dayjs().subtract(8, 'week'), dayjs().subtract(1, 'week')]
      break
    case 'month':
      queryForm.dateRange = [dayjs().subtract(6, 'month'), dayjs().subtract(1, 'month')]
      break
    default:
      queryForm.dateRange = [dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]
  }
}

// 日期变化
const handleDateChange = () => {
  // 日期变化时可以添加验证逻辑
}

// 表格分页变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  // 前端分页，不需要重新请求数据
}

// 显示模板选择弹窗
const showTemplateModal = () => {
  templateModalRef.value?.show()
}

// 处理模板选择
const handleTemplateSelect = (template) => {
  queryForm.templateCode = template.templateCode
  queryForm.templateName = template.templateName
}

// 处理模板清空
const handleTemplateClear = () => {
  queryForm.templateCode = ''
  queryForm.templateName = ''
}

// 组件挂载
onMounted(() => {
  nextTick(() => {
    initChart()
    queryStats()
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chartInstance && chartInstance.resize()
  })
})
</script>

<style scoped lang="less">
.success-rate-stats {
  padding: 20px;
}

.stats-card {
  :deep(.ant-card-body) {
    padding: 20px;
  }
}

.smart-margin-left10 {
  margin-left: 10px;
}
</style>
