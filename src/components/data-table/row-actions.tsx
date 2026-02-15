import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'

import { ButtonGroup } from '../ui/button-group'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '../ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

import { MoreHorizontal } from 'lucide-react'

export type DataTableRowActionItem = {
  type: 'item' | 'separator'
  icon?: React.ElementType
  label?: string
  variant?: 'default' | 'destructive'
  shortcut?: string
  disabled?: boolean
  onClick?: () => void
  href?: string
}

type DataTableRowActionsProps = {
  items: DataTableRowActionItem[]
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

export const DataTableRowActions = ({
  items,
  side = 'right',
  align = 'end',
}: DataTableRowActionsProps) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="size-8 data-[state=open]:bg-muted cursor-pointer"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={side} align={align} className={'w-40'}>
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return <DropdownMenuSeparator key={`separator-${index}`} />
            }
            if (item.href) {
              return (
                <DropdownMenuItem key={`item-${index}`} asChild>
                  <Link to={item.href}>
                    {item.label}
                    {item.icon && (
                      <DropdownMenuShortcut>
                        <item.icon />
                      </DropdownMenuShortcut>
                    )}
                  </Link>
                </DropdownMenuItem>
              )
            }
            return (
              <DropdownMenuItem
                key={`item-${index}`}
                onClick={item.onClick}
                variant={item.variant}
                disabled={item.disabled}
              >
                {item.label}
                {item.icon && (
                  <DropdownMenuShortcut>
                    <item.icon />
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <ButtonGroup>
      {items
        .filter((item) => item.type !== 'separator')
        .map((item, index) => {
          const buttonContent = (
            <Button
              onClick={item.href ? undefined : item.onClick}
              variant="outline"
              size="icon"
              disabled={item.disabled}
              asChild={!!item.href}
            >
              {item.href ? (
                <Link to={item.href}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                </Link>
              ) : (
                item.icon && <item.icon className="h-4 w-4" />
              )}
            </Button>
          )

          return (
            <Tooltip key={`tooltip-${index}`}>
              <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
    </ButtonGroup>
  )
}
