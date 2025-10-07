import React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cnExt } from './cn';

const Switch = React.forwardRef(({ className, disabled, ...rest }, forwardedRef) => {
  return (
    <SwitchPrimitives.Root
      className={cnExt(
        'group/switch block h-5 w-8 shrink-0 p-0.5 outline-none focus:outline-none',
        className,
      )}
      ref={forwardedRef}
      disabled={disabled}
      {...rest}
    >
      <div
        className={cnExt(
          // base
          'h-4 w-7 rounded-full bg-[#C8C3D4] p-0.5 outline-none',
          'transition duration-200 ease-out',
          !disabled && [
            // hover
            'group-hover/switch:bg-gray-300',
            // focus
            'group-focus-visible/switch:bg-gray-300',
            // pressed
            'group-active/switch:bg-gray-200',
            // checked
            'group-data-[state=checked]/switch:bg-[#230C50]',
            // checked hover
            'group-hover:data-[state=checked]/switch:bg-[#C8C3D4]',
            // checked pressed
            'group-active:data-[state=checked]/switch:bg-indigo-600',
            // focus
            'group-focus/switch:outline-none',
          ],
          // disabled
          disabled && [
            'bg-white p-[3px] ring-1 ring-inset ring-gray-200',
          ],
        )}
      >
        <SwitchPrimitives.Thumb
          className={cnExt(
            // base
            'pointer-events-none relative block h-3 w-3 rounded-full',
            'transition-transform duration-200 ease-out',
            // checked
            'data-[state=checked]:translate-x-3',
            !disabled && [
              // before
              'before:absolute before:inset-y-0 before:left-1/2 h-[12px] before:h-3 before:w-3 before:-translate-x-1/2 before:rounded-full before:bg-white',
              'before:[mask:--mask]',
              // after
              'after:absolute after:inset-y-0 after:left-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:rounded-full after:shadow-md',
              // pressed
              'group-active/switch:scale-90',
            ],
            // disabled
            disabled && [
              'h-2.5 w-2.5 rounded-full bg-gray-200 shadow-none',
            ],
          )}
          style={{
            '--mask': 'radial-gradient(circle farthest-side at 50% 50%, #0000 1.95px, #000 2.05px 100%) 50% 50%/100% 100% no-repeat',
          }}
        />
      </div>
    </SwitchPrimitives.Root>
  );
});

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch as Root };
