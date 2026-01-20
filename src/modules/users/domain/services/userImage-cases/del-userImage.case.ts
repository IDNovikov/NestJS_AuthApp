import { IUser } from '../../user.interface';

export interface IDelUserImage {
  delUserImage(this: IUser): void;
}

export const DEL_USER_IMAGE = async function (this: IUser) {
  this.userImage = null;
  this.updatedAt = new Date();
  //.toISOString();
};
