import React from 'react'
import BaseLayout from '../base-layout/components/structure/BaseLayout'
import DuoSteps from './components/DuoStep';

export default async function Duo({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <BaseLayout>
        <DuoSteps initialStep={resolvedSearchParams?.step || "profile"} />
    </BaseLayout>
  )
}
