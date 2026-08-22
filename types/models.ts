// Plain, JSON-serializable shapes used on the client (getStaticProps/getServerSideProps
// cannot return Mongoose documents or ObjectId/Date instances directly).

export interface BookDTO {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDTO {
  _id: string;
  book: string;
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ContactMessageDTO {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type LibraryStatus = "want" | "reading" | "read";

export interface LibraryEntryDTO {
  status: LibraryStatus;
  book: BookDTO;
}

export interface OrderItemDTO {
  book: string;
  title: string;
  price: number;
  quantity: number;
}

export interface ShippingAddressDTO {
  fullName: string;
  address: string;
  city: string;
  phone: string;
}

export type OrderStatus = "placed" | "fulfilled" | "cancelled";

export interface OrderDTO {
  _id: string;
  user: string;
  items: OrderItemDTO[];
  total: number;
  shippingAddress: ShippingAddressDTO;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSummaryDTO extends OrderDTO {
  userName?: string;
  userEmail?: string;
}
