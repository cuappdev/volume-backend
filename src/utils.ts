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

export default uploadImage;
