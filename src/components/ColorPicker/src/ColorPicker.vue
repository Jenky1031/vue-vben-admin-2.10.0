<template>
  <div class="flex items-center" :style="rootStyle">
    <Input
      v-bind="attrs"
      :value="inputText"
      :disabled="disabled"
      :placeholder="placeholder"
      class="flex-1 min-w-0"
      @focus="inputFocused = true"
      @change="handleInputChange"
      @blur="handleInputBlur"
      @press-enter="handleInputBlur"
    />
    <PickColors
      class="ml-2 shrink-0"
      :class="{ 'pointer-events-none cursor-not-allowed opacity-60': disabled }"
      :value="pickerColor"
      format="hex"
      :size="swatchSize"
      :theme="theme"
      :show-picker="pickerOpen"
      @update:show-picker="handleShowPickerChange"
      @update:value="handlePickerChange"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, watch } from 'vue';
  import { Input } from 'ant-design-vue';
  import PickColors from 'vue-pick-colors';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';

  const DEFAULT_COLOR = '#000000';

  // 校验并规范化十六进制色值：#abc -> #AABBCC；非法返回空字符串
  function normalizeHex(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    let hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      hex = hex.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3');
    }
    return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toUpperCase() : '';
  }

  export default defineComponent({
    name: 'ColorPicker',
    components: { Input, PickColors },
    inheritAttrs: false,
    props: {
      value: {
        type: String,
        default: DEFAULT_COLOR,
      },
      /**
       * 右侧预览色块尺寸。
       * 注意：不能叫 size——BasicForm 会把表单全局 size('default'|'small'|'large')注入到所有注册组件，若占用 size 会被 'default' 字符串覆盖，导致 vue-pick-colors 色块尺寸失效(不可见)。
       * 这里用 swatchSize 承接色块尺寸，让表单注入的 size 作为 attrs 落到内部 Input 上。
       */
      swatchSize: {
        type: Number,
        default: 32,
      },
      /**
       * 整个控件(输入框 + 右侧色块)的总宽度。
       * 默认 200 适配 7 位十六进制值(#RRGGBB，含清除图标/内边距仍舒适)；可传 false / 0 之外的任意 px，或传字符串如 '100%' 自适应
       */
      width: {
        type: [Number, String],
        default: 200,
      },
      // vue-pick-colors 拾色面板主题：light / dark
      theme: {
        type: String,
        default: 'light',
      },
      placeholder: {
        type: String,
        default: '#000000',
      },
      // 禁用：输入框不可编辑，色块不可点击打开拾色面板
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['change', 'update:value'],
    setup(props, { emit, attrs }) {
      // 兼容 BasicForm 字段注册：props.value 入、state 的 setter 触发 change 事件出
      const [state] = useRuleFormItem(props, 'value', 'change');
      // 允许空值：外部传空串时输入框保持为空（placeholder 提示默认色），非空才规范化
      const initialRaw = String(props.value ?? '').trim();
      const inputText = ref(initialRaw ? normalizeHex(initialRaw) || DEFAULT_COLOR : '');
      // 输入框聚焦期间不允许外部覆盖文本（避免打断手敲）
      const inputFocused = ref(false);
      // 拾色面板开关：通过 show-picker 受控，disabled 时强制关闭
      const pickerOpen = ref(false);
      // 色块渲染色：state 为空（未设置）时展示兜底色，避免给拾色器传空串
      const pickerColor = computed(() => normalizeHex(state.value) || DEFAULT_COLOR);

      // 控件整体宽度：数字按 px；字符串原样(如 '100%' / '180px')；max-width:100% 防止在较窄列里溢出
      const rootStyle = computed(() => ({
        width: typeof props.width === 'number' ? `${props.width}px` : props.width,
        maxWidth: '100%',
      }));

      // 提交值到 state：允许空串（清空）；非空非法内容不提交（由调用方回退展示）
      function syncState(value: unknown) {
        const raw = String(value ?? '').trim();
        if (!raw) {
          // state 是 WritableComputedRef：赋值会派发 change（BasicForm 联动）并更新内部值
          state.value = '';
          emit('update:value', '');
          return;
        }
        const norm = normalizeHex(raw);
        if (!norm) return;
        state.value = norm;
        emit('update:value', norm);
      }

      // 拾色器选色 -> 输入框 + 状态同步
      function handlePickerChange(value: unknown) {
        const norm = normalizeHex(value);
        if (!norm) return;
        inputText.value = norm;
        syncState(norm);
      }

      // 拾色面板开关：disabled 时丢弃"打开"请求，其余正常开合
      function handleShowPickerChange(open: boolean) {
        if (props.disabled && open) {
          return;
        }
        pickerOpen.value = open;
      }

      // 外部将组件置为禁用时，若面板已打开则强制关闭
      watch(
        () => props.disabled,
        (val) => {
          if (val) {
            pickerOpen.value = false;
          }
        },
      );

      // 输入框实时校验：合法 hex 即同步色块（即时联动）
      function handleInputChange(e: any) {
        const raw = e.target?.value ?? '';
        inputText.value = raw;
        const norm = normalizeHex(raw);
        if (norm) syncState(norm);
      }

      // 失焦 / 回车：合法则格式化提交；空则作为“清空”提交空值；乱码才回退到最近一次有效值
      function handleInputBlur() {
        inputFocused.value = false;
        const raw = inputText.value.trim();
        // 明确清空：提交空值，输入框留空（placeholder 提示默认色；是否必填由表单 rules 决定）
        if (!raw) {
          inputText.value = '';
          syncState('');
          return;
        }
        const norm = normalizeHex(raw);
        if (norm) {
          // 合法：格式化为大写并同步（通常已即时同步，此处幂等）
          inputText.value = norm;
          syncState(norm);
        } else {
          // 乱码（如打了一半的 #A1B2C）：回退展示到最近一次已提交值，不提交
          inputText.value = normalizeHex(state.value);
        }
      }

      // 外部改动（如表单回填 / v-model 赋值）同步输入框；空值保持为空
      watch(
        () => props.value,
        (v) => {
          if (!inputFocused.value) {
            const raw = String(v ?? '').trim();
            inputText.value = raw ? normalizeHex(raw) || DEFAULT_COLOR : '';
          }
        },
      );

      return {
        attrs,
        rootStyle,
        pickerColor,
        inputText,
        inputFocused,
        pickerOpen,
        handleInputChange,
        handleInputBlur,
        handlePickerChange,
        handleShowPickerChange,
      };
    },
  });
</script>
