'use client'
import BaseLayout from '@/components/layouts/BaseLayout'
import DuoStep1 from '@/components/pages/duo/step1'
import DuoStep2 from '@/components/pages/duo/step2'
import DuoStep3 from '@/components/pages/duo/step3'
import React, { useState } from 'react'

export default function Duo() {
  const [step, setStep] = useState<number>(1)
  const [myRole, setMyRole] = useState<string>('')
  const [searchRole, setSearchRole] = useState<string>('')
  const [searchRank, setSearchRank] = useState<string>('')

  const handleNextStep = () => {setStep(step + 1)}

  const handleBackToStep1 = () => {setStep(1)}

  const renderStep = () => {
    switch (step) {
      case 1:
        return <DuoStep1 myRole={myRole} setMyRole={setMyRole} onNextStep={handleNextStep}/>
      case 2:
        return <DuoStep2 onBackToStep1={handleBackToStep1} onNextStep={handleNextStep} searchRank={searchRank} setSearchRank={setSearchRank} searchRole={searchRole} setSearchRole={setSearchRole} />
      case 3:
        return <DuoStep3 onBackToStep1={handleBackToStep1} myRole={myRole} searchRank={searchRank} searchRole={searchRole} />
      default:
        return <DuoStep1 myRole={myRole} setMyRole={setMyRole} onNextStep={handleNextStep}/>
    }
  }

  return (
    <BaseLayout>
        {renderStep()}
    </BaseLayout>
  )
}
