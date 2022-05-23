/* 弹幕类型 */
export interface BarrageType {
  readonly NORMAL: any;
  readonly BOTTOM: any;
  readonly TOP: any;
}
export type PositionStatus = 'normal' | 'top' | 'bottom';
export const barrageType: BarrageType = {
  NORMAL: Symbol('NORMAL'), // Right to Left
  BOTTOM: Symbol('BOTTOM'), // 底部固定弹幕
  TOP: Symbol('TOP'), // 顶部固定弹幕
};
