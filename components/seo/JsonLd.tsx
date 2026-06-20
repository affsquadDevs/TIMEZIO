// Server component: emits JSON-LD into the initial HTML (no client useEffect),
// so structured data is visible to non-rendering crawlers.
type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export function JsonLd({ data, id }: { data: JsonLdData; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
