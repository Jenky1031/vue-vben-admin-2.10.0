import { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';
import { resultSuccess } from '../_util';

const Random = Mock.Random;

// 服务端固定每页条数（接口仅传 page，无 pageSize）
const PAGE_SIZE = 10;

// 创建人下拉 options（mock 写死，后端对齐时替换）
const creatorList = [
  { id: '1', name: '超级管理员' },
  { id: '2', name: '运营小明' },
  { id: '3', name: '测试小李' },
];

// 模板图：PC 抽奖 / PC 解锁 / 小程序抽奖 / 小程序解锁
const PC_LOTTERY_IMG = '/resource/activity/pc-lottery.svg';
const PC_UNLOCK_IMG = '/resource/activity/pc-unlock.svg';
const APP_LOTTERY_IMG = '/resource/activity/app-lottery.svg';
const APP_UNLOCK_IMG = '/resource/activity/app-unlock.svg';

const activityTitleList = [
  '周年庆抽奖活动',
  '新用户解锁礼包',
  '618 狂欢抽奖',
  '会员专属解锁',
  '双十一大促抽奖',
  '新手任务解锁',
  '春日好运抽奖',
  '夏日清凉解锁',
];

const activityList = (() => {
  const result: any[] = [];
  for (let index = 0; index < 23; index++) {
    // activityType: '1'-抽奖活动、'2'-解锁活动
    const activityType = index % 2 === 0 ? '1' : '2';
    const typeNameList = ['未开始', '进行中', '已结束'];
    result.push({
      activityDesignId: index + 1,
      activityTitle: activityTitleList[index % activityTitleList.length],
      dateStarted: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      dateEnded: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      PC_LOTTERY_IMG: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      status: index % 3,
      activityType,
      pcPreviewImg: activityType === '1' ? PC_LOTTERY_IMG : PC_UNLOCK_IMG,
      appPreviewImg: activityType === '1' ? APP_LOTTERY_IMG : APP_UNLOCK_IMG,
      username: creatorList[index % creatorList.length].name,
      typeName: typeNameList[index % 3],
    });
  }
  return result;
})();

export default [
  {
    url: '/basic-api/activity/list',
    timeout: 300,
    method: 'get',
    response: ({ query }) => {
      const {
        page = 1,
        activityTitle,
        createId,
        dateStarted,
        dateEnded,
        activityType,
        activityLabel,
        addStarted,
        addEnded,
      } = query;

      let data = activityList;

      if (activityTitle) {
        data = data.filter((item) => item.activityTitle.includes(activityTitle));
      }
      if (createId) {
        const creator = creatorList.find((c) => c.id === String(createId));
        if (creator) {
          data = data.filter((item) => item.username === creator.name);
        }
      }
      if (activityType) {
        data = data.filter((item) => item.activityType === String(activityType));
      }
      if (activityLabel) {
        data = data.filter((item) => item.activityTitle.includes(activityLabel));
      }
      if (dateStarted) {
        data = data.filter((item) => item.dateStarted >= String(dateStarted));
      }
      if (dateEnded) {
        data = data.filter((item) => item.dateEnded <= String(dateEnded));
      }
      if (addStarted) {
        data = data.filter((item) => item.dateAdded >= String(addStarted));
      }
      if (addEnded) {
        data = data.filter((item) => item.dateAdded <= String(addEnded));
      }

      const pageNum = Number(page) || 1;
      const total = data.length;
      const totalPage = Math.ceil(total / PAGE_SIZE);
      const offset = (pageNum - 1) * PAGE_SIZE;
      const pageData = data.slice(offset, offset + PAGE_SIZE);

      return resultSuccess({
        data: pageData,
        currentPage: pageNum,
        totalPage,
        total,
      });
    },
  },
  {
    url: '/basic-api/activity/getCreatorList',
    timeout: 100,
    method: 'get',
    response: () => {
      return resultSuccess(creatorList);
    },
  },
] as MockMethod[];
