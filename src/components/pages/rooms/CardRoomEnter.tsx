'use client';

import { useRouter } from 'next/navigation';
import { validateRoomAction } from '@/actions/validateRoom';
import DefaultButton from '@/components/elements/DefaultButton/DefaultButton';
import React, { useState, useTransition } from 'react';
import { RxPerson } from 'react-icons/rx';

function CardRoomEnter({ name }: { name: string }) {
  const router = useRouter(); // ✅ useRouter da App Router
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    startTransition(async () => {
      const result = await validateRoomAction(name);
      if (result.success) {
        router.push(`/rooms/${name}`); // ✅ redirecionamento
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <>
      {error && (
        <div className="absolute CardRoomEnter-error left-4 text-sm border rounded p-2 top-1 motion-preset-slide-right-md">
          {error}
        </div>
      )}
      <div className="w-full flex justify-between items-end">
        <DefaultButton
          onClick={handleClick}
          disabled={isPending}
          className="py-2 px-8 font-medium"
        >
          {isPending ? 'Entrando...' : 'Entrar'}
        </DefaultButton>
        <div className="flex gap-2 CardRoomContainer-online items-end">
          <RxPerson className="h-7" />
          <span>15/30</span>
        </div>
      </div>
    </>
  );
}

export default CardRoomEnter;