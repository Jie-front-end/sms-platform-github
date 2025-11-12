<!--
  * 模板选择弹窗
  *
  * @Author:    Claude Code
  * @Date:      2024-11-05
-->
<template>
  <a-modal
    v-model:open="visible"
    title="选择短信模板"
    width="1200px"
    :footer="null"
    @cancel="handleCancel"
  >
    <!-- 查询表单 -->
    <a-form class="smart-query-form" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="模板名称">
            <a-input
              v-model:value="queryForm.templateName"
              placeholder="请输入模板名称"
            />
          </a-form-item>
        </a-col>
        <a-col :span="5">
          <a-form-item label="模板类型">
            <DictSelect
              v-model:value="queryForm.outerTemplateType"
              :dict-code="DICT_SMS_ENUM.SMS_OUTER_TEMPLATE_TYPE"
              placeholder="请选择模板类型"
            />
          </a-form-item>
        </a-col>
        <a-col :span="5">
          <a-form-item label="短信签名">
            <SignSelect
              v-model:value="queryForm.signName"
              placeholder="请选择短信签名"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label=" " class="query-btn-item">
            <a-space>
              <a-button type="primary" @click="onSearch">
                <template #icon>
                  <SearchOutlined />
                </template>
                查询
              </a-button>
              <a-button @click="resetQuery">
                <template #icon>
                  <ReloadOutlined />
                </template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <!-- 表格 -->
    <a-table
      size="small"
      :scroll="{ y: 400 }"
      :dataSource="tableData"
      :columns="columns"
      rowKey="templateCode"
      bordered
      :loading="tableLoading"
      :pagination="false"
      :customRow="customRow"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ text, column, index, record }">
        <template v-if="column.dataIndex === 'serialNumber'">
          {{ (queryForm.pageNum - 1) * queryForm.pageSize + index + 1 }}
        </template>

        <template v-if="column.dataIndex === 'outerTemplateType'">
          <DictLabel :dict-code="DICT_SMS_ENUM.SMS_OUTER_TEMPLATE_TYPE" :data-value="text" />
        </template>

        <template v-if="column.dataIndex === 'auditStatus'">
          <DictLabel :dict-code="DICT_SMS_ENUM.SMS_AUDIT_STATUS" :data-value="text" />
        </template>

        <template v-if="column.dataIndex === 'enabled'">
          <DictLabel :dict-code="DICT_SMS_ENUM.SMS_TEMPLATE_ENABLED" :data-value="text" />
        </template>

        <template v-if="column.dataIndex === 'action'">
          <a-button type="link" size="small" @click="handleSelect(record)">选择</a-button>
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
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { smsTemplateApi } from '/@/api/business/sms-manager/sms-template-api'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { smartSentry } from '/@/lib/smart-sentry'
import DictLabel from '/@/components/support/dict-label/index.vue'
import DictSelect from '/@/components/support/dict-select/index.vue'
import SignSelect from '/@/components/business/sign-select/index.vue'
import { DICT_SMS_ENUM } from '/@/constants/support/dict-const'

const emits = defineEmits(['select'])

// 接收父组件传入的签名值
const props = defineProps({
  signName: {
    type: String,
    default: undefined
  }
})

// 弹窗显示状态
const visible = ref(false)

// 选中的模板
const selectedTemplate = ref(null)

// 表格列定义
const columns = ref([
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 60,
    fixed: 'left'
  },
  {
    title: '模板编码',
    dataIndex: 'templateCode',
    width: 150,
  },
  {
    title: '模板名称',
    dataIndex: 'templateName',
    width: 200,
    ellipsis: true,
  },
  {
    title: '模板类型',
    dataIndex: 'outerTemplateType',
    width: 100,
  },
  {
    title: '模板内容',
    dataIndex: 'templateContent',
    width: 400,
    ellipsis: true,
  },
  {
    title: '审核状态',
    dataIndex: 'auditStatus',
    width: 100,
  },
  {
    title: '启用状态',
    dataIndex: 'enabled',
    width: 100,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 80,
    fixed: 'right'
  },
])

// 查询表单
const queryFormState = {
  templateName: undefined,
  outerTemplateType: undefined,
  signName: undefined,
  enabled: 1, // 默认只显示已启用的模板
  pageNum: 1,
  pageSize: 10,
}

const queryForm = reactive({ ...queryFormState })

// 表格数据
const tableLoading = ref(false)
const tableData = ref([])
const total = ref(0)

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
    let queryResult = await smsTemplateApi.queryPage(queryForm)
    tableData.value = queryResult.data.list
    total.value = queryResult.data.total
  } catch (e) {
    smartSentry.captureError(e)
    message.error('查询失败')
  } finally {
    tableLoading.value = false
  }
}

// 自定义行属性
function customRow(record) {
  return {
    onClick: () => {
      handleSelect(record)
    },
    style: {
      cursor: 'pointer'
    }
  }
}

// 行样式
function rowClassName(record) {
  if (selectedTemplate.value?.templateCode === record.templateCode) {
    return 'selected-row'
  }
  return ''
}

// 选择模板
async function handleSelect(record) {
  try {
    selectedTemplate.value = record

    // 调用模糊查询接口获取完整的模板信息
    const result = await smsTemplateApi.queryFuzzyByName({ templateName: record.templateName })

    if (result.data && result.data.length > 0) {
      const templateDetail = result.data[0]
      emits('select', {
        templateCode: templateDetail.templateCode || record.templateCode,
        templateName: templateDetail.templateName || record.templateName,
        templateContent: templateDetail.templateContent || record.templateContent,
        templateKey: templateDetail.templateKey,
        templateKeyList: templateDetail.templateKeyList
      })
    } else {
      // 如果查询不到，使用原有数据
      emits('select', {
        templateCode: record.templateCode,
        templateName: record.templateName,
        templateContent: record.templateContent,
        templateKeyList: record.templateKeyList
      })
    }

    visible.value = false
  } catch (e) {
    smartSentry.captureError(e)
    message.error('获取模板详情失败')
  }
}

// 取消
function handleCancel() {
  visible.value = false
  selectedTemplate.value = null
}

// 显示弹窗
function show() {
  visible.value = true
  selectedTemplate.value = null
  // 重置查询条件并加载数据
  Object.assign(queryForm, queryFormState)
  // 如果传入了签名，则设置为查询条件
  if (props.signName) {
    queryForm.signName = props.signName
  }
  queryData()
}

// 监听弹窗显示状态
watch(visible, (newVal) => {
  if (newVal) {
    queryData()
  }
})

// 暴露方法给父组件
defineExpose({
  show
})
</script>

<style scoped>
.smart-query-form {
  margin-bottom: 16px;
}

.smart-query-table-page {
  margin-top: 16px;
  text-align: right;
}

:deep(.selected-row) {
  background-color: #e6f7ff;
}

:deep(.ant-table-row:hover) {
  background-color: #f5f5f5;
}

:deep(.ant-form-item) {
  margin-bottom: 0;
}

/* 确保所有输入框对齐 */
:deep(.ant-form-item-label) {
  line-height: 1.5715;
  padding-bottom: 8px;
}

/* 查询按钮项的标签透明，但保持高度 */
:deep(.query-btn-item .ant-form-item-label) {
  opacity: 0;
  pointer-events: none;
}
</style>
