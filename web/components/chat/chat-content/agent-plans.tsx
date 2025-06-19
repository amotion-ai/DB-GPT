import { CaretRightOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { GPTVis } from '@antv/gpt-vis';
import { Collapse } from 'antd';
import { ChevronRight, Check, Clock } from 'lucide-react';

import markdownComponents, { markdownPlugins, preprocessLaTeX } from './config';

interface Props {
  data: {
    name: string;
    num: number;
    status: 'complete' | 'todo';
    agent: string;
    markdown: string;
  }[];
}

function AgentPlans({ data }: Props) {
  if (!data || !data.length) return null;

  return (
    <Collapse
      bordered
      className='my-3'
      expandIcon={({ isActive }) => <ChevronRight className="w-5 h-5" />}
      items={data.map((item, index) => {
        return {
          key: index,
          label: (
            <div>
              <span>
                {item.name} - {item.agent}
              </span>
              {item.status === 'complete' ? (
                <Check className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
          ),
          children: (
            <GPTVis components={markdownComponents} {...markdownPlugins}>
              {preprocessLaTeX(item.markdown)}
            </GPTVis>
          ),
        };
      })}
    />
  );
}

export default AgentPlans;
