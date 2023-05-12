import { isString } from 'class-validator';

const validScanStatuses = [
  //when file was accepted for scanning
  'ACCEPTED',
  //when file is queued for scanning by the scan worker
  'QUEUED',
  //when file is being scanned by clamav
  'SCANNING',
  //when scan result is safe
  'SAFE',
  //when scan result is infected
  'INFECTED',
  //when file is not found in minio
  'NOT FOUND',
  //when file is safe but there was an error while moving it to safe bucket
  'MOVE ERROR SAFE',
  //when file is infected but there was an error while moving it to infected bucket
  'MOVE ERROR INFECTED',
  //when there was a clamav error while scanning file
  'SCAN ERROR',
  //when scan by clamav timed out
  'SCAN TIMEOUT',
  //after x number of unsuccessful scans, this status is set
  'SCAN NOT SUCCESSFUL',
];

export function isValid(resource: any): boolean {
  if (!isString(resource)) {
    return false;
  }

  if (resource.length < 3) {
    return false;
  }

  if (resource.length > 1000) {
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

//function which splits array into chunks of size n
export function chunkArray<T>(arr: T[], n: number): T[][] {
  const chunks = [];
  for (let i = 0; i < arr.length; i += n) {
    chunks.push(arr.slice(i, i + n));
  }
  return chunks;
}

export function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve('SCAN TIMEOUT'), ms);
  });
}
