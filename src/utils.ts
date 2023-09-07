import fetch from 'node-fetch-commonjs';

/**
 * Upload an image to our servers
 *
 * @param imageB64 the base64 string to upload
 * @returns the URl representing the image
 */
const uploadImage = async (imageB64: string): Promise<string> => {
  // Upload image via a POST request
  const imagePayload = {
    bucket: process.env.UPLOAD_BUCKET,
    image: `data:image/png;base64,${imageB64}`,
  };
  const response = await fetch(`${process.env.UPLOAD_SERVICE_URL}/upload/`, {
    method: 'POST',
    body: JSON.stringify(imagePayload),
  });

  const responseData = JSON.parse(await response.text());
  return responseData.data;
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

  const responseData = JSON.parse(await response.text());
  if (responseData.success === 'false') {
    console.log(`Removing an image from our servers failed with image URL: ${imageURL}`);
  }
  return responseData.success === 'true';
};

export default { removeImage, uploadImage };
