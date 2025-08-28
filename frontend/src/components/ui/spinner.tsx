export function Spinner() {
  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-primary motion-safe:animate-spin motion-reduce:animate-none motion-reduce:border-b-transparent"></div>
    </div>
  );
}
