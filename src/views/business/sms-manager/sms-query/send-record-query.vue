<template>
  <div class="send-record-query">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item class="smart-query-form-item" label="手机号码">
          <a-input
            v-model:value="queryForm.mobile"
            placeholder="请输入手机号码"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="发送时间">
          <a-range-picker
            v-model:value="queryForm.dateRange"
            style="width: 300px"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD HH:mm:ss"
            show-time
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="发送状态">
          <DictSelect
            v-model:value="queryForm.status"
            :dict-code="DICT_SMS_ENUM.SMS_SEND_STATUS"
            placeholder="请选择发送状态"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="批次号">
          <a-input
            v-model:value="queryForm.batchNo"
            placeholder="请输入批次号"
            style="width: 200px"
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
          <a-button @click="exportData" class="smart-margin-left10">
            <template #icon>
              <ExportOutlined />
            </template>
            导出
          </a-button>
        </a-form-item>
      </a-row>
    </a-form>

    <!-- 统计信息 -->
    <a-row :gutter="16" class="statistics-row">
      <a-col :span="6">
        <a-statistic title="总发送量" :value="statistics.total" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="成功发送" :value="statistics.success" :value-style="{ color: '#3f8600' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="发送失败" :value="statistics.failed" :value-style="{ color: '#cf1322' }" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="成功率" :value="statistics.successRate" suffix="%" :precision="2" />
      </a-col>
    </a-row>

    <!-- 表格操作行 -->
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="refreshData" size="small">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </a-button>
        <a-button @click="batchResend" type="primary" size="small" :disabled="selectedRowKeyList.length === 0">
          <template #icon>
            <SendOutlined />
          </template>
          批量重发
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator
          v-model="columns"
          :tableId="TABLE_ID_CONST.BUSINESS.SMS.SMS_SEND_RECORD"
          :refresh="queryData"
        />
      </div>
    </a-row>

    <!-- 数据表格 -->
    <a-table
      size="small"
      :scroll="{ x: 1200, y: 600 }"
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

        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template v-if="column.dataIndex === 'content'">
          <a-tooltip :title="text">
            <span class="ellipsis-text">{{ text }}</span>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'sendTime'">
          {{ formatDateTime(text) }}
        </template>

        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="viewDetail(record)" type="link" size="small">详情</a-button>
            <a-button
              v-if="record.status === 'FAILED'"
              @click="resendSingle(record)"
              type="link"
              size="small"
            >
              重发
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

    <!-- 详情弹窗
    <SendRecordDetail ref="detailRef" />
     -->
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const'
import { DICT_SMS_ENUM } from '/@/constants/support/dict-const'
import TableOperator from '/@/components/support/table-operator/index.vue'
import DictSelect from '/@/components/support/dict-select/index.vue'
// import SendRecordDetail from './components/send-record-detail.vue'
import { smsQueryApi } from '/@/api/business/sms-manager/sms-query-api'
import { formatDateTime } from '/@/utils/date-util'

// 查询表单数据
const queryFormState = {
  mobile: undefined,
  dateRange: undefined,
  status: undefined,
  batchNo: undefined,
  pageNum: 1,
  pageSize: 10
}

const queryForm = reactive({ ...queryFormState })

// 表格数据
const tableLoading = ref(false)
const tableData = ref([])
const total = ref(0)

// 统计数据
const statistics = reactive({
  total: 0,
  success: 0,
  failed: 0,
  successRate: 0
})

// 选中的行
const selectedRowKeyList = ref([])
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeyList.value,
  onChange: (selectedRowKeys) => {
    selectedRowKeyList.value = selectedRowKeys
  },
  getCheckboxProps: (record) => ({
    disabled: record.status !== 'FAILED'
  })
}))

