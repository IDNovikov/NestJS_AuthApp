import { $Enums, User } from "@prisma/client";
//TODO: Меняем сущность в бд id = string
export interface IUser extends Partial<Omit<User, "id"| "createdAt"|"updatedAt">> {
    id: string;
    userName: string;
    email: string;
    isEmailVerified: boolean;
    telegramId: string | null;
    role: $Enums.userRoles;
    status: $Enums.userStatus;
    password: string;
    userImage: string | null;
    createdAt: string
    updatedAt: string;
}