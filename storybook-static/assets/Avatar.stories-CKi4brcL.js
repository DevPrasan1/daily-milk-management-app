import{n as e}from"./chunk-DnJy8xQt.js";import{t}from"./jsx-runtime-DC6t-S6Q.js";import{n,t as r}from"./clsx-81pRbOPU.js";function i({name:e,photo:t,size:n=`md`,className:i}){let o={sm:`w-8 h-8 text-xs`,md:`w-10 h-10 text-sm`,lg:`w-14 h-14 text-base`,xl:`w-20 h-20 text-xl`},s=e?e.trim().split(` `).map(e=>e[0]).slice(0,2).join(``).toUpperCase():`?`;return t?(0,a.jsx)(`img`,{src:t,alt:e,className:r(`rounded-full object-cover`,o[n],i)}):(0,a.jsx)(`div`,{className:r(`rounded-full bg-[#1D9E75]/20 text-[#1D9E75] font-semibold flex items-center justify-center`,o[n],i),children:s})}var a,o=e((()=>{n(),a=t(),i.__docgenInfo={description:``,methods:[],displayName:`Avatar`,props:{size:{defaultValue:{value:`'md'`,computed:!1},required:!1}}}})),s,c,l,u,d,f,p;e((()=>{o(),s={title:`UI/Avatar`,component:i,tags:[`autodocs`],argTypes:{size:{control:{type:`select`},options:[`sm`,`md`,`lg`,`xl`]},name:{control:`text`},photo:{control:`text`}}},c={args:{name:`John Doe`,size:`md`}},l={args:{name:`Jane Doe`,photo:`https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150`,size:`lg`}},u={args:{name:`Jane Doe`,size:`sm`}},d={args:{name:`Jane Doe`,size:`xl`}},f={args:{size:`md`}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'John Doe',
    size: 'md'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'Jane Doe',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    size: 'lg'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'Jane Doe',
    size: 'sm'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'Jane Doe',
    size: 'xl'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...f.parameters?.docs?.source}}},p=[`Default`,`WithPhoto`,`Small`,`ExtraLarge`,`MissingName`]}))();export{c as Default,d as ExtraLarge,f as MissingName,u as Small,l as WithPhoto,p as __namedExportsOrder,s as default};