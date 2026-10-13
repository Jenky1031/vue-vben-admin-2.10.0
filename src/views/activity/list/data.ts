import type { FormSchema } from '/@/components/Form/index';
import { activityTypeOptions } from '/@/enums/activityEnum';
import type { ActivityTerminal } from '/@/enums/activityEnum';
import { DATE_FORMAT } from '/@/utils/dateUtil';

// 查询区表单配置
export const searchSchemas: FormSchema[] = [
  {
    field: 'activityTitle',
    component: 'Input',
    label: '活动名称',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入活动名称',
    },
  },
  {
    field: 'createId',
    component: 'Select',
    label: '创建人',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请选择创建人',
      options: [],
      allowClear: true,
    },
  },
  {
    field: 'activityType',
    component: 'Select',
    label: '活动类型',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请选择活动类型',
      options: activityTypeOptions,
      allowClear: true,
    },
  },
  {
    field: 'activityLabel',
    component: 'Input',
    label: '活动标签',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入活动标签',
    },
  },
  {
    field: 'activityTime',
    component: 'RangePicker',
    label: '活动时间',
    colProps: { span: 8 },
    componentProps: {
      class: 'w-full',
      format: DATE_FORMAT,
      valueFormat: DATE_FORMAT,
    },
  },
  {
    field: 'addTime',
    component: 'RangePicker',
    label: '创建时间',
    colProps: { span: 8 },
    componentProps: {
      class: 'w-full',
      format: DATE_FORMAT,
      valueFormat: DATE_FORMAT,
    },
  },
];

// 卡片内终端切换选项（项目未启用 Segmented，使用 Radio 按钮组样式）
export const terminalOptions = [
  { label: 'PC', value: 'pc' },
  { label: '小程序', value: 'miniProgram' },
];

// 默认终端
export const DEFAULT_TERMINAL: ActivityTerminal = 'pc';

// bannerImg 为空时的默认模板图
export const DEFAULT_ACTIVITY_IMG = '/resource/activity/pc-lottery.svg';

// 服务端固定每页条数（接口仅传 page，无 pageSize），与 mock 保持一致
export const PAGE_SIZE = 10;
