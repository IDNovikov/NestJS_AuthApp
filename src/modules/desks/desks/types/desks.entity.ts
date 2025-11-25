export class DesksEntity {
  constructor(
    public readonly id: number,
    public name: string,
    public readonly userId: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public stickers?: number[] | null,
  ) {}
}

export type IDesk = InstanceType<typeof DesksEntity>;
