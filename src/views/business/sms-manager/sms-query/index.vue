<template>
  <div class="sms-query-container">
    <a-card size="small" :bordered="false" :hoverable="true">
      <a-tabs v-model:activeKey="activeKey" type="card">
        <a-tab-pane key="1" tab="发送记录查询">
          <SendRecordQuery />
        </a-tab-pane>
        <a-tab-pane key="2" tab="发送状态查询">
          <SendStatusQuery />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SendRecordQuery from './send-record-query.vue'
import SendStatusQuery from './send-status-query.vue'

const activeKey = ref('1')
</script>

<style scoped>
.sms-query-container {
  padding: 20px;
}
</style>