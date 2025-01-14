import React, { ReactElement, cloneElement, useCallback, useMemo, useState } from 'react'

import { useId } from '../../../hooks/useId'
import { ActionDialog } from '../ActionDialog'

type ToggleModalActionType = () => void

export const ActionDialogWithTrigger: React.FC<
  Omit<React.ComponentProps<typeof ActionDialog>, 'isOpen' | 'onClickClose'> & {
    trigger: Omit<ReactElement, 'onClick' | 'aria-haspopup' | 'aria-controls'>
    onClickTrigger?: (open: ToggleModalActionType) => void
    onClickClose?: (close: ToggleModalActionType) => void
  }
> = ({ id, trigger, onClickTrigger, onClickClose, ...props }) => {
  const generatedId = useId()
  const actualId = id || generatedId
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const onClickOpen = useCallback(() => {
    if (onClickTrigger) {
      return onClickTrigger(open)
    }

    open()
  }, [onClickTrigger, open])
  const actualOnClickClose = useCallback(() => {
    if (onClickClose) {
      return onClickClose(close)
    }

    close()
  }, [onClickClose, close])

  const actualTrigger = useMemo(
    () =>
      cloneElement(trigger as ReactElement, {
        onClick: onClickOpen,
        'aria-haspopup': 'true',
        'aria-controls': actualId,
      }),
    [trigger, actualId, onClickOpen],
  )

  return (
    <>
      {actualTrigger}
      <ActionDialog {...props} isOpen={isOpen} onClickClose={actualOnClickClose} id={actualId} />
    </>
  )
}
