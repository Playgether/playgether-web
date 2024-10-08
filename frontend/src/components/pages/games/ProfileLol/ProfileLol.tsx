import React from 'react'

import { useAuthContext } from '../../../../context/AuthContext';
import { useProfileLolContext } from '../../../../context/ProfileLolContext';
import { ProfileLolProps } from '../../../../services/getProfileLol';
import { useResource } from '../../../custom_hooks/useResource';
import { CardPerfil } from './CardPerfil';

const ProfileLol = ({}) => {

    const { user } = useAuthContext();
    const { profile, fetchProfile } = useProfileLolContext();
    useResource<ProfileLolProps>(() => fetchProfile());

    console.log(profile)
    console.log("user ",user?.user_id)

  return (
    <div>
      {profile ? (
        <>
          <h2 className='text-black-300'>Nick: {profile.username}</h2>
          <p className='text-black-300'>Rank: {profile.rank}</p>
        </>
      ) : (
        <>
        <p>sem perfil</p>
        <CardPerfil/>
        </>
      )}
    </div>
  )
}

export default ProfileLol
