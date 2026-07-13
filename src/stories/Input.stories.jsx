import { fn } from 'storybook/test'
import Input from '@/components/ui/Input'

export default {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    error: {
      control: 'text',
    },
    hint: {
      control: 'text',
    },
    prefix: {
      control: 'text',
    },
    suffix: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'number', 'email', 'password', 'tel'],
    },
    onChange: { action: 'changed' },
  },
  args: {
    onChange: fn(),
  },
}

export const Default = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name...',
    type: 'text',
  },
}

export const WithPrefix = {
  args: {
    label: 'Price per Litre',
    placeholder: '0.00',
    type: 'number',
    prefix: '₹',
  },
}

export const WithSuffix = {
  args: {
    label: 'Milk Quantity',
    placeholder: '0.0',
    type: 'number',
    suffix: 'Litres',
  },
}

export const WithPrefixAndSuffix = {
  args: {
    label: 'Amount Paid',
    placeholder: '0',
    type: 'number',
    prefix: '₹',
    suffix: 'INR',
  },
}

export const WithError = {
  args: {
    label: 'Mobile Number',
    placeholder: 'Enter 10-digit number',
    type: 'tel',
    error: 'Please enter a valid 10-digit phone number',
  },
}

export const WithHint = {
  args: {
    label: 'Password',
    placeholder: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters long.',
  },
}

export const Disabled = {
  args: {
    label: 'Email (Cannot change)',
    placeholder: 'user@example.com',
    type: 'email',
    disabled: true,
  },
}
