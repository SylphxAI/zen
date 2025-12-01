import { For, computed, signal } from '@zen/web';
import { Icon } from '../components/Icon.tsx';
import { categories, examples } from '../data/examples.ts';

export function Examples() {
  const selectedCategory = signal<string>('all');

  const filteredExamples = computed(() => {
    if (selectedCategory.value === 'all') {
      return examples;
    }
    return examples.filter((ex) => ex.category === selectedCategory.value);
  });

  return (
    <div class="min-h-screen bg-bg py-12">
      <div class="max-w-screen-xl mx-auto px-6">
        {/* Header */}
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-text mb-4">Examples</h1>
          <p class="text-xl text-text-muted max-w-2xl mx-auto">
            Learn Zen through practical examples. Each example demonstrates core concepts with
            working code you can run in the playground.
          </p>
        </div>

        {/* Category filter */}
        <div class="flex flex-wrap gap-3 justify-center mb-12">
          <button
            type="button"
            class={
              selectedCategory.value === 'all'
                ? 'px-5 py-2.5 bg-primary text-white rounded-zen font-medium transition-all shadow-zen'
                : 'px-5 py-2.5 bg-bg-light hover:bg-bg-lighter text-text-muted hover:text-text border border-border rounded-zen font-medium transition-all'
            }
            onClick={() => {
              selectedCategory.value = 'all';
            }}
          >
            All Examples
          </button>
          <For each={[...categories]}>
            {(cat) => (
              <button
                type="button"
                class={
                  selectedCategory.value === cat.id
                    ? 'px-5 py-2.5 bg-primary text-white rounded-zen font-medium transition-all shadow-zen flex items-center gap-2'
                    : 'px-5 py-2.5 bg-bg-light hover:bg-bg-lighter text-text-muted hover:text-text border border-border rounded-zen font-medium transition-all flex items-center gap-2'
                }
                onClick={() => {
                  selectedCategory.value = cat.id;
                }}
              >
                <Icon icon={cat.icon} width="18" height="18" />
                {cat.name}
              </button>
            )}
          </For>
        </div>

        {/* Examples grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={filteredExamples}>
            {(example) => (
              <div class="bg-bg-light border border-border rounded-zen overflow-hidden hover:border-primary/50 hover:shadow-zen transition-all group">
                {/* Header */}
                <div class="bg-bg-lighter border-b border-border px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-zen group-hover:bg-primary group-hover:text-white transition-all">
                      <Icon icon={example.icon} width="20" height="20" />
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-text">{example.title}</h3>
                      <span class="text-xs text-text-muted capitalize">{example.category}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div class="p-6">
                  <p class="text-text-muted mb-4 line-clamp-2">{example.description}</p>

                  {/* Code preview */}
                  <pre class="bg-bg border border-border rounded-zen p-3 text-xs text-text-muted font-mono overflow-hidden max-h-32 mb-4">
                    {example.code.slice(0, 200)}...
                  </pre>

                  {/* Action */}
                  <a
                    href={`/playground?example=${example.id}`}
                    class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-zen transition-colors"
                  >
                    <Icon icon="lucide:play" width="16" height="16" />
                    Run in Playground
                  </a>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Empty state */}
        {filteredExamples.value.length === 0 && (
          <div class="text-center py-16">
            <Icon
              icon="lucide:search"
              width="48"
              height="48"
              class="text-text-muted mx-auto mb-4"
            />
            <h3 class="text-xl font-semibold text-text mb-2">No examples found</h3>
            <p class="text-text-muted">Try selecting a different category</p>
          </div>
        )}

        {/* CTA */}
        <div class="mt-16 text-center bg-bg-light border border-border rounded-zen p-8">
          <h3 class="text-2xl font-bold text-text mb-3">Want to try these examples?</h3>
          <p class="text-text-muted mb-6 max-w-xl mx-auto">
            Head to the playground to edit and run any example. See instant results as you modify
            the code.
          </p>
          <a
            href="/playground"
            class="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-zen shadow-zen transition-all hover:scale-105"
          >
            <Icon icon="lucide:terminal" width="20" height="20" />
            Open Playground
          </a>
        </div>
      </div>
    </div>
  );
}
