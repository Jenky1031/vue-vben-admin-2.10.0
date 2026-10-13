<template>
  <PageWrapper title="活动列表">
    <template #headerContent>
      <BasicForm
        class="bg-white px-4 pt-4"
        @register="registerForm"
        @submit="handleSearch"
        @reset="handleReset"
      />
    </template>

    <div class="bg-white mt-4 p-4 min-h-[260px]" v-loading="loading">
      <div v-if="list.length" class="flex flex-wrap gap-4">
        <div
          v-for="item in list"
          :key="item.activityDesignId"
          class="w-[300px] overflow-hidden border border-[#d9d9d9] rounded-lg bg-white transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
        >
          <!-- 模板图 + 状态 + 终端切换 -->
          <div class="relative w-full h-[180px] overflow-hidden">
            <img
              v-if="item.bannerImg"
              :src="item.bannerImg"
              :alt="item.activityTitle"
              class="block w-full h-full object-cover"
            />
            <div
              v-else
              class="flex flex-col items-center justify-center gap-1 w-full h-full bg-gray-100 text-gray-400 text-xs"
            >
              <PictureOutlined class="text-2xl" />
              <span>暂无预览图</span>
            </div>
            <span
              class="absolute top-2 left-2 px-2.5 py-0.5 rounded-[10px] text-white text-xs leading-[18px]"
              :style="{ backgroundColor: activityStatusColorMap[item.status] }"
            >
              {{ activityStatusTextMap[item.status] }}
            </span>
            <RadioGroup
              class="absolute right-2 bottom-2 p-0.5 rounded-md bg-black/45"
              :value="getTerminal(item.activityDesignId)"
              button-style="solid"
              size="small"
              @change="handleTerminalChange(item.activityDesignId, $event)"
            >
              <RadioButton v-for="opt in terminalOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </RadioButton>
            </RadioGroup>
          </div>

          <!-- 活动信息 -->
          <div class="p-3">
            <div class="flex justify-between items-center mb-2">
              <div class="text-[#000000d9] text-base font-medium truncate">
                {{ item.activityTitle }}
              </div>

              <span
                class="text-white text-sm px-2"
                :style="{ backgroundColor: activityPhaseColorMap[item.typeName] }"
              >
                {{ item.typeName }}
              </span>
            </div>

            <div class="text-secondary text-xs">
              <div class="flex justify-between gap-2 mb-1">
                <span>活动时间</span>
                <span>
                  {{ formatToDate(item.dateStarted) }} ~ {{ formatToDate(item.dateEnded) }}
                </span>
              </div>
              <div class="flex justify-between gap-2 mb-1">
                <span>创建人</span>
                <span>{{ item.username || '-' }}</span>
              </div>
              <div class="flex justify-between gap-2 mb-1">
                <span>创建时间</span>
                <span>{{ item.dateAdded }}</span>
              </div>
            </div>
          </div>

          <!-- 操作 -->
          <div class="flex justify-between py-0.5 px-2 border-t border-[#d9d9d9]">
            <a-button size="small" type="link" @click="handleCopyActivity">复制活动</a-button>
            <a-button size="small" type="link" @click="handleEdit">编辑</a-button>
            <a-button size="small" type="link" @click="handleCopyLink(item)">复制链接</a-button>
            <a-button size="small" type="link" @click="handlePreview">预览</a-button>
            <a-button size="small" type="link" @click="handleDetail">详情</a-button>
          </div>
        </div>
      </div>
      <AEmpty v-else description="暂无活动数据" />
    </div>

    <div v-if="total" class="flex justify-end pt-4">
      <APagination
        :current="currentPage"
        :total="total"
        :page-size="pageSize"
        :show-total="showTotal"
        :show-size-changer="false"
        :show-quick-jumper="true"
        @change="handlePageChange"
      />
    </div>
  </PageWrapper>
