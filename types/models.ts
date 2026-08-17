// Plain, JSON-serializable shapes used on the client (getStaticProps/getServerSideProps
// cannot return Mongoose documents or ObjectId/Date instances directly).

export interface BookDTO {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  genre: string;
  coverImage: string;
  stock: number;
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
