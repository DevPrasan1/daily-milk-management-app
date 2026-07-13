import Avatar from '@/components/ui/Avatar'

export default {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    name: {
      control: 'text',
    },
    photo: {
      control: 'text',
    },
  },
}

export const Default = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
}

export const WithPhoto = {
  args: {
    name: 'Jane Doe',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    size: 'lg',
  },
}

export const Small = {
  args: {
    name: 'Jane Doe',
    size: 'sm',
  },
}

export const ExtraLarge = {
  args: {
    name: 'Jane Doe',
    size: 'xl',
  },
}

export const MissingName = {
  args: {
    size: 'md',
  },
}
