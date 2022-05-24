<template>
  <div class="barrage-stage" :style="{ width: data.boxWidthVal + 'px', height: data.boxHeightVal + 'px' }"
    v-show="isShow" id="vueBarrageDom" ref="barrageDom">
    <!-- 默认顶部滚动 -->
    <div class="barrage-top" v-for="lane in data.topQueue" :key="lane.id">
      <Barrage v-for="item in lane.laneQueue" :key="item.runtimeId" :item="item" :isSlot="data.isSlot">
        <slot name="barrage" :item="item"></slot>
      </Barrage>
    </div>
    <Barrage v-for="(item, index) in data.topFixQueue" :key="index" :item="item" :isSlot="data.isSlot">
      <slot name="barrage" :item="item"></slot>
    </Barrage>
    <Barrage v-for="(item, index) in data.bottomFixQueue" :key="index" :item="item" :isSlot="data.isSlot">
      <slot name="barrage" :item="item"></slot>
    </Barrage>
  </div>
</template>

<script lang="ts">
export default { name: "vue3Barrage" };
</script>

<script setup lang="ts">
import { withDefaults, onMounted, ref, watch, reactive, getCurrentInstance, ComponentInternalInstance } from 'vue';

import Barrage from './barrage.vue';
import { BarrageList } from '../../utils/lib';

const { slots } = getCurrentInstance() as ComponentInternalInstance;

window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;
window.cancelAnimationFrame =
  window.cancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  function (requestID) {
    clearTimeout(requestID);
  };

interface Item extends BarrageList {
  style?: any;
  runtimeId?: string | undefined;
  startTime: number;
  currentTime: number;
  laneId: number;
  left: number;
  width: number;
  top: number;
}

interface Props {
  type?: string; // 弹幕时间类型，是一下显示完，还是根据组件开始时间轴分批显示，需要有一个time属性
  attachId: string;
  isShow?: boolean;
  list: Array<BarrageList>;
  lanesCount?: number;
  boxWidth?: number;
  boxHeight?: number;
  // 字体大小 -》控制行高、行数
  fontSize?: number;
  loop?: boolean;
  defineLanes?: Function;
  speed?: number | string; // 弹幕移动速度
}

// 父组件传值
const props = withDefaults(defineProps<Props>(), {
  isShow: true,
  boxWidth: 0,
  lanesCount: 5,
  boxHeight: 0,
  fontSize: 18,
  loop: false,
  speed: 6, // 1-10级 弹幕速度相同
});

// 响应式数据
const data = reactive({
  isSlot: !!slots?.barrage as boolean,
  boxWidthVal: props.boxWidth as number,
  boxHeightVal: 0 as number,
  loopVal: props.loop as boolean,
  speedVal: props.speed as number,
  laneNum: 0 as number, // 泳道数量 将舞台分为固定泳道，防止弹幕重叠

  startTime: 0 as number | undefined,
  frameId: null as any,
  readyId: null as any,
  // 全部弹幕队列，新弹幕先进入队列
  normalQueue: [] as Array<Item>,
  // 顶部滚动队列,分泳道
  topQueue: [] as Array<{
    id: number;
    laneQueue: Array<Item>;
  }>,
  // 即将显示底部固定队列
  bottomFixQueue: [] as Array<Item>,
  // 即将显示顶部固定队列
  topFixQueue: [] as Array<Item>,
  // 未显示的固定弹幕存放区
  fixQueue: {
    top: [] as Array<Item>,
    bottom: [] as Array<Item>,
  },
  showInd: 0, // 用指针来代替频繁环操作
  indexShowQueue: null as any, // 随机展示位置环
  taskQueue: [],
  taskIsRunning: false,
  taskLastTime: 0 as number,

  lineHeight: 14 as number, // 默认行高
  fixLineNum: 0 as number, // 固定行数
})

const _speedRatio = 3000 // 弹幕移动速度倍率
const _sizeLineRatio = 1.8 // 字体和行高倍率
const _throttleGap = 20


const barrageDom = ref();
let $emit = defineEmits(['barrage-list-empty', 'maxRows']);

