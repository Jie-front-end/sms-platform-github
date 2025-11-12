<!--
  * 短信模板详情
  *
  * @Author:    xiong
  * @Date:      2025-09-25 15:21:00
  * @Copyright  xiong
-->
<template>
  <a-modal :title="form.templateCode ? '编辑' : '添加'" width="800px" :open="visibleFlag" @cancel="onClose"
    :maskClosable="false" :destroyOnClose="true">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 3 }">
      <a-form-item label="模板名称" name="templateName">
        <a-input style="width: 100%" v-model:value="form.templateName" placeholder="短信模板名称" />
      </a-form-item>
      <a-form-item label="模板类型" name="outerTemplateType">
        <DictSelect width="100%" v-model:value="form.outerTemplateType"
          :dict-code="DICT_SMS_ENUM.SMS_OUTER_TEMPLATE_TYPE" placeholder="请选择模板类型" />
      </a-form-item>
      <a-form-item label="模板内容" name="templateContent">
        <a-textarea v-model:value="form.templateContent" placeholder="模板内容" :rows="4" />
        <a-typography-text type="secondary">提示：使用$和花括号包围变量名，如 ${code}、${name}、${time} 等</a-typography-text>
      </a-form-item>
      <a-form-item label="变量列表" name="templateKeyList">
        <TemplateKeyVue :key-list="form.templateKeyList" @update:key-list="$event => (form.templateKeyList = $event)" />
      </a-form-item>
      <a-form-item label="模板签名" name="signatureName">
        <!-- <a-input style="width: 100%" v-model:value="form.signatureName" placeholder="签名名称" /> -->
          <SignSelect style="width: 100%" :value="form.signatureName" @update:value="$event => (form.signatureName = $event)" />
      </a-form-item>

      <a-form-item v-if="!form.templateCode" label="业务场景" name="applySceneContent">
        <a-input style="width: 100%" v-model:value="form.applySceneContent" placeholder="业务场景" />
      </a-form-item>
      <a-form-item label="启用状态" name="enabled">
        <DictSelect width="100%" v-model:value="form.enabled" :dict-code="DICT_SMS_ENUM.SMS_TEMPLATE_ENABLED"
          placeholder="请选择启用状态" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
<script setup>
import { reactive, ref, nextTick } from 'vue';
import _ from 'lodash';
import { message } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { smsTemplateApi } from '/@/api/business/sms-manager/sms-template-api';
import { smartSentry } from '/@/lib/smart-sentry';
import DictSelect from '/@/components/support/dict-select/index.vue';
import { DICT_SMS_ENUM, DICT_GENERAL_ENUM } from '/@/constants/support/dict-const';
import TemplateKeyVue from '../sms-template/components/template-key.vue';
import SignSelect from '/@/components/business/sign-select/index.vue'
import { template } from 'lodash';

// ------------------------ 事件 ------------------------

const emits = defineEmits(['reloadList']);

// ------------------------ 显示与隐藏 ------------------------
// 是否显示
const visibleFlag = ref(false);

function show(rowData) {
  Object.assign(form, formDefault);
  if (rowData && !_.isEmpty(rowData)) {
    Object.assign(form, rowData);
  }
  // 使用字典时把下面这注释修改成自己的字典字段 有多个字典字段就复制多份同理修改 不然打开表单时不显示字典初始值
  form.outerTemplateType = form.outerTemplateType == null ? '' : String(form.outerTemplateType);
  form.enabled = form.enabled == null ? '' : String(form.enabled);
  visibleFlag.value = true;
  nextTick(() => {
    formRef.value.clearValidate();
  });
}

function onClose() {
  Object.assign(form, formDefault);
  visibleFlag.value = false;
}

// ------------------------ 表单 ------------------------

// 组件ref
const formRef = ref();

const formDefault = {
  templateCode: undefined, //短信模板code
  orderId: undefined, //工单号
  outerTemplateType: undefined, //短信发送状态:[0：验证码短信，1:通知短信,2:推广短信,3:国际/港澳台短信]
  templateType: undefined, //短信发送状态:[0：短信通知，1:推广短信,2:验证码短信,6:国际/港澳台短信]
  auditStatus: undefined, //模板审核状态:[1:审核中,2:审核通过,3:审核失败,10:取消审核]
  templateName: undefined, //短信模板名称
  templateContent: undefined, //模板内容
  rejectInfo: undefined, //审核未通过原因
  signatureName: undefined, //签名名称
  createDate: undefined, //创建模板的时间
  enabled: undefined, //启用状态，0-启用，1-禁用
  rejectDate: undefined, //审核未通过的时间
  deletedFlag: undefined, //删除状态
  applySceneContent:undefined,


  templateKeyList: [
    {
      value: undefined,//设备名称
      label: undefined,//设备品牌
    }
  ],//需求设备详细列表
};

let form = reactive({ ...formDefault });

const rules = {

  outerTemplateType: [{ required: true, message: '短信发送状态:[0：验证码短信，1:通知短信,2:推广短信,3:国际/港澳台短信] 必填' }],
  templateName: [{ required: true, message: '短信模板名称 必填' }],
  templateContent: [{ required: true, message: '模板内容 必填' }],
  signatureName: [{ required: true, message: '签名名称 必填' }],
  enabled: [{ required: true, message: '启用状态 必填' }],
};

// 点击确定，验证表单
async function onSubmit() {
  try {
    await formRef.value.validateFields();
    save();
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

// 新建、编辑API
async function save() {
  SmartLoading.show();
  try {
    console.log('form', form);
    if (form.templateCode) {
      await smsTemplateApi.update(form);
    } else {
      const params ={
        templateName:form.templateName,
        outerTemplateType:Number(form.outerTemplateType),
        templateContent:form.templateContent,
        templateKey:handleTemplateKeyChange(form.templateKeyList),
        templateRule:handleTemplateRultChange(form.templateKeyList),
        signatureName:form.signatureName,
        enabled:Number(form.enabled),
        applySceneContent:form.applySceneContent
      }
      console.log('params', params);
      await smsTemplateApi.add(params);
    }
    message.success('操作成功');
    emits('reloadList');
    // onClose();
  } catch (err) {
    smartSentry.captureError(err);
  } finally {
    SmartLoading.hide();
  }
}

function handleTemplateKeyChange(value) {
  if(value && Array.isArray(value) && value.length > 0){
    const data = []
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      data.push({
        index: i + 1,
        value: item.value,
        label: item.label,
      })
    }
    return JSON.stringify(data)
  }
  return ''
}
function handleTemplateRultChange(value) {
  if(value && Array.isArray(value) && value.length > 0){
     const targetObj = value.reduce((acc, item) => {
            // acc 是累积的目标对象，每次循环给 acc 新增键值对
            acc[item.value] = 'characterWithNumber2';
            return acc; // 返回累积后的对象，供下一次循环使用
        }, {}); // 初始值设为空对象 {}
        return JSON.stringify(targetObj);
  }
  return {}
}

defineExpose({
  show,
});
</script>
