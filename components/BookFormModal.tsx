import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import type { BookDTO } from "@/types/models";

interface BookFormValues {
  title: string;
  author: string;
  description: string;
  price: number;
  genre: string;
  coverImage: string;
  stock: number;
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
  price: 0,
  genre: "",
  coverImage: "",
  stock: 0,
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
      reset(initialBook ? { ...initialBook } : emptyValues);
    }
  }, [isOpen, initialBook, reset]);

  const onSubmit = async (data: BookFormValues) => {
    const payload = { ...data, price: Number(data.price), stock: Number(data.stock) };
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Titulli</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...register("title", { required: "E detyrueshme." })}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Autori</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...register("author", { required: "E detyrueshme." })}
          />
          {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Përshkrimi</label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...register("description", { required: "E detyrueshme." })}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Çmimi (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("price", { required: "E detyrueshme.", min: { value: 0, message: ">= 0" }, valueAsNumber: true })}
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Stoku</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              {...register("stock", { required: "E detyrueshme.", min: { value: 0, message: ">= 0" }, valueAsNumber: true })}
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Zhanri</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            {...register("genre", { required: "E detyrueshme." })}
          />
          {errors.genre && <p className="mt-1 text-xs text-red-600">{errors.genre.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">URL e kapakut</label>
          <input
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder="https://..."
            {...register("coverImage", { required: "E detyrueshme." })}
          />
          {errors.coverImage && <p className="mt-1 text-xs text-red-600">{errors.coverImage.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
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
