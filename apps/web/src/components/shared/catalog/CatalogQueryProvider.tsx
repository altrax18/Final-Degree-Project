import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// PROVEEDOR COMPARTIDO: CatalogQueryProvider
// RESPONSABILIDAD:
// - Proporciona una instancia de `QueryClient` con opciones coherentes para todos los catálogos.
// - Evita que cada cliente cree su propia instancia repetida (DRY).
// POR QUÉ: Centralizar la configuración de React Query facilita cambios y consistencia.

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export default function CatalogQueryProvider({
  children,
  client,
}: {
  children: React.ReactNode;
  client?: QueryClient;
}) {
  // Si el consumidor pasa un cliente personalizado lo usamos, si no usamos el compartido.
  const usedClient = client ?? defaultQueryClient;

  return <QueryClientProvider client={usedClient}>{children}</QueryClientProvider>;
}
