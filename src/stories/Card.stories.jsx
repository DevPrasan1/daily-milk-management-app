import { fn } from 'storybook/test'
import Card from '@/components/ui/Card'

export default {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: fn(),
  },
}

export const Default = {
  args: {
    padding: true,
    children: (
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Card Title</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This is a standard card component with padding enabled.</p>
      </div>
    ),
  },
}

export const Interactive = {
  args: {
    padding: true,
    onClick: fn(),
    children: (
      <div>
        <h4 className="text-lg font-bold text-[#1D9E75]">Interactive Card</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Clicking this card triggers a scale animation and fires the onClick action.</p>
      </div>
    ),
  },
}

export const NoPadding = {
  args: {
    padding: false,
    children: (
      <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-2xl text-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">Custom inner content padding.</p>
      </div>
    ),
  },
}
