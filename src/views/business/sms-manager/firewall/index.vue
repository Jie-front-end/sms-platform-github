<template>
  <div class="firewall-container">
    <a-card size="small" :bordered="false" :hoverable="true">
      <a-tabs v-model:activeKey="activeKey" type="card">
        <a-tab-pane key="1" tab="黑名单管理">
          <BlacklistManage />
        </a-tab-pane>
        <a-tab-pane key="2" tab="违禁词管理">
          <ForbiddenWordsManage />
        </a-tab-pane>
        <a-tab-pane key="3" tab="防火墙配置">
          <FirewallConfig />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BlacklistManage from './blacklist-manage.vue'
import ForbiddenWordsManage from './forbidden-words-manage.vue'
import FirewallConfig from './firewall-config.vue'

const activeKey = ref('1')
</script>

<style scoped>
.firewall-container {
  padding: 20px;
}
</style>