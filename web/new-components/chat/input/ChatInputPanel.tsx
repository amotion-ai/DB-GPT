import { ChatContentContext } from '@/pages/chat';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Input, Spin } from 'antd';
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Send, Paperclip, Mic, Smile } from 'lucide-react';

import { UserChatContent } from '@/types/chat';
import { parseResourceValue } from '@/utils';
import ToolsBar from './ToolsBar';

const ChatInputPanel: React.FC<{ ctrl: AbortController }> = ({ ctrl }) => {
  const { t } = useTranslation();
  const {
    scrollRef,
    replyLoading,
    handleChat,
    appInfo,
    currentDialogue,
    temperatureValue,
    maxNewTokensValue,
    resourceValue,
    setResourceValue,
    refreshDialogList,
  } = useContext(ChatContentContext);

  const searchParams = useSearchParams();
  const scene = searchParams?.get('scene') ?? '';
  const select_param = searchParams?.get('select_param') ?? '';

  const [userInput, setUserInput] = useState<string>('');
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [isZhInput, setIsZhInput] = useState<boolean>(false);

  const submitCountRef = useRef(0);

  const paramKey: string[] = useMemo(() => {
    return appInfo.param_need?.map(i => i.type) || [];
  }, [appInfo.param_need]);

  const onSubmit = async () => {
    submitCountRef.current++;
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current?.scrollHeight,
        behavior: 'smooth',
      });
      setUserInput('');
    }, 0);
    const resources = parseResourceValue(resourceValue);
    // Clear the resourceValue if it not empty
    let newUserInput: UserChatContent;
    if (resources.length > 0) {
      if (scene !== 'chat_excel') {
        // Chat Excel scene does not need to clear the resourceValue
        // We need to find a better way to handle this
        setResourceValue(null);
      }
      const messages = [...resources];
      messages.push({
        type: 'text',
        text: userInput,
      });
      newUserInput = {
        role: 'user',
        content: messages,
      };
    } else {
      newUserInput = userInput;
    }
    await handleChat(newUserInput, {
      app_code: appInfo.app_code || '',
      ...(paramKey.includes('temperature') && { temperature: temperatureValue }),
      ...(paramKey.includes('max_new_tokens') && { max_new_tokens: maxNewTokensValue }),
      select_param,
      ...(paramKey.includes('resource') && {
        select_param:
          typeof resourceValue === 'string'
            ? resourceValue
            : JSON.stringify(resourceValue) || currentDialogue.select_param,
      }),
    });
    // 如果应用进来第一次对话，刷新对话列表
    if (submitCountRef.current === 1) {
      await refreshDialogList();
    }
  };

  return (
    <div className='flex flex-col w-5/6 mx-auto pt-6 pb-8 bg-transparent'>
      {/* Enhanced Input Container */}
      <div
        className={classNames(
          'relative group',
          'bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl',
          'border border-white/30 dark:border-gray-700/50',
          'rounded-2xl shadow-lg hover:shadow-xl',
          'transition-all duration-300',
          isFocus && 'ring-2 ring-blue-500/50 border-blue-500/50'
        )}
        id='input-panel'
      >
        {/* Tools Bar */}
        <div className="px-4 pt-4">
          <ToolsBar ctrl={ctrl} />
        </div>

        {/* Input Area */}
        <div className="relative px-4 pb-4">
          <Input.TextArea
            placeholder={t('input_tips')}
            className={classNames(
              'w-full min-h-[80px] max-h-[200px]',
              'resize-none border-0 p-0',
              'bg-transparent',
              'text-gray-800 dark:text-gray-200',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:shadow-none focus:outline-none',
              'text-sm leading-relaxed'
            )}
            value={userInput}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  return;
                }
                if (isZhInput) {
                  return;
                }
                e.preventDefault();
                if (!userInput.trim() || replyLoading) {
                  return;
                }
                onSubmit();
              }
            }}
            onChange={e => {
              setUserInput(e.target.value);
            }}
            onFocus={() => {
              setIsFocus(true);
            }}
            onBlur={() => setIsFocus(false)}
            onCompositionStart={() => setIsZhInput(true)}
            onCompositionEnd={() => setIsZhInput(false)}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                title="Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            {/* Send Button */}
            <button
              className={classNames(
                'flex items-center justify-center gap-2',
                'px-6 py-2 rounded-xl text-sm font-medium',
                'transition-all duration-300 transform',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                userInput.trim() && !replyLoading
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
              onClick={() => {
                if (replyLoading || !userInput.trim()) {
                  return;
                }
                onSubmit();
              }}
              disabled={replyLoading || !userInput.trim()}
            >
              {replyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('sent')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Focus Indicator */}
        {isFocus && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-500/20 pointer-events-none"></div>
        )}
      </div>

      {/* Character Count */}
      {userInput.length > 0 && (
        <div className="flex justify-end mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {userInput.length} characters
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatInputPanel;
