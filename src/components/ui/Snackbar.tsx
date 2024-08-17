import { SVG } from '@/components/ui/svg'
import { MessageContext } from '@/hooks/message'
import { css } from '@/styled-system/css'
import { component$, useContext, useVisibleTask$ } from '@builder.io/qwik'

/**
 * 成功/エラーのメッセージを表示するスナックバーコンポーネント
 */
export const Snackbar = component$(() => {
  const message = useContext(MessageContext)

  useVisibleTask$(({ track, cleanup }) => {
    const value = track(() => message.content)
    const id = setTimeout(() => {
      if (value) {
        message.content = null
      }
    }, 3000)
    cleanup(() => clearTimeout(id))
  })

  return (
    <div
      class={css({
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: message.severity === 'error' ? 'red.500' : 'teal.500',
        color: 'white',
        borderRadius: 'md',
        boxShadow: 'md',
        zIndex: 9999,
        textStyle: 'button',
        transition: 'opacity 0.3s ease-in-out',
        opacity: message.content ? 1 : 0,
        pointerEvents: message.content ? 'auto' : 'none',
        transform: message.content ? 'translateX(0)' : 'translateX(100%)',
        animation: message.content
          ? 'slideIn 0.3s ease-out'
          : 'slideOut 0.3s ease-out',
        maxWidth: ['90vw', '415px'],
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      })}
    >
      <div
        class={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        })}
      >
        <span>{message.content}</span>
        <button
          onClick$={() => (message.content = null)}
          class={css({
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '10px',
          })}
        >
          <SVG.Close color="white" />
        </button>
      </div>
    </div>
  )
})
