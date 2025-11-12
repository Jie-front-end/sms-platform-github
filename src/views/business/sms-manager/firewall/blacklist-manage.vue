<template>
  <div class="blacklist-manage">
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
        <a-form-item class="smart-query-form-item" label="姓名">
          <a-input
            v-model:value="queryForm.name"
            placeholder="请输入姓名"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="添加时间">
          <a-range-picker
            v-model:value="queryForm.dateRange"
            style="width: 300px"
            :placeholder="['开始时间', '结束时间']"
            format="YYYY-MM-DD"
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
        <a-button @click="showAddModal" type="primary" size="small">
          <template #icon>
            <PlusOutlined />
          </template>
          添加黑名单
        </a-button>
        <a-button @click="downloadTemplate" type="default" size="small">
          <template #icon>
            <DownloadOutlined />
          </template>
          下载模板
        </a-button>
        <a-button @click="showImportModal" type="primary" size="small">
          <template #icon>
            <ImportOutlined />
          </template>
          批量导入
        </a-button>
        <a-button @click="batchDelete" type="primary" danger size="small" :disabled="selectedRowKeyList.length === 0">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
        <a-button @click="exportBlacklist" size="small">
          <template #icon>
            <ExportOutlined />
          </template>
          导出黑名单
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator
          v-model="columns"
          :tableId="TABLE_ID_CONST.BUSINESS.SMS.BLACKLIST_MANAGE"
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

        <template v-if="column.dataIndex === 'phoneNumber'">
          <a-tag color="red">{{ text }}</a-tag>
        </template>

        <template v-if="column.dataIndex === 'remark'">
          <a-tooltip :title="text">
            <span class="ellipsis-text">{{ text || '-' }}</span>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'createTime'">
          {{ formatDateTime(text) }}
        </template>

        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showEditModal(record)" type="link" size="small">
              编辑
            </a-button>
            <a-button @click="removeFromBlacklist(record)" type="link" size="small" danger>
              移除黑名单
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

    <!-- 添加/编辑黑名单弹窗 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="isEdit ? '编辑黑名单' : '添加黑名单'"
      @ok="handleSubmit"
      @cancel="handleFormCancel"
      :confirm-loading="formLoading"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="手机号码" name="phoneNumber">
          <a-input
            v-model:value="formData.phoneNumber"
            placeholder="请输入11位手机号码"
            :maxlength="11"
            :disabled="isEdit"
          />
        </a-form-item>
        <a-form-item label="姓名" name="name">
          <a-input
            v-model:value="formData.name"
            placeholder="请输入姓名"
            :maxlength="50"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            placeholder="请输入加入黑名单的原因或备注"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量导入弹窗 -->
    <a-modal
      v-model:open="importModalVisible"
      title="批量导入黑名单"
      @ok="handleImport"
      @cancel="handleImportCancel"
      :confirm-loading="importLoading"
      width="600px"
    >
      <a-alert
        message="使用说明"
        description="请下载模板文件，按照模板格式填写数据后上传。支持 Excel (.xlsx, .xls) 格式文件。"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />

      <a-upload-dragger
        v-model:file-list="importFileList"
        :before-upload="beforeImportUpload"
        :remove="handleImportRemove"
        :max-count="1"
        accept=".xlsx,.xls"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">
          支持 Excel 格式，单次只能上传一个文件
        </p>
      </a-upload-dragger>

      <div v-if="importResult" class="import-result">
        <a-divider>导入结果</a-divider>
        <a-result
          :status="importResult.success ? 'success' : 'warning'"
          :title="importResult.message"
        >
          <template #extra v-if="importResult.details">
            <div class="result-details">
              <p>{{ importResult.details }}</p>
            </div>
          </template>
        </a-result>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const'
import TableOperator from '/@/components/support/table-operator/index.vue'
import { formatDateTime } from '/@/utils/date-util'
import { blacklistApi } from '/@/api/business/sms-manager/blacklist-api'
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ImportOutlined,
  ExportOutlined,
  InboxOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'

