import { ModelSvg } from '@/components/icons';
import { AppstoreFilled, BulbOutlined, DingdingOutlined, PlusOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { ConfigProvider, Tabs } from 'antd';
import { t } from 'i18next';
import { useRouter } from 'next/router';
import React from 'react';
import './style.css';
import { AppWindow, Lightbulb, MessageSquare, Plus, Search, AlertTriangle } from 'lucide-react';

function ConstructLayout({ children }: { children: React.ReactNode }) {
  const items = [
    {
      key: 'app',
      name: t('App'),
      path: '/app',
      icon: <AppWindow className="w-5 h-5" />,
      // operations: (
      //   <Button
      //     className='border-none text-white bg-button-gradient h-full flex items-center'
      //     icon={<PlusOutlined className='text-base' />}
      //     // onClick={handleCreate}
      //   >
      //     {t('create_app')}
      //   </Button>
      // ),
    },
    // {
    //   key: 'flow',
    //   name: t('awel_flow'),
    //   icon: <Plus className="w-5 h-5" />,
    //   path: '/flow',
    // },
    {
      key: 'models',
      name: t('model_manage'),
      path: '/models',
      icon: <ModelSvg />,
    },
    {
      key: 'database',
      name: t('Database'),
      icon: <Lightbulb className="w-5 h-5" />,
      path: '/database',
    },
    {
      key: 'knowledge',
      name: t('Knowledge_Space'),
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/knowledge',
    },
    // {
    //   key: 'agent',
    //   name: t('Plugins'),
    //   path: '/agent',
    //   icon: <BuildOutlined />,
    // },
    {
      key: 'prompt',
      name: t('Prompt'),
      icon: <DingdingOutlined className="w-5 h-5" />,
      path: '/prompt',
    },
    // {
    //   key: 'dbgpts',
    //   name: t('dbgpts_community'),
    //   path: '/dbgpts',
    //   icon: <Plus className="w-5 h-5" />,
    // },
  ];
  const router = useRouter();
  const activeKey = router.pathname.split('/')[2];
  // const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches; // unused

  return (
    <div className='flex flex-col h-full w-full  dark:bg-gradient-dark bg-gradient-light bg-cover bg-center'>
      <ConfigProvider
        theme={{
          components: {
            Button: {
              // defaultBorderColor: 'white',
            },
            Segmented: {
              itemSelectedBg: '#2867f5',
              itemSelectedColor: 'white',
            },
          },
        }}
      >
        <Tabs
          // tabBarStyle={{
          //   background: '#edf8fb',
          //   border: 'none',
          //   height: '3.5rem',
          //   padding: '0 1.5rem',
          //   color: !isDarkMode ? 'white' : 'black',
          // }}
          activeKey={activeKey}
          items={items.map(items => {
            return {
              key: items.key,
              label: items.name,
              children: children,
              icon: items.icon,
            };
          })}
          onTabClick={key => {
            router.push(`/construct/${key}`);
          }}
          // tabBarExtraContent={
          //   <Button
          //     className='border-none text-white bg-button-gradient h-full flex items-center'
          //     icon={<PlusOutlined className='text-base' />}
          //     // onClick={handleCreate}
          //   >
          //     {t('create_app')}
          //   </Button>
          // }
        />
      </ConfigProvider>
    </div>
  );
}

export default ConstructLayout;
