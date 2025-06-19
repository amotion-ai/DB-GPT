import { CheckOutlined, ClockCircleOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { GPTVis } from '@antv/gpt-vis';
import classNames from 'classnames';
import { ReactNode } from 'react';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import markdownComponents from './config';
import { Check, Clock, X, Loader2 } from 'lucide-react';

interface IVisPlugin {
  name: string;
  args: {
    query: string;
  };
  status: 'todo' | 'runing' | 'failed' | 'complete' | (string & {});
  logo: string | null;
  result: string;
  err_msg: string | null;
}

interface Props {
  data: IVisPlugin;
}

const pluginViewStatusMapper: Record<IVisPlugin['status'], { bgClass: string; icon: ReactNode }> = {
  todo: {
    bgClass: 'bg-gray-500',
    icon: <Clock className="w-5 h-5" />,
  },
  runing: {
    bgClass: 'bg-blue-500',
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
  },
  failed: {
    bgClass: 'bg-red-500',
    icon: <X className="w-5 h-5" />,
  },
  complete: {
    bgClass: 'bg-green-500',
    icon: <Check className="w-5 h-5" />,
  },
};

function VisPlugin({ data }: Props) {
  const { bgClass, icon } = pluginViewStatusMapper[data.status] ?? {};

  return (
    <div className='bg-theme-light dark:bg-theme-dark-container rounded overflow-hidden my-2 flex flex-col'>
      <div className={classNames('flex px-4 md:px-6 py-2 items-center text-white text-sm', bgClass)}>
        {data.name}
        {icon}
      </div>
      {data.result ? (
        <div className='px-4 md:px-6 py-4 text-sm whitespace-normal'>
          <GPTVis components={markdownComponents} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {data.result ?? ''}
          </GPTVis>
        </div>
      ) : (
        <div className='px-4 md:px-6 py-4 text-sm'>{data.err_msg}</div>
      )}
    </div>
  );
}

export default VisPlugin;
