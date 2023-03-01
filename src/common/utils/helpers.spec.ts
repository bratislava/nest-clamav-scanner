import { isValid } from './helpers';

describe('helpers', () => {
  it('isValidBucketUidAndFileUid', async () => {
    const fileUid = '5f9b5b9c0b9b4b0b9b4b0b9b';
    const bucketUid = 'sfsfsfdsfsfsfsfsdfsdfs';

    expect(isValid(bucketUid, fileUid)).toBe(true);
  });
});
