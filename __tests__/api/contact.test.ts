import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/contact";

jest.mock("@/lib/dbConnect", () => jest.fn().mockResolvedValue(undefined));

jest.mock("@/models/ContactMessage", () => ({
  create: jest.fn(),
}));

jest.mock("@/lib/apiAuth", () => ({
  requireAdmin: jest.fn(),
}));

import ContactMessage from "@/models/ContactMessage";

describe("/api/contact", () => {
  afterEach(() => jest.clearAllMocks());

  it("rejects a submission missing required fields", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { name: "A", email: "not-an-email", subject: "", message: "" },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(ContactMessage.create).not.toHaveBeenCalled();
  });

  it("saves a valid contact message and returns 201", async () => {
    (ContactMessage.create as jest.Mock).mockResolvedValue({ _id: "abc123" });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: {
        name: "Anila",
        email: "anila@example.com",
        subject: "Pyetje",
        message: "Ky është një mesazh testues me më shumë se 10 karaktere.",
      },
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(ContactMessage.create).toHaveBeenCalledTimes(1);
    expect(JSON.parse(res._getData())).toMatchObject({ id: "abc123" });
  });
});
