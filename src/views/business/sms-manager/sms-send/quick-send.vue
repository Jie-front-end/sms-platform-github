<template>
    <div class="quick-send-container">
        <a-form ref="quickFormRef" :model="quickForm" :rules="quickRules" :label-col="{ span: 2 }">
            <a-form-item label="短信签名" name="signName">
                <SignSelect style="width: 100%" :value="quickForm.signName" @update:value="$event => (quickForm.signName = $event)" />
            </a-form-item>
            <a-form-item label="短信模板" name="templateCode">
                <a-input
                    v-model:value="quickForm.templateName"
                    placeholder="请点击选择短信模板"
                    readonly
                    style="width: 100%"
                    @click="showQuickTemplateModal"
                >
                    <template #suffix>
                        <SearchOutlined style="cursor: pointer; color: #1890ff" />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="短信内容" name="content">
                <a-textarea v-model:value="quickForm.content" placeholder="请输入短信内容" :rows="6" />
            </a-form-item>
            <a-form-item label="手机号码" name="phoneNumbers">
                <a-textarea v-model:value="quickForm.phoneNumbers" placeholder="请输入手机号码，多个号码用英文逗号或换行分隔" :rows="4" />
            </a-form-item>
            <a-form-item label="发送方式" name="sendType">
                <a-radio-group v-model:value="quickForm.sendType">
                    <a-radio :value="1">立即发送</a-radio>
                    <a-radio :value="2">定时发送</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item v-if="quickForm.sendType === 2" label="发送时间" name="sendTime">
                <a-date-picker
                    v-model:value="quickForm.sendTime"
                    show-time
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择发送时间"
                    :disabled-date="disabledDate"
                    style="width: 100%"
                />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 2, span: 16 }">
                <a-button type="primary" :loading="quickLoading" @click="submitQuick">快速发送</a-button>
                <a-button style="margin-left: 10px" @click="resetQuick">重置</a-button>
            </a-form-item>
        </a-form>
    </div>

    <!-- 模板选择弹窗 -->
    <TemplateSelectModal ref="templateModalRef" :signName="quickForm.signName" @select="handleTemplateSelect" />
</template>

<script setup>
import { ref, reactive } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import SignSelect from '/@/components/business/sign-select/index.vue'
import TemplateSelectModal from '/@/components/business/template-select-modal/index.vue'
import { smartSentry } from '/@/lib/smart-sentry';
import { validateMultiPhoneWithDetails, processPhones } from '/@/utils/validate-util';
import { message } from 'ant-design-vue';
import { smsSendApi } from '/@/api/business/sms-manager/sms-send-api';
import dayjs from 'dayjs';

// 加载状态
const quickLoading = ref(false);

// 组件ref
const quickFormRef = ref();
const templateModalRef = ref();

// 快速发送表单
const quickFormDefault = {
    signName: undefined,
    templateCode: undefined,
    templateName: undefined,
    content: undefined,
    phoneNumbers: undefined,
    sendType: 1,
    sendTime: undefined,
};

let quickForm = reactive({ ...quickFormDefault });

// 快速发送验证规则
const quickRules = {
    signName: [{ required: true, message: '短信签名 必选' }],
    templateCode: [{ required: true, message: '短信模板 必选' }],
    content: [{ required: true, message: '短信内容 必填' }],
    phoneNumbers: [{ required: true, message: '手机号码 必填' }],
    sendTime: [
        {
            required: true,
            validator: (rule, value) => {
                if (quickForm.sendType === 2 && !value) {
                    return Promise.reject('定时发送必须选择发送时间');
                }
                return Promise.resolve();
            },
            trigger: 'change'
        }
    ]
};

// 显示模板选择弹窗（快速发送）
function showQuickTemplateModal() {
    if (!quickForm.signName) {
        message.warning('请先选择短信签名')
        return
    }
    templateModalRef.value?.show()
}

// 处理模板选择
function handleTemplateSelect(template) {
    quickForm.templateCode = template.templateCode
    quickForm.templateName = template.templateName
    quickForm.content = template.templateContent
}

// 禁用过去的日期
const disabledDate = (current) => {
    return current && current < new Date(new Date().setHours(0, 0, 0, 0));
};

// 快速发送提交
const submitQuick = async () => {
    quickLoading.value = true;
    try {
        await quickFormRef.value.validate();

        const validateResult = validateMultiPhoneWithDetails(quickForm.phoneNumbers)
        if (!validateResult.isValid) {
            message.warning(`以下手机号码格式无效：${validateResult.errorPhones.join("、")}\n请检查并重新输入（支持英文逗号或换行分隔）`, 8);
        } else {
            const params = {
                signName: quickForm.signName,
                templateCode: quickForm.templateCode,
                phoneNumbers: processPhones(quickForm.phoneNumbers),
                content: quickForm.content,
                sendType: quickForm.sendType,
            }

            if (quickForm.sendType === 2 && quickForm.sendTime) {
                params.sendTime = dayjs(quickForm.sendTime).format('YYYY-MM-DDTHH:mm:ss');
            }

            let res = await smsSendApi.quickSend(params)
            if (res.ok) {
                message.success(quickForm.sendType === 2 ? '定时短信设置成功！' : '快速发送完成！');
                resetQuick()
            } else {
                message.error(res.message);
            }
        }

    } catch (e) {
        smartSentry.captureError(e)
    } finally {
        quickLoading.value = false;
    }
};

// 快速发送重置
const resetQuick = () => {
    quickFormRef.value.resetFields();
    Object.assign(quickForm, quickFormDefault);
};
</script>

<style scoped lang="less">
.quick-send-container {
    padding: 20px;
}
</style>
