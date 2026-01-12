import { userStatus } from '@prisma/client';
import { IUser } from '../../user.interface';

export interface ISetUserStatus {
  setUserStatus(this: IUser, status: userStatus): void;
}

export const SET_USER_STATUS = async function (
  this: IUser,
  status: userStatus,
) {
  this.status = status;
  this.updatedAt = new Date().toISOString();
};
