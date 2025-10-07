// cn.jsx - Fixed utility for conditional class names

import config from '../tailwind.config';
import clsx from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Safely access config properties with fallbacks
const texts = config?.texts || {};
const shadows = config?.shadows || {};
const borderRadii = config?.borderRadii || {};

export const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [
        {
          text: Object.keys(texts),
        },
      ],
      shadow: [
        {
          shadow: Object.keys(shadows),
        },
      ],
      rounded: [
        {
          rounded: Object.keys(borderRadii),
        },
      ],
    },
  },
};

const customTwMerge = extendTailwindMerge(twMergeConfig);

export function cnExt(...classes) {
  return customTwMerge(clsx(...classes));
}

export const cn = clsx;