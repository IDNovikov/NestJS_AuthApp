import { AggregateRoot } from '@nestjs/cqrs';
import {
  ISetUserImage,
  SET_USER_IMAGE,
} from './userImage-cases/set-userImage.case';
import {
  DEL_USER_IMAGE,
  IDelUserImage,
} from './userImage-cases/del-userImage.case';
import { IUser } from '../user.interface';
import {
  ISetUserStatus,
  SET_USER_STATUS,
} from './userStatus-cases/set-status.case';

export class UserServices
  extends AggregateRoot
  implements ISetUserImage, IDelUserImage, ISetUserStatus
{
  setUserImage = SET_USER_IMAGE;
  delUserImage = DEL_USER_IMAGE;
  setUserStatus = SET_USER_STATUS;
}
