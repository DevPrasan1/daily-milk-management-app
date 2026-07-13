import{a as e,n as t}from"./chunk-DnJy8xQt.js";import{j as n}from"./iframe-4-_2k7y2.js";import{t as r}from"./jsx-runtime-DC6t-S6Q.js";import{n as i,t as a}from"./clsx-81pRbOPU.js";var o,s,c,l=t((()=>{i(),o=e(n(),1),s=r(),c=(0,o.forwardRef)(function({label:e,error:t,hint:n,className:r,prefix:i,suffix:o,...c},l){return(0,s.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[e&&(0,s.jsx)(`label`,{className:`text-sm font-medium text-gray-700 dark:text-gray-300`,children:e}),(0,s.jsxs)(`div`,{className:`relative flex items-center`,children:[i&&(0,s.jsx)(`span`,{className:`absolute left-3 text-gray-500 dark:text-gray-400 text-sm select-none`,children:i}),(0,s.jsx)(`input`,{ref:l,min:c.type===`number`?c.min??`0`:c.min,onKeyDown:c.type===`number`?e=>{(e.key===`-`||e.key===`e`)&&e.preventDefault(),c.onKeyDown?.(e)}:c.onKeyDown,className:a(`w-full rounded-xl border px-4 py-3 text-sm min-h-[44px]`,`bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`,`placeholder:text-gray-400 dark:placeholder:text-gray-500`,`focus:outline-none focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent`,`transition-colors`,t?`border-red-400 dark:border-red-500`:`border-gray-200 dark:border-gray-700`,i&&`pl-10`,o&&`pr-12`,r),...c}),o&&(0,s.jsx)(`span`,{className:`absolute right-3 text-gray-500 dark:text-gray-400 text-sm select-none`,children:o})]}),t&&(0,s.jsx)(`p`,{className:`text-xs text-red-500`,children:t}),n&&!t&&(0,s.jsx)(`p`,{className:`text-xs text-gray-400`,children:n})]})}),c.__docgenInfo={description:``,methods:[],displayName:`Input`}})),u,d,f,p,m,h,g,_,v,y;t((()=>{l(),{fn:u}=__STORYBOOK_MODULE_TEST__,d={title:`UI/Input`,component:c,tags:[`autodocs`],argTypes:{label:{control:`text`},error:{control:`text`},hint:{control:`text`},prefix:{control:`text`},suffix:{control:`text`},disabled:{control:`boolean`},placeholder:{control:`text`},type:{control:{type:`select`},options:[`text`,`number`,`email`,`password`,`tel`]},onChange:{action:`changed`}},args:{onChange:u()}},f={args:{label:`Full Name`,placeholder:`Enter your name...`,type:`text`}},p={args:{label:`Price per Litre`,placeholder:`0.00`,type:`number`,prefix:`₹`}},m={args:{label:`Milk Quantity`,placeholder:`0.0`,type:`number`,suffix:`Litres`}},h={args:{label:`Amount Paid`,placeholder:`0`,type:`number`,prefix:`₹`,suffix:`INR`}},g={args:{label:`Mobile Number`,placeholder:`Enter 10-digit number`,type:`tel`,error:`Please enter a valid 10-digit phone number`}},_={args:{label:`Password`,placeholder:`Password`,type:`password`,hint:`Must be at least 8 characters long.`}},v={args:{label:`Email (Cannot change)`,placeholder:`user@example.com`,type:`email`,disabled:!0}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name...',
    type: 'text'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Price per Litre',
    placeholder: '0.00',
    type: 'number',
    prefix: '₹'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Milk Quantity',
    placeholder: '0.0',
    type: 'number',
    suffix: 'Litres'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Amount Paid',
    placeholder: '0',
    type: 'number',
    prefix: '₹',
    suffix: 'INR'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Mobile Number',
    placeholder: 'Enter 10-digit number',
    type: 'tel',
    error: 'Please enter a valid 10-digit phone number'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Password',
    placeholder: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters long.'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email (Cannot change)',
    placeholder: 'user@example.com',
    type: 'email',
    disabled: true
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`,`WithPrefix`,`WithSuffix`,`WithPrefixAndSuffix`,`WithError`,`WithHint`,`Disabled`]}))();export{f as Default,v as Disabled,g as WithError,_ as WithHint,p as WithPrefix,h as WithPrefixAndSuffix,m as WithSuffix,y as __namedExportsOrder,d as default};