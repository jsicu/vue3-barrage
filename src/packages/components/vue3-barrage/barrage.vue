<template>
  <div :class="[item.position === 'normal' ? 'barrage-normal' : 'barrage-fixed']" :style="item.style">
    <template v-if="isSlot">
      <slot></slot>
    </template>
    <div v-else class="normal">
      <div class="barrage-msg">{{ item.msg || '弹幕没内容呀' }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, } from 'vue';

defineProps({
  item: {
    type: Object,
    default: {},
  },
  isSlot: {
    type: Boolean,
    default: false,
  },
});

</script>
<style>
.barrage-normal {
  position: absolute;
  width: auto;
  display: block;
  color: #000;
  box-sizing: border-box;
  text-align: left;
  white-space: nowrap;
}

.barrage-fixed {
  position: absolute;
  width: 100%;
  display: block;
  color: #000;
  box-sizing: border-box;
  text-align: center;
  white-space: nowrap;
}

.normal {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 100px;
  color: #fff;
}

.barrage-msg {
  line-height: 30px;
  padding-left: 8px;
  white-space: nowrap;
}
</style>