import { Schema, models, model, Document, Model } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  price: number;
  genre: string;
  coverImage: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    genre: { type: String, required: true, trim: true },
    coverImage: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export default (models.Book as Model<IBook>) || model<IBook>("Book", BookSchema);
