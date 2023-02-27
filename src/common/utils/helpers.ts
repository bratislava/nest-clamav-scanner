import { isString } from 'class-validator';

export function isValidBucketUidAndFileUid(
  bucketUid: any,
  fileUid: any,
): boolean {
  if (!isString(bucketUid) || !isString(fileUid)) {
    return false;
  }

  if (bucketUid.length < 3 || fileUid.length < 3) {
    return false;
  }

  return true;
}

// function which checks if string is in base64 format
export function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}
