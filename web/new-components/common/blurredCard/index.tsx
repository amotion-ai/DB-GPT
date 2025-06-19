import { Divider, DropDownProps, Dropdown, Tooltip, Typography } from 'antd';
import cls from 'classnames';
import { t } from 'i18next';
import Image from 'next/image';
import React from 'react';
import { MoreHorizontal, FileSpreadsheet, BarChart3, Database, MessageSquare, BookOpen } from 'lucide-react';
import './style.css';

const getAppIcon = (scene?: string) => {
  switch (scene) {
    case 'chat_excel':
      return <FileSpreadsheet className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
    case 'chat_dashboard':
      return <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
    case 'chat_data':
      return <Database className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
    case 'chat_normal':
      return <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
    case 'chat_knowledge':
      return <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
    default:
      return <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />;
  }
};

const BlurredCard: React.FC<{
  RightTop?: React.ReactNode;
  Tags?: React.ReactNode;
  name: string;
  description: string | React.ReactNode;
  logo?: string;
  onClick?: () => void;
  className?: string;
  scene?: string;
  code?: string;
}> = ({
  RightTop,
  Tags,
  onClick,
  name,
  description,
  className,
  scene,
  code,
}) => {
  if (typeof description === 'string') {
    description = (
      <p className='text-sm text-gray-500 dark:text-gray-400'>
        {description}
      </p>
    );
  }

  const appIcon = getAppIcon(scene);

  return (
    <div className={cls('w-full', className)}>
      <div
        onClick={onClick}
        className='group flex items-center justify-between py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors rounded-lg'
      >
        <div className='flex items-center gap-4 min-w-0 flex-1'>
          <div className='flex-shrink-0'>
            {appIcon}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-3'>
              <h3 className='text-base font-medium text-gray-900 dark:text-white truncate'>
                {name}
              </h3>
              {Tags && <div className='flex-shrink-0'>{Tags}</div>}
            </div>
            <div className='mt-1'>
              {description}
            </div>
          </div>
        </div>
        
        <div className='flex items-center'>
          <div
            className={cls('flex-shrink-0')}
            onClick={e => e.stopPropagation()}
          >
            {RightTop}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatButton: React.FC<{
  onClick?: () => void;
  Icon?: React.ReactNode | string;
  text?: string;
}> = ({ onClick, Icon = <MessageSquare className="w-5 h-5" />, text = t('start_chat') }) => {
  return (
    <div
      className='flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
      onClick={e => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {typeof Icon === 'string' ? <Image src={Icon} alt={text} width={17} height={15} /> : Icon}
      <span className="text-sm">{text}</span>
    </div>
  );
};

const InnerDropdown: React.FC<{ menu: DropDownProps['menu'] }> = ({ menu }) => {
  return (
    <Dropdown
      menu={menu}
      getPopupContainer={node => node.parentNode as HTMLElement}
      placement='bottomRight'
      autoAdjustOverflow={false}
    >
      <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>
    </Dropdown>
  );
};

export { ChatButton, InnerDropdown };
export default BlurredCard;
