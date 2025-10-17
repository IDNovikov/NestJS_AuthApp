import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
@Injectable()
export class HashService {
  private readonly rounds: number;
  private readonly pepper: string;

  constructor(opts: { rounds: number; pepper: string }) {
    this.rounds = opts.rounds;
    this.pepper = opts.pepper;
  }

  async hash(plain: string): Promise<string> {
    const salted = plain + this.pepper;
    const salt = await bcrypt.genSalt(this.rounds);
    return bcrypt.hash(salted, salt);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const salted = plain + this.pepper;
    return bcrypt.compare(salted, hash);
  }
}