onMounted(() => {
  // 插入弹幕dom
  if (props.attachId) {
    const parentDiv = document.getElementById(props.attachId)
    const barrageDiv = document.getElementById('vueBarrageDom')
    // const docEl = document.createElement('div')
    // docEl.className = 'barrage-container'
    // docEl.appendChild(barrageDiv)

    if (parentDiv) {
      parentDiv.appendChild(barrageDiv)
    }
  }

  // 反馈满屏最大弹幕行数
  handleMaxRows()
  // 设置泳道数量
  setLanes()
  // 弹幕行高
  handleLineHeight()

  // Calculate the size of Stage
  if (data.boxWidthVal === 0) {
    data.boxWidthVal = barrageDom.value.parentNode.offsetWidth
  }

  // 值范围判定: 移动速度1-10之间，不符合赋6
  if (!(data.speedVal >= 1 && data.speedVal <= 10)) data.speedVal = 6

  shuffle();
  play();
});

watch(props.list, (newValue, oldValue) => {
  // console.log('obj改变了', newValue, oldValue);
  insertToReadyShowQueue();
  // { deep: true }
});

// 弹幕区域高度变化监听
watch(() => props.boxHeight as number, (newHeight, oldHeight) => {
  setLanes();
});

watch(() => props.lanesCount as number, (newCount, oldCount) => {
  setLanes();
});

watch(() => props.speed as number, (newCount, oldCount) => {
  if (!(newCount >= 1 && newCount <= 10)) {
    data.speedVal = 6
  } else {
    data.speedVal = newCount
  }
});

// 字体大小监听
watch(() => props.fontSize as number, (newVal, oldVal) => {
  handleLineHeight()
  setLanes();
  // 弹幕位置修改
  for (let i = 0; i < data.topQueue.length; i++) {
    const element = data.topQueue[i].laneQueue;
    for (const iterator of element) {
      handlePosition(iterator, i)
    }
  }
});

// 字体大小监听
watch(() => data.fixLineNum as number, (newVal, oldVal) => {
  // 固定弹幕泳道重新计算
  // 位置重新计算
  data.bottomFixQueue.forEach((element, i) => {
    handlePosition(element, i)
  });
  data.topFixQueue.forEach((element, i) => {
    handlePosition(element, i)
  });
  if (oldVal > newVal) {
    // 会造成弹幕不显示，直接消失
    data.bottomFixQueue.splice(data.fixLineNum);
    data.topFixQueue.splice(data.fixLineNum);
  }
});


/* 方法 */
// 设置舞台高度
const setBoxHeightVal = () => {
  if (props.boxHeight) {
    data.boxHeightVal = props.boxHeight
  } else {
    // 宽度为父元素的宽度
    const parentNodeH = barrageDom.value.parentNode.offsetHeight
    data.boxHeightVal = parentNodeH === 0 ? window.innerHeight : parentNodeH;
  }
}

// 计算泳道数量，判断lanesCount是否超过最大行数
const setLanes = () => {
  // 舞台高度变化重新计算泳道
  const oldLaneNum = data.topQueue.length

  setBoxHeightVal()
  handleMaxRows()
  const maxRows = Math.floor(data.boxHeightVal / data.lineHeight);
  if (props.lanesCount > 0 && props.lanesCount <= maxRows) {
    data.laneNum = props.lanesCount
  } else {
    data.laneNum = maxRows
  }

  // 计算泳道数量
  if (oldLaneNum <= data.laneNum) {
    for (let i = oldLaneNum; i < data.laneNum; i++) {
      data.topQueue.push({
        id: i,
        laneQueue: [],
      });
    }
  } else {
    data.topQueue.splice(data.laneNum);
  }
};
// init indexShowQueue
const shuffle = () => {
  let len = data.laneNum;
  // 按顺序展示
  data.indexShowQueue = Array.from({ length: len }, (e, i) => i);
};

// 节流函数
const insertToReadyShowQueue = () => {
  clearTimeout(data.readyId);
  data.readyId = setTimeout(() => {
    while (props.list.length > 0) {
      let current = props.list.splice(0, data.laneNum);
      // 给data.normalQueue赋值
      addTask(() => {
        data.normalQueue = [...data.normalQueue, ...current];
      });
    }
    updateBarrageDate();
  }, 300);
};

