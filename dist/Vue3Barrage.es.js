var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { defineComponent, openBlock, createElementBlock, normalizeClass, normalizeStyle, renderSlot, createElementVNode, toDisplayString, getCurrentInstance, reactive, ref, onMounted, watch, withDirectives, Fragment, renderList, createBlock, withCtx, vShow } from "vue";
var barrage_vue_vue_type_style_index_0_lang = "";
const _hoisted_1 = {
  key: 1,
  class: "normal"
};
const _hoisted_2 = { class: "barrage-msg" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  name: "barrage",
  props: {
    item: {
      type: Object,
      default: {}
    },
    isSlot: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([__props.item.position === "normal" ? "barrage-normal" : "barrage-fixed"]),
        style: normalizeStyle(__props.item.style)
      }, [
        __props.isSlot ? renderSlot(_ctx.$slots, "default", { key: 0 }) : (openBlock(), createElementBlock("div", _hoisted_1, [
          createElementVNode("div", _hoisted_2, toDisplayString(__props.item.msg || "\u5F39\u5E55\u6CA1\u5185\u5BB9\u5440"), 1)
        ]))
      ], 6);
    };
  }
});
var index_vue_vue_type_style_index_0_scoped_true_lang = "";
var _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const __default__ = { name: "vue3Barrage" };
const _sfc_main = /* @__PURE__ */ defineComponent(__spreadProps(__spreadValues({}, __default__), {
  props: {
    type: null,
    attachId: null,
    isShow: { type: Boolean, default: true },
    list: null,
    lanesCount: { default: 5 },
    boxWidth: { default: 0 },
    boxHeight: { default: 0 },
    fontSize: { default: 18 },
    loop: { type: Boolean, default: false },
    defineLanes: null,
    speed: { default: 6 }
  },
  emits: ["barrage-list-empty", "maxRows"],
  setup(__props, { expose, emit: $emit }) {
    const props = __props;
    const { slots } = getCurrentInstance();
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || function(requestID) {
      clearTimeout(requestID);
    };
    const data = reactive({
      isSlot: !!(slots == null ? void 0 : slots.barrage),
      boxWidthVal: props.boxWidth,
      boxHeightVal: 0,
      loopVal: props.loop,
      speedVal: props.speed,
      laneNum: 0,
      startTime: 0,
      frameId: null,
      readyId: null,
      normalQueue: [],
      topQueue: [],
      bottomFixQueue: [],
      topFixQueue: [],
      fixQueue: {
        top: [],
        bottom: []
      },
      showInd: 0,
      indexShowQueue: null,
      taskQueue: [],
      taskIsRunning: false,
      taskLastTime: 0,
      lineHeight: 14,
      fixLineNum: 0
    });
    const _speedRatio = 3e3;
    const _sizeLineRatio = 1.8;
    const _throttleGap = 20;
    const barrageDom = ref();
    onMounted(() => {
      if (props.attachId) {
        const parentDiv = document.getElementById(props.attachId);
        const barrageDiv = document.getElementById("vueBarrageDom");
        if (parentDiv) {
          parentDiv.appendChild(barrageDiv);
        }
      }
      handleMaxRows();
      setLanes();
      handleLineHeight();
      if (data.boxWidthVal === 0) {
        data.boxWidthVal = barrageDom.value.parentNode.offsetWidth;
      }
      if (!(data.speedVal >= 1 && data.speedVal <= 10))
        data.speedVal = 6;
      shuffle();
      play();
    });
    watch(props.list, (newValue, oldValue) => {
      insertToReadyShowQueue();
    });
    watch(() => props.boxHeight, (newHeight, oldHeight) => {
      setLanes();
    });
    watch(() => props.lanesCount, (newCount, oldCount) => {
      setLanes();
    });
    watch(() => props.speed, (newCount, oldCount) => {
      if (!(newCount >= 1 && newCount <= 10)) {
        data.speedVal = 6;
      } else {
        data.speedVal = newCount;
      }
    });
    watch(() => props.fontSize, (newVal, oldVal) => {
      handleLineHeight();
      setLanes();
      for (let i = 0; i < data.topQueue.length; i++) {
        const element = data.topQueue[i].laneQueue;
        for (const iterator of element) {
          handlePosition(iterator, i);
        }
      }
    });
    watch(() => data.fixLineNum, (newVal, oldVal) => {
      data.bottomFixQueue.forEach((element, i) => {
        handlePosition(element, i);
      });
      data.topFixQueue.forEach((element, i) => {
        handlePosition(element, i);
      });
      if (oldVal > newVal) {
        data.bottomFixQueue.splice(data.fixLineNum);
        data.topFixQueue.splice(data.fixLineNum);
      }
    });
    const setBoxHeightVal = () => {
      if (props.boxHeight) {
        data.boxHeightVal = props.boxHeight;
      } else {
        const parentNodeH = barrageDom.value.parentNode.offsetHeight;
        data.boxHeightVal = parentNodeH === 0 ? window.innerHeight : parentNodeH;
      }
    };
    const setLanes = () => {
      const oldLaneNum = data.topQueue.length;
      setBoxHeightVal();
      handleMaxRows();
      const maxRows = Math.floor(data.boxHeightVal / data.lineHeight);
      if (props.lanesCount > 0 && props.lanesCount <= maxRows) {
        data.laneNum = props.lanesCount;
      } else {
        data.laneNum = maxRows;
      }
      if (oldLaneNum <= data.laneNum) {
        for (let i = oldLaneNum; i < data.laneNum; i++) {
          data.topQueue.push({
            id: i,
            laneQueue: []
          });
        }
      } else {
        data.topQueue.splice(data.laneNum);
      }
    };
    const shuffle = () => {
      let len = data.laneNum;
      data.indexShowQueue = Array.from({ length: len }, (e, i) => i);
    };
    const insertToReadyShowQueue = () => {
      clearTimeout(data.readyId);
      data.readyId = setTimeout(() => {
        while (props.list.length > 0) {
          let current = props.list.splice(0, data.laneNum);
          addTask(() => {
            data.normalQueue = [...data.normalQueue, ...current];
          });
        }
        updateBarrageDate();
      }, 300);
    };
    const addTask = (fun) => {
      data.taskQueue.push(fun);
      if (data.taskQueue.length > 0 && !data.taskIsRunning) {
        data.taskIsRunning = true;
        window.requestAnimationFrame(runTask);
      }
    };
    const updateBarrageDate = (timestamp) => {
      if (data.startTime == null)
        data.startTime = timestamp;
      if (typeof timestamp !== "undefined") {
        move(timestamp);
      }
      if (data.normalQueue.length > 0 || data.bottomFixQueue.length > 0 || data.topFixQueue.length > 0) {
        play();
      } else {
        $emit("barrage-list-empty");
        data.frameId = null;
      }
    };
    const play = () => {
      data.frameId = requestAnimationFrame(updateBarrageDate);
    };
    const pause = () => {
      cancelAnimationFrame(data.frameId);
    };
    const replay = () => {
      play();
    };
    const move = (timestamp) => {
      data.normalQueue.forEach((item, i) => {
        if (item.startTime) {
          if (item.position === "normal") {
            normalMove(item, timestamp);
            if (item.left + item.width < 0) {
              if (!data.topQueue[item.laneId])
                return;
              const index2 = data.topQueue[item.laneId].laneQueue.findIndex((e) => e.runtimeId === item.runtimeId);
              data.topQueue[item.laneId].laneQueue.splice(index2, 1);
              if (data.loopVal) {
                itemReset(item, timestamp);
              } else {
                data.normalQueue.splice(i, 1);
              }
            }
          }
        } else {
          if (item.position === "top" || item.position === "bottom") {
            if (item.position !== "top" && item.position !== "bottom") {
              throw new Error("Position only between top and bottom when the type equal 1");
            }
            fixMove(item);
            data.normalQueue.splice(i, 1);
          }
          itemReset(item, timestamp);
        }
      });
      queueRefresh(timestamp);
    };
    const normalMove = (item, timestamp) => {
      let progress = timestamp - item.currentTime;
      item.currentTime = timestamp;
      let moveVal = data.boxWidthVal / (data.speedVal * _speedRatio) * progress;
      const extra = strlen(item.msg) / _speedRatio;
      if (moveVal <= 0 || isNaN(moveVal))
        return;
      item.left -= moveVal + extra;
      moveTo(item);
    };
    const fixMove = (item) => {
      if (data.fixLineNum > data[item.position + "FixQueue"].length) {
        handlePosition(item, data[item.position + "FixQueue"].length);
        data[item.position + "FixQueue"].push(item);
      } else {
        if (!data.fixQueue[item.position].includes(item)) {
          data.fixQueue[item.position].push(item);
        }
      }
    };
    const queueRefresh = (currentTime) => {
      data.bottomFixQueue.forEach((item, i) => {
        if (item.startTime + data.speedVal * _speedRatio / 3 <= currentTime) {
          queueFill("bottom", currentTime, i);
        }
      });
      data.topFixQueue.forEach((item, i) => {
        if (item.startTime + data.speedVal * _speedRatio / 3 <= currentTime) {
          queueFill("top", currentTime, i);
        }
      });
    };
    const queueFill = (type, currentTime, index2) => {
      if (data.fixQueue[type].length > 0) {
        const newItem = data.fixQueue[type][0];
        newItem.startTime = currentTime;
        handlePosition(newItem, index2);
        data[`${type}FixQueue`][index2] = newItem;
        data.fixQueue[type].splice(0, 1);
      } else {
        data[`${type}FixQueue`].splice(index2, 1);
      }
    };
    const selectPos = () => {
      console.log(props.defineLanes);
      if (props.defineLanes) {
        const laneIndex = props.defineLanes(data.topQueue) - 1;
        if (laneIndex < data.topQueue.length && laneIndex >= 0) {
          return laneIndex;
        } else {
          throw new Error("lane index should be >0 and <= lanesCount");
        }
      } else {
        if (data.showInd + 1 > data.laneNum) {
          data.showInd = 0;
        }
        return data.showInd++;
      }
    };
    const itemReset = (item, timestamp) => {
      item.runtimeId = getUuid();
      item.startTime = timestamp;
      item.currentTime = timestamp;
      if (item.position === "normal") {
        const len = strlen(item.msg);
        item.width = len * props.fontSize * 1.2;
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
        data.topQueue[laneInd].laneQueue.push(item);
        item.top = data.indexShowQueue[laneInd] * data.lineHeight;
        item.left = lastLeft;
        moveTo(item);
      }
    };
    const handlePosition = (item, index2) => {
      if (item.position === "bottom") {
        item.top = data.boxHeightVal - data.lineHeight * (index2 + 1);
      } else {
        item.top = data.lineHeight * index2;
      }
      moveTo(item);
    };
    const moveTo = (item) => {
      item.style = {
        transform: "translate3d(" + (item.left || 0) + "px," + item.top + "px,0)",
        "font-size": props.fontSize + "px"
      };
    };
    const runTask = (time) => {
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
    const handleMaxRows = () => {
      $emit("maxRows", Math.trunc(data.boxHeightVal / data.lineHeight));
    };
    const handleLineHeight = () => {
      data.lineHeight = Math.ceil(props.fontSize * _sizeLineRatio);
      data.fixLineNum = Math.trunc(data.boxHeightVal / data.lineHeight / 2);
    };
    const strlen = (str) => {
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
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    };
    expose({ pause, replay });
    return (_ctx, _cache) => {
      return withDirectives((openBlock(), createElementBlock("div", {
        class: "barrage-stage",
        style: normalizeStyle({ width: data.boxWidthVal + "px", height: data.boxHeightVal + "px" }),
        id: "vueBarrageDom",
        ref_key: "barrageDom",
        ref: barrageDom
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(data.topQueue, (lane) => {
          return openBlock(), createElementBlock("div", {
            class: "barrage-top",
            key: lane.id
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(lane.laneQueue, (item) => {
              return openBlock(), createBlock(_sfc_main$1, {
                key: item.runtimeId,
                item,
                isSlot: data.isSlot
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "barrage", { item }, void 0, true)
                ]),
                _: 2
              }, 1032, ["item", "isSlot"]);
            }), 128))
          ]);
        }), 128)),
        (openBlock(true), createElementBlock(Fragment, null, renderList(data.topFixQueue, (item, index2) => {
          return openBlock(), createBlock(_sfc_main$1, {
            key: index2,
            item,
            isSlot: data.isSlot
          }, {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "barrage", { item }, void 0, true)
            ]),
            _: 2
          }, 1032, ["item", "isSlot"]);
        }), 128)),
        (openBlock(true), createElementBlock(Fragment, null, renderList(data.bottomFixQueue, (item, index2) => {
          return openBlock(), createBlock(_sfc_main$1, {
            key: index2,
            item,
            isSlot: data.isSlot
          }, {
            default: withCtx(() => [
              renderSlot(_ctx.$slots, "barrage", { item }, void 0, true)
            ]),
            _: 2
          }, 1032, ["item", "isSlot"]);
        }), 128))
      ], 4)), [
        [vShow, __props.isShow]
      ]);
    };
  }
}));
var vue3Barrage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-25c4cd6d"]]);
const components = [vue3Barrage];
const install = (app) => {
  components.map((item) => {
    app.component(item.name, item);
  });
};
var index = __spreadValues({
  install
}, components);
export { index as default };
