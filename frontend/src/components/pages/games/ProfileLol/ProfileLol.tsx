import React from 'react'

import { useAuthContext } from '../../../../context/AuthContext';
import { useProfileLolContext } from '../../../../context/ProfileLolContext';
import { ProfileLolProps } from '../../../../services/getProfileLol';
import { useResource } from '../../../custom_hooks/useResource';

const ProfileLol = ({}) => {

    const { user } = useAuthContext();
    const { profile, fetchProfile } = useProfileLolContext();
    useResource<ProfileLolProps>(() => fetchProfile());

    const soloq = () => {
      if (profile && profile[0].queueType === 'RANKED_SOLO_5x5') {
        return `${profile[0].tier} ${profile[0].rank}`;
      }
    }

  return (
    <div>
      {profile ? (
        <>
          <h2 className='text-black-300'>Nick: {soloq()}</h2>
          <p className='text-black-300'>Rank: {profile[0].queueType}</p>
        </>
      ) : (
        <p>sem perfil</p>
      )}
    </div>
  )
}

export default ProfileLol
