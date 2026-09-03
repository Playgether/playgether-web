import { CldUploadWidget } from "next-cloudinary";
import { GoFileMedia } from "react-icons/go";
import { useAuthContext } from "../../../../../../../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { PostMediaProps } from "../../../../../../../services/postPost";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";
import { deletePostFile } from "@/services/cloudinary_requests/deletePostFile";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import {
  BYTES_5_MB,
  BYTES_50_MB,
  CLOUDINARY_IMAGE_AND_VIDEO_FORMATS,
  createVideoDurationPreBatchValidator,
  POST_VIDEO_MAX_DURATION_SEC,
  videoExceedsMaxDuration,
} from "@/app/utils/cloudinaryUploadConfig";

const Step3 = ({
  setUploadedFiles,
  handleSubmit,
  makeUploadRequest,
  uploadedFiles,
  returnFirstStep,
}) => {
  const [widgetKey, setWidgetKey] = useState(0);
  const [activeUploads, setActiveUploads] = useState(0);
  const { user } = useAuthContext();
  const validatePostVideoDuration = useMemo(
    () =>
      createVideoDurationPreBatchValidator({
        maxDurationSec: POST_VIDEO_MAX_DURATION_SEC,
        onError: (message) => {
          CustomToast.error("Vídeo inválido", {
            description: message,
            duration: CustomToastProps.defaultDuration,
          });
        },
      }),
    [],
  );

  const handleUploadSuccess = async (result) => {
    if (videoExceedsMaxDuration(result?.info, POST_VIDEO_MAX_DURATION_SEC)) {
      deletePostFile(result.info.public_id, "", "video").catch(console.error);
      CustomToast.error("Vídeo muito longo", {
        description: `Vídeos devem ter no máximo ${POST_VIDEO_MAX_DURATION_SEC} segundos.`,
        duration: CustomToastProps.defaultDuration,
      });
      setActiveUploads((prevCount) => prevCount - 1);
      return;
    }

    await setUploadedFiles((prevFiles: PostMediaProps[]) => [
      ...prevFiles,
      {
        url: result.info.secure_url,
        media_file: result.info.public_id,
        media_type: result.info.resource_type,
        width: result.info.width,
        height: result.info.height,
        bytes_file: result.info.bytes,
        file_format: result.info.format,
        created_at: result.info.created_at,
        media_folder: result.info.asset_folder,
      },
    ]);
    setActiveUploads((prevCount) => prevCount - 1);
  };

  const handleUploadError = (file) => {
    CustomToast.error("Um dos seus uploads não cumpre as diretrizes", {
      description: file.statusText,
      duration: CustomToastProps.defaultDuration,
    });
    setWidgetKey((prevCount) => prevCount + 1);

    setUploadedFiles((prevFiles: PostMediaProps[]) => {
      for (const media of prevFiles) {
        if (!media.media_file) continue;
        deletePostFile(
          media.media_file,
          media.media_folder,
          media.media_type,
        ).catch((err) => console.error("Erro ao deletar mídia:", err));
      }
      return [];
    });
  };

  const handleOnAbort = () => {
    setActiveUploads(0);
    setWidgetKey((prevCount) => prevCount + 1);
  };

  const handleQueuesEnd = () => {
    setActiveUploads(0);
    setWidgetKey((prevCount) => prevCount + 1);
  };

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
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col gap-1 p-2 Step3-wrapper">
      <CustomToaster />
      <div className="flex flex-col gap-1 w-full text-center">
        <p className="text-xs">Envie até 5 fotos ou vídeos.</p>
        <p className="text-xs">Fotos podem ter no máximo 5mb e vídeos 50mb.</p>
        <p className="text-xs">
          Vídeos devem ter no máximo {POST_VIDEO_MAX_DURATION_SEC} segundos.
        </p>
      </div>
      <div className="w-full flex justify-center pt-2">
        <CldUploadWidget
          key={widgetKey}
          signatureEndpoint="/api/signed-posts"
          options={{
            sources: ["local"],
            maxFiles: 5,
            tags: [`${user?.username}`, getCurrentDate(), "post", "user"],
            uploadPreset: PresetsCloudinary.posts,
            resourceType: "auto",
            clientAllowedFormats: [
              ...CLOUDINARY_IMAGE_AND_VIDEO_FORMATS,
            ],
            maxImageFileSize: BYTES_5_MB,
            maxVideoFileSize: BYTES_50_MB,
            preBatch: validatePostVideoDuration,
            language: "pt-br",
            showCompletedButton: true,
            multiple: true,
          }}
          onUploadAdded={handleUploadStart}
          onSuccess={handleUploadSuccess}
          onAbort={() => handleOnAbort}
          onOpen={() => setActiveUploads(0)}
          onError={handleUploadError}
          onQueuesEnd={handleQueuesEnd}
        >
          {({ open }) => {
            return (
              <GoFileMedia
                className="h-12 w-12 text-black-200 cursor-pointer"
                onClick={() => open()}
              />
            );
          }}
        </CldUploadWidget>
      </div>
      <span className="Step3-error text-sm text-center">
        Caso não queira adicionar nenhuma media, apenas avance para realizar seu
        post
      </span>
    </div>
  );
};

export default Step3;
