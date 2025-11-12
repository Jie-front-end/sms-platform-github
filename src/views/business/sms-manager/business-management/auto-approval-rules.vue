<!--
  * 自动审核规则管理
  *
  * @Author:    Claude
  * @Date:      2025-11-04
-->
<template>
  <div class="auto-approval-rules">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item class="smart-query-form-item" label="规则名称">
          <a-input v-model:value="queryForm.ruleName" placeholder="请输入规则名称" />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="规则类型">
          <a-select v-model:value="queryForm.ruleType" placeholder="请选择规则类型" allowClear>
            <a-select-option value="FORBIDDEN_WORDS">违禁词过滤</a-select-option>
            <a-select-option value="FREQUENCY_LIMIT">发送频率限制</a-select-option>
            <a-select-option value="PHONE_VALIDATION">手机号验证</a-select-option>
            <a-select-option value="CONTENT_LENGTH">内容长度限制</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="启用状态">
          <a-select v-model:value="queryForm.status" placeholder="请选择启用状态" allowClear>
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item class="smart-query-form-item">
          <a-button type="primary" @click="onSearch">
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

    <a-card size="small" :bordered="false" :hoverable="true">
      <!-- 表格操作行 -->
      <a-row class="smart-table-btn-block">
        <div class="smart-table-operate-block">
          <a-button @click="showForm" type="primary" size="small">
            <template #icon><PlusOutlined /></template>
            新建规则
          </a-button>
          <a-button @click="confirmBatchDelete" type="primary" danger size="small"
            :disabled="selectedRowKeyList.length == 0">
            <template #icon><DeleteOutlined /></template>
            批量删除
          </a-button>
        </div>
        <div class="smart-table-setting-block">
          <TableOperator v-model="columns" tableId="BUSINESS.SMS.AUTO_APPROVAL_RULES" :refresh="queryData" />
        </div>
      </a-row>

      <!-- 表格 -->
      <a-table size="small" :scroll="{ y: 800 }" :dataSource="tableData" :columns="columns"
        rowKey="ruleId" bordered :loading="tableLoading" :pagination="false"
        :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }">
        <template #bodyCell="{ text, record, column, index }">
          <template v-if="column.dataIndex === 'serialNumber'">
            {{ ++index }}
          </template>

          <template v-if="column.dataIndex === 'ruleType'">
            <a-tag :color="getRuleTypeColor(text)">
              {{ getRuleTypeText(text) }}
            </a-tag>
          </template>

          <template v-if="column.dataIndex === 'ruleContent'">
            <a-tooltip :title="text">
              <span class="rule-content">{{ formatRuleContent(text, record.ruleType) }}</span>
            </a-tooltip>
          </template>

          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="text === 1 ? 'green' : 'red'">
              {{ text === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <div class="smart-table-operate">
              <a-button @click="showForm(record)" type="link">编辑</a-button>
              <a-button @click="showTestModal(record)" type="link">测试</a-button>
              <a-button @click="toggleStatus(record)" :type="record.status === 1 ? 'link' : 'link'"
                :danger="record.status === 1">
                {{ record.status === 1 ? '禁用' : '启用' }}
              </a-button>
              <a-button @click="confirmDelete(record.ruleId)" type="link" danger>删除</a-button>
            </div>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="smart-query-table-page">
        <a-pagination showSizeChanger showQuickJumper show-less-items :pageSizeOptions="PAGE_SIZE_OPTIONS"
          :defaultPageSize="queryForm.pageSize" v-model:current="queryForm.pageNum"
          v-model:pageSize="queryForm.pageSize" :total="total" @change="queryData" @showSizeChange="queryData"
          :show-total="(total) => `共${total}条`" />
      </div>
    </a-card>

    <!-- 规则表单弹窗 -->
    <RuleForm ref="formRef" @reloadList="queryData" />

    <!-- 测试弹窗 -->
    <a-modal v-model:open="testModalVisible" title="规则测试" @ok="handleTestSubmit" @cancel="cancelTest">
      <a-form layout="vertical">
        <a-form-item label="测试内容">
          <a-textarea v-model:value="testContent" placeholder="请输入要测试的内容" :rows="4" />
        </a-form-item>
        <a-form-item label="测试结果" v-if="testResult">
          <a-alert :type="testResult.passed ? 'success' : 'error'" :message="testResult.result" show-icon />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { autoApprovalApi } from '/@/api/business/sms-manager/auto-approval-api';
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
import { smartSentry } from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import RuleForm from './rule-form.vue';
import { SearchOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue';

// 表格列定义
const columns = ref([
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 60
  },
  {
    title: '规则名称',
    dataIndex: 'ruleName',
    width: 150
  },
  {
    title: '规则类型',
    dataIndex: 'ruleType',
    width: 120
  },
  {
    title: '规则描述',
    dataIndex: 'ruleDescription',
    width: 200
  },
  {
    title: '规则内容',
    dataIndex: 'ruleContent',
    width: 250
  },
  {
    title: '启用状态',
    dataIndex: 'status',
    width: 100
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    width: 150
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 200,
    fixed: 'right'
  }
]);

// 查询表单
const queryFormState = {
  ruleName: undefined,
  ruleType: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10
};

const queryForm = reactive({ ...queryFormState });
const tableLoading = ref(false);
const tableData = ref([]);
const total = ref(0);
const selectedRowKeyList = ref([]);

// 测试相关
const testModalVisible = ref(false);
const testContent = ref('');
const testResult = ref(null);
const currentTestRule = ref(null);

// 重置查询
function resetQuery() {
  let pageSize = queryForm.pageSize;
  Object.assign(queryForm, queryFormState);
  queryForm.pageSize = pageSize;
  queryData();
}

// 搜索
function onSearch() {
  queryForm.pageNum = 1;
  queryData();
}

// 查询数据
async function queryData() {
  tableLoading.value = true;
  try {
    let result = await autoApprovalApi.queryPage(queryForm);
    if (result.code === 0) {
      tableData.value = result.data.list;
      total.value = result.data.total;
    }
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    tableLoading.value = false;
  }
}

// 表单相关
const formRef = ref();
function showForm(data) {
  formRef.value.show(data);
}

// 删除确认
function confirmDelete(ruleId) {
  Modal.confirm({
    title: '提示',
    content: '确定要删除这个规则吗？',
    okText: '删除',
    okType: 'danger',
    onOk() {
      requestDelete(ruleId);
    },
    cancelText: '取消'
  });
}

// 删除请求
async function requestDelete(ruleId) {
  try {
    SmartLoading.show();
    await autoApprovalApi.delete(ruleId);
    message.success('删除成功');
    queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

// 批量删除
function confirmBatchDelete() {
  Modal.confirm({
    title: '提示',
    content: '确定要批量删除这些规则吗？',
    okText: '删除',
    okType: 'danger',
    onOk() {
      requestBatchDelete();
    }
  });
}

async function requestBatchDelete() {
  try {
    SmartLoading.show();
    await autoApprovalApi.batchDelete(selectedRowKeyList.value);
    message.success('批量删除成功');
    selectedRowKeyList.value = [];
    queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

// 选择表格行
function onSelectChange(selectedRowKeys) {
  selectedRowKeyList.value = selectedRowKeys;
}

// 状态切换
async function toggleStatus(record) {
  const newStatus = record.status === 1 ? 0 : 1;
  try {
    SmartLoading.show();
    await autoApprovalApi.updateStatus({
      ruleId: record.ruleId,
      status: newStatus
    });
    message.success(`${newStatus === 1 ? '启用' : '禁用'}成功`);
    queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

// 测试相关方法
function showTestModal(record) {
  currentTestRule.value = record;
  testContent.value = '';
  testResult.value = null;
  testModalVisible.value = true;
}

async function handleTestSubmit() {
  if (!testContent.value.trim()) {
    message.warning('请输入测试内容');
    return;
  }

  try {
    SmartLoading.show();
    const result = await autoApprovalApi.testRule({
      ruleData: currentTestRule.value,
      testContent: testContent.value
    });

    if (result.code === 0) {
      testResult.value = result.data;
    }
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

function cancelTest() {
  testModalVisible.value = false;
  testContent.value = '';
  testResult.value = null;
  currentTestRule.value = null;
}

// 辅助方法
function getRuleTypeColor(type) {
  const colors = {
    'FORBIDDEN_WORDS': 'red',
    'FREQUENCY_LIMIT': 'orange',
    'PHONE_VALIDATION': 'blue',
    'CONTENT_LENGTH': 'green'
  };
  return colors[type] || 'default';
}

function getRuleTypeText(type) {
  const texts = {
    'FORBIDDEN_WORDS': '违禁词过滤',
    'FREQUENCY_LIMIT': '发送频率限制',
    'PHONE_VALIDATION': '手机号验证',
    'CONTENT_LENGTH': '内容长度限制'
  };
  return texts[type] || type;
}

function formatRuleContent(content, type) {
  if (type === 'FREQUENCY_LIMIT') {
    try {
      const config = JSON.parse(content);
      return `每分钟${config.maxPerMinute}条，每小时${config.maxPerHour}条，每天${config.maxPerDay}条`;
    } catch {
      return content;
    }
  }
  return content.length > 30 ? content.substring(0, 30) + '...' : content;
}

onMounted(queryData);
</script>

<style scoped>
.auto-approval-rules {
  padding: 20px;
}

.rule-content {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>