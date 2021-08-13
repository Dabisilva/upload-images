import { useState } from 'react';
import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

interface CreateImageformdata {
  title: string;
  description: string;
}

interface ImageProps {
  size: number;
  type: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');

  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        size: (file: ImageProps[]) => {
          const { size } = file[0];
          return size < 10000000 || 'O arquivo deve ser menor que 10MB';
        },
        type: (file: ImageProps[]) => {
          const { type } = file[0];
          const typeRegex = new RegExp('[(?i)/(jpeg|png|gif)$]');
          const value = type.search(typeRegex);
          return value !== -1 || 'Somente são aceitos arquivos PNG, JPEG e GIF';
        },
      },
    },
    title: {
      required: 'Título obrigatório',
      minLength: {
        value: 2,
        message: 'Mínimo de 2 caracteres',
      },
      maxLength: {
        value: 20,
        message: 'Máximo de 20 caracteres',
      },
    },
    description: {
      required: 'Descrição obrigatória',
      maxLength: {
        value: 65,
        message: 'Máximo de 65 caracteres',
      },
    },
  };

  const queryClient = useQueryClient();

  const mutation = useMutation(
    async ({ title, description }: CreateImageformdata) => {
      const response = await api.post('api/images', {
        title,
        description,
        url: imageUrl,
      });

      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );

  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();

  const { errors } = formState;

  const onSubmit = async (data: CreateImageformdata): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
      } else {
        await mutation.mutateAsync(data).then(() => {
          reset();
          closeModal();
          toast({
            title: 'Imagem cadastrada',
            description: 'Imagem cadastrada com sucesso',
            status: 'success',
            duration: 6000,
            isClosable: true,
          });
        });
      }
    } catch {
      toast({
        title: 'Erro',
        description: errors.name,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image', formValidations.image)}
        />

        <TextInput
          placeholder="Título da imagem..."
          error={errors.title}
          {...register('title', formValidations.title)}
        />

        <TextInput
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register('description', formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
