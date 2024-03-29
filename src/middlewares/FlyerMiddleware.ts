import { MiddlewareFn } from 'type-graphql';
import { Context } from 'vm';
import utils from '../utils';

const FlyerUploadErrorInterceptor: MiddlewareFn<Context> = async ({ args, context }, next) => {
  try {
    // Upload image to our upload service (if not null)
    if (args.imageB64) {
      context.imageURL = await utils.uploadImage(args.imageB64);
      return await next();
    }

    // If null, move on
    return await next();
  } catch (err) {
    console.log(`Error uploading a flyer: ${err}`);
    throw new Error(err as string);
  }
};

export default { FlyerUploadErrorInterceptor };
