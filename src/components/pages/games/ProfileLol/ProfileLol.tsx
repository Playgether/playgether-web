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

    interface ProfileLolResponse {
      leaguePoints: number;
      losses: number;
      queueType: string;
      rank: string;
      tier: string;
      winRate: number;
      wins: number;
    }

    console.log('profile', { profile })

    const profile0: ProfileLolResponse | null = profile ? {
      leaguePoints: profile.data[0].leaguePoints,
      losses: profile.data[0].losses,
      queueType: profile.data[0].queueType,
      rank: profile.data[0].rank,
      tier: profile.data[0].tier,
      winRate: profile.data[0].winRate,
      wins: profile.data[0].wins,
    } : null;

    const profile1: ProfileLolResponse | null = profile ? {
      leaguePoints: profile.data[1].leaguePoints,
      losses: profile.data[1].losses,
      queueType: profile.data[1].queueType,
      rank: profile.data[1].rank,
      tier: profile.data[1].tier,
      winRate: profile.data[1].winRate,
      wins: profile.data[1].wins,
    } : null;

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
            <h1>{profile?.username}</h1>
            <h1>#{profile?.tag}</h1>
          </CardContent>
        </Card>
      </div>

      <div className='w-full flex justify-evenly mt-[2rem]'>
        <Card className='bg-[#62B7F8] w-[22rem]'>
          <CardHeader>
            <CardTitle className='text-center text-white-300 font-extrabold text-xl'>SoloQ</CardTitle>
          </CardHeader>
          <div className='border-t border-zinc-700 w-full'></div>

          <CardContent className='flex flex-col items-center justify-center text-white-300 text-xl font-extrabold gap-2 mt-10'>
            <h1>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.tier} ${profile0?.rank}` : `${profile1?.tier} ${profile1?.rank}`) : '' }</h1>

            <Avatar className='w-[60px] h-[60px] mt-5'>
              <AvatarImage src="https://github.com/shadcn.png" alt='avatar' />
              <AvatarFallback>Rank Logo</AvatarFallback>
            </Avatar>

            <h1 className={profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? (profile0?.winRate! >= 50 ? 'text-[#24FF00]' : 'text-red-500') : (profile1?.winRate! >= 50 ? 'text-[#24FF00]' : 'text-red-500')) : ''}>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.winRate}%` : `${profile1?.winRate}%`) : '' }</h1>

            <h1>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.leaguePoints} PDL` :`${profile1?.leaguePoints} PDL`) : '' }</h1>

            <div className='flex justify-between w-[40%] my-8'>
              <h1 className='text-[#24FF00]'>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.wins} V` :`${profile1?.wins} V`) : '' }</h1>
              <h1 className='text-red-500'>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.losses} D` :`${profile1?.losses} D`) : '' }</h1>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-[#ADDCFF] w-[22rem]'>
        <CardHeader>
            <CardTitle className='text-center text-white-300 font-extrabold text-xl'>Flex</CardTitle>
          </CardHeader>
          <div className='border-t border-zinc-700 w-full'></div>

          <CardContent className='flex flex-col items-center justify-center text-white-300 text-xl font-extrabold gap-2 mt-10'>
            <h1>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.tier} ${profile0?.rank}` : `${profile1?.tier} ${profile1?.rank}`) : '' }</h1>

            <Avatar className='w-[60px] h-[60px] mt-5'>
              <AvatarImage src="https://github.com/shadcn.png" alt='avatar' />
              <AvatarFallback>Rank Logo</AvatarFallback>
            </Avatar>

            <h1 className={profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? (profile0?.winRate! >= 50 ? 'text-[#24FF00]' : 'text-red-500') : (profile1?.winRate! >= 50 ? 'text-[#24FF00]' : 'text-red-500')) : ''}>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.winRate}%` : `${profile1?.winRate}%`) : '' }</h1>

            <h1>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.leaguePoints} PDL` :`${profile1?.leaguePoints} PDL`) : '' }</h1>

            <div className='flex justify-between w-[40%] my-8'>
              <h1 className='text-[#24FF00]'>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.wins} V` :`${profile1?.wins} V`) : '' }</h1>
              <h1 className='text-red-500'>{ profile ? (profile.data[0].queueType === 'RANKED_SOLO_5x5' ? `${profile0?.losses} D` :`${profile1?.losses} D`) : '' }</h1>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default ProfileLol
