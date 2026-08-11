export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-3">
      <span
        className="inline-block w-12 h-12 rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent animate-spin"
        role="status"
        aria-label="Cargando"
      />
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Cargando...</p>
    </div>
  );
}
