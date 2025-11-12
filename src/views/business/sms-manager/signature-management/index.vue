<!--
  * 短信签名管理
  *
  * @Author:    Claude
  * @Date:      2025-11-04
-->
<template>
  <div class="signature-management">
    <!-- 查询表单 -->
    <a-form class="smart-query-form">
      <a-row class="smart-query-form-row">
        <a-form-item class="smart-query-form-item" label="签名名称">
          <a-input v-model:value="queryForm.signatureName" placeholder="请输入签名名称" />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="签名类型">
          <DictSelect v-model:value="queryForm.signatureType" dict-code="SIGNATURE_TYPE" placeholder="请选择签名类型" />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="审核状态">
          <DictSelect v-model:value="queryForm.auditStatus" dict-code="AUDIT_STATUS" placeholder="请选择审核状态" />
        </a-form-item>
        <a-form-item class="smart-query-form-item" label="启用状态">
          <DictSelect v-model:value="queryForm.status" dict-code="STATUS" placeholder="请选择启用状态" />
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
      <!-- 表格 -->
      <a-table size="small" :scroll="{ y: 800 }" :dataSource="tableData" :columns="columns"
        :rowKey="(record, index) => index" bordered :loading="tableLoading" :pagination="false">
        <template #bodyCell="{ text, record, column, index }">
          <template v-if="column.dataIndex === 'serialNumber'">
            {{ ++index }}
          </template>

          <template v-if="column.dataIndex === 'auditStatus'">
            <a-tag :color="getAuditStatusColor(text)">
              {{ getAuditStatusText(text) }}
            </a-tag>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <div class="smart-table-operate">
              <a-button @click="handleAudit(record)" type="link" v-if="record.auditStatus === 'AUDIT_STATE_INIT'">审核</a-button>
              <a-button @click="viewDetail(record)" type="link">查看</a-button>
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

    <!-- 审核弹窗 -->
    <a-modal v-model:open="auditModalVisible" title="签名审核" @ok="handleAuditSubmit" @cancel="cancelAudit">
      <a-form :model="auditForm" layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model:value="auditForm.auditStatus">
            <a-radio value="APPROVED">通过</a-radio>
            <a-radio value="REJECTED">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核备注">
          <a-textarea v-model:value="auditForm.auditRemark" placeholder="请输入审核备注" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { signatureApi } from '/@/api/business/sms-manager/signature-api';
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
import { smartSentry } from '/@/lib/smart-sentry';
import DictLabel from '/@/components/support/dict-label/index.vue';
import DictSelect from '/@/components/support/dict-select/index.vue';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue';

// 表格列定义
const columns = ref([
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 80
  },
  {
    title: '签名名称',
    dataIndex: 'signName',
    width: 250
  },
  {
    title: '业务类型',
    dataIndex: 'businessType',
    width: 150
  },
  {
    title: '审核状态',
    dataIndex: 'auditStatus',
    width: 150
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
    fixed: 'right'
  }
]);

// 查询表单
const queryFormState = {
  signatureName: undefined,
  signatureType: undefined,
  auditStatus: undefined,
  status: undefined,
  pageNum: 1,
  pageSize: 10
};

const queryForm = reactive({ ...queryFormState });
const tableLoading = ref(false);
const tableData = ref([]);
const total = ref(0);

// 审核相关
const auditModalVisible = ref(false);
const auditForm = reactive({
  signatureId: null,
  auditStatus: 'APPROVED',
  auditRemark: ''
});
const currentAuditRecord = ref(null);

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
    let result = await signatureApi.queryPage(queryForm);
    if (result.code === 0) {
      // 适配接口返回的数据结构：data 直接是数组
      const dataList = Array.isArray(result.data) ? result.data : (result.data.list || []);

      // 直接使用接口返回的数据
      tableData.value = dataList;
      total.value = result.data.total || dataList.length;
    }
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    tableLoading.value = false;
  }
}

// 状态切换
async function toggleStatus(record) {
  const newStatus = record.status === 1 ? 0 : 1;
  try {
    SmartLoading.show();
    await signatureApi.updateStatus({
      signatureId: record.signatureId,
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

// 审核相关方法
function handleAudit(record) {
  currentAuditRecord.value = record;
  auditForm.signatureId = record.signatureId;
  auditForm.auditStatus = 'APPROVED';
  auditForm.auditRemark = '';
  auditModalVisible.value = true;
}

async function handleAuditSubmit() {
  try {
    SmartLoading.show();
    await signatureApi.audit(auditForm);
    message.success('审核完成');
    auditModalVisible.value = false;
    queryData();
  } catch (e) {
    smartSentry.captureError(e);
  } finally {
    SmartLoading.hide();
  }
}

function cancelAudit() {
  auditModalVisible.value = false;
  currentAuditRecord.value = null;
}

// 查看详情
function viewDetail(record) {
  message.info(`查看签名：${record.signName}`);
  // TODO: 实现查看详情功能
}

// 状态显示辅助方法
function getAuditStatusColor(status) {
  const colors = {
    'AUDIT_STATE_INIT': 'orange',
    'AUDIT_STATE_PASS': 'green',
    'AUDIT_STATE_FAIL': 'red',
    'AUDIT_STATE_CANCEL': 'red'
  };
  return colors[status] || 'default';
}

function getAuditStatusText(status) {
  const texts = {
    'AUDIT_STATE_INIT': '待审核',
    'AUDIT_STATE_PASS': '审核通过',
    'AUDIT_STATE_FAIL': '审核失败',
    'AUDIT_STATE_CANCEL': '已取消'
  };
  return texts[status] || status;
}

onMounted(queryData);
</script>

<style scoped>
.signature-management {
  padding: 20px;
}
</style>