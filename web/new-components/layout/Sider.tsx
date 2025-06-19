import { ChatContext } from '@/app/chat-context';
import { DarkSvg, SunnySvg } from '@/components/icons';
import UserBar from '@/new-components/layout/UserBar';
import { STORAGE_LANG_KEY, STORAGE_THEME_KEY } from '@/utils/constants/index';
import { Moon, Sun, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout, Popover } from 'antd';
import moment from 'moment';
import Link from 'next/link';
import React, { ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingItem {
  key: string;
  name: string;
  icon: ReactNode;
  onClick?: () => void;
  placement?: 'top' | 'topLeft';
}

const Sider: React.FC = () => {
  const { mode, setMode } = useContext(ChatContext);
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // 切换主题
  const handleToggleTheme = useCallback(() => {
    const theme = mode === 'light' ? 'dark' : 'light';
    setMode(theme);
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [mode, setMode]);

  // 切换语言
  const handleChangeLang = useCallback(() => {
    const language = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(language);
    if (language === 'zh') {
      moment.locale('zh-cn');
    }
    if (language === 'en') {
      moment.locale('en');
    }
    localStorage.setItem(STORAGE_LANG_KEY, language);
  }, [i18n]);

  // 展开或收起
  const handleToggleMenu = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const settings: SettingItem[] = useMemo(() => {
    return [
      {
        key: 'theme',
        name: t('Theme'),
        icon: mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />,
        onClick: handleToggleTheme,
      },
      {
        key: 'language',
        name: t('language'),
        icon: <Globe className="w-5 h-5" />,
        onClick: handleChangeLang,
      },
      {
        key: 'fold',
        name: t(collapsed ? 'Show_Sidebar' : 'Close_Sidebar'),
        icon: collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />,
        onClick: handleToggleMenu,
      },
    ];
  }, [collapsed, handleChangeLang, handleToggleMenu, handleToggleTheme, mode, t]);

  return (
    <Layout.Sider
      theme={mode}
      width={240}
      collapsedWidth={80}
      collapsible={true}
      collapsed={collapsed}
      trigger={null}
      className='flex flex-1 flex-col h-full justify-between bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-6 pt-6'
    >
      {collapsed ? (
        <></>
      ) : (
        <>
          <Link href='/' className='flex items-center justify-center p-2 pb-6'>
            <span className='text-xl font-bold text-gray-900 dark:text-white'>DB Copolit</span>
          </Link>
          <div></div>
          <div className='flex flex-col'>
            <div className='flex items-center w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4'>
              <div className='w-full'>
                <UserBar />
              </div>
            </div>
            <div className='flex items-center justify-center py-3 border-t border-gray-200 dark:border-gray-700'>
              {settings.map(item => (
                <Popover key={item.key} content={item.name}>
                  <div
                    className='flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200'
                    onClick={item.onClick}
                  >
                    {item.icon}
                  </div>
                </Popover>
              ))}
            </div>
          </div>
        </>
      )}
    </Layout.Sider>
  );
};

export default Sider;
