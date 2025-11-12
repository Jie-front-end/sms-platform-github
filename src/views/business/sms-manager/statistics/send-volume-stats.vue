<template>
  <div class="send-volume-stats">
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

    <!-- T+1提示 -->
    <a-alert
      message="统计说明"
      description="统计数据采用T+1方式生成，即当日数据于次日凌晨生成。如需查看实时数据，请前往【短信查询】模块。"
      type="info"
      show-icon
      closable
      style="margin-bottom: 16px;"
    />

    <!-- 统计概览卡片 -->
    <a-row :gutter="16" style="margin-bottom: 16px;">
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="总发送量"
            :value="overview.totalSent"
            :precision="0"
            suffix="条"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <SendOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="成功发送"
            :value="overview.successSent"
            :precision="0"
            suffix="条"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="失败数量"
            :value="overview.failedSent"
            :precision="0"
            suffix="条"
            :value-style="{ color: '#ff4d4f' }"
          >
            <template #prefix>
              <CloseCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stats-card">
          <a-statistic
            title="成功率"
            :value="overview.successRate"
            :precision="2"
            suffix="%"
            :value-style="{ color: overview.successRate >= 95 ? '#52c41a' : '#faad14' }"
          >
            <template #prefix>
              <PercentageOutlined />
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
        row-key="date"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'successRate'">
            <a-tag :color="record.successRate >= 95 ? 'green' : record.successRate >= 90 ? 'orange' : 'red'">
              {{ record.successRate }}%
            </a-tag>
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
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined
} from '@ant-design/icons-vue'
import { statisticsApi } from '/@/api/business/sms-manager/statistics-api'
import SignSelect from '/@/components/business/sign-select/index.vue'
import TemplateSelectModal from '/@/components/business/template-select-modal/index.vue'

// 模板选择弹窗引用
const templateModalRef = ref(null)

// 查询表单
const queryForm = reactive({
  statsType: 'day', // day, week, month
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
  totalSent: 0,
  successSent: 0,
  failedSent: 0,
  successRate: 0,
})

// 表格列定义
const columns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
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
    width: 100,
    align: 'center',
  },
]

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

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option = {
    title: {
      text: '短信发送量趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['总发送量', '成功数', '失败数'],
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
      data: [],
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: '发送量（条）',
    },
    series: [
      {
        name: '总发送量',
        type: 'bar',
        data: [],
        itemStyle: {
          color: '#1890ff',
        },
      },
      {
        name: '成功数',
        type: 'bar',
        data: [],
        itemStyle: {
          color: '#52c41a',
        },
      },
      {
        name: '失败数',
        type: 'bar',
        data: [],
        itemStyle: {
          color: '#ff4d4f',
        },
      },
    ],
  }

  chartInstance.setOption(option)
}

// 更新图表数据
const updateChart = (data) => {
  if (!chartInstance) return

  const dates = data.map(item => item.date)
  const totalSent = data.map(item => item.totalSent)
  const successSent = data.map(item => item.successSent)
  const failedSent = data.map(item => item.failedSent)

  chartInstance.setOption({
    xAxis: {
      data: dates,
    },
    series: [
      { data: totalSent },
      { data: successSent },
      { data: failedSent },
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
      overview.totalSent = overviewRes.data.totalCount || 0
      overview.successSent = overviewRes.data.successCount || 0
      overview.failedSent = overviewRes.data.failCount || 0
      // 处理成功率，去掉百分号
      const successRate = overviewRes.data.successRate || '0%'
      overview.successRate = parseFloat(successRate.replace('%', ''))
    }

    // 更新表格和图表数据
    if (detailRes.data && detailRes.data.length > 0) {
      // 转换数据格式
      allTableData.value = detailRes.data.map(item => ({
        date: item.statisticsTime,
        totalSent: item.totalCount || 0,
        successSent: item.successCount || 0,
        failedSent: item.failCount || 0,
        successRate: parseFloat((item.successRate || '0%').replace('%', ''))
      }))

      pagination.total = allTableData.value.length
      pagination.current = 1 // 重置到第一页

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
.send-volume-stats {
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
