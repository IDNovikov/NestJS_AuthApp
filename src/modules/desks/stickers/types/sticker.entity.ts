export class StickerEntity {
  constructor(
    public readonly id: number,
    public readonly deskId: number,
    public text: string,
    public x: number,
    public y: number,
    public color: string | null,
    public layer: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}

export type ISticker = InstanceType<typeof StickerEntity>;
