<template>
    <div class="sms-send-container">
        <a-card size="small" :bordered="false" :hoverable="true">
            <a-tabs v-model:activeKey="activeKey" type="card">
            <!--
                <a-tab-pane key="0" tab="快速发送">
                    <QuickSend />
                </a-tab-pane>
            -->
                <a-tab-pane key="1" tab="模板发送">
                    <TemplateSend />
                </a-tab-pane>
                <a-tab-pane key="2" tab="批量发送">
                    <BatchSend />
                </a-tab-pane>
            </a-tabs>
        </a-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import QuickSend from './quick-send.vue'
import TemplateSend from './template-send.vue'
import BatchSend from './batch-send.vue'

const activeKey = ref('1')
</script>

<style scoped lang="less">
.sms-send-container {
    padding: 20px;
}
</style>
