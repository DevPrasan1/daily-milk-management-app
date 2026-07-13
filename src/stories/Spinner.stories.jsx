import Spinner, { FullPageSpinner } from '@/components/ui/Spinner'

export default {
  title: 'UI/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
}

export const Default = {
  args: {
    size: 'md',
  },
}

export const Small = {
  args: {
    size: 'sm',
  },
}

export const Large = {
  args: {
    size: 'lg',
  },
}

export const FullPage = {
  render: () => <FullPageSpinner />,
}
