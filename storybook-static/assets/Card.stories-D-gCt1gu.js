import{n as e}from"./chunk-DnJy8xQt.js";import{t}from"./jsx-runtime-DC6t-S6Q.js";import{n,t as r}from"./clsx-81pRbOPU.js";function i({children:e,className:t,onClick:n,padding:i=!0}){return(0,a.jsx)(`div`,{onClick:n,className:r(`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700`,`shadow-sm`,i&&`p-4`,n&&`cursor-pointer active:scale-[0.98] transition-transform`,t),children:e})}var a,o=e((()=>{n(),a=t(),i.__docgenInfo={description:``,methods:[],displayName:`Card`,props:{padding:{defaultValue:{value:`true`,computed:!1},required:!1}}}})),s,c,l,u,d,f,p;e((()=>{o(),s=t(),{fn:c}=__STORYBOOK_MODULE_TEST__,l={title:`UI/Card`,component:i,tags:[`autodocs`],argTypes:{padding:{control:`boolean`},onClick:{action:`clicked`}},args:{onClick:c()}},u={args:{padding:!0,children:(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h4`,{className:`text-lg font-bold text-gray-900 dark:text-gray-100`,children:`Card Title`}),(0,s.jsx)(`p`,{className:`text-sm text-gray-500 dark:text-gray-400 mt-1`,children:`This is a standard card component with padding enabled.`})]})}},d={args:{padding:!0,onClick:c(),children:(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h4`,{className:`text-lg font-bold text-[#1D9E75]`,children:`Interactive Card`}),(0,s.jsx)(`p`,{className:`text-sm text-gray-500 dark:text-gray-400 mt-1`,children:`Clicking this card trigger a scale animation and fires the onClick action.`})]})}},f={args:{padding:!1,children:(0,s.jsx)(`div`,{className:`bg-gray-100 dark:bg-gray-700 p-8 rounded-2xl text-center`,children:(0,s.jsx)(`p`,{className:`text-sm text-gray-700 dark:text-gray-300`,children:`Custom inner content padding.`})})}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    padding: true,
    children: <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Card Title</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This is a standard card component with padding enabled.</p>
      </div>
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    padding: true,
    onClick: fn(),
    children: <div>
        <h4 className="text-lg font-bold text-[#1D9E75]">Interactive Card</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Clicking this card trigger a scale animation and fires the onClick action.</p>
      </div>
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    padding: false,
    children: <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-2xl text-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">Custom inner content padding.</p>
      </div>
  }
}`,...f.parameters?.docs?.source}}},p=[`Default`,`Interactive`,`NoPadding`]}))();export{u as Default,d as Interactive,f as NoPadding,p as __namedExportsOrder,l as default};