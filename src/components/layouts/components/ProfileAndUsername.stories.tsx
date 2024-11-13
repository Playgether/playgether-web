import {Meta, StoryObj} from "@storybook/react"
import ProfileAndUsername from "./ProfileAndUsername"
import { ProfileAndUsernameProps } from "./ProfileAndUsername"

const meta:Meta<ProfileAndUsernameProps> = {
    component: ProfileAndUsername,
    tags: ['autodocs'],
    parameters:{
        layout:'centered'
    }
}

export default meta

type Story = StoryObj<typeof ProfileAndUsername>

/** Formato padrão */
export const Default:Story = {
    args: {
        className:"h-90 w-90",
        timestamp:new Date("2024-05-25T14:23:45Z"),
        imageClassName: "h-20 w-20",
        username:"test_username",
        profile_photo:"https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
    }
}

/** Sem passar a data, percebe que a informação que mostrava a quanto tempo foi sumiu */
export const WithoutTimeStamp:Story = {
    args: {
        className:"h-90 w-90",
        imageClassName: "h-20 w-20",
        username:"test_username",
        profile_photo:"https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
    }
}

/** Perceba que o nome de usuário sumiu */
export const WithoutUserName:Story = {
    args: {
        className:"h-90 w-90",
        timestamp:new Date("2024-05-25T14:23:45Z"),
        imageClassName: "h-20 w-20",
        profile_photo:"https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
    }
}
/** Por padrão, este componente exibirá uma imagem (sem foto) caso nenhuma imagem seja passada, perceba que a imagem de perfil não existe mais, porém, há uma imagem de "sem foto"
 * no lugar. Isto é útil porque caso o usuário não possua uma foto de perfil, essa imagem será exibida no lugar.
 */
export const WithoutProfileImage:Story = {
    args: {
        className:"h-90 w-90",
        timestamp:new Date("2024-05-25T14:23:45Z"),
        username:"test_username",
        imageClassName: "h-20 w-20",
    }
}

/** Assim como no componente ProfileImagePost (fazemos uso dele aqui), caso eu não passe uma altura / largura para o componente, a imagem não aparecerá. */
export const WithoutImageClassName:Story = {
    args: {
        className:"h-90 w-90",
        timestamp:new Date("2024-05-25T14:23:45Z"),
        username:"test_username",
        profile_photo:"https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
    }
}

/** Garanta também que tanto a altura quanto a largura tenham tamanho suficiente para o componente, pois caso não haja, a imagem tbm desaparecerá */
export const WithHeightAndWidthTooShort:Story = {
    args: {
        className:"h-20 w-20",
        timestamp:new Date("2024-05-25T14:23:45Z"),
        imageClassName: "h-20 w-20",
        username:"test_username",
        profile_photo:"https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
    }
}
