import { uploadApi } from '/@/api/sys/upload';

/**
 * antdv Upload 自定义上传实现。
 * 把待上传文件 POST 到项目上传接口（VITE_GLOB_UPLOAD_URL，默认 /upload），
 * 并在 FormData 中附带业务参数 fileType，便于后端区分文件归属。
 *
 * @param e antdv Upload 传入的 customRequest option：{ file, onSuccess, onError, onProgress }
 * @param options 扩展参数
 */
export async function customRequest(
  e: Recordable,
  options: { fileType?: number | string } = {},
): Promise<void> {
  const { file, onSuccess, onError, onProgress } = e;
  try {
    const res: Recordable = await uploadApi(
      {
        name: 'file',
        file,
        data: { fileType: options.fileType },
      },
      (event: ProgressEvent) => {
        if (event?.total && onProgress) {
          onProgress({ percent: Math.ceil((event.loaded / event.total) * 100) });
        }
      },
    );
    // defHttp.uploadFile 未走统一响应转换，返回的是原生 AxiosResponse；
    // 这里兼容「AxiosResponse（取 .data）」与「直接返回 body」两种形态。
    const data = res?.data ?? res;
    onSuccess?.(data);
  } catch (error) {
    onError?.(error as Error);
  }
}