// 查询表单数据
const queryFormState = {
  phoneNumber: undefined,
  name: undefined,
  dateRange: undefined,
  pageNum: 1,
  pageSize: 10
}

const queryForm = reactive({ ...queryFormState })

// 表格数据
const tableLoading = ref(false)
const tableData = ref([])
const total = ref(0)

// 选中的行
const selectedRowKeyList = ref([])
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeyList.value,
  onChange: (selectedRowKeys) => {
    selectedRowKeyList.value = selectedRowKeys
  }
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
    dataIndex: 'phoneNumber',
    width: 120
  },
  {
    title: '姓名',
    dataIndex: 'name',
    width: 120
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 300,
    ellipsis: true
  },
  {
    title: '添加时间',
    dataIndex: 'createTime',
    width: 150
  },
  {
    title: '操作人',
    dataIndex: 'createByName',
    width: 100
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 160,
    fixed: 'right'
  }
])

// 表单弹窗
const formModalVisible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const isEdit = ref(false)
const currentRecord = ref(null)

const formData = reactive({
  phoneNumber: '',
  name: '',
  remark: ''
})

const formRules = {
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ]
}

// 批量导入弹窗
const importModalVisible = ref(false)
const importLoading = ref(false)
const importFileList = ref([])
const importResult = ref(null)

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
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize,
      searchCount: true
    }

    // 添加查询条件
    if (queryForm.phoneNumber) {
      params.phoneNumber = queryForm.phoneNumber
    }
    if (queryForm.name) {
      params.name = queryForm.name
    }
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startTime = queryForm.dateRange[0].format('YYYY-MM-DD') + ' 00:00:00'
      params.endTime = queryForm.dateRange[1].format('YYYY-MM-DD') + ' 23:59:59'
    }

    const result = await blacklistApi.queryPage(params)

    // 根据新接口返回结构处理数据
    if (result.code === 0 && result.ok) {
      const responseData = result.data || {}
      tableData.value = responseData.list || responseData.records || []
      total.value = responseData.total || responseData.totalCount || 0
    } else {
      message.error(result.msg || '查询失败')
      tableData.value = []
      total.value = 0
    }

  } catch (e) {
    smartSentry.captureError(e)
    message.error('查询失败，请稍后重试')
    tableData.value = []
    total.value = 0
  } finally {
    tableLoading.value = false
  }
}

// 显示添加弹窗
function showAddModal() {
  isEdit.value = false
  currentRecord.value = null
  formModalVisible.value = true
  Object.assign(formData, {
    phoneNumber: '',
    name: '',
    remark: ''
  })
}

// 显示编辑弹窗
function showEditModal(record) {
  isEdit.value = true
  currentRecord.value = record
  formModalVisible.value = true
  Object.assign(formData, {
    phoneNumber: record.phoneNumber || '',
    name: record.name || '',
    remark: record.remark || ''
  })
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate()

    formLoading.value = true

    const params = {
      phoneNumber: formData.phoneNumber.trim(),
      name: formData.name.trim(),
      remark: formData.remark.trim()
    }

    if (isEdit.value) {
      // 编辑
      const result = await blacklistApi.update(currentRecord.value.id, params)
      if (result.code === 0 && result.ok) {
        message.success(result.msg || '修改成功')
        formModalVisible.value = false
        handleFormCancel()
        queryData()
      } else {
        message.error(result.msg || '修改失败')
      }
    } else {
      // 新增
      const result = await blacklistApi.add(params)
      // 注意：新增接口返回 code: 200
      if (result.code === 200 || (result.code === 0 && result.ok)) {
        message.success(result.msg || '添加成功')
        formModalVisible.value = false
        handleFormCancel()
        queryData()
      } else {
        message.error(result.msg || '添加失败')
      }
    }

  } catch (e) {
    if (!e.errorFields) {
      smartSentry.captureError(e)
      message.error('操作失败，请稍后重试')
    }
  } finally {
    formLoading.value = false
  }
}

// 取消表单
function handleFormCancel() {
  formRef.value?.resetFields()
  Object.assign(formData, {
    phoneNumber: '',
    name: '',
    remark: ''
  })
  isEdit.value = false
  currentRecord.value = null
}