const addTask = (fun: any) => {
  data.taskQueue.push(fun);
  if (data.taskQueue.length > 0 && !data.taskIsRunning) {
    data.taskIsRunning = true;
    window.requestAnimationFrame(runTask);
  }
};

/* 更新弹幕数据 */
const updateBarrageDate = (timestamp?: number) => {
  if (data.startTime == null) data.startTime = timestamp;
  if (typeof timestamp !== 'undefined') {
    move(timestamp);
  }
  if (data.normalQueue.length > 0 || data.bottomFixQueue.length > 0 || data.topFixQueue.length > 0) {
    // console.log('go play')
    play();
  } else {
    // 如果弹幕序列为空发出事件 barrageListEmpty
    $emit('barrage-list-empty');
    data.frameId = null;
  }
};
/*  开始弹幕 */
const play = () => {
  data.frameId = requestAnimationFrame(updateBarrageDate);
};

/* 暂停弹幕  */
const pause = () => {
  cancelAnimationFrame(data.frameId);
};
// 重设弹幕
const replay = () => {
  play();
};

/* 弹幕移动 */
const move = (timestamp: number) => {
  data.normalQueue.forEach((item, i) => {
    if (item.startTime) {
      if (item.position === 'normal') {
        // 正常弹幕
        normalMove(item, timestamp);
        // 退出条件
        if (item.left + item.width < 0) {
          // 清理弹幕 防止内存泄漏
          if (!data.topQueue[item.laneId]) return;
          const index = data.topQueue[item.laneId].laneQueue.findIndex((e: Item) => e.runtimeId === item.runtimeId);
          data.topQueue[item.laneId].laneQueue.splice(index, 1);
          if (data.loopVal) {
            // 如果循环则重新加入数据
            itemReset(item, timestamp);
          } else {
            data.normalQueue.splice(i, 1);
          }
        }
      }
    } else {
      if (item.position === 'top' || item.position === 'bottom') {
        if (item.position !== 'top' && item.position !== 'bottom') {
          throw new Error('Position only between top and bottom when the type equal 1');
        }
        // 固定弹幕
        fixMove(item);
        data.normalQueue.splice(i, 1);
      }
      // 弹幕初始化
      itemReset(item, timestamp);
    }
  });
  // 移除固定弹幕
  queueRefresh(timestamp);
};

/* 移动实现的核心 */
const normalMove = (item: Item, timestamp: number) => {
  // 时间差, 和时间挂钩
  let progress = timestamp - item.currentTime;
  item.currentTime = timestamp;
  // 弹幕移动距离
  let moveVal = (data.boxWidthVal / (data.speedVal * _speedRatio)) * progress;
  // 额外移动速度加成，字越多跑越快
  const extra = strlen(item.msg) / _speedRatio;

  // 如果移动距离为0或者NaN 跳过，保持动画连续和减少重绘
  if (moveVal <= 0 || isNaN(moveVal)) return;
  item.left -= moveVal + extra;
  // 设置移动
  moveTo(item);
};

/* 固定弹幕 */
const fixMove = (item: Item) => {
  // 固定弹幕初始化
  if (data.fixLineNum > data[item.position + 'FixQueue'].length) {
    handlePosition(item, data[item.position + 'FixQueue'].length)
    data[item.position + 'FixQueue'].push(item)
  } else {
    // 判断是否在队列中,并存入
    if (!data.fixQueue[item.position].includes(item)) {
      data.fixQueue[item.position].push(item);
    }
  }
};

/* 固定队列移除 */
const queueRefresh = (currentTime: number) => {
  // 删除显示后的弹幕，插入新弹幕 
  data.bottomFixQueue.forEach((item, i) => {
    if (item.startTime + data.speedVal * _speedRatio / 3 <= currentTime) {
      // 插入新的弹幕显示
      queueFill('bottom', currentTime, i)
    }
  });
  data.topFixQueue.forEach((item, i) => {
    if (item.startTime + data.speedVal * _speedRatio / 3 <= currentTime) {
      // 插入新的弹幕显示
      queueFill('top', currentTime, i)
    }
  });
};

