import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { Injectable } from "@nestjs/common";
import { User } from "../schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async create(email: string, password: string): Promise<User> {
        const hashed = await bcrypt.hash(password, 10);
        const user = new this.userModel({ email, password: hashed });
        return user.save();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email });
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id);
    }

    async matchPassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        if (data.password) data.password = await bcrypt.hash(data.password, 10);
        return this.userModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id);
    }
}
