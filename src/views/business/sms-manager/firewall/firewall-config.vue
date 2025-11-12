<template>
  <div class="firewall-config">
    <a-card title="短信频率限制管理" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <PlusOutlined />
          </template>
          新增配置
        </a-button>
      </template>

      <!-- 配置列表表格 -->
      <a-table
        :columns="columns"
        :data-source="configList"
        :loading="loading"
        :pagination="false"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <a-tag :color="record.enabled ? 'success' : 'default'">
              {{ record.enabled ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'blacklist'">
            <a-tag :color="record.blacklist === 1 ? 'success' : 'default'">
              {{ record.blacklist === 1 ? '开启' : '关闭' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'sensitive'">
            <a-tag :color="record.sensitive === 1 ? 'success' : 'default'">
              {{ record.sensitive === 1 ? '开启' : '关闭' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'rateLimit'">
            <a-tag :color="record.rateLimit === 1 ? 'success' : 'default'">
              {{ record.rateLimit === 1 ? '开启' : '关闭' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这个配置吗？"
                @confirm="handleDelete(record)"
              >
                <a-button type="link" danger size="small">
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :width="800"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-divider orientation="left">基础配置</a-divider>

        <a-form-item
          label="场景标识"
          name="scene"
          :rules="[{ required: true, message: '请输入场景标识' }]"
        >
          <a-input
            v-model:value="formState.scene"
            placeholder="请输入场景标识，如：login, register"
            :disabled="isEdit"
          />
        </a-form-item>

        <a-form-item label="配置描述" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="请输入配置描述"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="是否启用" name="enabled">
          <a-switch v-model:checked="formState.enabled" />
        </a-form-item>

        <a-divider orientation="left">防火墙过滤</a-divider>

        <a-form-item label="黑名单过滤" name="blacklist">
          <a-switch
            v-model:checked="formState.blacklistEnabled"
            @change="(val) => (formState.blacklist = val ? 1 : 0)"
          />
          <div class="form-help-text">开启后将过滤黑名单中的号码</div>
        </a-form-item>

        <a-form-item label="违禁词过滤" name="sensitive">
          <a-switch
            v-model:checked="formState.sensitiveEnabled"
            @change="(val) => (formState.sensitive = val ? 1 : 0)"
          />
          <div class="form-help-text">开启后将过滤包含违禁词的内容</div>
        </a-form-item>

        <a-form-item label="频率限制" name="rateLimit">
          <a-switch
            v-model:checked="formState.rateLimitEnabled"
            @change="(val) => (formState.rateLimit = val ? 1 : 0)"
          />
          <div class="form-help-text">开启后将限制发送频率</div>
        </a-form-item>

        <a-divider orientation="left">频率限制配置</a-divider>

        <a-form-item label="发送间隔（秒）" name="intervalSeconds">
          <a-input-number
            v-model:value="formState.intervalSeconds"
            :min="0"
            placeholder="单个号码两次发送的最小间隔秒数"
            style="width: 100%"
          />
          <div class="form-help-text">
            单个号码两次发送的最小间隔时间（秒）
          </div>
        </a-form-item>

        <a-form-item label="每小时限制次数" name="maxPerHour">
          <a-input-number
            v-model:value="formState.maxPerHour"
            :min="0"
            placeholder="单个号码每小时最多发送次数"
            style="width: 100%"
          />
          <div class="form-help-text">单个号码每小时允许的最大发送次数</div>
        </a-form-item>

        <a-form-item label="每天限制次数" name="maxPerDay">
          <a-input-number
            v-model:value="formState.maxPerDay"
            :min="0"
            placeholder="单个号码每天最多发送次数"
            style="width: 100%"
          />
          <div class="form-help-text">单个号码每天允许的最大发送次数</div>
        </a-form-item>

        <a-form-item label="IP 每小时限制" name="maxIpPerHour">
          <a-input-number
            v-model:value="formState.maxIpPerHour"
            :min="0"
            placeholder="单个IP每小时最多发送次数"
            style="width: 100%"
          />
          <div class="form-help-text">单个IP地址每小时允许的最大发送次数</div>
        </a-form-item>

        <a-form-item label="超限提示消息" name="errorMessage">
          <a-textarea
            v-model:value="formState.errorMessage"
            placeholder="频率超限时的提示消息"
            :rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { SmartLoading } from '/@/components/framework/smart-loading'
import { smartSentry } from '/@/lib/smart-sentry'
import { firewallConfigApi } from '/@/api/business/sms-manager/firewall-config-api'

// 表格列配置
const columns = [
  {
    title: '场景',
    dataIndex: 'scene',
    key: 'scene',
    width: 120,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    key: 'enabled',
    width: 80,
  },
  {
    title: '黑名单过滤',
    dataIndex: 'blacklist',
    key: 'blacklist',
    width: 100,
  },
  {
    title: '违禁词过滤',
    dataIndex: 'sensitive',
    key: 'sensitive',
    width: 100,
  },
  {
    title: '频率限制',
    dataIndex: 'rateLimit',
    key: 'rateLimit',
    width: 100,
  },
  {
    title: '间隔(秒)',
    dataIndex: 'intervalSeconds',
    key: 'intervalSeconds',
    width: 90,
  },
  {
    title: '时/天限制',
    key: 'limits',
    width: 100,
    customRender: ({ record }) => {
      const parts = []
      if (record.maxPerHour) parts.push(`${record.maxPerHour}/时`)
      if (record.maxPerDay) parts.push(`${record.maxPerDay}/天`)
      return parts.join(' ') || '-'
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
]

// 数据
const loading = ref(false)
const configList = ref([])
const modalVisible = ref(false)
const formRef = ref()
const isEdit = ref(false)

const modalTitle = computed(() => (isEdit.value ? '编辑配置' : '新增配置'))

// 表单数据
const formState = reactive({
  id: null,
  scene: '',
  description: '',
  enabled: true,
  blacklist: 0,
  blacklistEnabled: false,
  sensitive: 0,
  sensitiveEnabled: false,
  rateLimit: 0,
  rateLimitEnabled: false,
  intervalSeconds: null,
  maxPerHour: null,
  maxPerDay: null,
  maxIpPerHour: null,
  errorMessage: '',
})

// 加载配置列表
async function loadConfigList() {
  try {
    loading.value = true
    const result = await firewallConfigApi.getConfigList()
    if (result.data) {
      configList.value = result.data
    }
  } catch (e) {
    smartSentry.captureError(e)
    message.error('加载配置列表失败')
  } finally {
    loading.value = false
  }
}

// 新增配置
function handleAdd() {
  isEdit.value = false
  resetForm()
  modalVisible.value = true
}

// 编辑配置
function handleEdit(record) {
  isEdit.value = true
  Object.keys(formState).forEach((key) => {
    if (key in record) {
      formState[key] = record[key]
    }
  })
  // 设置开关状态
  formState.blacklistEnabled = record.blacklist === 1
  formState.sensitiveEnabled = record.sensitive === 1
  formState.rateLimitEnabled = record.rateLimit === 1
  modalVisible.value = true
}

// 删除配置
async function handleDelete(record) {
  try {
    SmartLoading.show()
    await firewallConfigApi.deleteConfig(record.id, record.scene)
    message.success('删除成功')
    await loadConfigList()
  } catch (e) {
    smartSentry.captureError(e)
    message.error('删除失败')
  } finally {
    SmartLoading.hide()
  }
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate()

    SmartLoading.show()

    // 准备提交数据 - 只提交接口需要的字段
    const submitData = {
      scene: formState.scene,
      description: formState.description,
      enabled: formState.enabled,
      blacklist: formState.blacklist,
      sensitive: formState.sensitive,
      rateLimit: formState.rateLimit,
      intervalSeconds: formState.intervalSeconds,
      maxPerHour: formState.maxPerHour,
      maxPerDay: formState.maxPerDay,
      maxIpPerHour: formState.maxIpPerHour,
      errorMessage: formState.errorMessage,
    }

    // 如果是编辑，添加 id
    if (isEdit.value && formState.id) {
      submitData.id = formState.id
      await firewallConfigApi.updateConfig(submitData)
    } else {
      await firewallConfigApi.createConfig(submitData)
    }

    message.success(isEdit.value ? '更新成功' : '创建成功')
    modalVisible.value = false
    await loadConfigList()
  } catch (e) {
    if (e.errorFields) {
      // 表单验证错误
      return
    }
    smartSentry.captureError(e)
    message.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    SmartLoading.hide()
  }
}

// 取消
function handleCancel() {
  modalVisible.value = false
  resetForm()
}

// 重置表单
function resetForm() {
  formState.id = null
  formState.scene = ''
  formState.description = ''
  formState.enabled = true
  formState.blacklist = 0
  formState.blacklistEnabled = false
  formState.sensitive = 0
  formState.sensitiveEnabled = false
  formState.rateLimit = 0
  formState.rateLimitEnabled = false
  formState.intervalSeconds = null
  formState.maxPerHour = null
  formState.maxPerDay = null
  formState.maxIpPerHour = null
  formState.errorMessage = ''
  formRef.value?.resetFields()
}

onMounted(() => {
  loadConfigList()
})
</script>

<style scoped>
.firewall-config {
  padding: 20px;
}

.form-help-text {
  margin-top: 4px;
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}
</style>
