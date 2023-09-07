import { MiddlewareFn } from 'type-graphql';
import { Context } from 'vm';
import utils from '../utils';

const FlyerUploadErrorInterceptor: MiddlewareFn<Context> = async ({ args, context }, next) => {
  try {
    // Upload image to our upload service
    context.imageURL = await utils.uploadImage(args.imageB64);
    return await next();
  } catch (err) {
    throw new Error('An error occured while uploading the flyer image.');
  }
};

export default { FlyerUploadErrorInterceptor };
