<template>
  <div class="business-management-container">
    <a-card size="small" :bordered="false" :hoverable="true">
      <a-tabs v-model:activeKey="activeKey" type="card">
        <a-tab-pane key="2" tab="自动审核规则">
          <AutoApprovalRules />
        </a-tab-pane>
        <a-tab-pane key="3" tab="配置管理">
          <ConfigurationManagement />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AutoApprovalRules from './auto-approval-rules.vue'
import ConfigurationManagement from './configuration-management.vue'

const activeKey = ref('1')
</script>

<style scoped>
.business-management-container {
  padding: 20px;
}
</style>