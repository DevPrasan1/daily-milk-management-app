import{n as e}from"./chunk-DnJy8xQt.js";import{t}from"./jsx-runtime-DC6t-S6Q.js";import{n,t as r}from"./Button-B45iJbRo.js";import{a as i,i as a,r as o,t as s}from"./lucide-react-DoYxdJde.js";function c({icon:e,title:t,description:n,action:i,actionLabel:a}){return(0,l.jsxs)(`div`,{className:`flex flex-col items-center justify-center py-16 px-6 text-center`,children:[e&&(0,l.jsx)(`div`,{className:`w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4`,children:(0,l.jsx)(e,{className:`w-8 h-8 text-gray-400`})}),(0,l.jsx)(`h3`,{className:`text-base font-semibold text-gray-800 dark:text-gray-200 mb-1`,children:t}),n&&(0,l.jsx)(`p`,{className:`text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs`,children:n}),i&&a&&(0,l.jsx)(r,{onClick:i,children:a})]})}var l,u=e((()=>{n(),l=t(),c.__docgenInfo={description:``,methods:[],displayName:`EmptyState`}})),d,f,p,m,h,g,_;e((()=>{s(),u(),{fn:d}=__STORYBOOK_MODULE_TEST__,f={title:`UI/EmptyState`,component:c,tags:[`autodocs`],argTypes:{icon:{control:{type:`select`},options:[`Inbox`,`ShieldAlert`,`Award`],mapping:{Inbox:a,ShieldAlert:o,Award:i}},title:{control:`text`},description:{control:`text`},actionLabel:{control:`text`},action:{action:`clicked`}},args:{action:d()}},p={args:{icon:`Inbox`,title:`No items found`,description:`There are no active records in this list. Try creating a new one.`}},m={args:{icon:`Inbox`,title:`No Buyers Added Yet`,description:`Get started by adding your first buyer to record milk deliveries.`,actionLabel:`Add Buyer`,action:d()}},h={args:{icon:`ShieldAlert`,title:`Connection Lost`,description:`We encountered an error loading your data. Please check your internet connection.`,actionLabel:`Retry Connection`,action:d()}},g={args:{icon:`Award`,title:`All Caught Up!`,description:`You have cleared all pending milk delivery schedules for today.`}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'Inbox',
    title: 'No items found',
    description: 'There are no active records in this list. Try creating a new one.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'Inbox',
    title: 'No Buyers Added Yet',
    description: 'Get started by adding your first buyer to record milk deliveries.',
    actionLabel: 'Add Buyer',
    action: fn()
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'ShieldAlert',
    title: 'Connection Lost',
    description: 'We encountered an error loading your data. Please check your internet connection.',
    actionLabel: 'Retry Connection',
    action: fn()
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    icon: 'Award',
    title: 'All Caught Up!',
    description: 'You have cleared all pending milk delivery schedules for today.'
  }
}`,...g.parameters?.docs?.source}}},_=[`Default`,`WithAction`,`ErrorState`,`Milestone`]}))();export{p as Default,h as ErrorState,g as Milestone,m as WithAction,_ as __namedExportsOrder,f as default};