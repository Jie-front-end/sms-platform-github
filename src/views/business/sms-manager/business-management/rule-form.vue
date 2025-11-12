<!--
  * 自动审核规则表单
  *
  * @Author:    Claude
  * @Date:      2025-11-04
-->
<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑规则' : '新建规则'"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="700px"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item label="规则名称" name="ruleName" required>
        <a-input
          v-model:value="formData.ruleName"
          placeholder="请输入规则名称"
          :maxlength="50"
        />
      </a-form-item>

      <a-form-item label="规则类型" name="ruleType" required>
        <a-select v-model:value="formData.ruleType" placeholder="请选择规则类型" @change="onRuleTypeChange">
          <a-select-option value="FORBIDDEN_WORDS">违禁词过滤</a-select-option>
          <a-select-option value="FREQUENCY_LIMIT">发送频率限制</a-select-option>
          <a-select-option value="PHONE_VALIDATION">手机号验证</a-select-option>
          <a-select-option value="CONTENT_LENGTH">内容长度限制</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="规则描述" name="ruleDescription" required>
        <a-textarea
          v-model:value="formData.ruleDescription"
          placeholder="请输入规则描述"
          :rows="3"
          :maxlength="200"
        />
      </a-form-item>

      <!-- 违禁词过滤规则配置 -->
      <template v-if="formData.ruleType === 'FORBIDDEN_WORDS'">
        <a-form-item label="违禁词列表" name="ruleContent" required>
          <a-textarea
            v-model:value="forbiddenWords"
            placeholder="请输入违禁词，用逗号分隔，如：赌博,色情,暴力"
            :rows="5"
          />
          <div class="form-tip">
            多个违禁词用逗号分隔，支持中文、英文和数字
          </div>
        </a-form-item>
      </template>

      <!-- 发送频率限制规则配置 -->
      <template v-if="formData.ruleType === 'FREQUENCY_LIMIT'">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="每分钟限制" name="maxPerMinute" required>
              <a-input-number
                v-model:value="frequencyLimit.maxPerMinute"
                :min="1"
                :max="100"
                placeholder="每分钟最多发送条数"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="每小时限制" name="maxPerHour" required>
              <a-input-number
                v-model:value="frequencyLimit.maxPerHour"
                :min="1"
                :max="1000"
                placeholder="每小时最多发送条数"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="每天限制" name="maxPerDay" required>
              <a-input-number
                v-model:value="frequencyLimit.maxPerDay"
                :min="1"
                :max="10000"
                placeholder="每天最多发送条数"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <!-- 手机号验证规则配置 -->
      <template v-if="formData.ruleType === 'PHONE_VALIDATION'">
        <a-form-item label="验证规则" name="ruleContent">
          <a-radio-group v-model:value="phoneValidationType">
            <a-radio value="STANDARD">标准验证</a-radio>
            <a-radio value="STRICT">严格验证</a-radio>
            <a-radio value="CUSTOM">自定义正则</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="自定义正则表达式" name="customRegex" v-if="phoneValidationType === 'CUSTOM'">
          <a-input
            v-model:value="customRegex"
            placeholder="请输入正则表达式，如：^1[3-9]\\d{9}$"
          />
        </a-form-item>
      </template>

      <!-- 内容长度限制规则配置 -->
      <template v-if="formData.ruleType === 'CONTENT_LENGTH'">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="最小长度" name="minLength">
              <a-input-number
                v-model:value="contentLength.minLength"
                :min="1"
                :max="1000"
                placeholder="最小字符数"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="最大长度" name="maxLength" required>
              <a-input-number
                v-model:value="contentLength.maxLength"
                :min="1"
                :max="1000"
                placeholder="最大字符数"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { autoApprovalApi } from '/@/api/business/sms-manager/auto-approval-api';
import { smartSentry } from '/@/lib/smart-sentry';

const emit = defineEmits(['reloadList']);

// 表单相关
const visible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const formData = reactive({
  ruleId: null,
  ruleName: '',
  ruleType: 'FORBIDDEN_WORDS',
  ruleDescription: '',
  ruleContent: ''
});

// 不同规则类型的配置数据
const forbiddenWords = ref('');
const frequencyLimit = reactive({
  maxPerMinute: 1,
  maxPerHour: 10,
  maxPerDay: 100
});
const phoneValidationType = ref('STANDARD');
const customRegex = ref('');
const contentLength = reactive({
  minLength: 1,
  maxLength: 500
});

