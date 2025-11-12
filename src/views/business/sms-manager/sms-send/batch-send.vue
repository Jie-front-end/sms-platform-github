<template>
    <div class="batch-send-container">
        <a-tabs v-model:activeKey="batchMode" type="card">
            <!-- 批量输入 -->
            <a-tab-pane key="manual" tab="批量输入">
                <a-form ref="manualFormRef" :model="manualForm" :rules="manualRules" :label-col="{ span: 2 }">
                    <a-form-item label="短信签名" name="signName">
                        <SignSelect style="width: 100%" :value="manualForm.signName" @update:value="$event => (manualForm.signName = $event)" />
                    </a-form-item>
                    <a-form-item label="短信模板" name="templateCode">
                        <a-input
                            v-model:value="manualForm.templateName"
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
                        <a-textarea v-model:value="manualForm.content" placeholder="模板内容" :rows="6" readonly />
                    </a-form-item>
                    <a-form-item v-for="(item, index) in manualForm.templateParam" :key="index" :label="item.value">
                        <a-input v-model:value="item.content" :placeholder="`请输入${item.value}`" />
                    </a-form-item>
                    <a-form-item label="手机号码" name="phoneNumbers">
                        <a-textarea
                            v-model:value="manualForm.phoneNumbers"
                            placeholder="请输入手机号码，多个号码请用逗号或换行分隔"
                            :rows="4"
                            show-count
                        />
                        <div style="color: #999; font-size: 12px; margin-top: 4px;">
                            支持多个手机号，可使用英文逗号(,)或换行分隔
                        </div>
                    </a-form-item>
                    <a-form-item :wrapper-col="{ offset: 2, span: 16 }">
                        <a-space>
                            <a-button type="primary" :loading="manualLoading" @click="sendManualBatch">批量发送</a-button>
                            <a-button @click="resetManualForm">重置</a-button>
                        </a-space>
                    </a-form-item>
                </a-form>
            </a-tab-pane>

            <!-- 文件发送 -->
            <a-tab-pane key="file" tab="文件发送">
                <!-- 下载模板提示 -->
                <a-alert
                    message="使用说明"
                    type="info"
                    show-icon
                    closable
                    style="margin-bottom: 20px;"
                >
                    <template #description>
                        <div>
                            <p><strong>步骤 1：</strong>下载模板文件</p>
                            <p><strong>步骤 2：</strong>按模板格式填写手机号和短信内容</p>
                            <p><strong>步骤 3：</strong>上传填好的文件并发送</p>
                            <p style="margin-top: 10px;">
                                <a-button type="link" @click="downloadTemplate" :loading="downloadLoading">
                                    <template #icon><DownloadOutlined /></template>
                                    下载模板文件
                                </a-button>
                            </p>
                        </div>
                    </template>
                </a-alert>

                <a-form
                    :model="fileForm"
                    :rules="fileRules"
                    ref="fileFormRef"
                    layout="vertical"
                >
                    <!-- 文件上传区域 -->
                    <a-row>
                        <a-col :span="24">
                            <a-form-item label="上传文件" name="file">
                                <a-upload-dragger
                                    v-model:file-list="fileList"
                                    :before-upload="beforeUpload"
                                    :remove="handleRemove"
                                    :max-count="1"
                                    accept=".xlsx,.xls"
                                >
                                    <p class="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
                                    <p class="ant-upload-hint">
                                        仅支持 Excel 格式 (.xlsx/.xls)，请使用下载的模板文件进行填写
                                    </p>
                                </a-upload-dragger>
                            </a-form-item>
                        </a-col>
                    </a-row>

                    <!-- 操作按钮 -->
                    <a-row v-if="fileList.length > 0">
                        <a-col :span="24" class="text-center">
                            <a-button
                                type="primary"
                                size="large"
                                @click="handleFileSubmit"
                                :loading="fileLoading"
                            >
                                <template #icon>
                                    <SendOutlined />
                                </template>
                                提交发送
                            </a-button>
                            <a-button @click="handleFileReset" class="smart-margin-left10" size="large">
                                <template #icon>
                                    <ReloadOutlined />
                                </template>
                                重新上传
                            </a-button>
                        </a-col>
                    </a-row>
                </a-form>

                <!-- 发送结果 -->
                <a-divider v-if="sendResult.visible" />
                <a-card title="发送结果" size="small" v-if="sendResult.visible">
                    <a-result
                        :status="sendResult.success ? 'success' : 'error'"
                        :title="sendResult.success ? '发送成功' : '发送失败'"
                    >
                        <template #subTitle>
                            <div v-if="sendResult.success && sendResult.data">
                                <p>处理完成，详细结果如下：</p>
                                <a-descriptions bordered size="small" :column="2" style="margin-top: 16px;">
                                    <a-descriptions-item label="总数">
                                        {{ sendResult.data || '-' }}
                                    </a-descriptions-item>
                                </a-descriptions>
                            </div>
                            <div v-else>
                                {{ sendResult.message }}
                            </div>
                        </template>
                        <template #extra v-if="sendResult.success">
                            <a-space>
                                <a-button type="primary" @click="handleFileReset">继续发送</a-button>
                            </a-space>
                        </template>
                    </a-result>
                </a-card>
            </a-tab-pane>
        </a-tabs>
    </div>

    <!-- 模板选择弹窗 -->
    <TemplateSelectModal ref="templateModalRef" :signName="manualForm.signName" @select="handleTemplateSelect" />
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { SearchOutlined, DownloadOutlined, InboxOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import SignSelect from '/@/components/business/sign-select/index.vue';
import TemplateSelectModal from '/@/components/business/template-select-modal/index.vue';
import { smartSentry } from '/@/lib/smart-sentry';
import { smsSendApi } from '/@/api/business/sms-manager/sms-send-api';
import { SmartLoading } from '/@/components/framework/smart-loading'
import { validateMultiPhoneWithDetails, processPhones } from '/@/utils/validate-util';

const batchMode = ref('manual');
const manualFormRef = ref();
const templateModalRef = ref();
const fileFormRef = ref();
const manualLoading = ref(false);
const fileLoading = ref(false);
const downloadLoading = ref(false);

// 手工输入表单
const manualFormDefault = {
    signName: undefined,
    templateCode: undefined,
    templateName: undefined,
    content: undefined,
    phoneNumbers: undefined,
    templateParam: undefined,
};

const manualForm = reactive({ ...manualFormDefault });

const manualRules = {
    signName: [{ required: true, message: '短信签名 必选' }],
    templateCode: [{ required: true, message: '短信模板 必选' }],
    phoneNumbers: [
        { required: true, message: '手机号码 必填' },
        {
            validator: (rule, value) => {
                if (!value) {
                    return Promise.resolve();
                }
                const validateResult = validateMultiPhoneWithDetails(value);
                if (!validateResult.isValid) {
                    return Promise.reject(`以下手机号码格式无效：${validateResult.errorPhones.join("、")}`);
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        }
    ]
};

// 文件上传表单
const fileForm = reactive({
    file: null
})

const fileList = ref([])

// 发送结果
const sendResult = reactive({
    visible: false,
    success: false,
    message: '',
    data: null
})

const fileRules = {
    file: [
        { required: true, message: '请上传文件', trigger: 'change' }
    ]
};

// 显示模板选择弹窗
function showTemplateModal() {
    if (!manualForm.signName) {
        message.warning('请先选择短信签名')
        return
    }
    templateModalRef.value?.show()
}

// 处理模板选择
function handleTemplateSelect(template) {
    manualForm.templateCode = template.templateCode
    manualForm.templateName = template.templateName
    manualForm.content = template.templateContent
    manualForm.templateParam = template.templateKeyList
}

// 转换模板参数
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

// 发送手工批量短信
const sendManualBatch = async () => {
    try {
        await manualFormRef.value.validate();

        // 验证手机号
        const validateResult = validateMultiPhoneWithDetails(manualForm.phoneNumbers)
        if (!validateResult.isValid) {
            message.warning(`以下手机号码格式无效：${validateResult.errorPhones.join("、")}\n请检查并重新输入（支持英文逗号分隔）`, 8);
            return;
        }

        manualLoading.value = true;
        SmartLoading.show('正在批量发送短信...')

        // 处理手机号，得到手机号数组
        const phoneNumbersStr = processPhones(manualForm.phoneNumbers);
        const phoneArray = phoneNumbersStr.split(',').filter(phone => phone);

        if (phoneArray.length === 0) {
            message.error('没有有效的手机号码');
            return;
        }

        // 统计发送结果
        let successCount = 0;
        let failCount = 0;
        const failedPhones = [];

        // 循环调用模板发送接口
        for (let i = 0; i < phoneArray.length; i++) {
            try {
                const params = {
                    signName: manualForm.signName,
                    templateCode: manualForm.templateCode,
                    phoneNumbers: phoneArray[i],
                    templateParam: handleChange(manualForm.templateParam),
                    sendType: 1, // 立即发送
                }

                const res = await smsSendApi.templateSend(params)
                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                    failedPhones.push(`${phoneArray[i]}(${res.message})`);
                }
            } catch (error) {
                failCount++;
                failedPhones.push(`${phoneArray[i]}(发送异常)`);
            }
        }

        // 显示发送结果
        if (failCount === 0) {
            message.success(`批量发送完成！成功 ${successCount} 条`);
            resetManualForm();
        } else if (successCount === 0) {
            message.error(`批量发送失败！失败 ${failCount} 条\n失败号码：${failedPhones.join('、')}`);
        } else {
            message.warning(`批量发送完成！成功 ${successCount} 条，失败 ${failCount} 条\n失败号码：${failedPhones.join('、')}`, 10);
            resetManualForm();
        }
    } catch (error) {
        message.error('批量发送失败：' + (error.message || '未知错误'));
        smartSentry.captureError(error);
    } finally {
        manualLoading.value = false;
        SmartLoading.hide()
    }
};

// 重置手工输入表单
const resetManualForm = () => {
    manualFormRef.value.resetFields();
    Object.assign(manualForm, manualFormDefault);
};

// 下载模板
async function downloadTemplate() {
    try {
        downloadLoading.value = true
        await smsSendApi.downloadFileSendTemplate()
        message.success('模板下载成功')
    } catch (error) {
        message.error('模板下载失败：' + (error.message || '未知错误'))
        smartSentry.captureError(error)
    } finally {
        downloadLoading.value = false
    }
}

// 文件上传前处理
function beforeUpload(file) {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.type === 'application/vnd.ms-excel'

    if (!isExcel) {
        message.error('只支持 Excel 格式文件 (.xlsx/.xls)')
        return false
    }

    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
        message.error('文件大小不能超过 10MB')
        return false
    }

    fileForm.file = file
    return false // 阻止自动上传
}

// 移除文件
function handleRemove() {
    fileForm.file = null
    sendResult.visible = false
}

// 文件发送提交
async function handleFileSubmit() {
    try {
        await fileFormRef.value.validate()

        if (!fileForm.file) {
            message.error('请上传文件')
            return
        }

        fileLoading.value = true
        SmartLoading.show('正在处理文件并发送...')

        const result = await smsSendApi.fileSend(fileForm.file)

        sendResult.visible = true
        sendResult.success = true
        sendResult.message = '文件发送成功'
        sendResult.data = result.data || null

        message.success('文件发送成功')

    } catch (error) {
        sendResult.visible = true
        sendResult.success = false
        sendResult.message = error.message || '发送失败，请检查文件格式是否正确'
        sendResult.data = null

        message.error(sendResult.message)
        smartSentry.captureError(error)
    } finally {
        fileLoading.value = false
        SmartLoading.hide()
    }
}

// 文件发送重置
function handleFileReset() {
    fileFormRef.value?.resetFields()
    fileList.value = []
    fileForm.file = null
    sendResult.visible = false
    sendResult.success = false
    sendResult.message = ''
    sendResult.data = null
}
</script>

<style scoped lang="less">
.batch-send-container {
    padding: 20px;
}

.text-center {
    text-align: center;
}

.smart-margin-left10 {
    margin-left: 10px;
}

:deep(.ant-upload-drag) {
    background-color: #fafafa;
}

:deep(.ant-upload-drag:hover) {
    border-color: #1890ff;
}

:deep(.ant-descriptions-item-label) {
    font-weight: 500;
}
</style>
