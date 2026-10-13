<template>
  <Upload
    :file-list="fileList"
    :list-type="listType"
    :accept="accept"
    :max-count="maxCount"
    :before-upload="handleBeforeUpload"
    :custom-request="customRequestHandler"
    @change="handleChange"
  >
    <div v-if="fileList.length < maxCount" class="flex flex-col items-center justify-center">
      <PlusOutlined />
      <div class="mt-1 text-xs">上传</div>
    </div>
  </Upload>
</template>
<script lang="ts">
  import { defineComponent, ref, watch, type PropType } from 'vue';
  import { Upload } from 'ant-design-vue';
  import type { UploadFile, UploadListType } from 'ant-design-vue/es/upload/interface';
  import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { customRequest } from './helper';

  export default defineComponent({
    name: 'ImageUpload',
    components: { Upload, PlusOutlined },
    props: {
      // 表单值：antdv UploadFile 数组（file-list）
      value: {
        type: Array,
        default: () => [],
      },
      // 上传时附带的业务参数
      fileType: {
        type: [Number, String],
        default: 14,
      },
      // 最大上传数量
      maxCount: {
        type: Number,
        default: 1,
      },
      // 大小限制（MB）
      maxSize: {
        type: Number,
        default: 5,
      },
      accept: {
        type: String,
        default: '.jpg, .jpeg, .png, .webp',
      },
      listType: {
        type: String as PropType<UploadListType>,
        default: 'picture-card',
      },
    },
    emits: ['change', 'update:value'],
    setup(props, { emit }) {
      const { createMessage } = useMessage();
      // 兼容 BasicForm 字段注册：props.value 入、state 的 setter 触发 change 事件出
      const [state] = useRuleFormItem(props, 'value', 'change');
      const fileList = ref<Array<any>>((props.value as Array<any>) || []);

      // 外部赋值（表单回填 / v-model）时同步内部列表
      watch(
        () => props.value,
        (v) => {
          fileList.value = (v || []) as Array<any>;
        },
        { deep: true },
      );

      // 文件大小校验：超过限制返回 LIST_IGNORE，不加入列表并提示
      function handleBeforeUpload(file: UploadFile) {
        const isSize = (file.size || 0) / 1024 / 1024 < props.maxSize;
        if (!isSize) {
          createMessage.error(`文件必须小于${props.maxSize}MB!`);
        }
        return isSize || Upload.LIST_IGNORE;
      }

      // 自定义上传：把文件 POST 到上传接口，附带 fileType 业务参数
      function customRequestHandler(e: UploadRequestOption) {
        return customRequest(e, { fileType: props.fileType });
      }

      // file-list 变化 -> 同步到表单值
      // 双事件：state setter 派发 change（BasicForm 用），update:value 供 v-model 用
      function handleChange({ fileList: list }: { fileList: Array<any> }) {
        fileList.value = list || [];
        state.value = fileList.value;
        emit('update:value', fileList.value);
      }

      return { fileList, handleBeforeUpload, customRequestHandler, handleChange };
    },
  });
</script>
