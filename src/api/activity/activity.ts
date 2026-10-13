import { ActivityListParams, ActivityListResultModel, CreatorOption } from './model/activityModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  ActivityList = '/activity/list',
  CreatorList = '/activity/getCreatorList',
}

/**
 * @description: 活动分页列表
 */
export const getActivityList = (params: ActivityListParams) =>
  defHttp.get<ActivityListResultModel>({ url: Api.ActivityList, params });

/**
 * @description: 创建人下拉选项
 */
export const getCreatorList = () => defHttp.get<CreatorOption[]>({ url: Api.CreatorList });
