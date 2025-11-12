<template>
  <div class="file-send-container">
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
      :model="form"
      :rules="rules"
      ref="formRef"
      layout="vertical"
      class="smart-query-form"
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
            @click="handleSubmit"
            :loading="loading"
          >
            <template #icon>
              <SendOutlined />
            </template>
            提交发送
          </a-button>
          <a-button @click="handleReset" class="smart-margin-left10" size="large">
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
            <a-button type="primary" @click="handleReset">继续发送</a-button>
            <a-button @click="viewSendRecord">查看发送记录</a-button>
          </a-space>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import { smsSendApi } from '/@/api/business/sms-manager/sms-send-api'
import {
  InboxOutlined,
  SendOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 表单数据
const form = reactive({
  file: null
})

// 表单验证规则
const rules = {
  file: [
    { required: true, message: '请上传文件', trigger: 'change' }
  ]
}

// 表单引用
const formRef = ref()
const loading = ref(false)
const downloadLoading = ref(false)
const fileList = ref([])

// 发送结果
const sendResult = reactive({
  visible: false,
  success: false,
  message: '',
  data: null
})

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

  form.file = file
  return false // 阻止自动上传
}

// 移除文件
function handleRemove() {
  form.file = null
  sendResult.visible = false
}

// 提交发送
async function handleSubmit() {
  try {
    await formRef.value.validate()

    if (!form.file) {
      message.error('请上传文件')
      return
    }

    loading.value = true
    SmartLoading.show('正在处理文件并发送...')

    const result = await smsSendApi.fileSend(form.file)

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
    loading.value = false
    SmartLoading.hide()
  }
}

// 重置表单
function handleReset() {
  formRef.value?.resetFields()
  fileList.value = []
  form.file = null
  sendResult.visible = false
  sendResult.success = false
  sendResult.message = ''
  sendResult.data = null
}

// 查看发送记录
function viewSendRecord() {
  router.push('/sms-manager/sms-query/send-record-list')
}
</script>

<style scoped lang="less">
.file-send-container {
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
