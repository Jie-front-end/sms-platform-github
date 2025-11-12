<!--
  *  短信签名 下拉选择组件
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-08-12 21:01:52
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
  *
-->
<template>

    <a-select allowClear v-model:value="props.value" :options="options" @change="changeSignName" ></a-select>

</template>

<script setup>
import { ref, reactive, onMounted,useAttrs } from 'vue'
import {smsSignApi} from '/@/api/business/sms-manager/sms-sign-api'
import { smartSentry } from '/@/lib/smart-sentry';
// const attrs = useAttrs()
const props = defineProps({
    value: [String]
})
const emits = defineEmits(['update:value'])
const options = ref([])

async function getSignList() {
    try {
        let resp = await smsSignApi.querySignList();
        options.value = resp.data.map(item => {
            return {
                label: item.signName,
                value: item.signName,
                disabled: !(item.auditStatus === 'AUDIT_STATE_PASS')
            }
        })
    } catch (e) {
        smartSentry.captureError(e)
    }
}

function changeSignName(value) {
    emits('update:value', value)
}

onMounted(() => {
    getSignList()
})

</script>

<style scoped></style>