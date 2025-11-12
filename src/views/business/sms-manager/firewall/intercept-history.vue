<template>
  <div class="intercept-history">
    <!-- 统计卡片 -->
    <a-row :gutter="16" class="statistics-cards">
      <a-col :span="6">
        <a-card size="small" :loading="statisticsLoading">
          <a-statistic
            title="今日拦截总数"
            :value="statistics.todayCount || 0"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <StopOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small" :loading="statisticsLoading">
          <a-statistic
            title="累计拦截总数"
            :value="statistics.totalCount || 0"
            :value-style="{ color: '#fa8c16' }"
          >
            <template #prefix>
              <UserDeleteOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small" :loading="statisticsLoading">
          <a-statistic
            title="敏感词拦截"
            :value="sensitiveWordCount"
            :value-style="{ color: '#fa541c' }"
          >
            <template #prefix>
              <WarningOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card size="small" :loading="statisticsLoading">
          <a-statistic
            title="频率限制拦截"
            :value="rateLimitCount"
            :value-style="{ color: '#2f54eb' }"
          >
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item class="smart-query-form-item" label="手机号码">
          <a-input
            v-model:value="queryForm.phoneNumber"
            placeholder="请输入手机号码"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="拦截类型">
          <a-select
            v-model:value="queryForm.interceptType"
            placeholder="请选择拦截类型"
            style="width: 150px"
            allowClear
          >
            <a-select-option value="BLACKLIST">黑名单</a-select-option>
            <a-select-option value="FORBIDDEN_WORD">违禁词</a-select-option>
            <a-select-option value="RATE_LIMIT">频率限制</a-select-option>
            <a-select-option value="IP_LIMIT">IP限制</a-select-option>
            <a-select-option value="OTHER">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="业务场景">
          <a-input
            v-model:value="queryForm.scene"
            placeholder="请输入业务场景"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="客户端IP">
          <a-input
            v-model:value="queryForm.clientIp"
            placeholder="请输入客户端IP"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="拦截时间">
          <a-range-picker
            v-model:value="queryForm.dateRange"
            style="width: 300px"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD"
            :show-time="{ format: 'HH:mm:ss' }"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="状态">
          <a-select
            v-model:value="queryForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            allowClear
          >
            <a-select-option :value="1">有效</a-select-option>
            <a-select-option :value="0">无效</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="拦截原因">
          <a-input
            v-model:value="queryForm.interceptReason"
            placeholder="请输入关键词"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="发送人">
          <a-input
            v-model:value="queryForm.sender"
            placeholder="请输入发送人"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item">
          <a-button type="primary" @click="onSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" class="smart-margin-left10">
            <template #icon>
              <ReloadOutlined />
            </template>
            重置
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>

    <!-- 操作按钮 -->
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="batchDelete" type="primary" danger size="small" :disabled="selectedRowKeyList.length === 0">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
        <a-button @click="exportData" size="small">
          <template #icon>
            <ExportOutlined />
          </template>
          导出
        </a-button>
      </div>
    </a-row>

    <!-- 数据表格 -->
    <a-table
      size="small"
      :scroll="{ x: 1800, y: 600 }"
      :dataSource="tableData"
      :columns="columns"
      rowKey="id"
      bordered
      :loading="tableLoading"
      :pagination="false"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ text, record, column, index }">
        <template v-if="column.dataIndex === 'serialNumber'">
          {{ (queryForm.pageNum - 1) * queryForm.pageSize + index + 1 }}
        </template>

        <template v-if="column.dataIndex === 'phoneNumber'">
          <a-tag color="red">{{ text }}</a-tag>
        </template>

        <template v-if="column.dataIndex === 'interceptType'">
          <a-tag :color="getInterceptTypeColor(text)">
            {{ getInterceptTypeText(text) }}
          </a-tag>
        </template>

        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="text === 1 ? 'green' : 'default'">
            {{ text === 1 ? '有效' : '无效' }}
          </a-tag>
        </template>

        <template v-if="column.dataIndex === 'content'">
          <a-tooltip :title="text">
            <span class="ellipsis-text">{{ text || '-' }}</span>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'interceptReason'">
          <a-tooltip :title="text">
            <span class="ellipsis-text">{{ text || '-' }}</span>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'interceptTime'">
          {{ formatDateTime(text) }}
        </template>

        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showDetail(record)" type="link" size="small">
              查看详情
            </a-button>
            <a-button @click="deleteRecord(record)" type="link" size="small" danger>
              删除
            </a-button>
          </div>
        </template>
      </template>
    </a-table>

    <!-- 分页 -->
    <div class="smart-query-table-page">
      <a-pagination
        showSizeChanger
        showQuickJumper
        show-less-items
        :pageSizeOptions="PAGE_SIZE_OPTIONS"
        :defaultPageSize="queryForm.pageSize"
        v-model:current="queryForm.pageNum"
        v-model:pageSize="queryForm.pageSize"
        :total="total"
        @change="queryData"
        @showSizeChange="queryData"
        :show-total="(total) => `共${total}条`"
      />
    </div>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="拦截历史详情"
      width="800px"
      :footer="null"
    >
      <a-spin :spinning="detailLoading">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item label="手机号码">
            <a-tag color="red">{{ detailData.phoneNumber }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="拦截类型">
            <a-tag :color="getInterceptTypeColor(detailData.interceptType)">
              {{ detailData.interceptTypeDesc || getInterceptTypeText(detailData.interceptType) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="业务场景">
            {{ detailData.scene || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="客户端IP">
            {{ detailData.clientIp || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="发送人">
            {{ detailData.sender || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="detailData.status === 1 ? 'green' : 'default'">
              {{ detailData.status === 1 ? '有效' : '无效' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="拦截时间" :span="2">
            {{ formatDateTime(detailData.interceptTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="短信内容" :span="2">
            <div class="detail-content">{{ detailData.content || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="拦截原因" :span="2">
            <div class="detail-reason">{{ detailData.interceptReason || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(detailData.createTime) }}
          </a-descriptions-item>
        </a-descriptions>
      </a-spin>
    </a-modal>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExportOutlined,
  StopOutlined,
  UserDeleteOutlined,
  WarningOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { interceptHistoryApi } from '/@/api/business/sms-manager/intercept-history-api'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { formatDateTime } from '/@/utils/date-util'

// 统计数据
const statistics = ref({})
const statisticsLoading = ref(false)

// 查询表单
const queryFormState = {
  phoneNumber: undefined,
  interceptType: undefined,
  scene: undefined,
  clientIp: undefined,
  dateRange: undefined,
  status: undefined,
  interceptReason: undefined,
  sender: undefined,
  pageNum: 1,
  pageSize: 10,
}

const queryForm = reactive({ ...queryFormState })

// 表格数据
const tableData = ref([])
const tableLoading = ref(false)
const total = ref(0)

// 表格列
const columns = ref([
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 70,
    fixed: 'left',
  },
  {
    title: '手机号码',
    dataIndex: 'phoneNumber',
    width: 130,
  },
  {
    title: '拦截类型',
    dataIndex: 'interceptType',
    width: 120,
  },
  {
    title: '业务场景',
    dataIndex: 'scene',
    width: 100,
  },
  {
    title: '客户端IP',
    dataIndex: 'clientIp',
    width: 130,
  },
  {
    title: '发送人',
    dataIndex: 'sender',
    width: 100,
  },
  {
    title: '短信内容',
    dataIndex: 'content',
    width: 200,
    ellipsis: true,
  },
  {
    title: '拦截原因',
    dataIndex: 'interceptReason',
    width: 200,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
  },
  {
    title: '拦截时间',
    dataIndex: 'interceptTime',
    width: 160,
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 150,
  },
])

// 行选择
const selectedRowKeyList = ref([])
const rowSelection = {
  onChange: (selectedRowKeys) => {
    selectedRowKeyList.value = selectedRowKeys
  },
}

// 详情弹窗
const detailModalVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref({})

// 获取拦截类型颜色
const getInterceptTypeColor = (type) => {
  const colorMap = {
    'BLACKLIST': 'red',
    'FORBIDDEN_WORD': 'orange',
    'RATE_LIMIT': 'blue',
    'IP_LIMIT': 'purple',
    'OTHER': 'default',
  }
  return colorMap[type] || 'default'
}

// 获取拦截类型文本
const getInterceptTypeText = (type) => {
  const textMap = {
    'BLACKLIST': '黑名单',
    'FORBIDDEN_WORD': '违禁词',
    'RATE_LIMIT': '频率限制',
    'IP_LIMIT': 'IP限制',
    'OTHER': '其他',
  }
  return textMap[type] || type
}

// 计算敏感词拦截数
const sensitiveWordCount = computed(() => {
  if (!statistics.value.typeStatistics || !Array.isArray(statistics.value.typeStatistics)) {
    return 0
  }
  const item = statistics.value.typeStatistics.find(stat => stat.intercept_type === '敏感词')
  return item ? item.count : 0
})

// 计算频率限制拦截数
const rateLimitCount = computed(() => {
  if (!statistics.value.typeStatistics || !Array.isArray(statistics.value.typeStatistics)) {
    return 0
  }
  const item = statistics.value.typeStatistics.find(stat => stat.intercept_type === '频率限制')
  return item ? item.count : 0
})

// 获取统计数据
const getStatistics = async () => {
  try {
    statisticsLoading.value = true
    const res = await interceptHistoryApi.getStatistics()
    if (res.code === 0 && res.ok) {
      statistics.value = res.data || {}
    }
  } catch (error) {
    smartSentry.captureError(error)
  } finally {
    statisticsLoading.value = false
  }
}

// 查询数据
const queryData = async () => {
  try {
    tableLoading.value = true
    const params = {
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      searchCount: true
    }

    // 添加查询条件
    if (queryForm.phoneNumber) {
      params.phoneNumber = queryForm.phoneNumber
    }
    if (queryForm.interceptType) {
      params.interceptType = queryForm.interceptType
    }
    if (queryForm.scene) {
      params.scene = queryForm.scene
    }
    if (queryForm.clientIp) {
      params.clientIp = queryForm.clientIp
    }
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startTime = queryForm.dateRange[0].format('YYYY-MM-DD HH:mm:ss')
      params.endTime = queryForm.dateRange[1].format('YYYY-MM-DD HH:mm:ss')
    }
    if (queryForm.status !== undefined) {
      params.status = queryForm.status
    }
    if (queryForm.interceptReason) {
      params.interceptReason = queryForm.interceptReason
    }
    if (queryForm.sender) {
      params.sender = queryForm.sender
    }

    const res = await interceptHistoryApi.queryPage(params)

    // 根据接口返回结构处理数据
    if (res.code === 0 && res.ok) {
      const responseData = res.data || {}
      tableData.value = responseData.list || responseData.records || []
      total.value = responseData.total || responseData.totalCount || 0
    } else {
      message.error(res.msg || '查询失败')
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    smartSentry.captureError(error)
    message.error('查询失败，请稍后重试')
    tableData.value = []
    total.value = 0
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const onSearch = () => {
  queryForm.pageNum = 1
  queryData()
}

// 重置查询
const resetQuery = () => {
  let pageSize = queryForm.pageSize
  Object.assign(queryForm, queryFormState)
  queryForm.pageSize = pageSize
  queryData()
  getStatistics()
}

// 查看详情
const showDetail = async (record) => {
  try {
    detailModalVisible.value = true
    detailLoading.value = true
    detailData.value = {}

    const res = await interceptHistoryApi.getDetail(record.id)
    if (res.code === 0 && res.ok) {
      detailData.value = res.data || {}
    } else {
      message.error(res.msg || '获取详情失败')
    }
  } catch (error) {
    smartSentry.captureError(error)
    message.error('获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 删除记录
const deleteRecord = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除手机号 ${record.phoneNumber} 的拦截记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        const result = await interceptHistoryApi.batchDelete([record.id])
        if (result.code === 0 && result.ok) {
          message.success('删除成功')
          queryData()
          getStatistics()
        } else {
          message.error(result.msg || '删除失败')
        }
      } catch (error) {
        smartSentry.captureError(error)
        message.error('删除失败')
      } finally {
        SmartLoading.hide()
      }
    },
  })
}

// 批量删除
const batchDelete = () => {
  if (selectedRowKeyList.value.length === 0) {
    message.warning('请选择要删除的记录')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeyList.value.length} 条拦截记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        const result = await interceptHistoryApi.batchDelete(selectedRowKeyList.value)
        if (result.code === 0 && result.ok) {
          message.success('批量删除成功')
          selectedRowKeyList.value = []
          queryData()
          getStatistics()
        } else {
          message.error(result.msg || '批量删除失败')
        }
      } catch (error) {
        smartSentry.captureError(error)
        message.error('批量删除失败')
      } finally {
        SmartLoading.hide()
      }
    },
  })
}

// 导出数据
const exportData = async () => {
  try {
    SmartLoading.show('正在导出数据...')

    const params = {}

    if (queryForm.phoneNumber) {
      params.phoneNumber = queryForm.phoneNumber
    }
    if (queryForm.interceptType) {
      params.interceptType = queryForm.interceptType
    }
    if (queryForm.scene) {
      params.scene = queryForm.scene
    }
    if (queryForm.clientIp) {
      params.clientIp = queryForm.clientIp
    }
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startTime = queryForm.dateRange[0].format('YYYY-MM-DD HH:mm:ss')
      params.endTime = queryForm.dateRange[1].format('YYYY-MM-DD HH:mm:ss')
    }
    if (queryForm.status !== undefined) {
      params.status = queryForm.status
    }
    if (queryForm.interceptReason) {
      params.interceptReason = queryForm.interceptReason
    }
    if (queryForm.sender) {
      params.sender = queryForm.sender
    }

    await interceptHistoryApi.export(params)
    message.success('导出成功')
  } catch (error) {
    smartSentry.captureError(error)
    message.error('导出失败')
  } finally {
    SmartLoading.hide()
  }
}

// 组件挂载
onMounted(() => {
  getStatistics()
  queryData()
})
</script>

<style scoped lang="less">
.intercept-history {
  padding: 20px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.smart-margin-left10 {
  margin-left: 10px;
}

.ellipsis-text {
  display: inline-block;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-content,
.detail-reason {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
