import { v2 as cloudinary } from "cloudinary";
import { PresetsCloudinary } from "../../../components/content_types/PresetsCloudinary";
 
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 
export async function POST(request: Request) {
  const body = await request.json();
  const { paramsToSign } = body;

  paramsToSign.upload_preset = PresetsCloudinary.profile_image;

  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET não está definido nas variáveis de ambiente.");
  }

 
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
  
  return Response.json({ signature });
}