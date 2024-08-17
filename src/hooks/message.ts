import { $, createContextId, useContext } from '@builder.io/qwik'

import type { ActionReturn } from '@builder.io/qwik-city'

export const MessageContext = createContextId<{
  content: string | null
  severity: 'success' | 'error'
}>('message-context')

type ActionFn = ActionReturn<
  | {
      formErrors: string[]
      fieldErrors: {
        inputs: string[]
      }
      failed: true
    }
  | {
      [x: string]: undefined
    }
  | {
      [x: string]: any
    }
>

export const useMessage = () => {
  const message = useContext(MessageContext)

  const execute = $(async (submitResult: Promise<ActionFn> | ActionFn) => {
    const result = await submitResult
    if (result.value.failed) {
      const errorMessage =
        result?.value?.fieldErrors?.inputs[0] ?? 'エラーが発生しました。'

      message.severity = 'error'
      message.content = errorMessage
      throw new Error(errorMessage)
    }
    message.content = null

    return result
  })

  const showMessage = $(async (obj: string | Error) => {
    if (obj instanceof Error) {
      message.severity = 'error'
      message.content = obj.message
    } else {
      message.severity = 'success'
      message.content = obj
    }
  })

  return {
    /**
     * @description routeActionフックのsubmitを実行し、処理に失敗した場合はエラーをthrowし、同時にメッセージを表示する。
     * actionの実行結果をPromiseで扱うための関数
     *
     * @param {Promise<ActionFn> | ActionFn} result action.submitの実行結果
     */
    execute,
    /**
     * @description アプリのスナックバーUIにメッセージを表示するための関数。
     *
     * @param {string | Error} obj 表示するメッセージ、またはエラーオブジェクト
     */
    showMessage,
  }
}
