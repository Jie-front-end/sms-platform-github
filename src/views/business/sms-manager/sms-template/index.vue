<!--
  * 短信模板详情
  *
  * @Author:    xiong
  * @Date:      2025-09-25 15:21:00
  * @Copyright  xiong
-->
<template>
    <!---------- 查询表单form begin ----------->
    <a-form class="smart-query-form">
        <a-row class="smart-query-form-row">
            <a-form-item class="smart-query-form-item" label="模板名称">
                <a-input v-model:value="queryForm.templateName" placeholder="请输入模板名称" />
            </a-form-item>
            <a-form-item class="smart-query-form-item" label="模板类型">
                <DictSelect v-model:value="queryForm.outerTemplateType" :dict-code="DICT_SMS_ENUM.SMS_OUTER_TEMPLATE_TYPE" placeholder="请选择模板类型" />
            </a-form-item>
            <a-form-item class="smart-query-form-item" label="短信签名">
                <SignSelect v-model:value="queryForm.signName" placeholder="请选择短信签名" />
            </a-form-item>
            <a-form-item class="smart-query-form-item" label="审批状态">
                <DictSelect v-model:value="queryForm.auditStatus" :dict-code="DICT_SMS_ENUM.SMS_AUDIT_STATUS" placeholder="请选择审批状态" />
            </a-form-item>
            <a-form-item class="smart-query-form-item" label="启用状态">
                <DictSelect v-model:value="queryForm.enabled" :dict-code="DICT_SMS_ENUM.SMS_TEMPLATE_ENABLED" placeholder="请选择启用状态" />
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
    <!---------- 查询表单form end ----------->

    <a-card size="small" :bordered="false" :hoverable="true">
        <!---------- 表格操作行 begin ----------->
        <a-row class="smart-table-btn-block">
            <div class="smart-table-operate-block">
                <a-button @click="showForm" type="primary" size="small">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    新建
                </a-button>
                <!-- <a-button @click="confirmBatchDelete" type="primary" danger size="small"
                    :disabled="selectedRowKeyList.length == 0">
                    <template #icon>
                        <DeleteOutlined />
                    </template>
                    批量删除
                </a-button> -->
            </div>
            <div class="smart-table-setting-block">
                <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.SMS.SMS_TEMPLATE_LIST"
                    :refresh="queryData" />
            </div>
        </a-row>
        <!---------- 表格操作行 end ----------->

        <!---------- 表格 begin ----------->
        <a-table size="small" :scroll="{ y: 800 }" :dataSource="tableData" :columns="columns" rowKey="templateCode"
            bordered :loading="tableLoading" :pagination="false"
        >
            <template #bodyCell="{ text, record, column, index }">
                <template v-if="column.dataIndex === 'serialNumber'">
                    {{ ++index }}
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
                    <div class="smart-table-operate">
                        <a-button @click="showForm(record)" type="link">编辑</a-button>
                        <a-button v-if="record.enabled === 1" @click="requestEnabled(record.templateCode,0)"  type="link">启用</a-button>
                        <a-button v-else @click="requestEnabled(record.templateCode,1)" danger type="link">禁用</a-button>
                    </div>
                </template>
            </template>
        </a-table>
        <!---------- 表格 end ----------->

        <div class="smart-query-table-page">
            <a-pagination showSizeChanger showQuickJumper show-less-items :pageSizeOptions="PAGE_SIZE_OPTIONS"
                :defaultPageSize="queryForm.pageSize" v-model:current="queryForm.pageNum"
                v-model:pageSize="queryForm.pageSize" :total="total" @change="queryData" @showSizeChange="queryData"
                :show-total="(total) => `共${total}条`" />
        </div>

        <SmsTemplateForm ref="formRef" @reloadList="queryData" />

    </a-card>
</template>
<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { smsTemplateApi } from '/@/api/business/sms-manager/sms-template-api';
import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
import { smartSentry } from '/@/lib/smart-sentry';
import TableOperator from '/@/components/support/table-operator/index.vue';
import SmsTemplateForm from './sms-template-form.vue';
import DictLabel from '/@/components/support/dict-label/index.vue';
import DictSelect from '/@/components/support/dict-select/index.vue';
import SignSelect from '/@/components/business/sign-select/index.vue';
import { DICT_SMS_ENUM, DICT_GENERAL_ENUM } from '/@/constants/support/dict-const';
import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';

// ---------------------------- 表格列 ----------------------------

const columns = ref([
    {
        title: '序号',
        dataIndex: 'serialNumber',
        ellipsis: true,
        width: 60
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
        width: 500,
        ellipsis: true,
    },
    {
        title: '审核状态',
        dataIndex: 'auditStatus',
        width: 100,
        ellipsis: true,
    },
    {
        title: '启用状态',
        dataIndex: 'enabled',
        width: 100,
        ellipsis: true,
    },
    {
        title: '创建时间',
        dataIndex: 'createDate',
        ellipsis: true,
        width: 150,
    },
    {
        title: '操作',
        dataIndex: 'action',
        // fixed: 'right',
        width: 150,
    },
]);

// ---------------------------- 查询数据表单和方法 ----------------------------

const queryFormState = {

    templateName: undefined,
    outerTemplateType:undefined,
    signName: undefined,
    auditStatus: undefined,
    enabled:undefined,


    pageNum: 1,
    pageSize: 10,
};
// 查询表单form
const queryForm = reactive({ ...queryFormState });
// 表格加载loading
const tableLoading = ref(false);
// 表格数据
const tableData = ref([]);
// 总数
const total = ref(0);

// 重置查询条件
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
        let queryResult = await smsTemplateApi.queryPage(queryForm);
        tableData.value = queryResult.data.list;
        total.value = queryResult.data.total;
    } catch (e) {
        smartSentry.captureError(e);
    } finally {
        tableLoading.value = false;
    }
}


onMounted(queryData);

// ---------------------------- 添加/修改 ----------------------------
const formRef = ref();

function showForm(data) {
    formRef.value.show(data);
}

// ---------------------------- 单个删除 ----------------------------
//请求删除
async function requestEnabled(templateCode,enabled) {
    SmartLoading.show();
    try {
        let params = {
            templateCode: templateCode,
            enabled: enabled,
        };
        await smsTemplateApi.enable(params);
        queryData();
    } catch (e) {
        smartSentry.captureError(e);
    } finally {
        SmartLoading.hide();
    }
}

// ---------------------------- 批量删除 ----------------------------

// 选择表格行
const selectedRowKeyList = ref([]);

function onSelectChange(selectedRowKeys) {
    selectedRowKeyList.value = selectedRowKeys;
}

// 批量删除
function confirmBatchDelete() {
    Modal.confirm({
        title: '提示',
        content: '确定要批量删除这些数据吗?',
        okText: '删除',
        okType: 'danger',
        onOk() {
            requestBatchDelete();
        },
        cancelText: '取消',
        onCancel() { },
    });
}

//请求批量删除
async function requestBatchDelete() {
    try {
        SmartLoading.show();
        await smsTemplateApi.batchDelete(selectedRowKeyList.value);
        message.success('删除成功');
        queryData();
    } catch (e) {
        smartSentry.captureError(e);
    } finally {
        SmartLoading.hide();
    }
}
</script>
