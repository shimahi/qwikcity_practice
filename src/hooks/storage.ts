import { StorageService } from '@/services/storage'
import { getMimeType } from '@/utils'
import { $, useSignal } from '@builder.io/qwik'
import { server$, z } from '@builder.io/qwik-city'

const fileSizeValidator = z
  .custom<{ file: FileList[number] }>()
  .refine((file: { file: File }) => file.file.size <= 30 * 1024 * 1024)

/**
 * @description
 * 画像をストレージのtmpにアップロードし、そのkeyを取得するためのフロントエンド用フック
 */
export function useUpload() {
  /** アップロードしたファイルの一時保存先キー */
  const tmpKeySignal = useSignal('')
  /** アップロード中のローディング状態 */
  const loadingSignal = useSignal(false)
  /** ファイルコピー中のローディング状態 */

  /**
   * ファイルをブラウザからtmpストレージにアップロードする関数
   * @param {File} file アップロードするファイル
   */
  const upload = $(async (file: File) => {
    if (!fileSizeValidator.safeParse({ file }).success) {
      throw new Error('画像のファイルサイズは30MB以下にしてください。')
    }
    // ファイルがjpg, png, heic, heifじゃない場合エラーにする
    if (
      ![
        'image/jpeg',
        'image/png',
        'image/heic',
        'image/heif',
        'image/webp',
      ].includes(file.type)
    ) {
      throw new Error(
        '画像のファイル形式は jpg, png, webp のいずれかにしてください。',
      )
    }

    loadingSignal.value = true
    // tmpストレージへのキーを発行
    tmpKeySignal.value = `service/.tmp/${Date.now().toString()}-${file.name}`
    // 署名付きURLをサーバー側で発行
    const url = await server$(async function (tmpKey: string) {
      const storageService = new StorageService(this)
      return storageService.generateUploadUrl(tmpKey)
    })(tmpKeySignal.value)

    // 署名付きURLに対してファイルをアップロードする
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': getMimeType(file.name),
      },
    }).finally(() => {
      loadingSignal.value = false
    })
  })

  const reset = $(() => {
    tmpKeySignal.value = ''
  })

  return {
    upload,
    loading: loadingSignal.value,
    tmpKey: tmpKeySignal.value,
    reset,
  }
}
