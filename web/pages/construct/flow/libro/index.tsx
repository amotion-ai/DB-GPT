import { ChatContext } from '@/app/chat-context';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Libro: React.FC = () => {
  const searchParams = useSearchParams();
  const { i18n } = useTranslation();
  const { mode } = useContext(ChatContext);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const id = searchParams?.get('id') || '';

  // Listen for language switch events
  useEffect(() => {
    const handleLanguageChange = () => {
      // Handle language change logic
    };

    // Register listener
    window.addEventListener('languageChange', handleLanguageChange);

    // Clean up listener
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      `theme:${mode}`,
      `${window.location.protocol}//${window.location.hostname}:5671`,
    );
  }, [mode]);

  return (
    <>
      <iframe
        src={`${window.location.protocol}//${window.location.hostname}:5671/dbgpt?flow_uid=${id}`}
        className='h-full'
        ref={iframeRef}
      ></iframe>
    </>
  );
};

export default Libro;
