<template>
  <div class="contact-manage">
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
        <a-form-item class="smart-query-form-item" label="联系人姓名">
          <a-input
            v-model:value="queryForm.contactName"
            placeholder="请输入联系人姓名"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="联系人类型">
          <a-select
            v-model:value="queryForm.contactType"
            placeholder="请选择联系人类型"
            style="width: 150px"
            allowClear
          >
            <a-select-option value="客户">客户</a-select-option>
            <a-select-option value="供应商">供应商</a-select-option>
            <a-select-option value="合作伙伴">合作伙伴</a-select-option>
            <a-select-option value="员工">员工</a-select-option>
            <a-select-option value="其他">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="创建人">
          <a-input
            v-model:value="queryForm.creatorName"
            placeholder="请输入创建人"
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
        <a-button @click="showFormModal()" type="primary" size="small">
          <template #icon>
            <PlusOutlined />
          </template>
          新增联系人
        </a-button>
        <a-button @click="batchDelete" type="primary" danger size="small" :disabled="selectedRowKeyList.length === 0">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <!-- TableOperator 组件已移除，等待后端接口实现 -->
      </div>
    </a-row>

    <!-- 数据表格 -->
    <a-table
      size="small"
      :scroll="{ x: 1400, y: 600 }"
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
          <a-tag color="blue">{{ text }}</a-tag>
        </template>

        <template v-if="column.dataIndex === 'contactType'">
          <a-tag :color="getContactTypeColor(text)">{{ text || '-' }}</a-tag>
        </template>

        <template v-if="column.dataIndex === 'remark'">
          <a-tooltip :title="text">
            <span class="ellipsis-text">{{ text || '-' }}</span>
          </a-tooltip>
        </template>

        <template v-if="column.dataIndex === 'createTime'">
          {{ formatDateTime(text) }}
        </template>

        <template v-if="column.dataIndex === 'updateTime'">
          {{ formatDateTime(text) }}
        </template>

        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showFormModal(record)" type="link" size="small">
              编辑
            </a-button>
            <a-button @click="deleteContact(record)" type="link" size="small" danger>
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

    <!-- 新增/编辑联系人弹窗 -->
    <a-modal
      v-model:open="formModalVisible"
      :title="isEdit ? '编辑联系人' : '新增联系人'"
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
          />
        </a-form-item>
        <a-form-item label="联系人姓名" name="contactName">
          <a-input
            v-model:value="formData.contactName"
            placeholder="请输入联系人姓名"
            :maxlength="50"
          />
        </a-form-item>
        <a-form-item label="联系人类型" name="contactType">
          <a-select
            v-model:value="formData.contactType"
            placeholder="请选择联系人类型"
          >
            <a-select-option value="客户">客户</a-select-option>
            <a-select-option value="供应商">供应商</a-select-option>
            <a-select-option value="合作伙伴">合作伙伴</a-select-option>
            <a-select-option value="员工">员工</a-select-option>
            <a-select-option value="其他">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="formData.remark"
            placeholder="请输入备注信息"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { contactApi } from '/@/api/business/sms-manager/contact-api'
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const'
import { formatDateTime } from '/@/utils/date-util'

// 查询表单
const queryFormState = {
  phoneNumber: undefined,
  contactName: undefined,
  contactType: undefined,
  creatorName: undefined,
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
    title: '联系人姓名',
    dataIndex: 'contactName',
    width: 120,
  },
  {
    title: '联系人类型',
    dataIndex: 'contactType',
    width: 120,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 200,
    ellipsis: true,
  },
  {
    title: '创建人',
    dataIndex: 'creatorName',
    width: 100,
  },
  {
    title: '更新人',
    dataIndex: 'updaterName',
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
  phoneNumber: '',
  contactName: '',
  contactType: '客户',
  remark: '',
})

const formRules = {
  phoneNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '联系人姓名长度为2-50个字符', trigger: 'blur' }
  ],
  contactType: [
    { required: true, message: '请选择联系人类型', trigger: 'change' }
  ]
}

// 获取联系人类型颜色
const getContactTypeColor = (type) => {
  const colorMap = {
    '客户': 'green',
    '供应商': 'blue',
    '合作伙伴': 'purple',
    '员工': 'orange',
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
    if (queryForm.phoneNumber) {
      params.phoneNumber = queryForm.phoneNumber
    }
    if (queryForm.contactName) {
      params.contactName = queryForm.contactName
    }
    if (queryForm.contactType) {
      params.contactType = queryForm.contactType
    }
    if (queryForm.creatorName) {
      params.creatorName = queryForm.creatorName
    }

    const res = await contactApi.queryPage(params)

    // 根据接口返回结构处理数据
    if (res.code === 0 && res.ok) {
      const responseData = res.data || {}
      tableData.value = responseData.list || []
      total.value = responseData.total || 0
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
      phoneNumber: record.phoneNumber || '',
      contactName: record.contactName || '',
      contactType: record.contactType || '客户',
      remark: record.remark || '',
    })
  } else {
    // 新增模式
    isEdit.value = false
    currentRecord.value = null
    Object.assign(formData, {
      id: undefined,
      phoneNumber: '',
      contactName: '',
      contactType: '客户',
      remark: '',
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
      phoneNumber: formData.phoneNumber.trim(),
      contactName: formData.contactName.trim(),
      contactType: formData.contactType,
      remark: formData.remark.trim(),
    }

    if (isEdit.value) {
      // 编辑
      params.id = formData.id
      const result = await contactApi.update(params)
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
      const result = await contactApi.add(params)
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
    phoneNumber: '',
    contactName: '',
    contactType: '客户',
    remark: '',
  })
  isEdit.value = false
  currentRecord.value = null
}

// 删除联系人
const deleteContact = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除联系人 "${record.contactName}" (${record.phoneNumber}) 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        const result = await contactApi.batchDelete([record.id])
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
    message.warning('请选择要删除的联系人')
    return
  }

  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeyList.value.length} 个联系人吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        SmartLoading.show()
        const result = await contactApi.batchDelete(selectedRowKeyList.value)
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

// 组件挂载
onMounted(() => {
  queryData()
})
</script>

<style scoped lang="less">
.contact-manage {
  padding: 20px;
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
</style>
