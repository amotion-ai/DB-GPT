import { ReadOutlined, SmileOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import React from 'react';
import { BookOpen, Smile } from 'lucide-react';

const FloatHelper: React.FC = () => {
  return (
    <FloatButton.Group trigger='hover' icon={<Smile className="w-5 h-5" />}>
      <FloatButton icon={<BookOpen className="w-5 h-5" />} href='http://docs.dbgpt.cn' target='_blank' tooltip='Doucuments' />
    </FloatButton.Group>
  );
};
export default FloatHelper;
