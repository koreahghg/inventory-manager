export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-grey-200 bg-white p-8 text-center text-body-2 text-grey-500">
      {message}
    </div>
  );
}
