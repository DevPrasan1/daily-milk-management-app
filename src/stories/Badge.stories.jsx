import Badge from '@/components/ui/Badge'

export default {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['green', 'amber', 'red', 'gray', 'teal'],
    },
    children: {
      control: 'text',
    },
  },
}

export const Gray = {
  args: {
    variant: 'gray',
    children: 'Pending',
  },
}

export const Green = {
  args: {
    variant: 'green',
    children: 'Active',
  },
}

export const Amber = {
  args: {
    variant: 'amber',
    children: 'Warning',
  },
}

export const Red = {
  args: {
    variant: 'red',
    children: 'Inactive',
  },
}

export const Teal = {
  args: {
    variant: 'teal',
    children: 'New Partner',
  },
}
