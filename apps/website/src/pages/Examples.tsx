import { For, Show, computed, signal } from '@zen/zen';
import { Icon } from '../components/Icon.tsx';
import { categories, examples } from '../data/examples.ts';

export function Examples() {
  const selectedCategory = signal<string>('basic');
  const selectedExampleId = signal<string>('counter');
  const showCode = signal(false);

  const filteredExamples = computed(() =>
    examples.filter((ex) => ex.category === selectedCategory.value),
  );

  const selectedExample = computed(
    () => examples.find((ex) => ex.id === selectedExampleId.value) || examples[0],
  );

  // Auto-select first example when category changes
  const handleCategoryChange = (categoryId: string) => {
    selectedCategory.value = categoryId;
    const firstExample = examples.find((ex) => ex.category === categoryId);
    if (firstExample) {
      selectedExampleId.value = firstExample.id;
    }
  };

  return (
    <div class="min-h-screen bg-bg py-8">
      <div class="max-w-screen-2xl mx-auto px-6">
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-text mb-2">Examples</h1>
          <p class="text-xl text-text-muted">
            Real-world examples showcasing Zen's powerful features
          </p>
        </header>

        <div class="grid grid-cols-12 gap-6">
          {/* Category Sidebar */}
          <aside class="col-span-12 lg:col-span-2">
            <div class="bg-bg-light border border-border rounded-zen p-4">
              <h3 class="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
                Categories
              </h3>
              <nav class="space-y-1">
                <For each={categories}>
                  {(category) => (
                    <button
                      type="button"
                      class={
                        selectedCategory.value === category.id
                          ? 'w-full flex items-center gap-2 px-3 py-2 bg-primary text-white rounded transition-colors'
                          : 'w-full flex items-center gap-2 px-3 py-2 text-text-muted hover:text-text hover:bg-bg-lighter rounded transition-colors'
                      }
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      <Icon icon={category.icon} width="18" height="18" />
                      <span class="text-sm font-medium">{category.name}</span>
                    </button>
                  )}
                </For>
              </nav>
            </div>
          </aside>

          {/* Examples List */}
          <div class="col-span-12 lg:col-span-3">
            <div class="bg-bg-light border border-border rounded-zen p-4">
              <h3 class="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
                Examples
              </h3>
              <div class="space-y-2">
                <For each={filteredExamples.value}>
                  {(example) => (
                    <button
                      type="button"
                      class={
                        selectedExampleId.value === example.id
                          ? 'w-full text-left p-3 bg-bg-lighter border-2 border-primary rounded-zen transition-all'
                          : 'w-full text-left p-3 bg-bg hover:bg-bg-lighter border-2 border-transparent rounded-zen transition-all'
                      }
                      onClick={() => {
                        selectedExampleId.value = example.id;
                      }}
                    >
                      <div class="flex items-start gap-3">
                        <div
                          class={
                            selectedExampleId.value === example.id
                              ? 'flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-white rounded'
                              : 'flex-shrink-0 w-8 h-8 flex items-center justify-center bg-bg-lighter text-primary rounded'
                          }
                        >
                          <Icon icon={example.icon} width="18" height="18" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="text-sm font-semibold text-text truncate">{example.title}</h4>
                          <p class="text-xs text-text-muted line-clamp-2">{example.description}</p>
                        </div>
                      </div>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </div>

          {/* Preview & Code */}
          <main class="col-span-12 lg:col-span-7">
            <div class="bg-bg-light border border-border rounded-zen overflow-hidden">
              {/* Header */}
              <div class="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-lighter">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 flex items-center justify-center bg-primary text-white rounded">
                    <Icon icon={selectedExample.value.icon} width="20" height="20" />
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-text">{selectedExample.value.title}</h2>
                    <p class="text-sm text-text-muted">{selectedExample.value.description}</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class={
                      !showCode.value
                        ? 'px-4 py-2 bg-primary text-white rounded transition-colors'
                        : 'px-4 py-2 bg-bg hover:bg-bg-lighter text-text border border-border rounded transition-colors'
                    }
                    onClick={() => {
                      showCode.value = false;
                    }}
                  >
                    <div class="flex items-center gap-2">
                      <Icon icon="lucide:play" width="16" height="16" />
                      <span class="text-sm font-medium">Preview</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    class={
                      showCode.value
                        ? 'px-4 py-2 bg-primary text-white rounded transition-colors'
                        : 'px-4 py-2 bg-bg hover:bg-bg-lighter text-text border border-border rounded transition-colors'
                    }
                    onClick={() => {
                      showCode.value = true;
                    }}
                  >
                    <div class="flex items-center gap-2">
                      <Icon icon="lucide:code" width="16" height="16" />
                      <span class="text-sm font-medium">Code</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div class="p-6">
                <Show when={computed(() => !showCode.value)}>
                  <div class="min-h-[400px] bg-bg border border-border rounded-zen p-6">
                    <p class="text-text-muted text-center py-12">
                      <Icon
                        icon="lucide:play-circle"
                        width="48"
                        height="48"
                        class="mx-auto mb-4 opacity-50"
                      />
                      Interactive preview coming soon. Use the Playground to run this example.
                    </p>
                  </div>
                </Show>

                <Show when={showCode}>
                  <div class="bg-[#282c34] rounded-zen overflow-hidden">
                    <div class="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-[#181a1f]">
                      <span class="text-xs text-[#abb2bf] font-mono">
                        {selectedExample.value.id}.tsx
                      </span>
                      <button
                        type="button"
                        class="text-xs text-[#abb2bf] hover:text-white transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedExample.value.code);
                        }}
                      >
                        <Icon icon="lucide:copy" width="14" height="14" />
                      </button>
                    </div>
                    <pre class="p-4 overflow-x-auto">
                      <code class="text-sm text-[#abb2bf] font-mono">
                        {selectedExample.value.code}
                      </code>
                    </pre>
                  </div>
                </Show>
              </div>

              {/* Footer */}
              <div class="px-6 py-4 border-t border-border bg-bg-lighter">
                <a
                  href="/playground"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded transition-colors"
                >
                  <Icon icon="lucide:external-link" width="16" height="16" />
                  <span class="text-sm font-medium">Open in Playground</span>
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
