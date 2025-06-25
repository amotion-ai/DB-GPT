import { ChatContext } from '@/app/chat-context';
import { apiInterceptors, getAppInfo } from '@/client/api';
import MonacoEditor from '@/components/chat/monaco-editor';
import ChatContent from '@/new-components/chat/content/ChatContent';
import { ChatContentContext } from '@/pages/chat';
import { IApp } from '@/types/app';
import { IChatDialogueMessageSchema } from '@/types/chat';
import { STORAGE_INIT_MESSAGE_KET, getInitMessage } from '@/utils';
import { useAsyncEffect } from 'ahooks';
import { Modal } from 'antd';
import { cloneDeep } from 'lodash';
import { useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Code, MessageSquare } from 'lucide-react';

const ChatCompletion: React.FC = () => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const chatId = searchParams?.get('id') ?? '';

  const { currentDialogInfo, model } = useContext(ChatContext);
  const {
    history,
    handleChat,
    refreshDialogList,
    setAppInfo,
    setModelValue,
    setTemperatureValue,
    setMaxNewTokensValue,
    setResourceValue,
  } = useContext(ChatContentContext);

  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState<string>('');

  const showMessages = useMemo(() => {
    const tempMessage: IChatDialogueMessageSchema[] = cloneDeep(history);
    return tempMessage
      .filter(item => ['view', 'human'].includes(item.role))
      .map(item => {
        return {
          ...item,
          key: uuid(),
        };
      });
  }, [history]);

  useAsyncEffect(async () => {
    const initMessage = getInitMessage();
    if (initMessage && initMessage.id === chatId) {
      const [, res] = await apiInterceptors(
        getAppInfo({
          ...currentDialogInfo,
        }),
      );
      if (res) {
        const paramKey: string[] = res?.param_need?.map(i => i.type) || [];
        const resModel = res?.param_need?.filter(item => item.type === 'model')[0]?.value || model;
        const temperature = res?.param_need?.filter(item => item.type === 'temperature')[0]?.value || 0.6;
        const maxNewTokens = res?.param_need?.filter(item => item.type === 'max_new_tokens')[0]?.value || 4000;
        const resource = res?.param_need?.filter(item => item.type === 'resource')[0]?.bind_value;
        setAppInfo(res || ({} as IApp));
        setTemperatureValue(temperature || 0.6);
        setMaxNewTokensValue(maxNewTokens || 4000);
        setModelValue(resModel);
        setResourceValue(resource);
        await handleChat(initMessage.message, {
          app_code: res?.app_code,
          model_name: resModel,
          ...(paramKey?.includes('temperature') && { temperature }),
          ...(paramKey?.includes('max_new_tokens') && { max_new_tokens: maxNewTokens }),
          ...(paramKey.includes('resource') && {
            select_param: typeof resource === 'string' ? resource : JSON.stringify(resource),
          }),
        });
        await refreshDialogList();
        localStorage.removeItem(STORAGE_INIT_MESSAGE_KET);
      }
    }
  }, [chatId, currentDialogInfo]);

  useEffect(() => {
    setTimeout(() => {
      scrollableRef.current?.scrollTo(0, scrollableRef.current?.scrollHeight);
    }, 50);
  }, [history, history[history.length - 1]?.context]);

  return (
    <div className='flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8' ref={scrollableRef}>
      {/* Welcome Message for Empty State */}
      {!showMessages.length && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Welcome to DB-GPT Chat
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Start a conversation with your AI assistant. Ask questions, get insights, or explore your data.
          </p>
        </div>
      )}

      {/* Chat Messages */}
      {!!showMessages.length && (
        <div className="space-y-2">
          {showMessages.map((content, index) => {
            return (
              <ChatContent
                key={index}
                content={content}
                onLinkClick={() => {
                  setJsonModalOpen(true);
                  setJsonValue(JSON.stringify(content?.context, null, 2));
                }}
              />
            );
          })}
        </div>
      )}

      {/* Enhanced JSON Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span>JSON Editor</span>
          </div>
        }
        open={jsonModalOpen}
        width='70%'
        cancelButtonProps={{
          hidden: true,
        }}
        okText="Close"
        onOk={() => {
          setJsonModalOpen(false);
        }}
        onCancel={() => {
          setJsonModalOpen(false);
        }}
        className="modern-modal"
      >
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <MonacoEditor 
            className='w-full h-[500px] rounded-lg overflow-hidden' 
            language='json' 
            value={jsonValue} 
          />
        </div>
      </Modal>
    </div>
  );
};

export default ChatCompletion;
