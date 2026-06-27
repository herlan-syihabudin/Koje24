// hooks/useProducts.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useProducts() {
  const { data, error, mutate } = useSWR('/api/dashboard/products', fetcher);

  return {
    products: data?.products || [],
    isLoading: !error && !data,
    isError: error,
    mutate, // panggil mutate setelah add/edit/delete
  };
}

// Di dashboard products page:
const { products, mutate } = useProducts();

// Setelah sukses add/edit:
await mutate(); // revalidate cache
