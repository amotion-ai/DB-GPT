import { ChatContext } from '@/app/chat-context';
import UserBar from '@/new-components/layout/UserBar';
import { MessageSquare, Compass, Settings, Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_USERINFO_KEY } from '@/utils/constants/index';
import cls from 'classnames';

type RouteItem = {
  key: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  isActive?: boolean;
};

function NavBar() {
  const { adminList } = useContext(ChatContext);
  const { pathname } = useRouter();
  const { t } = useTranslation();

  const hasAdmin = useMemo(() => {
    const { user_id } = JSON.parse(localStorage.getItem(STORAGE_USERINFO_KEY) || '{}');
    return adminList.some(admin => admin.user_id === user_id);
  }, [adminList]);

  const functions = useMemo(() => {
    const items: RouteItem[] = [
      {
        key: 'chat',
        name: t('chat_online'),
        icon: <MessageSquare className="w-5 h-5" />,
        path: '/chat',
        isActive: pathname.startsWith('/chat'),
      },
      {
        key: 'explore',
        name: t('explore'),
        isActive: pathname === '/',
        icon: <Compass className="w-5 h-5" />,
        path: '/',
      },
      {
        key: 'construct',
        name: t('construct'),
        isActive: pathname.startsWith('/construct'),
        icon: <Settings className="w-5 h-5" />,
        path: '/construct/app',
      },
    ];
    if (hasAdmin) {
      items.push({
        key: 'evaluation',
        name: '场景评测',
        icon: <Bot className="w-5 h-5" />,
        path: '/evaluation',
        isActive: pathname === '/evaluation',
      });
    }
    return items;
  }, [t, pathname, hasAdmin]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <Link href="/" className="flex items-center mr-8">
          <span className="text-xl font-bold text-gray-900 dark:text-white">DB Copolit</span>
        </Link>
        <div className="flex items-center space-x-2">
          {functions.map(item => (
            <Link
              key={item.key}
              href={item.path}
              className={cls(
                'flex items-center px-4 h-10 rounded-lg transition-all duration-200',
                {
                  'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white': item.isActive,
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800': !item.isActive,
                }
              )}
            >
              <span className="mr-2">{item.icon}</span>
              <span className="text-sm font-medium">{t(item.name as any)}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <UserBar />
      </div>
    </nav>
  );
}

export default NavBar; 