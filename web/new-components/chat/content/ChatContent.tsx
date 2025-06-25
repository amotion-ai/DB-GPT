import markdownComponents, { markdownPlugins, preprocessLaTeX } from '@/components/chat/chat-content/config';
import { IChatDialogueMessageSchema } from '@/types/chat';
import { STORAGE_USERINFO_KEY } from '@/utils/constants/index';
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  CodeOutlined,
  CopyOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { GPTVis } from '@antv/gpt-vis';
import { message } from 'antd';
import classNames from 'classnames';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Bot, User, Sparkles } from 'lucide-react';
import Feedback from './Feedback';
import RobotIcon from './RobotIcon';

const UserIcon: React.FC = () => {
  const user = JSON.parse(localStorage.getItem(STORAGE_USERINFO_KEY) ?? '');

  if (!user.avatar_url) {
    return (
      <div className='flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-sm text-white font-medium shadow-lg'>
        {user?.nick_name?.charAt(0)?.toUpperCase()}
      </div>
    );
  }
  return (
    <div className="relative">
      <Image
        className='rounded-full border-2 border-white/20 object-contain bg-white/10 backdrop-blur-sm shadow-lg'
        width={40}
        height={40}
        src={user?.avatar_url}
        alt={user?.nick_name}
      />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
    </div>
  );
};

type DBGPTView = {
  name: string;
  status: 'todo' | 'runing' | 'failed' | 'completed' | (string & {});
  result?: string;
  err_msg?: string;
};

type MarkdownComponent = Parameters<typeof GPTVis>['0']['components'];

const pluginViewStatusMapper: Record<DBGPTView['status'], { bgClass: string; icon: React.ReactNode; textClass: string }> = {
  todo: {
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-600 dark:text-gray-400',
    icon: <ClockCircleOutlined className='ml-2' />,
  },
  runing: {
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    icon: <LoadingOutlined className='ml-2' />,
  },
  failed: {
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    textClass: 'text-red-600 dark:text-red-400',
    icon: <CloseOutlined className='ml-2' />,
  },
  completed: {
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    textClass: 'text-green-600 dark:text-green-400',
    icon: <CheckOutlined className='ml-2' />,
  },
};

const formatMarkdownVal = (val: string) => {
  return val
    .replaceAll('\\n', '\n')
    .replace(/<table(\w*=[^>]+)>/gi, '<table $1>')
    .replace(/<tr(\w*=[^>]+)>/gi, '<tr $1>');
};

const formatMarkdownValForAgent = (val: string) => {
  return val?.replace(/<table(\w*=[^>]+)>/gi, '<table $1>').replace(/<tr(\w*=[^>]+)>/gi, '<tr $1>');
};

