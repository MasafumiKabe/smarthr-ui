import React from 'react'
import { IconBaseProps, IconType } from 'react-icons'
import styled, { css } from 'styled-components'

import { useSpacing } from '../../hooks/useSpacing'
import { useTheme } from '../../hooks/useTheme'
import { AbstractSize, CharRelativeSize } from '../../themes/createSpacing'
import { VisuallyHiddenText } from '../VisuallyHiddenText'

import { useClassNames } from './useClassNames'

/**
 * literal union type に補完を効かせるためのハック
 * https://github.com/microsoft/TypeScript/issues/29729
 */
type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>)

export const generateIcon = (svg: IconType) => createIcon(svg)

const definedColors = [
  'TEXT_BLACK',
  'TEXT_WHITE',
  'TEXT_GREY',
  'TEXT_DISABLED',
  'TEXT_LINK',
  'MAIN',
  'DANGER',
  'WARNING',
  'BRAND',
] as const
type DefinedColor = (typeof definedColors)[number]

const knownColorSet: Set<string> = new Set(definedColors)
const isDefinedColor = (color: string): color is DefinedColor => knownColorSet.has(color)

interface IconProps {
  /**
   * アイコンの色
   * @type string | 'TEXT_BLACK' | 'TEXT_GREY' | 'TEXT_DISABLED' | 'TEXT_LINK' | 'MAIN' | 'DANGER' | 'WARNING' | 'BRAND'
   */
  color?: LiteralUnion<DefinedColor>
  /**
   * アイコンの大きさ
   * @deprecated 親要素やデフォルトフォントサイズが継承されるため固定値の指定は非推奨
   */
  size?: IconBaseProps['size']
}

type ElementProps = Omit<React.SVGAttributes<SVGAElement>, keyof IconProps>

export interface ComponentProps extends IconProps, ElementProps {
  /**アイコンの説明テキスト*/
  alt?: React.ReactNode
  /** アイコンと並べるテキスト */
  text?: React.ReactNode
  /** アイコンと並べるテキストとの溝 */
  iconGap?: CharRelativeSize | AbstractSize
  /** `true` のとき、アイコンを右側に表示する */
  right?: boolean
  /** コンポーネントに適用するクラス名 */
  className?: string
}

export const createIcon = (SvgIcon: IconType) => {
  const Icon: React.FC<ComponentProps> = ({
    color,
    className = '',
    role = 'img',
    alt,
    'aria-hidden': ariaHidden,
    focusable = false,
    text,
    iconGap = 0.25,
    right = false,
    ...props
  }) => {
    const hasLabelByAria =
      props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined
    const isAriaHidden = ariaHidden !== undefined ? ariaHidden : !hasLabelByAria

    const theme = useTheme()
    const replacedColor = React.useMemo(() => {
      const asserted = color as string | undefined
      if (asserted && isDefinedColor(asserted)) {
        return theme.color[asserted]
      }
      return color
    }, [color, theme.color])

    const classNames = useClassNames()

    const existsText = !!text
    const svgIcon = (
      <SvgIcon
        {...props}
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        width="1em"
        height="1em"
        color={replacedColor}
        className={`${className} ${classNames.wrapper}`}
        role={role}
        aria-hidden={isAriaHidden || alt !== undefined || undefined}
        focusable={focusable}
      />
    )

    if (existsText) {
      return (
        <WithIcon gap={iconGap} right={right} className={classNames.withText}>
          {alt && <VisuallyHiddenText>{alt}</VisuallyHiddenText>}
          {right && text}
          {svgIcon}
          {!right && text}
        </WithIcon>
      )
    }

    return (
      <>
        {alt && <VisuallyHiddenText>{alt}</VisuallyHiddenText>}
        {svgIcon}
      </>
    )
  }

  return Icon
}

const WithIcon = styled.span<{
  right: ComponentProps['right']
  gap: ComponentProps['iconGap']
}>`
  ${({ right, gap }) => css`
    ${!right &&
    css`
      display: inline-flex;
      align-items: baseline;
      ${gap && `column-gap: ${useSpacing(gap)};`}
    `}

    .smarthr-ui-Icon {
      flex-shrink: 0;
      transform: translateY(0.125em);
      ${right && gap && `margin-inline-start: ${useSpacing(gap)};`}
    }
  `}
`
