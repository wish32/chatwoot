<script setup>
import { useAttrs } from 'vue';
import { useMapGetter } from 'dashboard/composables/store';
import mark from 'dashboard/assets/images/takehk-mark.png';

const attrs = useAttrs();
const globalConfig = useMapGetter('globalConfig/get');
</script>

<template>
  <img
    v-bind="attrs"
    :src="globalConfig.logoThumbnail || mark"
    alt="TakeHK"
  />
</template>
