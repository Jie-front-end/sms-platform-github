<template>
  <div class="forbidden-words-manage">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item class="smart-query-form-item" label="违禁词">
          <a-input
            v-model:value="queryForm.word"
            placeholder="请输入违禁词"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="类型">
          <a-select
            v-model:value="queryForm.wordType"
            placeholder="请选择类型"
            style="width: 150px"
            allowClear
          >
            <a-select-option value="广告">广告</a-select-option>
            <a-select-option value="政治">政治</a-select-option>
            <a-select-option value="色情">色情</a-select-option>
            <a-select-option value="违法">违法</a-select-option>
            <a-select-option value="其他">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="启用状态">
          <a-select
            v-model:value="queryForm.status"
            placeholder="请选择状态"
            style="width: 120px"
            allowClear
          >
            <a-select-option :value="1">已启用</a-select-option>
            <a-select-option :value="0">已禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="创建时间">
          <a-range-picker
            v-model:value="queryForm.createDateRange"
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
        <a-button @click="showFormModal()" type="primary" size="small">
          <template #icon>
            <PlusOutlined />
          </template>
          添加违禁词
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
        <a-button @click="exportWords" size="small">
          <template #icon>
            <ExportOutlined />
          </template>
          导出
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator
          v-model="columns"
          :tableId="TABLE_ID_CONST.BUSINESS.SMS.FORBIDDEN_WORDS_MANAGE"
          :refresh="queryData"
        />
      </div>
    </a-row>

    <!-- 数据表格 -->
    <a-table
      size="small"
      :scroll="{ x: 1100, y: 600 }"
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

        <template v-if="column.dataIndex === 'word'">
          <a-tag color="red">{{ text }}</a-tag>
        </template>

        <template v-if="column.dataIndex === 'wordType'">
          <a-tag :color="getTypeColor(text)">{{ text || '-' }}</a-tag>
        </template>

        <template v-if="column.dataIndex === 'status'">
          <a-switch
            :checked="record.status === 1"
            @change="(checked) => handleToggleStatus(record, checked)"
          />
        </template>

        <template v-if="column.dataIndex === 'createTime'">
          {{ formatDateTime(text) }}
        </template>

        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showFormModal(record)" type="link" size="small">
              编辑
            </a-button>
            <a-button @click="deleteWord(record)" type="link" size="small" danger>
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

    <!-- 添加/编辑违禁词弹窗 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="isEdit ? '编辑违禁词' : '添加违禁词'"
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
        <a-form-item label="违禁词" name="word">
          <a-input
            v-model:value="formData.word"
            placeholder="请输入违禁词"
            :maxlength="50"
          />
        </a-form-item>
        <a-form-item label="类型" name="wordType">
          <a-select
            v-model:value="formData.wordType"
            placeholder="请选择类型"
          >
            <a-select-option value="广告">广告</a-select-option>
            <a-select-option value="政治">政治</a-select-option>
            <a-select-option value="色情">色情</a-select-option>
            <a-select-option value="违法">违法</a-select-option>
            <a-select-option value="其他">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="启用状态" name="status">
          <a-radio-group v-model:value="formData.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量导入弹窗 -->
    <a-modal
      v-model:open="importModalVisible"
      title="批量导入违禁词"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  ImportOutlined,
  DeleteOutlined,
  ExportOutlined,
  InboxOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import { forbiddenWordsApi } from '/@/api/business/sms-manager/forbidden-words-api'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const'
import TableOperator from '/@/components/support/table-operator/index.vue'
import { formatDateTime } from '/@/utils/date-util'

// 查询表单
const queryFormState = {
  word: undefined,
  wordType: undefined,
  status: undefined,
  createDateRange: undefined,
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
    width: 80,
    fixed: 'left',
  },
  {
    title: '违禁词',
    dataIndex: 'word',
    width: 150,
  },
  {
    title: '类型',
    dataIndex: 'wordType',
    width: 100,
  },
  {
    title: '启用状态',
    dataIndex: 'status',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 180,
  },
  {
    title: '操作',
    dataIndex: 'action',
    fixed: 'right',
    width: 140,
  },
])

// 行选择
const selectedRowKeyList = ref([])
const rowSelection = {
  onChange: (selectedRowKeys) => {
    selectedRowKeyList.value = selectedRowKeys
  },
}

// 表单弹窗
const formModalVisible = ref(false)
const formLoading = ref(false)
const formRef = ref()
const isEdit = ref(false)
const currentRecord = ref(null)

const formData = reactive({
  id: undefined,
  word: '',
  wordType: '其他',
  status: 1,
})

