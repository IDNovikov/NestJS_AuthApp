import { IUser } from '../../user.interface';

export interface ISetUserImage {
  setUserImage(this: IUser, link: string): void;
}

export const SET_USER_IMAGE = async function (this: IUser, link: string) {
  this.userImage = link;
  this.updatedAt = new Date().toISOString();
};
