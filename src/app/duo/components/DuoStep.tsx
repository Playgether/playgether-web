'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react'
import { GameNav } from './GameNav';
import { ProfileSelection } from './steps/ProfileSelection';
import { RoleSelection } from './steps/RoleSelection';
import { EloFilter } from './steps/EloFilter';
import { MatchResults } from './steps/MatchResults';

export default function DuoSteps({ initialStep }: { initialStep: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = searchParams?.get("step") || initialStep;

  const changeStep = (newStep: string) => {
    router.push(`?step=${newStep}`);
  }

  const renderStep = () => {
    switch (step) {
        case "profile":
            return <ProfileSelection onNext={() => changeStep("roles")} />;
        case "roles":
          return <RoleSelection onNext={() => changeStep("filter")} onBack={() => changeStep("profile")} />;
        case "filter":
          return <EloFilter onNext={() => changeStep("results")} onBack={() => changeStep("roles")} />;
        case "results":
          return <MatchResults onBack={() => changeStep("filter")} />;
        default:
          return <ProfileSelection onNext={() => changeStep("roles")} />;
    }
  }

  return (
    <div className='min-h-screen bg-gradient-background'>
        <div className="ml-20">
          {renderStep()}
        </div>
    </div>
  )
}