const formRules = {
  word: [
    { required: true, message: '请输入违禁词', trigger: 'blur' },
    { min: 1, max: 50, message: '违禁词长度为1-50个字符', trigger: 'blur' }
  ],
  wordType: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

// 导入弹窗
const importModalVisible = ref(false)
const importLoading = ref(false)
const importFileList = ref([])
const importResult = ref(null)

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    '广告': 'orange',
    '政治': 'red',
    '色情': 'purple',
    '违法': 'volcano',
    '其他': 'default',
  }
  return colorMap[type] || 'default'
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
    if (queryForm.word) {
      params.word = queryForm.word
    }
    if (queryForm.wordType) {
      params.wordType = queryForm.wordType
    }
    if (queryForm.status !== undefined) {
      params.status = queryForm.status
    }
    if (queryForm.createDateRange && queryForm.createDateRange.length === 2) {
      params.createTimeStart = queryForm.createDateRange[0].format('YYYY-MM-DD') + ' 00:00:00'
      params.createTimeEnd = queryForm.createDateRange[1].format('YYYY-MM-DD') + ' 23:59:59'
    }

    const res = await forbiddenWordsApi.queryPage(params)

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
}

// 显示表单弹窗
const showFormModal = (record) => {
  if (record && record.id) {
    // 编辑模式
    isEdit.value = true
    currentRecord.value = record
    Object.assign(formData, {
      id: record.id,
      word: record.word || '',
      wordType: record.wordType || '其他',
      status: record.status !== undefined ? record.status : 1,
    })
  } else {
    // 新增模式
    isEdit.value = false
    currentRecord.value = null
    Object.assign(formData, {
      id: undefined,
      word: '',
      wordType: '其他',
      status: 1,
    })
  }
  formModalVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    formLoading.value = true

    const params = {
      word: formData.word.trim(),
      wordType: formData.wordType,
      status: formData.status,
    }

    if (isEdit.value) {
      // 编辑
      params.id = formData.id
      const result = await forbiddenWordsApi.update(params)
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
      const result = await forbiddenWordsApi.add(params)
      if (result.code === 0 && result.ok) {
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
const handleFormCancel = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: undefined,
    word: '',
    wordType: '其他',
    status: 1,
  })
  isEdit.value = false
  currentRecord.value = null
}

// 切换启用状态
const handleToggleStatus = async (record, checked) => {
  const oldStatus = record.status // 保存切换前的状态
  const newStatus = checked ? 1 : 0 // 新状态：开关打开为1，关闭为0

  try {
    const params = {
      id: record.id,
      word: record.word,
      wordType: record.wordType,
      status: newStatus,
    }
    const result = await forbiddenWordsApi.update(params)
    if (result.code === 0 && result.ok) {
      message.success(newStatus === 1 ? '已启用' : '已禁用')
      // 更新本地状态
      record.status = newStatus
    } else {
      message.error(result.msg || '操作失败')
      // 不需要恢复，因为我们没有用 v-model
    }
  } catch (error) {
    smartSentry.captureError(error)
    message.error('操作失败，请稍后重试')
    // 不需要恢复，因为我们没有用 v-model
  }
}

// 删除违禁词
const deleteWord = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除违禁词 "${record.word}" 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        const result = await forbiddenWordsApi.batchDelete([record.id])
        if (result.code === 0 && result.ok) {
          message.success('删除成功')
          queryData()
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
    message.warning('请选择要删除的违禁词')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeyList.value.length} 个违禁词吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        const result = await forbiddenWordsApi.batchDelete(selectedRowKeyList.value)
        if (result.code === 0 && result.ok) {
          message.success('批量删除成功')
          selectedRowKeyList.value = []
          queryData()
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

// 下载模板
const downloadTemplate = async () => {
  try {
    SmartLoading.show('正在下载模板...')
    await forbiddenWordsApi.downloadTemplate()
    message.success('模板下载成功')
  } catch (e) {
    smartSentry.captureError(e)
    message.error('模板下载失败')
  } finally {
    SmartLoading.hide()
  }
}

// 显示导入弹窗
const showImportModal = () => {
  importModalVisible.value = true
  importResult.value = null
}

// 导入前处理
const beforeImportUpload = (file) => {
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
const handleImportRemove = () => {
  importResult.value = null
}

// 处理导入
const handleImport = async () => {
  try {
    if (importFileList.value.length === 0) {
      message.error('请选择要导入的文件')
      return
    }

    importLoading.value = true

    const file = importFileList.value[0].originFileObj || importFileList.value[0]
    const result = await forbiddenWordsApi.importFile(file)

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
const handleImportCancel = () => {
  importFileList.value = []
  importResult.value = null
}

// 导出违禁词
const exportWords = async () => {
  try {
    SmartLoading.show('正在导出数据...')

    const params = {}

    if (queryForm.word) {
      params.word = queryForm.word
    }
    if (queryForm.wordType) {
      params.wordType = queryForm.wordType
    }
    if (queryForm.status !== undefined) {
      params.status = queryForm.status
    }
    if (queryForm.createDateRange && queryForm.createDateRange.length === 2) {
      params.createTimeStart = queryForm.createDateRange[0].format('YYYY-MM-DD') + ' 00:00:00'
      params.createTimeEnd = queryForm.createDateRange[1].format('YYYY-MM-DD') + ' 23:59:59'
    }

    await forbiddenWordsApi.export(params)
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
  queryData()
})
</script>

<style scoped lang="less">
.forbidden-words-manage {
  padding: 20px;
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
