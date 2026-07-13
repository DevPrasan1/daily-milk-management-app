import { fn } from 'storybook/test'
import { Inbox, ShieldAlert, Award } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'

export default {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: ['Inbox', 'ShieldAlert', 'Award'],
      mapping: {
        Inbox: Inbox,
        ShieldAlert: ShieldAlert,
        Award: Award,
      },
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    actionLabel: {
      control: 'text',
    },
    action: { action: 'clicked' },
  },
  args: {
    action: fn(),
  },
}

export const Default = {
  args: {
    icon: 'Inbox',
    title: 'No items found',
    description: 'There are no active records in this list. Try creating a new one.',
  },
}

export const WithAction = {
  args: {
    icon: 'Inbox',
    title: 'No Buyers Added Yet',
    description: 'Get started by adding your first buyer to record milk deliveries.',
    actionLabel: 'Add Buyer',
    action: fn(),
  },
}

export const ErrorState = {
  args: {
    icon: 'ShieldAlert',
    title: 'Connection Lost',
    description: 'We encountered an error loading your data. Please check your internet connection.',
    actionLabel: 'Retry Connection',
    action: fn(),
  },
}

export const Milestone = {
  args: {
    icon: 'Award',
    title: 'All Caught Up!',
    description: 'You have cleared all pending milk delivery schedules for today.',
  },
}
