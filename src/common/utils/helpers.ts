import { isString } from 'class-validator';

const validScanStatuses = [
  'ACCEPTED',
  'QUEUED',
  'SCANNING',
  'SAFE',
  'HARMFUL',
  'ERROR',
];

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

  if (bucketUid.length > 100 || fileUid.length > 100) {
    return false;
  }

  return true;
}

export const isDefined = (a: unknown) => a !== undefined;

// function which checks if string is in base64 format
export function isBase64(str: string): boolean {
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  return base64regex.test(str);
}

//check if scan status is valid
export function isValidScanStatus(status: string): boolean {
  return validScanStatuses.includes(status);
}

// return list of statuses in string
export function listOfStatuses(): string {
  return validScanStatuses.join(', ');
}
