import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/books/index";

jest.mock("@/lib/dbConnect", () => jest.fn().mockResolvedValue(undefined));

jest.mock("@/models/Book", () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

jest.mock("@/lib/apiAuth", () => ({
  requireAdmin: jest.fn(),
}));

import Book from "@/models/Book";
import { requireAdmin } from "@/lib/apiAuth";

describe("/api/books", () => {
  afterEach(() => jest.clearAllMocks());

  it("GET returns the list of books", async () => {
    const fakeBooks = [{ _id: "1", title: "Dune", author: "Frank Herbert" }];
    (Book.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(fakeBooks),
      }),
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: "GET" });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(fakeBooks);
  });

  it("POST is rejected for non-admins", async () => {
    (requireAdmin as jest.Mock).mockImplementation(async (_req, res) => {
      res.status(403).json({ message: "Vetëm adminët kanë qasje këtu." });
      return null;
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { title: "New Book" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(Book.create).not.toHaveBeenCalled();
  });

  it("POST creates a book for admins with valid data", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue({ user: { id: "1", role: "admin" } });
    const created = { _id: "2", title: "New Book", author: "Someone" };
    (Book.create as jest.Mock).mockResolvedValue(created);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        title: "New Book",
        author: "Someone",
        description: "A description",
        price: 9.99,
        genre: "Fiction",
        coverImage: "https://placehold.co/400x600",
        stock: 3,
      },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual(created);
  });
});
