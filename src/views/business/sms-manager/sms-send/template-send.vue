<template>
    <div class="template-send-container">
        <a-form ref="templateFormRef" :model="templateForm" :rules="templateRules" :label-col="{ span: 2 }">
            <a-form-item label="短信签名" name="signName">
                <SignSelect style="width: 100%" :value="templateForm.signName" @update:value="$event => (templateForm.signName = $event)" />
            </a-form-item>
            <a-form-item label="短信模板" name="templateCode">
                <a-input
                    v-model:value="templateForm.templateName"
                    placeholder="请点击选择短信模板"
                    readonly
                    style="width: 100%"
                    @click="showTemplateModal"
                >
                    <template #suffix>
                        <SearchOutlined style="cursor: pointer; color: #1890ff" />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="模板内容" name="content">
                <a-textarea v-model:value="templateForm.content" placeholder="模板内容" :rows="6" readonly />
            </a-form-item>
            <a-form-item v-for="(item, index) in templateForm.templateParam" :key="index" :label="item.value">
                <a-input v-model:value="item.content" />
            </a-form-item>
            <a-form-item label="手机号码" name="phoneNumbers">
                <a-input v-model:value="templateForm.phoneNumbers" placeholder="请输入手机号码" />
            </a-form-item>
            <a-form-item label="发送方式" name="sendType">
                <a-radio-group v-model:value="templateForm.sendType">
                    <a-radio :value="1">立即发送</a-radio>
                    <a-radio :value="2">定时发送</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item v-if="templateForm.sendType === 2" label="发送时间" name="sendTime">
                <a-date-picker
                    v-model:value="templateForm.sendTime"
                    show-time
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="选择发送时间"
                    :disabled-date="disabledDate"
                    style="width: 100%"
                />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 2, span: 16 }">
                <a-button type="primary" :loading="templateLoading" @click="submitTemplate">发送短信</a-button>
                <a-button style="margin-left: 10px" @click="resetTemplate">重置</a-button>
            </a-form-item>
        </a-form>
    </div>

    <!-- 模板选择弹窗 -->
    <TemplateSelectModal ref="templateModalRef" :signName="templateForm.signName" @select="handleTemplateSelect" />
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
const templateLoading = ref(false);

// 组件ref
const templateFormRef = ref();
const templateModalRef = ref();

// 模板发送表单
const templateFormDefault = {
    signName: undefined,
    templateCode: undefined,
    templateName: undefined,
    content: undefined,
    phoneNumbers: undefined,
    templateParam: undefined,
    sendType: 1,
    sendTime: undefined,
};

let templateForm = reactive({ ...templateFormDefault });

// 模板发送验证规则
const templateRules = {
    signName: [{ required: true, message: '短信签名 必选' }],
    templateCode: [{ required: true, message: '短信模板 必选' }],
    phoneNumbers: [
        { required: true, message: '手机号码 必填' },
        {
            validator: (rule, value) => {
                if (!value) {
                    return Promise.resolve();
                }
                // 去除空格
                const phone = value.trim();
                // 验证单个手机号格式
                const phoneRegex = /^1[3-9]\d{9}$/;

                if (!phoneRegex.test(phone)) {
                    return Promise.reject('请输入正确的手机号码格式（1开头的11位数字）');
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        }
    ],
    sendTime: [
        {
            required: true,
            validator: (rule, value) => {
                if (templateForm.sendType === 2 && !value) {
                    return Promise.reject('定时发送必须选择发送时间');
                }
                return Promise.resolve();
            },
            trigger: 'change'
        }
    ]
};

// 显示模板选择弹窗（模板发送）
function showTemplateModal() {
    if (!templateForm.signName) {
        message.warning('请先选择短信签名')
        return
    }
    templateModalRef.value?.show()
}

// 处理模板选择
function handleTemplateSelect(template) {
    templateForm.templateCode = template.templateCode
    templateForm.templateName = template.templateName
    templateForm.content = template.templateContent
    templateForm.templateParam = template.templateKeyList
}

function handleChange(originList) {
    if (originList && Array.isArray(originList) && originList.length > 0) {
        const targetObj = originList.reduce((acc, item) => {
            acc[item.value] = item.content;
            return acc;
        }, {});
        return JSON.stringify(targetObj);
    }
    return {};
}

// 禁用过去的日期
const disabledDate = (current) => {
    return current && current < new Date(new Date().setHours(0, 0, 0, 0));
};

// 模板发送提交
const submitTemplate = async () => {
    templateLoading.value = true;
    try {
        await templateFormRef.value.validate();

        const validateResult = validateMultiPhoneWithDetails(templateForm.phoneNumbers)
        if (!validateResult.isValid) {
            message.warning(`以下手机号码格式无效：${validateResult.errorPhones.join("、")}\n请检查并重新输入（支持英文逗号或换行分隔）`, 8);
        } else {
            const params = {
                signName: templateForm.signName,
                templateCode: templateForm.templateCode,
                phoneNumbers: processPhones(templateForm.phoneNumbers),
                templateParam: handleChange(templateForm.templateParam),
                sendType: templateForm.sendType,
            }

            if (templateForm.sendType === 2 && templateForm.sendTime) {
                params.sendTime = dayjs(templateForm.sendTime).format('YYYY-MM-DDTHH:mm:ss');
            }

            let res = await smsSendApi.templateSend(params)
            if (res.ok) {
                message.success(templateForm.sendType === 2 ? '定时短信设置成功！' : '发送完成！');
                resetTemplate()
            } else {
                message.error(res.message);
            }
        }

    } catch (e) {
        smartSentry.captureError(e)
    } finally {
        templateLoading.value = false;
    }
};

// 模板发送重置
const resetTemplate = () => {
    templateFormRef.value.resetFields();
    Object.assign(templateForm, templateFormDefault);
};
</script>

<style scoped lang="less">
.template-send-container {
    padding: 20px;
}
</style>
