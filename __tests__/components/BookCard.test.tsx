import { render, screen } from "@testing-library/react";
import BookCard from "@/components/BookCard";
import type { BookDTO } from "@/types/models";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

const book: BookDTO = {
  _id: "507f1f77bcf86cd799439011",
  title: "The Silent Mountain",
  author: "Elira Kastrati",
  description: "A gripping novel about a hidden village.",
  price: 14.99,
  genre: "Fiction",
  coverImage: "https://placehold.co/400x600",
  stock: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("BookCard", () => {
  it("renders the book title, author and price", () => {
    render(<BookCard book={book} />);
    expect(screen.getByText("The Silent Mountain")).toBeInTheDocument();
    expect(screen.getByText("Elira Kastrati")).toBeInTheDocument();
    expect(screen.getByText("€14.99")).toBeInTheDocument();
  });

  it("links to the book's detail page", () => {
    render(<BookCard book={book} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/books/${book._id}`);
  });

  it("shows out-of-stock state when stock is 0", () => {
    render(<BookCard book={{ ...book, stock: 0 }} />);
    expect(screen.getByText("Pa stok")).toBeInTheDocument();
  });
});
