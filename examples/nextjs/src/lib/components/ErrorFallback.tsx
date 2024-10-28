export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  return (
    <article role="alert">
      <p>Something went wrong!</p>
      <pre>{JSON.stringify(error)}</pre>
      <button type="reset" onClick={resetErrorBoundary}>
        Retry
      </button>
    </article>
  );
}
