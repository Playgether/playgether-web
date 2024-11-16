import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
   

export async function POST(req:Request, res) {
    try {
        const { public_id, resource_type } = await req.json(); 
        const result = await cloudinary.uploader.destroy(public_id, {
            invalidate: true,
            resource_type: resource_type
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}