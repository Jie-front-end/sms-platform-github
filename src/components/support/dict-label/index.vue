<template>
  <a-tag v-if="props.tag" :color="color">{{ dataLabels }}</a-tag>
  <span v-else>{{ dataLabels }}</span>
</template>

<script setup>
  import { computed } from 'vue';
  import { useDictStore } from '/@/store/modules/system/dict.js';

  const props = defineProps({
    dictCode: String,
    dataValue: [String, Number],
    color: String,
    tag: {
      type: Boolean,
      default: false,
    },
  });
  const dataLabels = computed(() => {
    return useDictStore().getDataLabels(props.dictCode, props.dataValue);
  });
</script>
