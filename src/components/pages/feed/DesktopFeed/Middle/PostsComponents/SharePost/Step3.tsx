import { CldUploadWidget } from "next-cloudinary";
import { GoFileMedia } from "react-icons/go";
import { useAuthContext } from "../../../../../../../context/AuthContext";
import { useEffect, useState } from "react";
import { PostMediaProps } from "../../../../../../../services/postPost";


const Step3 = ({setUploadedFiles, handleSubmit, makeUploadRequest, uploadedFiles, returnFirstStep}) =>{
    const {user} = useAuthContext()
    const [widgetKey, setWidgetKey] = useState(0);
    const [activeUploads, setActiveUploads] = useState(0);

    const handleUploadSuccess = async(result) => {
        await setUploadedFiles((prevFiles:PostMediaProps[]) => [
            ...prevFiles,
            {
                url: result.info.secure_url,
                media_file:result.info.public_id,
                media_type: result.info.resource_type,
                width: result.info.width,
                height: result.info.height,
                bytes_file: result.info.bytes,
                file_format: result.info.format,
                created_at: result.info.created_at,
                media_folder: result.info.asset_folder
            }
        ]);
        setActiveUploads((prevCount) => prevCount - 1);
    };

    const handleUploadError = (file) => {
        console.log(`Um dos seus uploads não cumprem as diretrizes: ${JSON.stringify(file)}`)
        setWidgetKey((prevCount) => prevCount + 1);
    }

    const handleOnAbort = () => {
        setActiveUploads(0)
        setWidgetKey((prevCount) => prevCount + 1)
    }

    const handleUploadStart = () => {
        setActiveUploads((prevCount) => prevCount + 1);
    };

    useEffect(() => {
        if (activeUploads === 0 && uploadedFiles.length > 0) {
            handleSubmit(makeUploadRequest)();
        }
    }, [activeUploads]);

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
                    key={widgetKey}
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
                    onUploadAdded={handleUploadStart}
                    onSuccess={handleUploadSuccess}
                    onAbort={() => handleOnAbort}
                    onOpen={()=> setActiveUploads(0)}
                    onError={handleUploadError}

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

export default Step3;