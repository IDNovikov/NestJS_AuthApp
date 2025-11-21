import { Prisma } from '@prisma/client';

export const safeSelect = {
  id: true,
  email: true,
  userName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  isEmailVerified: true,
};
export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeSelect;
}>;
