/* 弹幕类型 */
export type PositionStatus = 'normal' | 'top' | 'bottom';
export interface BarrageList {
  msg: string | undefined;
  position: PositionStatus;
}
