<template>

    <div style="align-items: center;">
        <a-space v-for="(item, index) in key" :key="index" id="mysapnce" :size="20"
            style=" margin-bottom: 8px;" :align="'baseline'">
            <a-input v-model:value="item.value" placeholder="请输入变量名" />
            <a-input v-model:value="item.label" placeholder="请输入变量描述" />
            <MinusCircleOutlined @click="removeSight(item)" />
        </a-space>
        <a-button type="primary" style="width: 50%" block @click="addSight">
            <PlusCircleOutlined />
            添加变量
        </a-button>
    </div>

</template>

<script setup>
import { ref, reactive } from 'vue'
const props = defineProps({
    keyList: {
        type: Array,
        default: () => [],
    },
})
const emit = defineEmits(['update:keyList'])
const key = ref(props.keyList)
const removeSight = item => {
    const index = key.value.indexOf(item);
    if (index !== -1) {
        key.value.splice(index, 1);
        emit('update:keyList', key.value)
    }
};
const addSight = () => {
    key.value.push({
        value: undefined,//变量名
        label: undefined,//变量描述
        id: Date.now(),
    });
    emit('update:keyList', key.value)
};

</script>

<style scoped></style>