import {Meta, StoryObj} from "@storybook/react"
import ProfileCard from "./ProfileCard"
import { ProfileContext } from "../../../../../../context/ProfileContext";
import { AuthContext } from "../../../../../../context/AuthContext";
import { UserProps } from "../../../../../../context/AuthContext";
import { loginUserProps } from "../../../../../../services/loginUser";

const ProfileContextMock = ({children}) => {
    const mockProfile = { 
        id: 1,
        bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." ,
        profile_photo: "https://media.gettyimages.com/id/1282821098/pt/foto/happy-young-man-in-the-city.jpg?s=612x612&w=gi&k=20&c=FJ7jeagRFTj4jlvAc0rR8E4sJzGOHCQDVy0mjHk9rX4=",
        verified: false,
        matches_played: 0,
        hours_played: 0,
        performance: "Iniciante",
        gamer_nivel:0
      };

    const fetchProfile = () => {
        return
    }

    return (
        <ProfileContext.Provider value={{profile:mockProfile, fetchProfile:fetchProfile}}>
            {children}
        </ProfileContext.Provider>
    )
}

const UserContextMock = ({children}) => {
    const mockUser:UserProps = {
        first_name:"Henry",
        last_name:"Johnson",
        user_id:1,
        username:"henry_johnson",
    }

    const login = (mockLoginUserProps:loginUserProps) => {
        return new Promise<void>((resolve) => {
            resolve();
          });
    }

    const logout = () =>{
        return
    }

    return (
        <AuthContext.Provider value={{user:mockUser, login:login, logout:logout, wrongPassword:null, authTokens:null, isLoggedOut:false}}>
            {children}
        </AuthContext.Provider>
    )
}



const meta: Meta<typeof ProfileCard> = {
    component:ProfileCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators:[
        (Story) => {
            return (
                <ProfileContextMock>
                    <UserContextMock>
                        {Story()}
                    </UserContextMock>
                </ProfileContextMock>
            )
        }
    ]
}

export default meta;

type Story = StoryObj<typeof ProfileCard>

export const Primary: Story = {}