// 表单验证规则
const rules = computed(() => {
  const baseRules = {
    ruleName: [
      { required: true, message: '请输入规则名称', trigger: 'blur' },
      { min: 2, max: 50, message: '规则名称长度为2-50个字符', trigger: 'blur' }
    ],
    ruleType: [
      { required: true, message: '请选择规则类型', trigger: 'change' }
    ],
    ruleDescription: [
      { required: true, message: '请输入规则描述', trigger: 'blur' },
      { min: 5, max: 200, message: '规则描述长度为5-200个字符', trigger: 'blur' }
    ]
  };

  // 根据规则类型添加特定验证
  if (formData.ruleType === 'FORBIDDEN_WORDS') {
    baseRules.ruleContent = [
      { required: true, message: '请输入违禁词列表', trigger: 'blur' },
      { validator: validateForbiddenWords, trigger: 'blur' }
    ];
  } else if (formData.ruleType === 'FREQUENCY_LIMIT') {
    baseRules.maxPerMinute = [
      { required: true, message: '请设置每分钟限制', trigger: 'blur' }
    ];
    baseRules.maxPerHour = [
      { required: true, message: '请设置每小时限制', trigger: 'blur' }
    ];
    baseRules.maxPerDay = [
      { required: true, message: '请设置每天限制', trigger: 'blur' }
    ];
  } else if (formData.ruleType === 'CONTENT_LENGTH') {
    baseRules.maxLength = [
      { required: true, message: '请设置最大长度', trigger: 'blur' }
    ];
  }

  return baseRules;
});

// 违禁词验证
function validateForbiddenWords(rule, value) {
  if (!forbiddenWords.value.trim()) {
    return Promise.reject('请输入违禁词列表');
  }
  const words = forbiddenWords.value.split(',').map(w => w.trim()).filter(w => w);
  if (words.length === 0) {
    return Promise.reject('请至少输入一个违禁词');
  }
  return Promise.resolve();
}

// 规则类型改变时重置配置
function onRuleTypeChange() {
  forbiddenWords.value = '';
  Object.assign(frequencyLimit, { maxPerMinute: 1, maxPerHour: 10, maxPerDay: 100 });
  phoneValidationType.value = 'STANDARD';
  customRegex.value = '';
  Object.assign(contentLength, { minLength: 1, maxLength: 500 });
}

// 构建规则内容
function buildRuleContent() {
  switch (formData.ruleType) {
    case 'FORBIDDEN_WORDS':
      return forbiddenWords.value;
    case 'FREQUENCY_LIMIT':
      return JSON.stringify(frequencyLimit);
    case 'PHONE_VALIDATION':
      if (phoneValidationType.value === 'CUSTOM') {
        return customRegex.value || '^1[3-9]\\d{9}$';
      }
      return phoneValidationType.value;
    case 'CONTENT_LENGTH':
      return JSON.stringify(contentLength);
    default:
      return '';
  }
}

// 显示表单
function show(data) {
  visible.value = true;
  isEdit.value = !!data;

  if (data) {
    // 编辑模式
    Object.assign(formData, {
      ruleId: data.ruleId,
      ruleName: data.ruleName,
      ruleType: data.ruleType,
      ruleDescription: data.ruleDescription,
      ruleContent: data.ruleContent
    });

    // 解析规则内容
    parseRuleContent(data.ruleType, data.ruleContent);
  } else {
    // 新建模式
    resetForm();
  }
}

// 解析规则内容
function parseRuleContent(ruleType, ruleContent) {
  switch (ruleType) {
    case 'FORBIDDEN_WORDS':
      forbiddenWords.value = ruleContent;
      break;
    case 'FREQUENCY_LIMIT':
      try {
        Object.assign(frequencyLimit, JSON.parse(ruleContent));
      } catch {
        Object.assign(frequencyLimit, { maxPerMinute: 1, maxPerHour: 10, maxPerDay: 100 });
      }
      break;
    case 'PHONE_VALIDATION':
      if (ruleContent === 'STANDARD' || ruleContent === 'STRICT') {
        phoneValidationType.value = ruleContent;
      } else {
        phoneValidationType.value = 'CUSTOM';
        customRegex.value = ruleContent;
      }
      break;
    case 'CONTENT_LENGTH':
      try {
        Object.assign(contentLength, JSON.parse(ruleContent));
      } catch {
        Object.assign(contentLength, { minLength: 1, maxLength: 500 });
      }
      break;
  }
}

// 重置表单
function resetForm() {
  Object.assign(formData, {
    ruleId: null,
    ruleName: '',
    ruleType: 'FORBIDDEN_WORDS',
    ruleDescription: '',
    ruleContent: ''
  });

  forbiddenWords.value = '';
  Object.assign(frequencyLimit, { maxPerMinute: 1, maxPerHour: 10, maxPerDay: 100 });
  phoneValidationType.value = 'STANDARD';
  customRegex.value = '';
  Object.assign(contentLength, { minLength: 1, maxLength: 500 });

  if (formRef.value) {
    formRef.value.resetFields();
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate();

    // 构建规则内容
    formData.ruleContent = buildRuleContent();

    SmartLoading.show();

    if (isEdit.value) {
      await autoApprovalApi.update(formData);
      message.success('更新成功');
    } else {
      await autoApprovalApi.add(formData);
      message.success('添加成功');
    }

    visible.value = false;
    emit('reloadList');
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    smartSentry.captureError(error);
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