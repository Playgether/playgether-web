import {
  authorizeCloudinaryDeleteMutation,
  cloudinaryMutationErrorResponse,
} from "../_lib/authorizeCloudinaryMutation";

const ALLOWED_RESOURCE_TYPES = new Set(["image", "video"]);

export async function POST(request: Request) {
  try {
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

    await authorizeCloudinaryDeleteMutation(publicId, resourceType);
    return Response.json(
      { queued: true, public_id: publicId, resource_type: resourceType },
      { status: 202 },
    );
  } catch (error) {
    return cloudinaryMutationErrorResponse(error, "signed-delete-posts");
  }
}
