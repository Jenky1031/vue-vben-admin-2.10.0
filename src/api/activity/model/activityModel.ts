// 活动列表查询参数（均为 string，仅 page 为分页参数，无 pageSize）
export interface ActivityListParams {
  page?: number;
  activityTitle?: string;
  createId?: string;
  dateStarted?: string;
  dateEnded?: string;
  activityType?: string;
  activityLabel?: string;
  addStarted?: string;
  addEnded?: string;
}

// 活动对象
export interface ActivityItem {
  activityDesignId: number; // 活动 ID
  activityTitle: string; // 活动标题
  dateStarted: string; // 活动起始时间
  dateEnded: string; // 活动结束时间
  dateAdded: string; // 创建时间
  status: number; // 发布状态 0 草稿 / 1 上架 / 2 下架
  typeKey?: number; // 活动阶段 2 已结束 / 3 进行中
  bannerImg?: string | null; // 活动横幅图地址
  pcPreviewImg?: string | null; // PC 端预览图地址
  appPreviewImg?: string | null; // 小程序端预览图地址
  username?: string | null; // 创建人名称
  typeName: string; // 活动阶段名称（进行中 / 已结束）
}

// 活动分页列表出参
export interface ActivityListResultModel {
  data: ActivityItem[];
  currentPage: number;
  totalPage: number;
  total: number;
}

// 创建人下拉选项
export interface CreatorOption {
  id: string;
  name: string;
}
