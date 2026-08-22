import { Schema, models, model, Document, Model } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  summary?: string;
  price: number;
  genre: string;
  coverImage: string;
  stock: number;
  publishYear?: number;
  pages?: number;
  language?: string;
  publisher?: string;
  isbn?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    summary: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    genre: { type: String, required: true, trim: true },
    coverImage: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    publishYear: { type: Number, min: 0 },
    pages: { type: Number, min: 0 },
    language: { type: String, trim: true },
    publisher: { type: String, trim: true },
    isbn: { type: String, trim: true },
  },
  { timestamps: true }
);

export default (models.Book as Model<IBook>) || model<IBook>("Book", BookSchema);
