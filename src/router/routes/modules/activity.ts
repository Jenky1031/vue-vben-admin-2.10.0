import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';

// 常规活动开发（新功能不使用 i18n，中文直写）
const activity: AppRouteModule = {
  path: '/activity',
  name: 'Activity',
  component: LAYOUT,
  redirect: '/activity/list',
  meta: {
    orderNo: 20,
    icon: 'ion:gift-outline',
    title: '常规活动配置',
  },
  children: [
    {
      path: 'list',
      name: 'ActivityList',
      component: () => import('/@/views/activity/list/index.vue'),
      meta: {
        title: '活动列表',
      },
    },
  ],
};

export default activity;
