import { ChatContext } from '@/app/chat-context';
import { LinkOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import ExcelUpload from './excel-upload';
import { Link } from 'lucide-react';

interface Props {
  onComplete?: () => void;
}

function ChatExcel({ onComplete }: Props) {
  const { currentDialogue, scene, chatId } = useContext(ChatContext);

  if (scene !== 'chat_excel') return null;

  return (
    <div className='max-w-md h-full relative'>
      {currentDialogue ? (
        <div className='flex h-8 overflow-hidden rounded'>
          <div className='flex items-center justify-center px-2 bg-gray-600 text-lg'>
            <Link className="w-5 h-5" />
          </div>
          <div className='flex items-center justify-center px-3 bg-gray-100 text-xs rounded-tr rounded-br dark:text-gray-800 truncate'>
            {currentDialogue.select_param}
          </div>
        </div>
      ) : (
        <ExcelUpload convUid={chatId} chatMode={scene} onComplete={onComplete} />
      )}
    </div>
  );
}

export default ChatExcel;
