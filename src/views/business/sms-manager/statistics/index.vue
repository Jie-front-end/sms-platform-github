<template>
  <div class="sms-statistics-container">
    <a-card size="small" :bordered="false" :hoverable="true">
      <a-tabs v-model:activeKey="activeKey" type="card">
        <a-tab-pane key="1" tab="发送量统计">
          <SendVolumeStats />
        </a-tab-pane>
        <a-tab-pane key="2" tab="成功率统计">
          <SuccessRateStats />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SendVolumeStats from './send-volume-stats.vue'
import SuccessRateStats from './success-rate-stats.vue'

const activeKey = ref('1')
</script>

<style scoped>
.sms-statistics-container {
  padding: 20px;
}
</style>
