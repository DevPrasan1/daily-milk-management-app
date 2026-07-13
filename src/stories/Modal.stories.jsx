import React, { useState } from 'react'
import { fn } from 'storybook/test'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

export default {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    onClose: { action: 'closed' },
  },
  args: {
    onClose: fn(),
  },
}

const Template = (args) => {
  const [open, setOpen] = useState(args.open ?? true)
  return (
    <div className="min-h-[300px]">
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...args} open={open} onClose={() => { setOpen(false); args.onClose(); }}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is the content area of the modal. You can place any form elements, text, or buttons here.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export const Default = {
  render: Template,
  args: {
    open: false,
    title: 'Confirm Delivery',
  },
}

export const WithoutTitle = {
  render: Template,
  args: {
    open: false,
  },
}
