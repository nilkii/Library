import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import type { BookDTO } from "@/types/models";

interface BookFormValues {
  title: string;
  author: string;
  description: string;
  summary: string;
  price: number;
  genre: string;
  coverImage: string;
  stock: number;
  publishYear?: number;
  pages?: number;
  language: string;
  publisher: string;
  isbn: string;
}

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBook?: BookDTO | null;
  onSaved: (book: BookDTO) => void;
}

const emptyValues: BookFormValues = {
  title: "",
  author: "",
  description: "",
  summary: "",
  price: 0,
  genre: "",
  coverImage: "",
  stock: 0,
  publishYear: undefined,
  pages: undefined,
  language: "",
  publisher: "",
  isbn: "",
};

export default function BookFormModal({ isOpen, onClose, initialBook, onSaved }: BookFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({ defaultValues: emptyValues });

  useEffect(() => {
    if (isOpen) {
      reset(initialBook ? { ...emptyValues, ...initialBook } : emptyValues);
    }
  }, [isOpen, initialBook, reset]);

  const onSubmit = async (data: BookFormValues) => {
    const payload = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      publishYear: data.publishYear ? Number(data.publishYear) : undefined,
      pages: data.pages ? Number(data.pages) : undefined,
      language: data.language || undefined,
      publisher: data.publisher || undefined,
      isbn: data.isbn || undefined,
      summary: data.summary || undefined,
    };
    const url = initialBook ? `/api/books/${initialBook._id}` : "/api/books";
    const method = initialBook ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (!res.ok) {
      setError("root", { message: result.message ?? "Diçka shkoi keq." });
      return;
    }

    onSaved(result);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialBook ? "Ndrysho librin" : "Shto libër të ri"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" noValidate>
        <div>
          <label className="lib-label">Titulli</label>
          <input className="lib-input" {...register("title", { required: "E detyrueshme." })} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="lib-label">Autori</label>
          <input className="lib-input" {...register("author", { required: "E detyrueshme." })} />
          {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author.message}</p>}
        </div>

        <div>
          <label className="lib-label">Përshkrimi i shkurtër</label>
          <textarea rows={2} className="lib-input resize-y" {...register("description", { required: "E detyrueshme." })} />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          <p className="mt-1 text-xs text-muted">Shfaqet te karta e librit — një fjali.</p>
        </div>

        <div>
          <label className="lib-label">Përmbledhja e plotë</label>
          <textarea rows={5} className="lib-input resize-y" {...register("summary")} />
          <p className="mt-1 text-xs text-muted">Teksti i gjatë, shfaqet në fund të faqes së librit.</p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="lib-label">Çmimi (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="lib-input"
              {...register("price", { required: "E detyrueshme.", min: { value: 0, message: ">= 0" }, valueAsNumber: true })}
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="lib-label">Stoku</label>
            <input
              type="number"
              min="0"
              className="lib-input"
              {...register("stock", { required: "E detyrueshme.", min: { value: 0, message: ">= 0" }, valueAsNumber: true })}
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
          </div>
        </div>

        <div>
          <label className="lib-label">Zhanri</label>
          <input className="lib-input" {...register("genre", { required: "E detyrueshme." })} />
          {errors.genre && <p className="mt-1 text-xs text-red-600">{errors.genre.message}</p>}
        </div>

        <div>
          <label className="lib-label">URL e kapakut</label>
          <input className="lib-input" placeholder="https://..." {...register("coverImage", { required: "E detyrueshme." })} />
          {errors.coverImage && <p className="mt-1 text-xs text-red-600">{errors.coverImage.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="lib-label">Viti i botimit</label>
            <input type="number" className="lib-input" {...register("publishYear", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="lib-label">Numri i faqeve</label>
            <input type="number" min="0" className="lib-input" {...register("pages", { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="lib-label">Gjuha</label>
            <input className="lib-input" placeholder="Shqip, Anglisht…" {...register("language")} />
          </div>
          <div>
            <label className="lib-label">Shtëpia botuese</label>
            <input className="lib-input" {...register("publisher")} />
          </div>
        </div>

        <div>
          <label className="lib-label">ISBN</label>
          <input className="lib-input" {...register("isbn")} />
        </div>

        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Anulo
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialBook ? "Ruaj" : "Shto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
