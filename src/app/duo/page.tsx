import React from 'react'
import type { Metadata } from 'next';
import BaseLayout from '../base-layout/components/structure/BaseLayout'
import DuoSteps from './components/DuoStep';

export const metadata: Metadata = {
  title: "Duo",
};

export default async function Duo({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string; game?: string; tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <BaseLayout>
        <DuoSteps
          initialStep={resolvedSearchParams?.step || "game"}
          initialGame={resolvedSearchParams?.game || null}
          initialTab={resolvedSearchParams?.tab || null}
        />
    </BaseLayout>
  )
}
