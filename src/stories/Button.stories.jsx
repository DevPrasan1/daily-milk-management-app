import { fn } from 'storybook/test'
import Button from '@/components/ui/Button'

export default {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'full'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: fn(),
  },
}

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const Outline = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
}

export const Ghost = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

export const Danger = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
}

export const Loading = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
}

export const Disabled = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
}

export const Small = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
}

export const Large = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
}

export const FullWidth = {
  args: {
    size: 'full',
    children: 'Full Width Button',
  },
}
