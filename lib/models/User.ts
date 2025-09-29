import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document
{
    name: string;
    email: string;
    password: string;
    role: "student" | "faculty" | "admin";
    onboardingCompleted: boolean;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "faculty", "admin"], required: true },
    onboardingCompleted: { type: Boolean, default: false },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
