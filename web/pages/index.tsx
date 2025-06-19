import { apiInterceptors, collectApp, getAppList, newDialogue, recommendApps, unCollectApp } from '@/client/api';
import { PlusOutlined, SearchOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import type { SegmentedProps } from 'antd';
import { Avatar, Button, ConfigProvider, Input, Segmented, Spin, message } from 'antd';
import cls from 'classnames';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GridCellRenderer, Index, IndexRange } from 'react-virtualized';
import { AutoSizer, Grid, InfiniteLoader } from 'react-virtualized';

import { ChatContext } from '@/app/chat-context';
import IconFont from '@/new-components/common/Icon';
import BlurredCard from '@/new-components/common/blurredCard';
import { AppListResponse } from '@/types/app';
import moment from 'moment';
import { Plus, Search, Star } from 'lucide-react';

const Playground: NextPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { setAgent, setCurrentDialogInfo, model } = useContext(ChatContext);

  const [activeKey, setActiveKey] = useState<string>('all');
  const [apps, setApps] = useState<AppListResponse>({
    app_list: [],
    total_count: 0,
  });

  const items: SegmentedProps['options'] = [
    {
      value: 'recommend',
      label: t('recommend_apps'),
    },
    {
      value: 'all',
      label: t('all_apps'),
    },
    {
      value: 'collected',
      label: t('my_collected_apps'),
    },
  ];

  const getAppListWithParams = (params: Record<string, string>) =>
    apiInterceptors(
      getAppList({
        page_no: '1',
        page_size: '12',
        ...params,
      }),
    );
  const getHotAppList = (params: Record<string, string>) =>
    apiInterceptors(
      recommendApps({
        page_no: '1',
        page_size: '12',
        ...params,
      }),
    );
  // 获取应用列表
  const { run: getAppListFn, loading } = useRequest(
    async (app_name = '', page_no = '1', page_size = '12'): Promise<[any, [] | AppListResponse]> => {
      switch (activeKey) {
        case 'recommend':
          return await getHotAppList({
            ...{ page_no, page_size },
          });
        case 'collected':
          return await getAppListWithParams({
            is_collected: 'true',
            ignore_user: 'true',
            published: 'true',
            need_owner_info: 'true',
            ...{ app_name, page_no, page_size },
          });
        case 'all':
          return await getAppListWithParams({
            ignore_user: 'true',
            published: 'true',
            need_owner_info: 'true',
            ...{ app_name, page_no, page_size },
          });
        default:
          return [null, []];
      }
    },
    {
      manual: true,
      onSuccess: (res: [any, [] | AppListResponse]) => {
        const [_error, data] = res;
        if (activeKey === 'recommend' && Array.isArray(data)) {
          setApps({
            app_list: data,
            total_count: data.length,
          });
          return;
        }
        
        if (!Array.isArray(data) && 'app_list' in data) {
          const code = data?.app_list?.[0]?.app_code;
          const index = code ? apps.app_list.findIndex((item: any) => item.app_code === code) : -1;
          if (index !== -1) {
            const finallyIndex = Math.floor(index / 12) * 12;
            setApps({
              app_list: apps.app_list.toSpliced(finallyIndex, 12, ...data.app_list) || [],
              total_count: data?.total_count || 0,
            });
          } else {
            setApps({
              app_list: apps.app_list.concat(data?.app_list) || [],
              total_count: data?.total_count || 0,
            });
          }
        }
      },
      debounceWait: 500,
    },
  );

  const onSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setApps({
      app_list: [],
      total_count: 0,
    });
    getAppListFn(e.target.value);
  };

  const collect = async (data: Record<string, any>) => {
    const [error] = await apiInterceptors(
      data.is_collected === 'true'
        ? unCollectApp({ app_code: data.app_code })
        : collectApp({ app_code: data.app_code }),
    );
    const index = apps.app_list.findIndex((item: any) => item.app_code === data.app_code);
    if (error) return;
    if (data.is_collected === 'true') {
      message.success(t('cancel_success'));
    } else {
      message.success(t('collect_success'));
    }
    getAppListFn('', (Math.floor(index / 12) + 1).toString());
  };
  const columnCount = 3;

  function isRowLoaded({ index }: Index) {
    return !!apps.app_list[index]; // 检查给定的索引是否已经加载
  }

  async function loadMoreRows({ startIndex, stopIndex }: IndexRange): Promise<void> {
    const pageSize = 12;
    const currentPage = Math.ceil(startIndex / pageSize) + 1; // 计算当前页数
    await getAppListFn('', currentPage.toString());
  }
  const cellRenderer: GridCellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    // 计算数组中的索引
    const index = rowIndex * columnCount + columnIndex;
    if (!isRowLoaded({ index })) return null;
    const item = apps.app_list[index];
    return (
      <div key={key} style={style}>
        <BlurredCard
          key={item.app_code}
          name={item.app_name}
          description={item.app_describe}
          className='w-11/12'
          RightTop={
            item.is_collected === 'true' ? (
              <Star className="w-5 h-5 fill-current"
                onClick={() => collect(item)}
                style={{
                  height: '21px',
                  cursor: 'pointer',
                  color: '#f9c533',
                }}
              />
            ) : (
              <Star className="w-5 h-5"
                onClick={() => collect(item)}
                style={{
                  height: '21px',
                  cursor: 'pointer',
                }}
              />
            )
          }
          onClick={async () => {
            // 原生应用跳转
            if (item.team_mode === 'native_app') {
              const { chat_scene = '' } = item.team_context;
              const [, res] = await apiInterceptors(newDialogue({ chat_mode: chat_scene }));
              if (res) {
                setCurrentDialogInfo?.({
                  chat_scene: res.chat_mode,
                  app_code: item.app_code,
                });
                localStorage.setItem(
                  'cur_dialog_info',
                  JSON.stringify({
                    chat_scene: res.chat_mode,
                    app_code: item.app_code,
                  }),
                );
                router.push(`/chat?scene=${chat_scene}&id=${res.conv_uid}${model ? `&model=${model}` : ''}`);
              }
            } else {
              // 自定义应用
              const [, res] = await apiInterceptors(newDialogue({ chat_mode: 'chat_agent' }));
              if (res) {
                setCurrentDialogInfo?.({
                  chat_scene: res.chat_mode,
                  app_code: item.app_code,
                });
                localStorage.setItem(
                  'cur_dialog_info',
                  JSON.stringify({
                    chat_scene: res.chat_mode,
                    app_code: item.app_code,
                  }),
                );
                setAgent?.(item.app_code);
                router.push(`/chat/?scene=chat_agent&id=${res.conv_uid}${model ? `&model=${model}` : ''}`);
              }
            }
          }}
          scene={item?.team_context?.chat_scene || 'chat_agent'}
        />
      </div>
    );
  };
  useEffect(() => {
    // setPageNo('1');
    setApps({
      app_list: [],
      total_count: 0,
    });
  }, [activeKey]);

  useEffect(() => {
    getAppListFn();
  }, [activeKey, getAppListFn]);

  // useEffect(() => {
  //   getAppListFn();
  // }, [getAppListFn, pageNo]);

  return (
    <div
      className='flex flex-col h-full w-full backdrop-filter backdrop-blur dark:bg-gradient-dark bg-gradient-light  p-10 pt-12 '
      id='home-container'
    >
      <ConfigProvider
        theme={{
          components: {
            Button: {
              defaultBorderColor: 'white',
            },
            Segmented: {
              itemSelectedBg: '#2867f5',
              itemSelectedColor: 'white',
            },
          },
        }}
      >
        {/* Apps list */}
        <div
          className='flex flex-col h-full mt-4 overflow-hidden relative'
          style={{
            paddingBottom: apps.total_count > 12 ? 45 : 20,
          }}
        >
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <Segmented
                className='h-10 backdrop-filter backdrop-blur-lg bg-white bg-opacity-30 border border-white rounded-lg shadow p-1 dark:border-[#6f7f95] dark:bg-[#6f7f95] dark:bg-opacity-60'
                options={items}
                value={activeKey}
                onChange={value => {
                  setActiveKey(value as string);
                  setApps({
                    app_list: [],
                    total_count: 0,
                  });
                  getAppListFn();
                }}
              />
              <Input
                variant='filled'
                prefix={<Search className="w-5 h-5" />}
                placeholder={t('please_enter_the_keywords')}
                onChange={onSearch}
                onPressEnter={onSearch}
                allowClear
                className={cls(
                  'w-[230px] h-[40px] border-1 border-white backdrop-filter backdrop-blur-lg bg-white bg-opacity-30 dark:border-[#6f7f95] dark:bg-[#6f7f95] dark:bg-opacity-60',
                  {
                    hidden: activeKey === 'recommend',
                  },
                )}
              />
            </div>

            <div className='flex items-center gap-4'>
              <Button
                className='border-none text-white bg-button-gradient'
                icon={<Plus className="w-5 h-5" />}
                onClick={() => {
                  localStorage.removeItem('new_app_info');
                  router.push('/construct/app?openModal=true');
                }}
              >
                {t('create_app')}
              </Button>
            </div>
          </div>
          {loading && !apps.app_list.length ? (
            <Spin size='large' className='flex items-center justify-center h-full' spinning={loading} />
          ) : (
            <>
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={apps.total_count} // 数据的总行数，如果未知则可以设置为一个较大的数字
              >
                {({ onRowsRendered, registerChild }) => (
                  <AutoSizer>
                    {({ width, height }) => (
                      <Grid
                        ref={registerChild}
                        onSectionRendered={({ rowStartIndex, rowStopIndex }) => {
                          const startIndex = rowStartIndex * columnCount;
                          const stopIndex = rowStopIndex * columnCount + (columnCount - 1);
                          onRowsRendered({
                            startIndex,
                            stopIndex,
                          });
                        }}
                        cellRenderer={cellRenderer}
                        columnWidth={width / columnCount}
                        columnCount={columnCount}
                        height={height}
                        rowHeight={200 /* 你的行高 */}
                        rowCount={apps.total_count}
                        width={width}
                      />
                    )}
                  </AutoSizer>
                )}
              </InfiniteLoader>
              {loading && apps.app_list.length && (
                <Spin className='flex items-end justify-center h-full' spinning={loading} />
              )}
            </>
          )}

          {/* <TabContent apps={apps?.app_list || []} loading={loading} refresh={refresh} /> */}
        </div>
      </ConfigProvider>
    </div>
  );
};

export default Playground;
