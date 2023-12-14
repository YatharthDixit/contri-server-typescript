import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
  phoneNumber: string;
  name: string;
  upi?: string;
  email?: string;
  type: string;
  didUserSigned: boolean;
  currency: string;
  country: string;
  photoURL: string;
  fcmToken: string;
}

export interface IUserModel extends IUser, Document {}

const userSchema = new Schema<IUserModel>({
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  upi: {
    default: "",
    type: String,
  },
  email: {
    type: String,
    default: "",
    trim: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
    default: "user",
  },
  didUserSigned: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: String,
    default: "INR",
  },
  country: {
    type: String,
    default: "India",
  },
  photoURL: {
    type: String,
    default:
      "https://res.cloudinary.com/dzbgk67sd/image/upload/v1702044411/contri-profile-pictures/default_profile_pic.jpg",
  },
  fcmToken: {
    type: String,
    default: "",
  },
});

const User = mongoose.model<IUserModel>("User", userSchema);

export { User };