// 下载模板
async function downloadTemplate() {
  try {
    SmartLoading.show('正在下载模板...')
    await blacklistApi.downloadTemplate()
    message.success('模板下载成功')
  } catch (e) {
    smartSentry.captureError(e)
    message.error('模板下载失败')
  } finally {
    SmartLoading.hide()
  }
}

// 显示导入弹窗
function showImportModal() {
  importModalVisible.value = true
  importResult.value = null
}

// 导入文件上传前处理
function beforeImportUpload(file) {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel'

  if (!isExcel) {
    message.error('只能上传 Excel 文件！')
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('文件大小不能超过 10MB！')
    return false
  }

  return false // 阻止自动上传
}

// 移除导入文件
function handleImportRemove() {
  importResult.value = null
}

// 处理批量导入
async function handleImport() {
  try {
    if (importFileList.value.length === 0) {
      message.error('请选择要导入的文件')
      return
    }

    importLoading.value = true

    const file = importFileList.value[0].originFileObj || importFileList.value[0]
    const result = await blacklistApi.importFile(file)

    // 根据接口返回结构处理结果
    if (result.code === 0 && result.ok) {
      importResult.value = {
        success: true,
        message: '导入成功',
        details: result.data || result.msg
      }
      message.success('导入成功')

      // 延迟关闭弹窗并刷新列表
      setTimeout(() => {
        importModalVisible.value = false
        handleImportCancel()
        queryData()
      }, 2000)
    } else {
      importResult.value = {
        success: false,
        message: '导入失败',
        details: result.msg
      }
      message.error(result.msg || '导入失败')
    }

  } catch (e) {
    smartSentry.captureError(e)
    importResult.value = {
      success: false,
      message: '导入失败',
      details: '系统异常，请稍后重试'
    }
    message.error('导入失败')
  } finally {
    importLoading.value = false
  }
}

// 取消导入
function handleImportCancel() {
  importFileList.value = []
  importResult.value = null
}

// 批量删除
function batchDelete() {
  if (selectedRowKeyList.value.length === 0) {
    message.warning('请选择要删除的记录')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeyList.value.length} 条黑名单记录吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        await blacklistApi.batchDelete(selectedRowKeyList.value)
        message.success('删除成功')
        selectedRowKeyList.value = []
        queryData()
      } catch (e) {
        smartSentry.captureError(e)
        message.error('删除失败')
      } finally {
        SmartLoading.hide()
      }
    }
  })
}

// 从黑名单移除
function removeFromBlacklist(record) {
  Modal.confirm({
    title: '确认移除',
    content: `确定要将手机号码 ${record.phoneNumber} 从黑名单中移除吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        await blacklistApi.remove(record.id)
        message.success('移除成功')
        queryData()
      } catch (e) {
        smartSentry.captureError(e)
        message.error('移除失败')
      } finally {
        SmartLoading.hide()
      }
    }
  })
}

// 导出黑名单
async function exportBlacklist() {
  try {
    SmartLoading.show('正在导出数据...')

    const params = {
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize
    }

    if (queryForm.phoneNumber) {
      params.phoneNumber = queryForm.phoneNumber
    }
    if (queryForm.name) {
      params.name = queryForm.name
    }
    if (queryForm.dateRange && queryForm.dateRange.length === 2) {
      params.startTime = queryForm.dateRange[0].format('YYYY-MM-DD') + ' 00:00:00'
      params.endTime = queryForm.dateRange[1].format('YYYY-MM-DD') + ' 23:59:59'
    }

    await blacklistApi.export(params)
    message.success('导出成功')

  } catch (e) {
    smartSentry.captureError(e)
    message.error('导出失败')
  } finally {
    SmartLoading.hide()
  }
}

onMounted(() => {
  queryData()
})
</script>

<style scoped>
.blacklist-manage {
  padding: 20px;
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

.import-result {
  margin-top: 16px;
}

.result-details {
  text-align: center;
  color: #666;
  font-size: 14px;
}
</style>
