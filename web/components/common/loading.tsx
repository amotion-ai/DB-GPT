import { LoadingOutlined } from '@ant-design/icons';
import { Loader2 } from 'lucide-react';

function MuiLoading({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className='absolute w-full h-full top-0 left-0 flex justify-center items-center z-10 bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-50 backdrop-blur-sm text-3xl animate-fade animate-duration-200'>
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

export default MuiLoading;