// 表格列定义
const columns = ref([
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 60,
    fixed: 'left'
  },
  {
    title: '手机号码',
    dataIndex: 'mobile',
    width: 120,
    fixed: 'left'
  },
  {
    title: '短信内容',
    dataIndex: 'content',
    width: 300,
    ellipsis: true
  },
  {
    title: '发送状态',
    dataIndex: 'status',
    width: 100
  },
  {
    title: '批次号',
    dataIndex: 'batchNo',
    width: 150
  },
  {
    title: '发送时间',
    dataIndex: 'sendTime',
    width: 150
  },
  {
    title: '重试次数',
    dataIndex: 'retryCount',
    width: 100
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 120,
    fixed: 'right'
  }
])

// 详情弹窗引用
const detailRef = ref()

// 重置查询条件
function resetQuery() {
  let pageSize = queryForm.pageSize
  Object.assign(queryForm, queryFormState)
  queryForm.pageSize = pageSize
  queryData()
}

// 搜索
function onSearch() {
  queryForm.pageNum = 1
  queryData()
}

// 查询数据
async function queryData() {
  tableLoading.value = true
  try {
    const params = {
      ...queryForm,
      startTime: queryForm.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      endTime: queryForm.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss')
    }

    const [recordResult, statisticsResult] = await Promise.all([
      smsQueryApi.querySendRecords(params),
      smsQueryApi.getSendStatistics(params)
    ])

    tableData.value = recordResult.data.list
    total.value = recordResult.data.total

    // 更新统计数据
    Object.assign(statistics, statisticsResult.data)

  } catch (e) {
    smartSentry.captureError(e)
  } finally {
    tableLoading.value = false
  }
}

// 刷新数据
function refreshData() {
  queryData()
}

// 导出数据
async function exportData() {
  try {
    SmartLoading.show()
    const params = {
      ...queryForm,
      startTime: queryForm.dateRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
      endTime: queryForm.dateRange?.[1]?.format('YYYY-MM-DD HH:mm:ss')
    }

    await smsQueryApi.exportSendRecords(params)
    message.success('导出任务已提交，请稍后下载')

  } catch (e) {
    smartSentry.captureError(e)
    message.error('导出失败')
  } finally {
    SmartLoading.hide()
  }
}

// 批量重发
function batchResend() {
  if (selectedRowKeyList.value.length === 0) {
    message.warning('请选择要重发的记录')
    return
  }

  Modal.confirm({
    title: '确认重发',
    content: `确定要重新发送选中的 ${selectedRowKeyList.value.length} 条短信吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        await smsQueryApi.batchResend(selectedRowKeyList.value)
        message.success('重发任务已提交')
        selectedRowKeyList.value = []
        queryData()
      } catch (e) {
        smartSentry.captureError(e)
        message.error('重发失败')
      } finally {
        SmartLoading.hide()
      }
    }
  })
}

// 单条重发
async function resendSingle(record) {
  try {
    SmartLoading.show()
    await smsQueryApi.resendSingle(record.id)
    message.success('重发任务已提交')
    queryData()
  } catch (e) {
    smartSentry.captureError(e)
    message.error('重发失败')
  } finally {
    SmartLoading.hide()
  }
}

// 查看详情
function viewDetail(record) {
  detailRef.value.show(record)
}

// 获取状态颜色
function getStatusColor(status) {
  const colors = {
    'SUCCESS': 'green',
    'FAILED': 'red',
    'PENDING': 'orange',
    'SENDING': 'blue'
  }
  return colors[status] || 'default'
}

// 获取状态文本
function getStatusText(status) {
  const texts = {
    'SUCCESS': '发送成功',
    'FAILED': '发送失败',
    'PENDING': '待发送',
    'SENDING': '发送中'
  }
  return texts[status] || status
}

onMounted(() => {
  queryData()
})
</script>

<style scoped>
.send-record-query {
  padding: 20px;
}

.statistics-row {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
}

.ellipsis-text {
  display: inline-block;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.smart-margin-left10 {
  margin-left: 10px;
}
</style>