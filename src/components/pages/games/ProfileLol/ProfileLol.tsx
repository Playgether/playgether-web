import React from 'react'

import { useAuthContext } from '../../../../context/AuthContext';
import { useProfileLolContext } from '../../../../context/ProfileLolContext';
import { ProfileLolProps } from '../../../../services/getProfileLol';
import { useResource } from '../../../custom_hooks/useResource';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const ProfileLol = ({}) => {

    const { user } = useAuthContext();
    const { profile, fetchProfile } = useProfileLolContext();
    useResource<ProfileLolProps>(() => fetchProfile());

    const soloq = () => {
      if (profile && profile[0].queueType === 'RANKED_SOLO_5x5') {
        return `${profile[0].tier} ${profile[0].rank}`;
      }
    }

    const userLol = {
      nick: 'Vayne Panicat',
      riotId: 'VEIGA',
      queueType0: 'SoloQ',
      queueType1: 'Flex',
      rankSoloQ: 'Desafiante I',
      rankFlex: 'Desafiante I',
      win: 100,
      lose: 0,
      matches: 100,
      lp: '1000',
    }

    const winRate = userLol.win / userLol.matches * 100;

  return (
    <>
      <div className='mt-[-3rem]'>
        <h1 className='text-orange-500 text-3xl text-center font-extrabold'>
          League of Legends
        </h1>
      </div>

      <div className='w-full flex justify-center mt-[3rem]'>
        <Card className='bg-blue-400 w-[26rem]'>
          <CardHeader>
            <CardTitle className='text-center text-white-300 font-extrabold text-xl'>Riot ID</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-row items-center justify-center text-white-300 text-xl font-extrabold gap-2'>
            <h1>{userLol.nick}</h1>
            <h1>#{userLol.riotId}</h1>
          </CardContent>
        </Card>
      </div>

      <div className='w-full flex justify-evenly mt-[2rem]'>
        <Card className='bg-[#62B7F8] w-[22rem]'>
          <CardHeader>
            <CardTitle className='text-center text-white-300 font-extrabold text-xl'>{userLol.queueType0}</CardTitle>
          </CardHeader>
          <div className='border-t border-zinc-700 w-full'></div>

          <CardContent className='flex flex-col items-center justify-center text-white-300 text-xl font-extrabold gap-2 mt-10'>
            <h1>{userLol.rankSoloQ}</h1>

            <Avatar className='w-[60px] h-[60px] mt-5'>
              <AvatarImage src="https://github.com/shadcn.png" alt='avatar' />
              <AvatarFallback>Rank Logo</AvatarFallback>
            </Avatar>

            <h1 className={winRate >= 50 ? 'text-[#24FF00]' : 'text-red-500'}>{winRate}%</h1>

            <h1>{userLol.lp + ' PDL'}</h1>

            <div className='flex justify-between w-[40%] my-8'>
              <h1 className='text-[#24FF00]'>{userLol.win + 'V'}</h1>
              <h1 className='text-red-500'>{userLol.lose + 'D'}</h1>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-[#ADDCFF] w-[22rem]'>
          <CardHeader>
            <CardTitle className='text-center text-[#FFFFFF] font-extrabold text-xl'>{userLol.queueType1}</CardTitle>
          </CardHeader>
          <div className='border-t border-zinc-700 w-full'></div>

          <CardContent className='flex flex-col items-center justify-center text-white-300 text-xl font-extrabold gap-2 mt-10'>
            <h1>{userLol.rankFlex}</h1>

            <Avatar className='w-[60px] h-[60px] mt-5'>
              <AvatarImage src="https://github.com/shadcn.png" alt='avatar' />
              <AvatarFallback>Rank Logo</AvatarFallback>
            </Avatar>

            <h1 className={winRate >= 50 ? 'text-[#24FF00]' : 'text-red-500'}>{winRate}%</h1>

            <h1>{userLol.lp + ' PDL'}</h1>

            <div className='flex justify-between w-[40%] my-8'>
              <h1 className='text-[#24FF00]'>{userLol.win + 'V'}</h1>
              <h1 className='text-red-500'>{userLol.lose + 'D'}</h1>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ProfileLol
