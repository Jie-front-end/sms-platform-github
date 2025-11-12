<template>
  <div class="send-status-query">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item class="smart-query-form-item" label="批次号">
          <a-input
            v-model:value="queryForm.batchNo"
            placeholder="请输入批次号"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="手机号码">
          <a-input
            v-model:value="queryForm.mobile"
            placeholder="请输入手机号码"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="查询类型">
          <a-select
            v-model:value="queryForm.queryType"
            placeholder="请选择查询类型"
            style="width: 150px"
          >
            <a-select-option value="batch">按批次查询</a-select-option>
            <a-select-option value="mobile">按手机号查询</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item">
          <a-button type="primary" @click="onSearch" :loading="loading">
            <template #icon>
              <SearchOutlined />
            </template>
            查询状态
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

    <!-- 批次状态概览 -->
    <a-card v-if="batchOverview.visible" title="批次状态概览" size="small" class="overview-card">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-statistic title="批次号" :value="batchOverview.batchNo" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="总数量" :value="batchOverview.total" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="成功数" :value="batchOverview.success" :value-style="{ color: '#3f8600' }" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="失败数" :value="batchOverview.failed" :value-style="{ color: '#cf1322' }" />
        </a-col>
      </a-row>
      <a-row :gutter="16" style="margin-top: 16px;">
        <a-col :span="6">
          <a-statistic title="发送中" :value="batchOverview.sending" :value-style="{ color: '#1890ff' }" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="待发送" :value="batchOverview.pending" :value-style="{ color: '#faad14' }" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="成功率" :value="batchOverview.successRate" suffix="%" :precision="2" />
        </a-col>
        <a-col :span="6">
          <a-statistic title="完成时间" :value="batchOverview.completeTime" />
        </a-col>
      </a-row>
    </a-card>

    <!-- 详细状态列表 -->
    <a-card v-if="statusList.length > 0" title="详细状态" size="small">
      <template #extra>
        <a-space>
          <a-button @click="refreshStatus" size="small" :loading="refreshing">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新状态
          </a-button>
          <a-button @click="exportStatus" size="small">
            <template #icon>
              <ExportOutlined />
            </template>
            导出状态
          </a-button>
        </a-space>
      </template>

      <a-table
        size="small"
        :scroll="{ x: 1000, y: 400 }"
        :dataSource="statusList"
        :columns="statusColumns"
        rowKey="id"
        bordered
        :loading="loading"
        :pagination="false"
      >
        <template #bodyCell="{ text, record, column }">
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

          <template v-if="column.dataIndex === 'receiveTime'">
            {{ formatDateTime(text) }}
          </template>

          <template v-if="column.dataIndex === 'errorCode'">
            <a-tag v-if="text" color="red">{{ text }}</a-tag>
            <span v-else>-</span>
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
      <div class="smart-query-table-page" v-if="statusTotal > 0">
        <a-pagination
          showSizeChanger
          showQuickJumper
          show-less-items
          :pageSizeOptions="PAGE_SIZE_OPTIONS"
          :defaultPageSize="queryForm.pageSize"
          v-model:current="queryForm.pageNum"
          v-model:pageSize="queryForm.pageSize"
          :total="statusTotal"
          @change="queryStatus"
          @showSizeChange="queryStatus"
          :show-total="(total) => `共${total}条`"
        />
      </div>
    </a-card>

    <!-- 空状态 -->
    <a-empty v-if="!loading && statusList.length === 0 && !batchOverview.visible" description="请输入批次号或手机号码查询发送状态" />

    <!-- 详情弹窗 
    <SendStatusDetail ref="detailRef" />
    -->
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { formatDateTime } from '/@/utils/date-util'
//import SendStatusDetail from './components/send-status-detail.vue'
import { smsQueryApi } from '/@/api/business/sms-manager/sms-query-api'

// 查询表单数据
const queryFormState = {
  batchNo: undefined,
  mobile: undefined,
  queryType: 'batch',
  pageNum: 1,
  pageSize: 10
}

const queryForm = reactive({ ...queryFormState })

// 状态数据
const loading = ref(false)
const refreshing = ref(false)
const statusList = ref([])
const statusTotal = ref(0)

// 批次概览数据
const batchOverview = reactive({
  visible: false,
  batchNo: '',
  total: 0,
  success: 0,
  failed: 0,
  sending: 0,
  pending: 0,
  successRate: 0,
  completeTime: ''
})

// 状态表格列
const statusColumns = [
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
    title: '发送时间',
    dataIndex: 'sendTime',
    width: 150
  },
  {
    title: '接收时间',
    dataIndex: 'receiveTime',
    width: 150
  },
  {
    title: '错误码',
    dataIndex: 'errorCode',
    width: 100
  },
  {
    title: '运营商',
    dataIndex: 'carrier',
    width: 100
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
]

// 详情弹窗引用
const detailRef = ref()

// 重置查询条件
function resetQuery() {
  Object.assign(queryForm, queryFormState)
  statusList.value = []
  statusTotal.value = 0
  batchOverview.visible = false
  Object.assign(batchOverview, {
    batchNo: '',
    total: 0,
    success: 0,
    failed: 0,
    sending: 0,
    pending: 0,
    successRate: 0,
    completeTime: ''
  })
}

// 查询状态
async function onSearch() {
  if (!queryForm.batchNo && !queryForm.mobile) {
    message.warning('请输入批次号或手机号码')
    return
  }

  if (queryForm.queryType === 'batch' && !queryForm.batchNo) {
    message.warning('按批次查询时，批次号不能为空')
    return
  }

  if (queryForm.queryType === 'mobile' && !queryForm.mobile) {
    message.warning('按手机号查询时，手机号码不能为空')
    return
  }

  await queryStatus()
}

// 查询状态数据
async function queryStatus() {
  loading.value = true
  try {
    const params = {
      ...queryForm,
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize
    }

    const result = await smsQueryApi.querySendStatus(params)

    if (queryForm.queryType === 'batch') {
      // 按批次查询，显示批次概览
      const overviewData = result.data.overview
      if (overviewData) {
        Object.assign(batchOverview, overviewData)
        batchOverview.visible = true
      }
    } else {
      batchOverview.visible = false
    }

    statusList.value = result.data.list || []
    statusTotal.value = result.data.total || 0

    if (statusList.value.length === 0) {
      message.info('未找到相关状态记录')
    }

  } catch (e) {
    smartSentry.captureError(e)
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 刷新状态
async function refreshStatus() {
  refreshing.value = true
  try {
    await queryStatus()
    message.success('状态已刷新')
  } catch (e) {
    smartSentry.captureError(e)
  } finally {
    refreshing.value = false
  }
}

// 导出状态
async function exportStatus() {
  try {
    SmartLoading.show()
    const params = {
      ...queryForm
    }

    await smsQueryApi.exportSendStatus(params)
    message.success('导出任务已提交，请稍后下载')

  } catch (e) {
    smartSentry.captureError(e)
    message.error('导出失败')
  } finally {
    SmartLoading.hide()
  }
}

// 单条重发
async function resendSingle(record) {
  try {
    SmartLoading.show()
    await smsQueryApi.resendSingle(record.id)
    message.success('重发任务已提交')
    await queryStatus()
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
  // 初始化时不自动查询
})
</script>

<style scoped>
.send-status-query {
  padding: 20px;
}

.overview-card {
  margin-bottom: 16px;
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