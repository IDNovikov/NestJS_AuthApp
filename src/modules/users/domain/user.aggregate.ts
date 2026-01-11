import { $Enums } from "@prisma/client";
import { IUser } from "./user.interface";

export class UserAggregate implements IUser{
    id: string = crypto.randomUUID();
    userName: string;
    email: string;
    isEmailVerified: boolean = false;
    telegramId: string | null = null;
    role: $Enums.userRoles = "USER";
    status: $Enums.userStatus ;
    password: string;
    userImage: string | null;
    createdAt = new Date ().toISOString()
    updatedAt= new Date ().toISOString();
  
    static createNew () {

    }

    static restore() {

    }
}