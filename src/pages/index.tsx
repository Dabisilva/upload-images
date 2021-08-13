import { Button, Box, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';
import { AxiosResponse } from 'axios';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

export default function Home(): JSX.Element {
  async function getImages({ pageParam = 0 }): Promise<AxiosResponse> {
    const response = await api.get(`/api/images?after=${pageParam}`);
    return response.data;
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', getImages, {
    getNextPageParam: (lastPage: any) =>
      lastPage.after ? lastPage.after : null,
  });

  const formattedData = useMemo(() => {
    if (data) {
      const filteredPages = data.pages.map(page => {
        return page.data;
      });

      return filteredPages.flat();
    }
    return [];
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button mt="2.5rem" onClick={() => fetchNextPage()}>
            {isFetchingNextPage ? (
              <Text color="pGray.50">Carregando...</Text>
            ) : (
              <Text>Carregar mais</Text>
            )}
          </Button>
        )}
      </Box>
    </>
  );
}
