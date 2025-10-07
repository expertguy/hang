// AlignUI Label v0.0.0
'use client';
import * as React from 'react';
import * as LabelPrimitives from '@radix-ui/react-label';
import { cnExt } from './cn';

const LabelRoot = React.forwardRef((props, forwardedRef) => {
  const { className, disabled, ...rest } = props;
  
  return (
    <LabelPrimitives.Root
      ref={forwardedRef}
      className={cnExt(
        'group cursor-pointer fs_14 text-[#211A30]',
        'flex items-center gap-px',
        // disabled
        'aria-disabled:text-text-disabled-300',
        className,
      )}
      aria-disabled={disabled}
      {...rest}
    />
  );
});

LabelRoot.displayName = 'LabelRoot';

function LabelAsterisk(props) {
  const { className, children, ...rest } = props;
  
  return (
    <span
      className={cnExt(
        'text-primary-base',
        // disabled
        'group-aria-disabled:text-text-disabled-300',
        className,
      )}
      {...rest}
    >
      {children || '*'}
    </span>
  );
}

function LabelSub(props) {
  const { children, className, ...rest } = props;
  
  return (
    <span
      className={cnExt(
        'text-paragraph-sm text-text-sub-600',
        // disabled
        'group-aria-disabled:text-text-disabled-300',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export { LabelRoot as Root, LabelAsterisk as Asterisk, LabelSub as Sub };