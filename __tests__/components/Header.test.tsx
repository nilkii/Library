import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({ pathname: "/", push: jest.fn() }),
}));

jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light", toggleTheme: jest.fn() }),
}));

jest.mock("@/context/CartContext", () => ({
  useCart: () => ({ itemCount: 0 }),
}));

describe("Header", () => {
  it("renders the site name and main navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Libraria")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Books" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("shows Login/Register when unauthenticated", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  });
});
