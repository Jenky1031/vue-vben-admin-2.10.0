/**
 * 活动相关枚举（常规活动开发-活动列表）
 */

// 活动类型（查询入参，string）
export enum ActivityTypeEnum {
  Lottery = '1', // 抽奖活动
  Unlock = '2', // 解锁活动
}

// 活动类型文案
export const activityTypeTextMap: Record<string, string> = {
  [ActivityTypeEnum.Lottery]: '抽奖活动',
  [ActivityTypeEnum.Unlock]: '解锁活动',
};

// 活动类型下拉选项
export const activityTypeOptions = Object.keys(activityTypeTextMap).map((value) => ({
  value,
  label: activityTypeTextMap[value],
}));

// 发布状态（响应，number）
export enum ActivityStatusEnum {
  Draft = 0, // 草稿
  On = 1, // 上架
  Off = 2, // 下架
}

// 发布状态文案
export const activityStatusTextMap: Record<number, string> = {
  [ActivityStatusEnum.Draft]: '草稿',
  [ActivityStatusEnum.On]: '上架',
  [ActivityStatusEnum.Off]: '下架',
};

// 发布状态色值
export const activityStatusColorMap: Record<number, string> = {
  [ActivityStatusEnum.Draft]: '#6aa4d1',
  [ActivityStatusEnum.On]: '#19a358',
  [ActivityStatusEnum.Off]: '#949494',
};

// 活动阶段色值（typeName 字符串，来自接口）
export const activityPhaseColorMap: Record<string, string> = {
  未开始: '#6aa4d1',
  进行中: '#19a358',
  已结束: '#949494',
};

// 终端（卡片内切换）
export type ActivityTerminal = 'pc' | 'miniProgram';
