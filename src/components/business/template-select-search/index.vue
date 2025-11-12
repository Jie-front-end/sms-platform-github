<template>

    <a-select v-model:value="props.value" show-search placeholder="input search text"
        :default-active-first-option="false" :show-arrow="false" :filter-option="false" :not-found-content="null"
        :options="options" @search="handleSearch" @change="handleChange" allowClear></a-select>

</template>

<script setup>
import { ref, reactive } from 'vue'
import { smsTemplateApi } from '/@/api/business/sms-manager/sms-template-api';

const props = defineProps({
    value: [Number, String, Object],
})
const emits = defineEmits(['update:value', 'rewrite'])

const options = ref([]);

const handleSearch = val => {
    fetch(val, d => (options.value = d));
};
const handleChange = (val, op) => {
    console.log(val);
    console.log(op);
    // templateValue.value = val;
    emits('update:value', val);
    emits('rewrite', op);
    fetch(val, d => (options.value = d));
};




let timeout;
let currentValue = '';
function fetch(value, callback) {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
    currentValue = value;
    function fake() {
        let params = {
            templateName: value,
        };
        smsTemplateApi.queryFuzzyByName(params)
            .then(res => {
                if (res.ok) {
                    const result = res.data;
                    const data = [];
                    result.forEach(r => {
                        data.push({
                            value: r.templateCode,
                            label: r.templateName,
                            templateContent: r.templateContent,
                            templateKeyList: r.templateKeyList,
                            content: undefined,
                        });
                    });
                    callback(data);
                }
            });
    }
    timeout = setTimeout(fake, 300);
}
</script>

<style scoped></style>