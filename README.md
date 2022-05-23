# vue3-barrage

> 基于 Vue.js 3.x 的弹幕交互组件



## 预览



## 安装

```bash
$ npm install vue3-barrage --save
```

## 案例

```vue
<template>
  <button type="button" style="float: left" @click="addToList">Add</button>
  <vue-barrage ref="barrage" :lanesCount="6" :boxHeight="data.stageHeight" :isShow="data.barrageIsShow" :barrageList="data.barrageList" :loop="data.barrageLoop" :speed="data.speed" attachId="barrage" fontSize="data.fontSize">
    <!-- 自定义弹幕样式 --> 
    <template #barrage="list">
      <span style="color: #00099">{{ list.item.msg }}</span>
    </template>
  </vue-barrage>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
type PositionStatus = 'normal' | 'top' | 'bottom';

interface BarrageList {
  id?: number;
  avatar?: string | undefined;
  msg: string | undefined;
  style?: any;
  speed?: number | undefined;
  position: PositionStatus;
}

// 响应式数据
let data = reactive({
  barrageList: [] as Array<BarrageList>,
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
        id: ++data.currentId,
        msg: data.msg[Math.floor(Math.random() * 20)],
        position: 'bottom',
      };
    });
    data.barrageList.push(...arr);
  } else if (data.position === 'top') {
    const arr: Array<BarrageList> = Array.from({ length: 3 }, (e) => {
      return {
        id: ++data.currentId,
        msg: data.msg[Math.floor(Math.random() * 20)],
        position: 'top',
      };
    });
    data.barrageList.push(...arr);
  } else {
    const arr: Array<BarrageList> = Array.from({ length: 30 }, (e) => {
      return {
        id: ++data.currentId,
        msg: data.msg[Math.floor(Math.random() * 20)],
        position: 'top',
      };
    });
    data.barrageList.push(...arr);
  }
};

</script>
```

## 属性

| 参数        | 说明                                                     | 类型     | 可选值     | 默认值 |
| :---------- | :------------------------------------------------------- | :------- | :--------- | :----- |
| attachId    | 挂载的DOM元素id，不设置就正常显示                        | string   |            |        |
| isShow      | 是否展示弹幕                                             | Boolean  |            | true   |
| list        | 弹幕列表                                                 | Array    |            | []     |
| lanesCount  | 弹幕轨道数量                                             | Number   |            | 5      |
| boxWidth    | 元素宽度                                                 | Number   | 父元素宽度 |        |
| boxHeight   | 元素高度                                                 | Number   | 父元素高度 |        |
| fontSize    | 弹幕字体大小，单位px                                     | Number   |            | 18     |
| speed       | 弹幕速度                                                 | Number   | 1-10       | 6      |
| loop        | 是否循环展示                                             | Boolean  |            | false  |
| defineLanes | 自定义弹幕显示轨道。注意必须返回一个[1-lanesCount]的数字 | Function |            |        |



## list属性

| 参数     | 说明                                       | 类型                    |
| -------- | ------------------------------------------ | ----------------------- |
| msg      | 弹幕文本                                   | string                  |
| position | 弹幕位置。滚动、顶部固定、底部固定         | normal \| top \| bottom |
| 其他     | 自己定义的在插槽里自己使用，插槽使用见下面 |                         |



## 插槽配置

```vue
<template>
  <vue-barrage ref="barrage" :lanesCount="6" :boxHeight="data.stageHeight" :isShow="data.barrageIsShow" :list="data.list" :loop="data.barrageLoop" :speed="data.speed" attachId="barrage" :fontSize="data.fontSize">
    <!-- 自定义弹幕样式 -->
    <!-- #barrage为聚名插槽，必须为这个，下面item也必须为item，其他自定义 -->
    <!-- item里自己加的东西就自己发挥了 -->
    <template #barrage="xxx">
      <span style="color: #00099">{{ xxx.item.msg }}</span>
    </template>
  </vue-barrage>
</template>


```

