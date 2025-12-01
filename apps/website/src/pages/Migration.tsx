import { For, signal } from '@zen/web';
import { Icon } from '../components/Icon.tsx';

export function Migration() {
  const activeFramework = signal('react');

  const frameworks = [
    { id: 'react', name: 'React', icon: 'lucide:atom', color: 'text-blue-400' },
    { id: 'vue', name: 'Vue', icon: 'lucide:triangle', color: 'text-green-400' },
    { id: 'solid', name: 'Solid', icon: 'lucide:box', color: 'text-blue-500' },
    { id: 'svelte', name: 'Svelte', icon: 'lucide:flame', color: 'text-orange-400' },
    { id: 'vanilla', name: 'Vanilla JS', icon: 'lucide:code', color: 'text-yellow-400' },
  ];

  const migrations = {
    react: {
      title: 'Migrating from React',
      description: 'React developers will find Zen familiar with a much smaller footprint',
      comparison: [
        {
          aspect: 'State Management',
          react: `const [count, setCount] = useState(0);
setCount(count + 1);`,
          zen: `const count = signal(0);
count.value++;`,
        },
        {
          aspect: 'Derived State',
          react: `const doubled = useMemo(
  () => count * 2, [count]
);`,
          zen: `const doubled = computed(
  () => count.value * 2
);`,
        },
        {
          aspect: 'Side Effects',
          react: `useEffect(() => {
  console.log(count);
}, [count]);`,
          zen: `effect(() => {
  console.log(count.value);
});`,
        },
        {
          aspect: 'Conditional Render',
          react: `{condition && <Child />}
{condition ? <A /> : <B />}`,
          zen: `<Show when={condition}>
  <Child />
</Show>`,
        },
        {
          aspect: 'List Rendering',
          react: `{items.map(item => (
  <Item key={item.id} {...item} />
))}`,
          zen: `<For each={items}>
  {item => <Item {...item} />}
</For>`,
        },
      ],
      steps: [
        {
          step: 1,
          title: 'Install Zen packages',
          code: 'npm install @zen/signal @zen/web',
        },
        {
          step: 2,
          title: 'Update tsconfig.json',
          code: `{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@zen/web"
  }
}`,
        },
        {
          step: 3,
          title: 'Migrate components gradually',
          code: `// Before (React)
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// After (Zen)
function Counter() {
  const count = signal(0);
  return <button onClick={() => count.value++}>{count}</button>;
}`,
        },
      ],
      benefits: [
        'Bundle size: 42KB → <5KB (90% smaller)',
        'No dependency array bugs',
        'Automatic dependency tracking',
        'Fine-grained updates (no re-renders)',
        '150M+ operations per second',
      ],
    },
    vue: {
      title: 'Migrating from Vue',
      description: 'Vue 3 Composition API users will feel right at home with Zen',
      comparison: [
        {
          aspect: 'Reactive State',
          react: `const count = ref(0);
count.value++;`,
          zen: `const count = signal(0);
count.value++;`,
        },
        {
          aspect: 'Computed',
          react: `const doubled = computed(
  () => count.value * 2
);`,
          zen: `const doubled = computed(
  () => count.value * 2
);`,
        },
        {
          aspect: 'Watch Effect',
          react: `watchEffect(() => {
  console.log(count.value);
});`,
          zen: `effect(() => {
  console.log(count.value);
});`,
        },
      ],
      steps: [
        {
          step: 1,
          title: 'Install Zen packages',
          code: 'npm install @zen/signal @zen/web',
        },
        {
          step: 2,
          title: 'Migrate reactive state',
          code: `// Vue 3
import { ref, computed } from 'vue';
const count = ref(0);

// Zen (nearly identical!)
import { signal, computed } from '@zen/signal';
const count = signal(0);`,
        },
      ],
      benefits: [
        'Almost identical API - minimal learning curve',
        'Smaller bundle (34KB → <5KB)',
        'Works with any build tool',
        'No .vue file format required',
      ],
    },
    solid: {
      title: 'Migrating from Solid',
      description: 'Solid users will appreciate the unified .value API',
      comparison: [
        {
          aspect: 'Signals',
          react: `const [count, setCount] = createSignal(0);
count(); // read
setCount(1); // write`,
          zen: `const count = signal(0);
count.value; // read
count.value = 1; // write`,
        },
        {
          aspect: 'Computed',
          react: `const doubled = createMemo(
  () => count() * 2
);`,
          zen: `const doubled = computed(
  () => count.value * 2
);`,
        },
      ],
      steps: [
        {
          step: 1,
          title: 'Replace signal syntax',
          code: `// Solid
const [count, setCount] = createSignal(0);
setCount(prev => prev + 1);

// Zen
const count = signal(0);
count.value++;`,
        },
      ],
      benefits: [
        'Consistent .value API (no getter function confusion)',
        'Slightly smaller bundle (7KB → <5KB)',
        'Same fine-grained reactivity model',
      ],
    },
    svelte: {
      title: 'Migrating from Svelte',
      description: 'Use standard JavaScript instead of compiler magic',
      comparison: [
        {
          aspect: 'Reactive State',
          react: `let count = 0;
$: doubled = count * 2;`,
          zen: `const count = signal(0);
const doubled = computed(() => count.value * 2);`,
        },
      ],
      steps: [
        {
          step: 1,
          title: 'Replace reactive declarations',
          code: `// Svelte (requires compiler)
<script>
  let count = 0;
  $: doubled = count * 2;
</script>

// Zen (standard JavaScript)
const count = signal(0);
const doubled = computed(() => count.value * 2);`,
        },
      ],
      benefits: [
        'No special compiler required',
        'Standard JavaScript/TypeScript',
        'Works in any environment',
        'Better IDE support',
      ],
    },
    vanilla: {
      title: 'Adding Zen to Vanilla JS',
      description: 'Supercharge vanilla JavaScript with reactive primitives',
      comparison: [
        {
          aspect: 'State + DOM',
          react: `let count = 0;
const el = document.getElementById('count');
function update() {
  el.textContent = count;
}
button.onclick = () => { count++; update(); };`,
          zen: `const count = signal(0);
effect(() => {
  el.textContent = count.value;
});
button.onclick = () => count.value++;`,
        },
      ],
      steps: [
        {
          step: 1,
          title: 'Install @zen/signal',
          code: 'npm install @zen/signal',
        },
        {
          step: 2,
          title: 'Add reactivity',
          code: `import { signal, effect } from '@zen/signal';

const count = signal(0);

effect(() => {
  document.getElementById('count').textContent = count.value;
});

document.getElementById('btn').onclick = () => count.value++;`,
        },
      ],
      benefits: [
        'Add reactivity without a framework',
        'Only 1.75KB',
        'Works with any DOM manipulation',
        'Gradual adoption',
      ],
    },
  };

  const currentMigration = () => migrations[activeFramework.value];

  return (
    <div class="min-h-screen bg-bg py-12">
      <div class="max-w-screen-xl mx-auto px-6">
        {/* Header */}
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-text mb-4">Migration Guide</h1>
          <p class="text-xl text-text-muted max-w-2xl mx-auto">
            Migrate to Zen from your current framework with confidence. Our API is designed to feel
            familiar while delivering superior performance.
          </p>
        </div>

        {/* Framework selector */}
        <div class="flex flex-wrap gap-3 justify-center mb-12">
          <For each={frameworks}>
            {(fw) => (
              <button
                type="button"
                class={
                  activeFramework.value === fw.id
                    ? 'px-6 py-3 bg-primary text-white rounded-zen font-medium transition-all shadow-zen flex items-center gap-2'
                    : 'px-6 py-3 bg-bg-light hover:bg-bg-lighter text-text-muted hover:text-text border border-border rounded-zen font-medium transition-all flex items-center gap-2'
                }
                onClick={() => {
                  activeFramework.value = fw.id;
                }}
              >
                <Icon icon={fw.icon} width="20" height="20" />
                {fw.name}
              </button>
            )}
          </For>
        </div>

        {/* Migration content */}
        <div class="space-y-8">
          {/* Title */}
          <div class="bg-bg-light border border-border rounded-zen p-8 text-center">
            <h2 class="text-3xl font-bold text-text mb-2">{currentMigration().title}</h2>
            <p class="text-lg text-text-muted">{currentMigration().description}</p>
          </div>

          {/* Comparison table */}
          <div class="bg-bg-light border border-border rounded-zen overflow-hidden">
            <div class="bg-bg-lighter border-b border-border px-6 py-4">
              <h3 class="text-xl font-semibold text-text">Side-by-Side Comparison</h3>
            </div>
            <div class="divide-y divide-border">
              <For each={currentMigration().comparison}>
                {(item) => (
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
                    <div class="p-4 bg-bg-lighter border-b md:border-b-0 md:border-r border-border">
                      <span class="font-medium text-text">{item.aspect}</span>
                    </div>
                    <div class="p-4 border-b md:border-b-0 md:border-r border-border">
                      <div class="text-xs text-text-muted mb-2 uppercase tracking-wide">Before</div>
                      <pre class="text-sm text-text-muted font-mono whitespace-pre-wrap">
                        {item.react}
                      </pre>
                    </div>
                    <div class="p-4 bg-primary/5">
                      <div class="text-xs text-primary mb-2 uppercase tracking-wide font-medium">
                        After (Zen)
                      </div>
                      <pre class="text-sm text-text font-mono whitespace-pre-wrap">{item.zen}</pre>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Migration steps */}
          <div class="bg-bg-light border border-border rounded-zen overflow-hidden">
            <div class="bg-bg-lighter border-b border-border px-6 py-4">
              <h3 class="text-xl font-semibold text-text">Migration Steps</h3>
            </div>
            <div class="p-6 space-y-6">
              <For each={currentMigration().steps}>
                {(step) => (
                  <div class="flex gap-4">
                    <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold">
                      {step.step}
                    </div>
                    <div class="flex-1">
                      <h4 class="text-lg font-semibold text-text mb-3">{step.title}</h4>
                      <pre class="bg-bg border border-border rounded-zen p-4 text-sm text-text-muted font-mono overflow-x-auto">
                        {step.code}
                      </pre>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Benefits */}
          <div class="bg-bg-light border border-border rounded-zen overflow-hidden">
            <div class="bg-bg-lighter border-b border-border px-6 py-4">
              <h3 class="text-xl font-semibold text-text">Benefits</h3>
            </div>
            <div class="p-6">
              <ul class="space-y-3">
                <For each={currentMigration().benefits}>
                  {(benefit) => (
                    <li class="flex items-start gap-3">
                      <span class="text-success mt-0.5">✓</span>
                      <span class="text-text-muted">{benefit}</span>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div class="mt-12 text-center bg-bg-light border border-border rounded-zen p-8">
          <h3 class="text-2xl font-bold text-text mb-3">Ready to get started?</h3>
          <p class="text-text-muted mb-6 max-w-xl mx-auto">
            Check out our documentation for detailed guides and API references.
          </p>
          <div class="flex gap-4 justify-center flex-wrap">
            <a
              href="/docs"
              class="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-zen shadow-zen transition-all hover:scale-105"
            >
              <Icon icon="lucide:book-open" width="20" height="20" />
              Read the Docs
            </a>
            <a
              href="/playground"
              class="inline-flex items-center gap-2 px-8 py-4 bg-secondary hover:bg-secondary/80 text-white font-semibold rounded-zen shadow-zen transition-all hover:scale-105"
            >
              <Icon icon="lucide:terminal" width="20" height="20" />
              Try in Playground
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
