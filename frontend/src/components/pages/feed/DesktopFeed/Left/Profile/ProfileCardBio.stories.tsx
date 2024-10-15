import type { Meta, StoryObj } from '@storybook/react';
import { ProfileCardBio } from './ProfileCardBio';
import { ProfileContext } from '../../../../../../context/ProfileContext';
import { ProfileProps } from '../../../../../../services/getProfile';


const ProfileContextMock = ({ children }) => {
  const mockProfile = { 
    id: 1,
    bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." ,
    profile_photo: "",
    verified: false,
    matches_played: 0,
    hours_played: 0,
    performance: "",
    gamer_nivel:0
  };


const fetchProfile = () => {
  return new Promise<ProfileProps>((resolve)=>{
    resolve
  })
}

  return (
      <ProfileContext.Provider value={{ profile: mockProfile, fetchProfile: fetchProfile }}>
          {children}
      </ProfileContext.Provider>
  );
};



const meta: Meta<typeof ProfileCardBio> = {
  component: ProfileCardBio,
  decorators:[
    (Story) => {
      return(
        <ProfileContextMock>
          {Story()}
        </ProfileContextMock>
      )
    }
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ProfileCardBio>;

export const Primary: Story = {};