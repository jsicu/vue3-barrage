<script setup lang="ts">
import { ref, reactive } from 'vue';
import { BarrageList } from './packages/utils/lib';

// 响应式数据
let data = reactive({
  list: [] as Array<BarrageList>,
  msg: [
    '礼',
    '老子',
    '孔子云：',
    '何陋之有',
    '谈笑有鸿儒',
    '孔子云：何陋之有？',
    '山不在高，有仙则名',
    '予谓菊，花之隐逸者也',
    '无丝竹之乱耳，无案牍之劳形',
    'Hello! vue3-barrage 0.0.1',
    '崇祯五年十二月，余住西湖',
    '莫说相公痴，更有痴似相公者。',
    '先天下之忧而忧，后天下之乐而乐',
    '是进亦忧，退亦忧。然则何时而乐耶？',
    '居庙堂之高则忧其民，处江湖之远则忧其君。',
    '嗟夫！予尝求古仁人之心，或异二者之为，何哉？',
    '是日更定矣，余拏一小舟，拥毳衣炉火，独往湖心亭看雪',
    '惟长堤一痕、湖心亭一点、与余舟一芥、舟中人两三粒而已。',
    '醉翁之意不在酒，在乎山水之间也。山水之乐，得之心而寓之酒也。',
    '然而禽鸟知山林之乐，而不知人之乐；人知从太守游而乐，而不知太守之乐其乐也。',
  ],
  position: 'normal',
  fontSize: 12,
  stageHeight: 300,
  barrageIsShow: true,
  currentId: 0,
  barrageLoop: true,
  speed: 10
});
const addToList = () => {
  if (data.position === 'bottom') {
    const arr: Array<BarrageList> = Array.from({ length: 3 }, (e) => {
      return {
        msg: data.msg[Math.floor(Math.random() * 20)],
        position: 'bottom',
      };
    });
    data.list.push(...arr);
  } else if (data.position === 'top') {
    const arr: Array<BarrageList> = Array.from({ length: 3 }, (e) => {
      return {
        msg: data.msg[Math.floor(Math.random() * 20)],
        position: 'top',
      };
    });
    data.list.push(...arr);
  } else {
    const arr: Array<BarrageList> = Array.from({ length: 30 }, (e) => {
      return {
        msg: data.msg[Math.floor(Math.random() * 20)],
        position: 'normal',
      };
    });
    data.list.push(...arr);
  }

};

function defineLanes(val) {
  console.log(val)
  return 1
}

</script>

<template>
  <div>
    <select v-model="data.position">
      <option value="normal">滚动弹幕</option>
      <option value="bottom">底部固定弹幕</option>
      <option value="top">顶部固定弹幕</option>
    </select>
    <select v-model="data.fontSize">
      <option value="12">12</option>
      <option value="15">15</option>
      <option value="18">18</option>
    </select>
    <select v-model="data.speed">
      <option value="1">1</option>
      <option value="3">3</option>
      <option value="5">5</option>
      <option value="7">7</option>
      <option value="9">9</option>
    </select>
    <input type="text" style="float: left" v-model="data.msg" />
    <button type="button" style="float: left" @click="addToList">Add</button>
  </div>

  <vue3-barrage ref="barrage" :lanesCount="6" :boxHeight="data.stageHeight" :isShow="data.barrageIsShow"
    :list="data.list" :loop="data.barrageLoop" :speed="data.speed" attachId="barrage" :fontSize="data.fontSize">
    <!-- 自定义弹幕样式 -->
    <template #barrage="list">
      <span style="color: #00099">{{ list.item.msg }}</span>
    </template>
  </vue3-barrage>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
