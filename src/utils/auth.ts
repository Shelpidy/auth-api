import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv?.config();

const SECRET = process.env.JWT_SECRET || 'supersecret';

/** Hash password */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/** Compare passwords */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  DELETED = 203,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}
