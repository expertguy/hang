'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { RiArrowRightSLine } from '@remixicon/react';
import { cnExt } from './cn';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuCheckboxItem = DropdownMenuPrimitive.CheckboxItem;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const DropdownMenuRadioItem = DropdownMenuPrimitive.RadioItem;
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
const DropdownMenuArrow = DropdownMenuPrimitive.Arrow;

const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 8, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={forwardedRef}
      sideOffset={sideOffset}
      className={cnExt(
        'z-50 w-72 overflow-hidden rounded-xl bg-white p-2 shadow-lg ring-1 ring-inset ring-gray-200',
        'flex flex-col gap-1',
        // origin animations using data attributes
        'data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom',
        // state animations
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...rest}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(({ className, inset, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    ref={forwardedRef}
    className={cnExt(
      'group/item relative cursor-pointer select-none rounded-lg p-2 text-sm text-gray-900 outline-none',
      'flex items-center gap-2',
      'transition-colors duration-200',
      'data-[highlighted]:bg-gray-50',
      'focus:outline-none',
      'data-[disabled]:text-gray-300',
      inset && 'pl-9',
      className,
    )}
    {...rest}
  />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

function DropdownItemIcon({ className, as: Component = 'div', ...rest }) {
  return (
    <Component
      className={cnExt(
        'h-5 w-5 text-gray-600',
        'group-has-[[data-disabled]]:text-gray-300',
        className,
      )}
      {...rest}
    />
  );
}
DropdownItemIcon.displayName = 'DropdownItemIcon';

const DropdownMenuGroup = React.forwardRef(({ className, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Group
    ref={forwardedRef}
    className={cnExt('flex flex-col gap-1', className)}
    {...rest}
  />
));
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

const DropdownMenuLabel = React.forwardRef(({ className, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.Label
    ref={forwardedRef}
    className={cnExt(
      'px-2 py-1 text-xs font-semibold uppercase text-gray-400',
      className,
    )}
    {...rest}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={forwardedRef}
    className={cnExt(
      'group/item relative cursor-pointer select-none rounded-lg p-2 text-sm text-gray-900 outline-none',
      'flex items-center gap-2',
      'transition-colors duration-200',
      'data-[highlighted]:bg-gray-50',
      'data-[disabled]:text-gray-300',
      inset && 'pl-9',
      className,
    )}
    {...rest}
  >
    {children}
    <span className='flex-1' />
    <DropdownItemIcon as={RiArrowRightSLine} />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

const DropdownMenuSubContent = React.forwardRef(({ className, ...rest }, forwardedRef) => (
  <DropdownMenuPrimitive.SubContent
    ref={forwardedRef}
    className={cnExt(
      'z-999 w-max overflow-hidden rounded-xl bg-white p-2 shadow-lg ring-1 ring-inset ring-gray-200',
      'flex flex-col gap-1',
      // animations
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...rest}
  />
));
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

export {
  DropdownMenu as Root,
  DropdownMenuPortal as Portal,
  DropdownMenuTrigger as Trigger,
  DropdownMenuContent as Content,
  DropdownMenuItem as Item,
  DropdownItemIcon as ItemIcon,
  DropdownMenuGroup as Group,
  DropdownMenuLabel as Label,
  DropdownMenuSub as MenuSub,
  DropdownMenuSubTrigger as MenuSubTrigger,
  DropdownMenuSubContent as MenuSubContent,
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRadioItem as RadioItem,
  DropdownMenuSeparator as Separator,
  DropdownMenuArrow as Arrow,
};