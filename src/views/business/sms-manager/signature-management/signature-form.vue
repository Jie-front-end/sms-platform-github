<!--
  * 短信签名表单
  *
  * @Author:    Claude
  * @Date:      2025-11-06
-->
<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑签名' : '新建签名'"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="签名名称" name="signName" required>
        <a-input
          v-model:value="formData.signName"
          placeholder="请输入签名名称"
          :maxlength="50"
        />
      </a-form-item>

      <a-form-item label="业务类型" name="businessType" required>
        <a-input
          v-model:value="formData.businessType"
          placeholder="请输入业务类型"
          :maxlength="50"
        />
      </a-form-item>

      <a-form-item label="审核状态" name="auditStatus" required>
        <a-select v-model:value="formData.auditStatus" placeholder="请选择审核状态">
          <a-select-option value="PENDING">待审核</a-select-option>
          <a-select-option value="APPROVED">已通过</a-select-option>
          <a-select-option value="REJECTED">已拒绝</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { smsSignApi } from '/@/api/business/sms-manager/sms-sign-api';
import { smartSentry } from '/@/lib/smart-sentry';

const emit = defineEmits(['reloadList']);

// 表单相关
const visible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const formData = reactive({
  signName: '',
  businessType: '',
  auditStatus: 'PENDING'
});

// 表单验证规则
const rules = {
  signName: [
    { required: true, message: '请输入签名名称', trigger: 'blur' },
    { min: 2, max: 50, message: '签名名称长度为2-50个字符', trigger: 'blur' }
  ],
  businessType: [
    { required: true, message: '请输入业务类型', trigger: 'blur' },
    { min: 2, max: 50, message: '业务类型长度为2-50个字符', trigger: 'blur' }
  ],
  auditStatus: [
    { required: true, message: '请选择审核状态', trigger: 'change' }
  ]
};

// 显示表单
function show(data) {
  visible.value = true;
  isEdit.value = !!data;

  if (data) {
    // 编辑模式
    Object.assign(formData, {
      signName: data.signName || '',
      businessType: data.businessType || '',
      auditStatus: data.auditStatus || 'PENDING'
    });
  } else {
    // 新建模式
    resetForm();
  }
}

// 重置表单
function resetForm() {
  Object.assign(formData, {
    signName: '',
    businessType: '',
    auditStatus: 'PENDING'
  });

  if (formRef.value) {
    formRef.value.resetFields();
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate();
    SmartLoading.show();

    const result = await smsSignApi.updateSignList(formData);

    // 根据接口返回体处理响应
    if (result.code === 0 && result.ok) {
      message.success(result.msg || '操作成功');
      visible.value = false;
      emit('reloadList');
    } else {
      message.error(result.msg || '操作失败');
    }
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    smartSentry.captureError(error);
    message.error('操作失败，请稍后重试');
  } finally {
    SmartLoading.hide();
  }
}

// 取消
function handleCancel() {
  visible.value = false;
  resetForm();
}

// 监听弹窗关闭，重置表单
watch(visible, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

defineExpose({
  show
});
</script>

<style scoped>
.form-tip {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
</style>
