<!--
  * 配置管理
  *
  * @Author:    Claude
  * @Date:      2025-11-04
-->
<template>
  <div class="configuration-management">
    <a-card size="small" :bordered="false" :hoverable="true">
      <a-tabs v-model:activeKey="activeKey" type="card">
        <!-- 基础配置 -->
        <a-tab-pane key="1" tab="基础配置">
          <div class="config-section">
            <h3>短信发送基础配置</h3>
            <a-form :model="basicConfig" layout="vertical">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="单次发送上限">
                    <a-input-number
                      v-model:value="basicConfig.maxSingleSend"
                      :min="1"
                      :max="1000"
                      style="width: 100%"
                    />
                    <div class="form-tip">单次最多发送的短信条数</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="每日发送上限">
                    <a-input-number
                      v-model:value="basicConfig.maxDailySend"
                      :min="1"
                      :max="10000"
                      style="width: 100%"
                    />
                    <div class="form-tip">单个号码每天最多发送的短信条数</div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="短信内容最大长度">
                    <a-input-number
                      v-model:value="basicConfig.maxContentLength"
                      :min="1"
                      :max="1000"
                      style="width: 100%"
                    />
                    <div class="form-tip">单条短信内容的最大字符数</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="发送间隔(秒)">
                    <a-input-number
                      v-model:value="basicConfig.sendInterval"
                      :min="1"
                      :max="3600"
                      style="width: 100%"
                    />
                    <div class="form-tip">同一号码两次发送的最小间隔时间</div>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- 审核配置 -->
        <a-tab-pane key="2" tab="审核配置">
          <div class="config-section">
            <h3>自动审核配置</h3>
            <a-form :model="auditConfig" layout="vertical">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="启用自动审核">
                    <a-switch v-model:checked="auditConfig.enableAutoAudit" />
                    <div class="form-tip">是否启用系统自动审核功能</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="人工审核阈值">
                    <a-input-number
                      v-model:value="auditConfig.manualAuditThreshold"
                      :min="1"
                      :max="100"
                      style="width: 100%"
                      :disabled="!auditConfig.enableAutoAudit"
                    />
                    <div class="form-tip">超过此数量的发送需要人工审核</div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="24">
                  <a-form-item label="免审关键词">
                    <a-textarea
                      v-model:value="auditConfig.whitelistKeywords"
                      placeholder="请输入免审关键词，用逗号分隔"
                      :rows="3"
                    />
                    <div class="form-tip">包含这些关键词的内容将自动通过审核</div>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- 通知配置 -->
        <a-tab-pane key="3" tab="通知配置">
          <div class="config-section">
            <h3>发送结果通知配置</h3>
            <a-form :model="notificationConfig" layout="vertical">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="发送失败通知">
                    <a-switch v-model:checked="notificationConfig.enableFailureNotification" />
                    <div class="form-tip">短信发送失败时是否发送通知</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="审核结果通知">
                    <a-switch v-model:checked="notificationConfig.enableAuditNotification" />
                    <div class="form-tip">模板审核完成时是否发送通知</div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="24">
                  <a-form-item label="通知邮箱">
                    <a-input
                      v-model:value="notificationConfig.notificationEmail"
                      placeholder="请输入接收通知的邮箱地址"
                    />
                    <div class="form-tip">多个邮箱地址用分号;分隔</div>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="24">
                  <a-form-item label="通知手机号">
                    <a-input
                      v-model:value="notificationConfig.notificationPhone"
                      placeholder="请输入接收通知的手机号码"
                    />
                    <div class="form-tip">多个手机号用逗号分隔</div>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- 第三方服务配置 -->
        <a-tab-pane key="4" tab="第三方服务">
          <div class="config-section">
            <h3>短信服务商配置</h3>
            <a-form :model="serviceConfig" layout="vertical">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="主服务商">
                    <a-select v-model:value="serviceConfig.primaryProvider" placeholder="请选择主服务商">
                      <a-select-option value="aliyun">阿里云</a-select-option>
                      <a-select-option value="tencent">腾讯云</a-select-option>
                      <a-select-option value="huawei">华为云</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="备用服务商">
                    <a-select v-model:value="serviceConfig.backupProvider" placeholder="请选择备用服务商">
                      <a-select-option value="">无</a-select-option>
                      <a-select-option value="aliyun">阿里云</a-select-option>
                      <a-select-option value="tencent">腾讯云</a-select-option>
                      <a-select-option value="huawei">华为云</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item label="启用故障转移">
                    <a-switch v-model:checked="serviceConfig.enableFailover" />
                    <div class="form-tip">主服务商故障时自动切换到备用服务商</div>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="重试次数">
                    <a-input-number
                      v-model:value="serviceConfig.retryCount"
                      :min="0"
                      :max="5"
                      style="width: 100%"
                    />
                    <div class="form-tip">发送失败时的重试次数</div>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>

      <!-- 操作按钮 -->
      <div class="config-actions">
        <a-space>
          <a-button type="primary" @click="saveConfig" :loading="saving">
            <template #icon><SaveOutlined /></template>
            保存配置
          </a-button>
          <a-button @click="resetConfig">
            <template #icon><ReloadOutlined /></template>
            重置配置
          </a-button>
          <a-button @click="exportConfig">
            <template #icon><ExportOutlined /></template>
            导出配置
          </a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { SaveOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons-vue';

// 标签页状态
const activeKey = ref('1');
const saving = ref(false);

// 配置数据
const basicConfig = reactive({
  maxSingleSend: 50,
  maxDailySend: 100,
  maxContentLength: 500,
  sendInterval: 60
});

const auditConfig = reactive({
  enableAutoAudit: true,
  manualAuditThreshold: 100,
  whitelistKeywords: '验证码,通知,提醒'
});

const notificationConfig = reactive({
  enableFailureNotification: true,
  enableAuditNotification: true,
  notificationEmail: 'admin@example.com',
  notificationPhone: ''
});

const serviceConfig = reactive({
  primaryProvider: 'aliyun',
  backupProvider: '',
  enableFailover: true,
  retryCount: 3
});

// 默认配置备份
const defaultConfig = {
  basic: { ...basicConfig },
  audit: { ...auditConfig },
  notification: { ...notificationConfig },
  service: { ...serviceConfig }
};

// 保存配置
async function saveConfig() {
  try {
    saving.value = true;
    SmartLoading.show();

    // 模拟保存API调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    message.success('配置保存成功');
  } catch (error) {
    console.error('保存配置失败:', error);
    message.error('保存配置失败');
  } finally {
    saving.value = false;
    SmartLoading.hide();
  }
}

// 重置配置
function resetConfig() {
  Modal.confirm({
    title: '确认重置',
    content: '确定要重置所有配置到默认值吗？此操作不可撤销。',
    okText: '确定重置',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      Object.assign(basicConfig, defaultConfig.basic);
      Object.assign(auditConfig, defaultConfig.audit);
      Object.assign(notificationConfig, defaultConfig.notification);
      Object.assign(serviceConfig, defaultConfig.service);
      message.success('配置已重置到默认值');
    }
  });
}

// 导出配置
function exportConfig() {
  const configData = {
    basic: basicConfig,
    audit: auditConfig,
    notification: notificationConfig,
    service: serviceConfig,
    exportTime: new Date().toISOString()
  };

  const dataStr = JSON.stringify(configData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sms-config-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);

  message.success('配置导出成功');
}

// 加载配置（模拟从后端加载）
function loadConfig() {
  // 这里可以调用API加载配置
  // 现在使用默认配置
  console.log('加载配置...');
}

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.configuration-management {
  padding: 20px;
}

.config-section {
  margin-bottom: 30px;
}

.config-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.form-tip {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

.config-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
  text-align: center;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

:deep(.ant-tabs-content-holder) {
  padding-top: 20px;
}
</style>