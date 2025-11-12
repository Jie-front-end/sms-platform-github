<!--
  * 短信发送记录列表
  *
  * @Author:    Claude Code
  * @Date:      2025-11-06
-->
<template>
  <div class="send-record-list">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item class="smart-query-form-item" label="手机号码">
          <a-input
            v-model:value="queryForm.phoneNumber"
            placeholder="请输入手机号码"
            style="width: 200px"
            allowClear
          />
        </a-form-item>

        <a-form-item class="smart-query-form-item" label="发送状态">
          <a-select
            v-model:value="queryForm.sendStatus"
            placeholder="请选择发送状态"
            style="width: 150px"
            allowClear
          >
            <a-select-option :value="0">失败</a-select-option>
            <a-select-option :value="1">成功</a-select-option>
            <a-select-option :value="2">等待回执</a-select-option>
            <a-select-option :value="3">拦截</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item class="smart-query-form-item" label="签名名称">
          <SignSelect
            v-model:value="queryForm.signName"
            placeholder="请选择签名"
            style="width: 160px"
          />
        </a-form-item>

        <a-form-item class="smart-query-form-item" label="模板代码">
          <a-input
            v-model:value="queryForm.templateCode"
            placeholder="请输入模板代码"
            style="width: 160px"
            allowClear
          />
        </a-form-item>

        <a-form-item class="smart-query-form-item" label="发送时间">
          <a-range-picker
            v-model:value="queryForm.sendDateRange"
            style="width: 300px"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD HH:mm:ss"
            show-time
          />
        </a-form-item>

        <a-form-item class="smart-query-form-item" label="回执时间">
          <a-range-picker
            v-model:value="queryForm.receiveDateRange"
            style="width: 300px"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD HH:mm:ss"
            show-time
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

    <!-- 数据卡片 -->
    <a-card size="small" :bordered="false" :hoverable="true">
      <!-- 表格操作行 -->
      <a-row class="smart-table-btn-block">
        <div class="smart-table-operate-block">
          <a-button @click="refreshData" size="small">
            <template #icon>
              <ReloadOutlined />
            </template>
            刷新
          </a-button>
        </div>
        <div class="smart-table-setting-block">
          <TableOperator
            v-model="columns"
            :tableId="TABLE_ID_CONST.BUSINESS.SMS.SMS_SEND_RECORD_LIST"
            :refresh="queryData"
          />
        </div>
      </a-row>

      <!-- 数据表格 -->
      <a-table
        size="small"
        :scroll="{ x: 1400, y: 600 }"
        :dataSource="tableData"
        :columns="columns"
        rowKey="recordId"
        bordered
        :loading="tableLoading"
        :pagination="false"
      >
        <template #bodyCell="{ text, record, column, index }">
          <template v-if="column.dataIndex === 'serialNumber'">
            {{ (queryForm.pageNum - 1) * queryForm.pageSize + index + 1 }}
          </template>

          <template v-if="column.dataIndex === 'sendStatus'">
            <a-tag v-if="record.sendStatus === 1" color="success">成功</a-tag>
            <a-tag v-else-if="record.sendStatus === 0" color="error">失败</a-tag>
            <a-tag v-else-if="record.sendStatus === 2" color="processing">等待回执</a-tag>
            <a-tag v-else-if="record.sendStatus === 3" color="warning">拦截</a-tag>
            <a-tag v-else color="default">未知</a-tag>
          </template>

          <template v-if="column.dataIndex === 'smsContent'">
            <a-tooltip :title="text">
              <span class="ellipsis-text">{{ text }}</span>
            </a-tooltip>
          </template>

          <template v-if="column.dataIndex === 'sendDate'">
            {{ text ? formatDateTime(text) : '-' }}
          </template>

          <template v-if="column.dataIndex === 'receiveDate'">
            {{ text ? formatDateTime(text) : '-' }}
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
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const'
import TableOperator from '/@/components/support/table-operator/index.vue'
import SignSelect from '/@/components/business/sign-select/index.vue'
import { smsQueryApi } from '/@/api/business/sms-manager/sms-query-api'
import dayjs from 'dayjs'

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

// 查询表单数据
const queryFormState = {
  phoneNumber: undefined,
  sendStatus: undefined,
  signName: '南宁交通物流集团',
  templateCode: undefined,
  smsContent: undefined,
  sendDateRange: undefined,
  receiveDateRange: undefined,
  deletedFlag: 0, // 默认查询未删除的记录
  pageNum: 1,
  pageSize: 10,
  searchCount: true
}

const queryForm = reactive({ ...queryFormState })

// 表格数据
const tableLoading = ref(false)
const tableData = ref([])
const total = ref(0)

// 表格列定义
const columns = ref([
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 60,
    fixed: 'left'
  },
  {
    title: '记录ID',
    dataIndex: 'recordId',
    width: 100
  },
  {
    title: '手机号码',
    dataIndex: 'phoneNumber',
    width: 130
  },
  {
    title: '短信内容',
    dataIndex: 'smsContent',
    width: 300,
    ellipsis: true
  },
  {
    title: '签名',
    dataIndex: 'signName',
    width: 120
  },
  {
    title: '模板代码',
    dataIndex: 'templateCode',
    width: 150
  },
  {
    title: '发送状态',
    dataIndex: 'sendStatus',
    width: 100
  },
  {
    title: '发送时间',
    dataIndex: 'sendDate',
    width: 180
  },
  {
    title: '回执时间',
    dataIndex: 'receiveDate',
    width: 180
  }
])

// 查询数据
async function queryData() {
  tableLoading.value = true
  try {
    // 组装查询参数
    const params = {
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      searchCount: queryForm.searchCount,
      deletedFlag: queryForm.deletedFlag
    }

    // 添加可选参数
    if (queryForm.phoneNumber) {
      params.phoneNumber = queryForm.phoneNumber
    }
    if (queryForm.sendStatus !== undefined && queryForm.sendStatus !== null) {
      params.sendStatus = queryForm.sendStatus
    }
    if (queryForm.signName) {
      params.signName = queryForm.signName
    }
    if (queryForm.templateCode) {
      params.templateCode = queryForm.templateCode
    }
    if (queryForm.smsContent) {
      params.smsContent = queryForm.smsContent
    }

    // 处理发送时间范围
    if (queryForm.sendDateRange && queryForm.sendDateRange.length === 2) {
      params.sendDateStart = dayjs(queryForm.sendDateRange[0]).toISOString()
      params.sendDateEnd = dayjs(queryForm.sendDateRange[1]).toISOString()
    }

    // 处理回执时间范围
    if (queryForm.receiveDateRange && queryForm.receiveDateRange.length === 2) {
      params.receiveDateStart = dayjs(queryForm.receiveDateRange[0]).toISOString()
      params.receiveDateEnd = dayjs(queryForm.receiveDateRange[1]).toISOString()
    }

    const res = await smsQueryApi.queryPage(params)

    if (res.data) {
      tableData.value = res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (e) {
    smartSentry.captureError(e)
    message.error('查询失败')
  } finally {
    tableLoading.value = false
  }
}

// 搜索
function onSearch() {
  queryForm.pageNum = 1
  queryData()
}

// 重置查询
function resetQuery() {
  const pageSize = queryForm.pageSize
  Object.assign(queryForm, queryFormState)
  queryForm.pageSize = pageSize
  queryData()
}

// 刷新数据
function refreshData() {
  queryData()
}

// 组件挂载
onMounted(() => {
  queryData()
})
</script>

<style lang="less" scoped>
.send-record-list {
  padding: 20px;

  .statistics-row {
    margin-bottom: 20px;
  }

  .ellipsis-text {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
