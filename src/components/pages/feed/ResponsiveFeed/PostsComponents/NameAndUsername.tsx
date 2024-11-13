import ProfileAndUsername from "../../../../layouts/components/ProfileAndUsername"

type NameAndUsernameResponsiveProps = {
    username: string;
    profile_photo: string;
}

export const NameAndUsernameResponsive = ({username, profile_photo}:NameAndUsernameResponsiveProps) => {
    return (
        <ProfileAndUsername username={username}
        imageClassName="mt-3 ml-3 h-10 w-10" 
        profile_photo={profile_photo}
        />
    )
}