</template>
<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue';
  import { Radio, Pagination, Empty } from 'ant-design-vue';

  import { PageWrapper } from '/@/components/Page';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { copyTextToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { getActivityList, getCreatorList } from '/@/api/activity/activity';
  import type {
    ActivityItem,
    ActivityListParams,
    CreatorOption,
  } from '/@/api/activity/model/activityModel';
  import {
    activityPhaseColorMap,
    activityStatusColorMap,
    activityStatusTextMap,
  } from '/@/enums/activityEnum';
  import type { ActivityTerminal } from '/@/enums/activityEnum';
  import { DEFAULT_TERMINAL, PAGE_SIZE, searchSchemas, terminalOptions } from './data';
  import { formatToDate } from '/@/utils/dateUtil';

  defineOptions({ name: 'ActivityList' });

  // 本地注册 ant-design-vue 组件（项目未全局注册，采用别名方式）
  const RadioGroup = Radio.Group;
  const RadioButton = Radio.Button;
  const APagination = Pagination;
  const AEmpty = Empty;

  const { createMessage } = useMessage();

  const list = ref<ActivityItem[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const total = ref(0);
  const pageSize = PAGE_SIZE;
  // 卡片独立终端状态：activityDesignId -> pc / miniProgram
  const terminalMap = reactive<Record<number, ActivityTerminal>>({});

  const [registerForm, { getFieldsValue, updateSchema }] = useForm({
    labelWidth: 90,
    schemas: searchSchemas,
    actionColOptions: { span: 24 },
    submitButtonOptions: { text: '查询' },
    resetButtonOptions: { text: '重置' },
  });

  // 创建人下拉选项（mock 写死，数据来自 mock 接口）
  async function loadCreatorOptions() {
    try {
      const creators = await getCreatorList();
      updateSchema([
        {
          field: 'createId',
          componentProps: {
            options: (creators || []).map((item: CreatorOption) => ({
              label: item.name,
              value: item.id,
            })),
          },
        },
      ]);
    } catch (e) {
      console.error('创建人选项加载失败', e);
    }
  }

  // 查询列表：将表单值映射为接口入参
  async function fetchList() {
    loading.value = true;
    try {
      const values = getFieldsValue();
      const params: ActivityListParams = {
        page: currentPage.value,
        activityTitle: values.activityTitle,
        createId: values.createId,
        activityType: values.activityType,
        activityLabel: values.activityLabel,
      };

      // 处理日期
      if (Reflect.has(values, 'activityTime')) {
        params.dateStarted = values.activityTime?.[0] ? values.activityTime[0] + ' 00:00:00' : '';
        params.dateEnded = values.activityTime?.[1] ? values.activityTime[1] + ' 23:59:59' : '';
      }
      if (Reflect.has(values, 'addTime')) {
        params.addStarted = values.addTime?.[0] ? values.addTime[0] + ' 00:00:00' : '';
        params.addEnded = values.addTime?.[1] ? values.addTime[1] + ' 23:59:59' : '';
      }

      console.log('[ params ] >', params);

      const res = await getActivityList(params);
      list.value = res.data || [];
      currentPage.value = res.currentPage || 1;
      total.value = res.total || 0;
    } finally {
      loading.value = false;
    }
  }

  function handleSearch() {
    currentPage.value = 1;
    fetchList();
  }

  function handleReset() {
    // 重置按钮已由 BasicForm 内部完成字段重置并派发 reset 事件，这里只负责重新查询
    currentPage.value = 1;
    fetchList();
  }

  function handlePageChange(page: number) {
    currentPage.value = page;
    fetchList();
  }

  // 卡片终端切换
  function getTerminal(id: number): ActivityTerminal {
    return terminalMap[id] || DEFAULT_TERMINAL;
  }

  function handleTerminalChange(id: number, e: any) {
    terminalMap[id] = e.target.value;
  }

  // 复制链接：前端拼接（跟随当前选中终端）
  function buildActivityLink(item: ActivityItem): string {
    const { origin } = window.location;
    const terminal = getTerminal(item.activityDesignId);
    return `${origin}/activity/preview?activityDesignId=${item.activityDesignId}&terminal=${terminal}`;
  }

  function handleCopyLink(item: ActivityItem) {
    const link = buildActivityLink(item);
    const isSuccess = copyTextToClipboard(link);
    if (isSuccess) {
      createMessage.success('链接已复制到剪贴板');
    } else {
      createMessage.error('复制失败，请手动复制');
    }
  }

  // 本期占位：复制活动 / 编辑 / 预览 / 详情
  function handlePlaceholder(action: string) {
    createMessage.info(`「${action}」功能开发中，敬请期待`);
  }
  const handleCopyActivity = () => handlePlaceholder('复制活动');
  const handleEdit = () => handlePlaceholder('编辑');
  const handlePreview = () => handlePlaceholder('预览');
  const handleDetail = () => handlePlaceholder('详情');

  function showTotal(totalCount: number) {
    return `共 ${totalCount} 条`;
  }

  onMounted(() => {
    loadCreatorOptions();
    fetchList();
  });
</script>
