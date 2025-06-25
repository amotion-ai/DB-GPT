import ChatHeader from '@/new-components/chat/header/ChatHeader';
import { ChatContentContext } from '@/pages/chat';
import { ArrowDown, ArrowUp, ChevronUp, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';

const ChatCompletion = dynamic(() => import('@/new-components/chat/content/ChatCompletion'), { ssr: false });

// eslint-disable-next-line no-empty-pattern
const ChatContentContainer = ({}, ref: React.ForwardedRef<any>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrollToTop, setIsScrollToTop] = useState<boolean>(false);
  const [showScrollButtons, setShowScrollButtons] = useState<boolean>(false);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const { history } = useContext(ChatContentContext);

  useImperativeHandle(ref, () => {
    return scrollRef.current;
  });

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const buffer = 20; // Small buffer for better UX

    // Check if we're at the top
    setIsAtTop(scrollTop <= buffer);

    // Check if we're at the bottom
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - buffer);

    // Header visibility
    if (scrollTop >= 42 + 32) {
      setIsScrollToTop(true);
    } else {
      setIsScrollToTop(false);
    }

    // Show scroll buttons when content is scrollable
    const isScrollable = scrollHeight > clientHeight;
    setShowScrollButtons(isScrollable);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener('scroll', handleScroll);

      // Check initially if content is scrollable
      const isScrollable = scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
      setShowScrollButtons(isScrollable);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      scrollRef.current && scrollRef.current.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    // dynamic calculate need scroll buffer
    const buffer = Math.max(50, container.clientHeight * 0.2);

    // auto scroll to bottom when new message is added
    const isBottomPos = scrollTop + clientHeight >= scrollHeight - buffer;
    if (isBottomPos) {
      container.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  }, [history, history[history.length - 1]?.context]);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className='flex flex-1 overflow-hidden relative'>
      {/* Main Content Area */}
      <div 
        ref={scrollRef} 
        className='h-full w-full mx-auto overflow-y-auto scroll-smooth'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
        }}
      >
        <ChatHeader isScrollToTop={isScrollToTop} />
        <ChatCompletion />
      </div>

      {/* Enhanced Scroll Buttons */}
      {showScrollButtons && (
        <div className='absolute right-6 bottom-24 flex flex-col gap-3 z-10'>
          {!isAtTop && (
            <button
              onClick={scrollToTop}
              className='group relative w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
              aria-label='Scroll to top'
            >
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
          {!isAtBottom && (
            <button
              onClick={scrollToBottom}
              className='group relative w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/30 dark:border-gray-700/50 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
              aria-label='Scroll to bottom'
            >
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>
      )}

      {/* Scroll Progress Indicator */}
      {showScrollButtons && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-1 h-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="w-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-full transition-all duration-300"
            style={{
              height: scrollRef.current ? `${(scrollRef.current.scrollTop / (scrollRef.current.scrollHeight - scrollRef.current.clientHeight)) * 100}%` : '0%'
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default forwardRef(ChatContentContainer);