// 弹幕填充
const queueFill = (type: string, currentTime: number, index: number) => {
  if (data.fixQueue[type].length > 0) {
    const newItem = data.fixQueue[type][0]
    newItem.startTime = currentTime
    handlePosition(newItem, index)
    data[`${type}FixQueue`][index] = newItem;
    data.fixQueue[type].splice(0, 1);
  } else {
    data[`${type}FixQueue`].splice(index, 1)
  }
}

// 选择空闲可以插入的泳道
const selectPos = () => {
  // 如果有用户设置的函数则使用用户的
  console.log(props.defineLanes);
  if (props.defineLanes) {
    // 传入参数为当前所有泳道
    const laneIndex = props.defineLanes(data.topQueue) - 1;
    if (laneIndex < data.topQueue.length && laneIndex >= 0) {
      return laneIndex
    } else {
      throw new Error('lane index should be >0 and <= lanesCount');
    }

  } else {
    // 根据模式选择
    if (data.showInd + 1 > data.laneNum) {
      data.showInd = 0;
    }
    return data.showInd++;
  }
};

const itemReset = (item: Item, timestamp: any) => {
  item.runtimeId = getUuid();
  item.startTime = timestamp;
  item.currentTime = timestamp;

  if (item.position === 'normal') {
    // 弹幕宽度
    const len = strlen(item.msg)
    item.width = len * props.fontSize * 1.2

    // 顶部滚动弹幕
    let laneInd = selectPos();
    item.laneId = laneInd;
    let lastLeft = data.boxWidthVal;
    if (data.topQueue[laneInd] && data.topQueue[laneInd].laneQueue.length > 0) {
      const last = data.topQueue[laneInd].laneQueue[data.topQueue[laneInd].laneQueue.length - 1];
      if (last.left > data.boxWidthVal || last.left > data.boxWidthVal - last.width) {
        lastLeft = last.width + last.left;
      } else {
        lastLeft += last.width;
      }
    }
    // 弹幕赋值
    data.topQueue[laneInd].laneQueue.push(item);
    // 计算位置
    item.top = data.indexShowQueue[laneInd] * data.lineHeight;
    item.left = lastLeft;

    moveTo(item);
  }
};

/* 固定弹幕位置处理 */
const handlePosition = (item: Item, index: number) => {
  // if (index > data.fixLineNum) return // 超过最大行数不处理
  if (item.position === 'bottom') {
    item.top = data.boxHeightVal - data.lineHeight * (index + 1);
  } else {
    item.top = data.lineHeight * index;
  }
  moveTo(item);
};

/* 弹幕移动 */
const moveTo = (item: Item) => {
  item.style = {
    transform: 'translate3d(' + (item.left || 0) + 'px,' + item.top + 'px,0)', // 控制弹幕得移动
    'font-size': props.fontSize + 'px'
  }
};

const runTask = (time: number) => {
  if (!data.taskLastTime || time - data.taskLastTime >= _throttleGap) {
    let func = data.taskQueue.shift();
    data.taskLastTime = time;
    func();
  }
  if (data.taskQueue.length > 0) {
    window.requestAnimationFrame(runTask);
  } else {
    data.taskIsRunning = false;
  }
};

/* 最大行数反馈 */
const handleMaxRows = () => {
  $emit('maxRows', Math.trunc(data.boxHeightVal / data.lineHeight));
}

/* 行高及固定行数计算 */
const handleLineHeight = () => {
  data.lineHeight = Math.ceil(props.fontSize * _sizeLineRatio)
  data.fixLineNum = Math.trunc(data.boxHeightVal / data.lineHeight / 2)
}

/* 计算中英文的长度 */
const strlen = (str: any) => {
  let len = 0;
  for (let i in str) {
    if (str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94) {
      len += 2;
    } else {
      len++;
    }
  }
  return len;
};

const getUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 暴露自己的属性
defineExpose({ pause, replay });
</script>

<style scoped>
.barrage-stage {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
