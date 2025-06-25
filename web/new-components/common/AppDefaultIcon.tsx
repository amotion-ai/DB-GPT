import {
  BookOpen,
  Database,
  FileSpreadsheet,
  BarChart3,
  MessageSquare,
  Puzzle,
} from 'lucide-react';
import React, { useCallback } from 'react';

const AppDefaultIcon: React.FC<{ scene: string; width?: number; height?: number }> = ({ width, height, scene }) => {
  const size = width || 28;
  const returnComponent = useCallback(() => {
    switch (scene) {
      case 'chat_knowledge':
        return <BookOpen width={size} height={size} />;
      case 'chat_with_db_execute':
        return <Database width={size} height={size} />;
      case 'chat_excel':
        return <FileSpreadsheet width={size} height={size} />;
      case 'chat_with_db_qa':
      case 'chat_dba':
        return <Database width={size} height={size} />;
      case 'chat_dashboard':
        return <BarChart3 width={size} height={size} />;
      case 'chat_agent':
        return <Puzzle width={size} height={size} />;
      case 'chat_normal':
        return <MessageSquare width={size} height={size} />;
      default:
        return <MessageSquare width={size} height={size} />;
    }
  }, [scene, size]);

  return <span className={`w-${width || 7} h-${height || 7} flex items-center justify-center`}>{returnComponent()}</span>;
};

export default AppDefaultIcon;
