import { CldUploadWidget } from "next-cloudinary";
import { GoFileMedia } from "react-icons/go";
import { v4 as uuidv4} from 'uuid';
import { useAuthContext } from "../../../../../../../context/AuthContext";

const Step2 = () => {
    const {user} = useAuthContext()
    
    const generatePublicId = () => {
        const randomValue = uuidv4()
        return `${user?.username}_${randomValue}`;
    }

    const getCurrentDate = () => {
        const date = new Date();
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full flex flex-col gap-1 p-2">
            <div className="flex flex-col gap-1 w-full text-center">
                <p className="text-gray-500 text-xs">Envie até 5 fotos ou vídeos, com dimensões mínimas de 320x320 pixels.</p>
                <p className="text-gray-500 text-xs">Fotos podem ter no máximo 5mb e vídeos 50mb.</p>
                <p className="text-gray-500 text-xs">Videos maiores do que 30seg serão cortados para esta duração.</p>
            </div>
            <div className="w-full flex justify-center pt-2">
                <CldUploadWidget 
                    signatureEndpoint="/api/signed-posts"
                    options={{
                        sources:['local'],
                        minImageHeight:320,
                        minImageWidth:320,
                        maxFiles:5,
                        tags:[`${user?.username}`, getCurrentDate(), "post", "user"],
                        detection:"unidet",
                        maxImageFileSize:5000000,
                        maxVideoFileSize:50000000,
                        validateMaxWidthHeight:true,
                        language:"pt-br",
                        showCompletedButton:true,
                    }}
                    >
                        {({ open }) => {
                            return (
                            <GoFileMedia className='h-12 w-12 text-black-200 cursor-pointer' onClick={() => open()}/>
                            );
                        }}
                </CldUploadWidget>
            </div>
            <span className="text-red-500 text-sm text-center">Caso não queira adicionar nenhuma media, apenas avance para realizar seu post</span>
        </div>
    )
}

export default Step2;