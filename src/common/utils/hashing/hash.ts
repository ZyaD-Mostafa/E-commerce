import bcrypt from 'bcrypt';

export const hash = async (
  plainTest: string,
  salt = Number(process.env.SALT),
): Promise<string> => {
  return await bcrypt.hash(plainTest, salt);
};

export const compareHash = async (
  plainTest: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainTest, hash);
};
