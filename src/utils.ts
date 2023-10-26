import { createReadStream, unlinkSync } from 'fs';
import fetch from 'node-fetch-commonjs';
import FormData from 'form-data';

interface UploadResponse {
  success: boolean;
  data: string;
}

/**
 * Upload an image to our servers
 *
 * @param image the file that the user sent in their form data request
 * @returns the URl representing the image
 */
const uploadImage = async (image: Express.Multer.File): Promise<string> => {
  // Upload image via a POST request
  const form = new FormData();
  form.append('bucket', process.env.UPLOAD_BUCKET);
  form.append('image', createReadStream(image.path));

  const response = await fetch(`${process.env.UPLOAD_SERVICE_URL}/upload/`, {
    method: 'POST',
    headers: form.getHeaders(),
    body: form,
  });
  // Delete the image after sending it to the upload service
  unlinkSync(image.path);

  let responseData: UploadResponse | undefined;
  try {
    const json = await response.json();
    responseData = json as UploadResponse;
  } catch (e) {
    console.log(`error sending request: ${e}`);
  }
  return responseData?.data;
};

/**
 * Remove an image from AppDev servers
 *
 * @param imageURL the image URL to remove
 * @returns true if the deletion was successful; otherwise false
 */
const removeImage = async (imageURL: string): Promise<boolean> => {
  // Delete image via a POST request
  const payload = {
    bucket: process.env.UPLOAD_BUCKET,
    image_url: imageURL,
  };
  const response = await fetch(`${process.env.UPLOAD_SERVICE_URL}/remove/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const responseData = (await response.json()) as UploadResponse;
  if (!responseData.success) {
    console.log(`Removing an image from our servers failed with image URL: ${imageURL}`);
  }
  return responseData.success;
};

export default { removeImage, uploadImage };
