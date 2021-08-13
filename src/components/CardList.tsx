import { SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { Card } from './Card';
import { ModalViewImage } from './Modal/ViewImage';

interface Card {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface CardsProps {
  cards: Card[];
}

type ViewImageProps = (url: string) => void;

export function CardList({ cards }: CardsProps): JSX.Element {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [imageUrl, setImageUrl] = useState('');

  const ViewImage: ViewImageProps = (url: string) => {
    setImageUrl(url);
    onOpen();
  };

  return (
    <>
      <SimpleGrid columns={3} spacing="2.5rem">
        {cards.map(card => (
          <Card key={card.id} data={card} viewImage={ViewImage} />
        ))}
      </SimpleGrid>

      <ModalViewImage isOpen={isOpen} onClose={onClose} imgUrl={imageUrl} />
    </>
  );
}
