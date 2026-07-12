import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api";

export type SustainabilityRating = "A" | "B" | "C" | "D" | "F";

export interface ProductEsgProfile {
  id: string;
  product_name: string;
  product_code: string;
  emission_factor_id: string | null;
  recyclability_pct: number | null;
  sustainability_rating: SustainabilityRating | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductEsgProfileCreate {
  product_name: string;
  product_code: string;
  emission_factor_id?: string | null;
  recyclability_pct?: number | null;
  sustainability_rating?: SustainabilityRating | null;
  notes?: string | null;
}

export type ProductEsgProfileUpdate = Partial<ProductEsgProfileCreate>;

export function useProductEsgProfiles(page = 1, per_page = 20) {
  return useQuery({
    queryKey: ["product-esg-profiles", page, per_page],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<ProductEsgProfile>>>(
        "/product-esg-profiles",
        { params: { page, per_page } }
      );
      return res.data.data;
    },
  });
}

export function useCreateProductEsgProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductEsgProfileCreate) => {
      const res = await api.post<SuccessResponse<ProductEsgProfile>>(
        "/product-esg-profiles",
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-esg-profiles"] });
    },
  });
}

export function useUpdateProductEsgProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductEsgProfileUpdate }) => {
      const res = await api.patch<SuccessResponse<ProductEsgProfile>>(
        `/product-esg-profiles/${id}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-esg-profiles"] });
    },
  });
}
