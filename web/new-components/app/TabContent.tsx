import { ChatContext } from '@/app/chat-context';
import { apiInterceptors, collectApp, newDialogue, unCollectApp } from '@/client/api';
import BlurredCard from '@/new-components/common/blurredCard';
import { IApp } from '@/types/app';
import { Star } from 'lucide-react';
import { Empty } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';

const TabContent: React.FC<{ apps: IApp[]; loading: boolean; refresh: () => void; type: 'used' | 'recommend' }> = ({
  apps,
  refresh,
  loading,
  type,
}) => {
  const collect = async (data: Record<string, any>) => {
    const [error] = await apiInterceptors(
      data.is_collected === 'true'
        ? unCollectApp({ app_code: data.app_code })
        : collectApp({ app_code: data.app_code }),
    );
    if (error) return;
    refresh();
  };

  const { setAgent: setAgentToChat, model, setCurrentDialogInfo } = useContext(ChatContext);
  const router = useRouter();

  const toChat = async (app: IApp) => {
    const [error, res] = await apiInterceptors(
      newDialogue({
        chat_mode: app.team_mode,
        select_param: {
          chat_scene: app.team_context?.chat_scene || 'chat_agent',
        },
      }),
    );
    if (error || !res) return;
    
    setCurrentDialogInfo?.({
      chat_scene: app.team_context?.chat_scene || 'chat_agent',
      app_code: app.app_code,
    });
    
    setAgentToChat?.(app.app_code);
    router.push('/chat');
  };

  return (
    <div className='mt-4 divide-y divide-gray-100 dark:divide-gray-800'>
      {apps?.length > 0 ? (
        apps.map(item => (
          <BlurredCard
            key={item.app_code}
            name={item.app_name}
            description={item.app_describe}
            onClick={() => toChat(item)}
            RightTop={
              item.is_collected === 'true' ? (
                <Star className="w-5 h-5 fill-current" />
              ) : (
                <Star className="w-5 h-5" />
              )
            }
            scene={item?.team_context?.chat_scene || 'chat_agent'}
          />
        ))
      ) : (
        <Empty
          image={
            <Image src='/pictures/empty.png' alt='empty' width={142} height={133} className='w-[142px] h-[133px]' />
          }
          className='flex justify-center items-center w-full h-full min-h-[200px]'
        />
      )}
    </div>
  );
};

export default TabContent;
