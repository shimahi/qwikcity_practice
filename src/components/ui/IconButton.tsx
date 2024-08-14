import { css } from '@/styled-system/css'

import { token } from '@/styled-system/tokens'
import type { Token } from '@/styled-system/tokens'
import type { UtilityValues } from '@/styled-system/types/prop-type'
import type { ButtonHTMLAttributes, ClassList } from '@builder.io/qwik'
import { SVG } from './svg'

export const IconButton = ({
  icon,
  color = 'slate',
  class: classProp,
  ...props
}: {
  icon: keyof typeof SVG
  color?: Omit<
    UtilityValues['colorPalette'],
    'current' | 'black' | 'white' | 'transparent'
  >
  class?: ClassList
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const Icon = SVG[icon]

  return (
    <button
      style={{
        '--buttonBorderColor': token(`colors.${color}.200` as Token),
        '--buttonAcvtiveColor': token(`colors.${color}.300` as Token),
        '--buttonIconColor': token(`colors.${color}.500` as Token),
      }}
      class={[
        css({
          width: 6,
          height: 6,
          border: '1px solid',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '100%',
          cursor: 'pointer',
          _disabled: {
            cursor: 'not-allowed',
            opacity: 0.7,
          },
          borderColor: 'var(--buttonBorderColor)',
          color: 'var(--buttonIconColor)',
          _hover: {
            backgroundColor: 'var(--buttonBorderColor)',
          },
          _active: {
            backgroundColor: 'var(--buttonAcvtiveColor)',
          },
        }),
        classProp,
      ]}
      {...props}
    >
      <Icon
        class={css({ color: 'var(--buttonIconColor)', width: 4, height: 4 })}
      />
    </button>
  )
}