const ChatContent: React.FC<{
  content: Omit<IChatDialogueMessageSchema, 'context'> & {
    context:
      | string
      | {
          template_name: string;
          template_introduce: string;
        };
  };
  onLinkClick: () => void;
}> = ({ content, onLinkClick }) => {
  const { t } = useTranslation();

  const searchParams = useSearchParams();
  const scene = searchParams?.get('scene') ?? '';

  const { context, model_name, role, thinking } = content;

  const isRobot = useMemo(() => role === 'view', [role]);

  const { value, cachePluginContext } = useMemo<{
    relations: string[];
    value: string;
    cachePluginContext: DBGPTView[];
  }>(() => {
    if (typeof context !== 'string') {
      return {
        relations: [],
        value: '',
        cachePluginContext: [],
      };
    }
    const [value, relation] = context.split('\trelations:');
    const relations = relation ? relation.split(',') : [];
    const cachePluginContext: DBGPTView[] = [];

    let cacheIndex = 0;
    const result = value.replace(/<dbgpt-view[^>]*>[^<]*<\/dbgpt-view>/gi, matchVal => {
      try {
        const pluginVal = matchVal.replaceAll('\n', '\\n').replace(/<[^>]*>|<\/[^>]*>/gm, '');
        const pluginContext = JSON.parse(pluginVal) as DBGPTView;
        const replacement = `<custom-view>${cacheIndex}</custom-view>`;

        cachePluginContext.push({
          ...pluginContext,
          result: formatMarkdownVal(pluginContext.result ?? ''),
        });
        cacheIndex++;

        return replacement;
      } catch (e) {
        console.log((e as any).message, e);
        return matchVal;
      }
    });
    return {
      relations,
      cachePluginContext,
      value: result,
    };
  }, [context]);

  const extraMarkdownComponents = useMemo<MarkdownComponent>(
    () => ({
      'custom-view'({ children }) {
        const index = +children.toString();
        if (!cachePluginContext[index]) {
          return children;
        }
        const { name, status, err_msg, result } = cachePluginContext[index];
        const { bgClass, icon, textClass } = pluginViewStatusMapper[status] ?? {};
        return (
          <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden my-4 flex flex-col lg:max-w-[85%] border border-white/20 dark:border-gray-700/50 shadow-lg'>
            <div className={classNames('flex px-6 py-3 items-center text-sm font-medium', bgClass, textClass)}>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                {name}
              </div>
              {icon}
            </div>
            {result ? (
              <div className='px-6 py-4 text-sm bg-white/50 dark:bg-gray-900/50'>
                <GPTVis components={markdownComponents} {...markdownPlugins}>
                  {preprocessLaTeX(result ?? '')}
                </GPTVis>
              </div>
            ) : (
              <div className='px-6 py-4 text-sm bg-white/50 dark:bg-gray-900/50'>{err_msg}</div>
            )}
          </div>
        );
      },
    }),
    [cachePluginContext],
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t('copy_success'));
    } catch (err) {
      message.error(t('copy_failed'));
    }
  };

  return (
    <div className='flex gap-4 mt-8 group hover:bg-white/5 dark:hover:bg-gray-800/5 rounded-2xl p-4 transition-all duration-300'>
      {/* Avatar */}
      <div className='flex flex-shrink-0 items-start pt-2'>
        {isRobot ? (
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        ) : (
          <UserIcon />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-1 flex-col min-w-0 ${scene === 'chat_agent' && !thinking ? 'flex-1' : ''}`}>
        {/* Message Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isRobot ? 'AI Assistant' : 'You'}
            </span>
            {isRobot && model_name && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {model_name}
              </span>
            )}
          </div>
          {!isRobot && (
            <button
              onClick={() => handleCopy(typeof context === 'string' ? context : '')}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Message Bubble */}
        <div className={classNames(
          'relative rounded-2xl p-6 shadow-sm transition-all duration-300',
          isRobot 
            ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/50' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
        )}>
          {/* Thinking indicator */}
          {thinking && (
            <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          )}

          {/* Message Content */}
          <div className={classNames(
            'text-sm leading-relaxed',
            isRobot ? 'text-gray-800 dark:text-gray-200' : 'text-white'
          )}>
            {!isRobot && typeof context === 'string' && (
              <div className="whitespace-pre-wrap break-words">
                <GPTVis
                  components={{
                    ...markdownComponents,
                    img: ({ src, alt, ...props }) => (
                      <img
                        src={src}
                        alt={alt || 'image'}
                        className='max-w-full md:max-w-[80%] lg:max-w-[70%] object-contain rounded-lg shadow-md'
                        style={{ maxHeight: '300px' }}
                        {...props}
                      />
                    ),
                  }}
                  {...markdownPlugins}
                >
                  {formatMarkdownValForAgent(context)}
                </GPTVis>
              </div>
            )}

            {isRobot && typeof context === 'string' && (
              <div className="whitespace-pre-wrap break-words">
                <GPTVis
                  components={{
                    ...markdownComponents,
                    ...extraMarkdownComponents,
                    img: ({ src, alt, ...props }) => (
                      <img
                        src={src}
                        alt={alt || 'image'}
                        className='max-w-full md:max-w-[80%] lg:max-w-[70%] object-contain rounded-lg shadow-md'
                        style={{ maxHeight: '300px' }}
                        {...props}
                      />
                    ),
                    code: ({ children, ...props }) => (
                      <code
                        {...props}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono"
                      >
                        {children}
                      </code>
                    ),
                    pre: ({ children, ...props }) => (
                      <pre
                        {...props}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-4 rounded-lg overflow-x-auto my-4"
                      >
                        {children}
                      </pre>
                    ),
                  }}
                  {...markdownPlugins}
                >
                  {formatMarkdownValForAgent(value)}
                </GPTVis>
              </div>
            )}

            {typeof context !== 'string' && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                  {context.template_name}
                </h3>
                <p className="text-purple-700 dark:text-purple-400 text-sm">
                  {context.template_introduce}
                </p>
              </div>
            )}
          </div>

          {/* Feedback Section */}
          {isRobot && !thinking && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Feedback content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatContent);
