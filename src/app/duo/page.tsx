import React from 'react'
import BaseLayout from '../base-layout/components/structure/BaseLayout'
import DuoSteps from './components/DuoStep';

export default function Duo({ searchParams }: { searchParams?: { step?: string } }) {

  return (
    <BaseLayout>
        <DuoSteps initialStep={searchParams?.step || "profile"} />
    </BaseLayout>
  )
}
