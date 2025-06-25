import { apiInterceptors, collectApp, unCollectApp } from '@/client/api';
import { ChatContentContext } from '@/pages/chat';
import { ExportOutlined, LoadingOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Spin, Tag, Typography, message } from 'antd';
import copy from 'copy-to-clipboard';
import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRequest } from 'ahooks';
import AppDefaultIcon from '../../common/AppDefaultIcon';
import { Share2, Loader2, Star, Sparkles, MessageSquare, Zap } from 'lucide-react';

const tagColors = ['magenta', 'orange', 'geekblue', 'purple', 'cyan', 'green'];

const ChatHeader: React.FC<{ isScrollToTop: boolean }> = ({ isScrollToTop }) => {
  const { appInfo, refreshAppInfo, handleChat, scrollRef, temperatureValue, resourceValue, currentDialogue } =
    useContext(ChatContentContext);

  const { t } = useTranslation();

  const appScene = useMemo(() => {
    return appInfo?.team_context?.chat_scene || 'chat_agent';
  }, [appInfo]);

  // 应用收藏状态
  const isCollected = useMemo(() => {
    return appInfo?.is_collected === 'true';
  }, [appInfo]);

  const { run: operate, loading } = useRequest(
    async () => {
      const [error] = await apiInterceptors(
        isCollected ? unCollectApp({ app_code: appInfo.app_code }) : collectApp({ app_code: appInfo.app_code }),
      );
      if (error) {
        return;
      }
      return await refreshAppInfo();
    },
    {
      manual: true,
    },
  );

  const paramKey: string[] = useMemo(() => {
    return appInfo.param_need?.map(i => i.type) || [];
  }, [appInfo.param_need]);

  if (!Object.keys(appInfo).length) {
    return null;
  }

  const shareApp = async () => {
    const success = copy(location.href);
    message[success ? 'success' : 'error'](success ? t('copy_success') : t('copy_failed'));
  };

  // 正常header
  const headerContent = () => {
    return (
      <header className='flex items-center justify-between w-full max-w-6xl mx-auto px-6 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/50 rounded-2xl shadow-lg transition-all duration-300 ease-in-out relative'>
        <div className='flex items-center flex-1 min-w-0'>
          <div className='flex w-14 h-14 justify-center items-center rounded-xl mr-4 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'>
            <AppDefaultIcon scene={appScene} width={20} height={20} />
          </div>
          <div className='flex flex-col flex-1 min-w-0'>
            <div className='flex items-center text-lg text-gray-800 dark:text-gray-200 font-semibold gap-3 mb-1'>
              <span className="truncate">{appInfo?.app_name}</span>
              <div className='flex gap-2 flex-shrink-0'>
                {appInfo?.team_mode && (
                  <Tag color='green' className="text-xs px-2 py-1 rounded-full">
                    {appInfo?.team_mode}
                  </Tag>
                )}
                {appInfo?.team_context?.chat_scene && (
                  <Tag color='cyan' className="text-xs px-2 py-1 rounded-full">
                    {appInfo?.team_context?.chat_scene}
                  </Tag>
                )}
              </div>
            </div>
            <Typography.Text
              className='text-sm text-gray-600 dark:text-gray-400 leading-6 truncate'
              ellipsis={{
                tooltip: true,
              }}
            >
              {appInfo?.app_describe}
            </Typography.Text>
          </div>
        </div>
        
        <div className='flex items-center gap-3 ml-4'>
          <button
            onClick={async () => {
              await operate();
            }}
            className='group flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-full cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105'
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <Star className={`w-5 h-5 transition-colors ${isCollected ? 'text-yellow-500 fill-current' : 'text-gray-500 group-hover:text-yellow-500'}`} />
            )}
          </button>
          <button
            onClick={shareApp}
            className='group flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-full cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105'
          >
            <Share2 className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>

        {/* Recommended Questions */}
        {!!appInfo?.recommend_questions?.length && (
          <div className='absolute bottom-[-60px] left-0 right-0'>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className='text-sm text-gray-600 dark:text-gray-400 font-medium'>Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {appInfo.recommend_questions.map((item, index) => (
                <button
                  key={item.id}
                  className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-full px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 hover:scale-105 cursor-pointer'
                  onClick={async () => {
                    handleChat(item?.question || '', {
                      app_code: appInfo.app_code,
                      ...(paramKey.includes('temperature') && { temperature: temperatureValue }),
                      ...(paramKey.includes('resource') && {
                        select_param:
                          typeof resourceValue === 'string'
                            ? resourceValue
                            : JSON.stringify(resourceValue) || currentDialogue.select_param,
                      }),
                    });
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({
                        top: scrollRef.current?.scrollHeight,
                        behavior: 'smooth',
                      });
                    }, 0);
                  }}
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    );
  };

  // 吸顶header
  const topHeaderContent = () => {
    return (
      <header className='flex items-center justify-between w-full h-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-white/30 dark:border-gray-700/50 px-6 transition-all duration-300 ease-in-out shadow-sm'>
        <div className='flex items-center flex-1 min-w-0'>
          <div className='flex items-center justify-center w-10 h-10 rounded-lg mr-3 bg-gradient-to-br from-blue-500 to-purple-600 shadow-md'>
            <AppDefaultIcon scene={appScene} width={16} height={16} />
          </div>
          <div className='flex items-center text-base text-gray-800 dark:text-gray-200 font-semibold gap-3 min-w-0'>
            <span className="truncate">{appInfo?.app_name}</span>
            <div className='flex gap-2 flex-shrink-0'>
              {appInfo?.team_mode && (
                <Tag color='green' className="text-xs px-2 py-1 rounded-full">
                  {appInfo?.team_mode}
                </Tag>
              )}
              {appInfo?.team_context?.chat_scene && (
                <Tag color='cyan' className="text-xs px-2 py-1 rounded-full">
                  {appInfo?.team_context?.chat_scene}
                </Tag>
              )}
            </div>
          </div>
        </div>
        
        <div className='flex items-center gap-3'>
          <button
            onClick={async () => {
              await operate();
            }}
            className='group flex items-center justify-center w-10 h-10 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-full cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105'
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Star className={`w-4 h-4 transition-colors ${isCollected ? 'text-yellow-500 fill-current' : 'text-gray-500 group-hover:text-yellow-500'}`} />
            )}
          </button>
          <button
            onClick={shareApp}
            className='group flex items-center justify-center w-10 h-10 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 rounded-full cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105'
          >
            <Share2 className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </header>
    );
  };

  return (
    <div
      className={`h-20 mt-6 ${
        appInfo?.recommend_questions && appInfo?.recommend_questions?.length > 0 ? 'mb-8' : 'mb-4'
      } sticky top-0 bg-transparent z-30 transition-all duration-300 ease-in-out`}
    >
      {isScrollToTop ? topHeaderContent() : headerContent()}
    </div>
  );
};

export default ChatHeader;
