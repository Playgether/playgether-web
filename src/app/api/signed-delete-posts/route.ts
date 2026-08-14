import { v2 as cloudinary } from "cloudinary";
import {
  authorizeCloudinaryMutation,
  cloudinaryMutationErrorResponse,
} from "../_lib/authorizeCloudinaryMutation";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const ALLOWED_RESOURCE_TYPES = new Set(["image", "video"]);

export async function POST(request: Request) {
  try {
    await authorizeCloudinaryMutation();

    const body = (await request.json()) as {
      public_id?: unknown;
      resource_type?: unknown;
    };
    const publicId =
      typeof body.public_id === "string" ? body.public_id.trim() : "";
    const resourceType =
      typeof body.resource_type === "string" ? body.resource_type : "";

    if (
      !publicId ||
      publicId.length > 500 ||
      publicId.startsWith("/") ||
      publicId.includes("..") ||
      !ALLOWED_RESOURCE_TYPES.has(resourceType)
    ) {
      return Response.json(
        { error: "Parâmetros de exclusão inválidos" },
        { status: 400 },
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: resourceType,
    });
    return Response.json(result);
  } catch (error) {
    return cloudinaryMutationErrorResponse(error, "signed-delete-posts");
  }
}
