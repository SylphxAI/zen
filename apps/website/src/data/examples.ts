/**
 * Shared examples data source
 * Used by both Examples page and Playground
 */

export interface Example {
  id: string;
  title: string;
  description: string;
  icon: string; // iconify icon name
  category: 'basic' | 'components' | 'async' | 'advanced' | 'tui';
  code: string;
  /** Pre-rendered ANSI output for TUI examples */
  tuiOutput?: string;
}

export const examples: Example[] = [
  {
    id: 'counter',
    title: 'Counter',
    description: 'Basic reactive state with signal() and computed()',
    icon: 'lucide:hash',
    category: 'basic',
    code: `// Reactive state
const count = signal(0);
const doubled = computed(() => count.value * 2);

// Styles
const container = {
  padding: '32px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  maxWidth: '400px'
};

const title = {
  margin: '0 0 8px',
  fontSize: '32px',
  fontWeight: '700',
  color: '#1f2937'
};

const subtitle = {
  margin: '0 0 24px',
  fontSize: '18px',
  color: '#6b7280'
};

const btnBase = {
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: '600',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
};

const app = (
  <div style={container}>
    <h2 style={title}>Counter: {count}</h2>
    <p style={subtitle}>Doubled: {doubled}</p>
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <button
        onClick={() => count.value--}
        style={{...btnBase, backgroundColor: '#6366f1', color: 'white'}}
      >
        − Decrease
      </button>
      <button
        onClick={() => count.value++}
        style={{...btnBase, backgroundColor: '#10b981', color: 'white'}}
      >
        + Increase
      </button>
      <button
        onClick={() => count.value = 0}
        style={{...btnBase, backgroundColor: '#f3f4f6', color: '#374151'}}
      >
        ↺ Reset
      </button>
    </div>
  </div>
);`,
  },
  {
    id: 'finegrained',
    title: 'Fine-grained Reactivity',
    description: 'Component renders once, only signals update',
    icon: 'lucide:zap',
    category: 'basic',
    code: `// This component only renders ONCE!
const count = signal(0);
const effectRuns = signal(0);

// Auto-increment every second
const timer = setInterval(() => count.value++, 1000);

// Track effect executions
effect(() => {
  const c = count.value;
  effectRuns.value++;
});

// Styles
const card = {
  padding: '32px',
  fontFamily: 'system-ui, sans-serif',
  maxWidth: '450px',
  backgroundColor: '#fafafa',
  borderRadius: '16px'
};

const stat = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  backgroundColor: 'white',
  borderRadius: '12px',
  marginBottom: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const badge = {
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '600'
};

const app = (
  <div style={card}>
    <h2 style={{ margin: '0 0 8px', fontSize: '24px', color: '#1f2937' }}>
      ⚡ Fine-grained Updates
    </h2>
    <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '15px' }}>
      Watch the numbers change without re-rendering the component
    </p>

    <div style={stat}>
      <span style={{ color: '#374151', fontWeight: '500' }}>Current Count</span>
      <span style={{...badge, backgroundColor: '#dbeafe', color: '#1d4ed8'}}>{count}</span>
    </div>

    <div style={stat}>
      <span style={{ color: '#374151', fontWeight: '500' }}>Effect Runs</span>
      <span style={{...badge, backgroundColor: '#dcfce7', color: '#15803d'}}>{effectRuns}</span>
    </div>

    <div style={{
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#f0fdf4',
      borderRadius: '10px',
      border: '1px solid #bbf7d0'
    }}>
      <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#166534', fontSize: '14px' }}>
        ✓ How it works:
      </p>
      <ul style={{ margin: 0, paddingLeft: '20px', color: '#15803d', fontSize: '13px', lineHeight: '1.8' }}>
        <li>Component function runs only once</li>
        <li>Only the text nodes with signals update</li>
        <li>No virtual DOM diffing needed</li>
      </ul>
    </div>
  </div>
);`,
  },
  {
    id: 'todo',
    title: 'Todo List',
    description: 'List rendering with reactive arrays',
    icon: 'lucide:check-square',
    category: 'components',
    code: `// State
const todos = signal([
  { id: 1, text: 'Learn Zen signals', done: true },
  { id: 2, text: 'Build something awesome', done: false },
  { id: 3, text: 'Ship to production', done: false }
]);
const newTodo = signal('');

// Actions
const addTodo = () => {
  if (!newTodo.value.trim()) return;
  todos.value = [...todos.value, {
    id: Date.now(),
    text: newTodo.value,
    done: false
  }];
  newTodo.value = '';
};

const toggle = (id) => {
  todos.value = todos.value.map(t =>
    t.id === id ? {...t, done: !t.done} : t
  );
};

const remove = (id) => {
  todos.value = todos.value.filter(t => t.id !== id);
};

// Styles
const input = {
  flex: 1,
  padding: '14px 18px',
  fontSize: '16px',
  border: '2px solid #e5e7eb',
  borderRadius: '12px',
  outline: 'none'
};

const addBtn = {
  padding: '14px 28px',
  backgroundColor: '#6366f1',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  cursor: 'pointer'
};

const todoItem = (done) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '16px',
  backgroundColor: done ? '#f0fdf4' : 'white',
  borderRadius: '12px',
  marginBottom: '10px',
  border: '1px solid ' + (done ? '#bbf7d0' : '#e5e7eb'),
  transition: 'all 0.2s'
});

const app = (
  <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', maxWidth: '500px' }}>
    <h2 style={{ margin: '0 0 24px', fontSize: '28px', color: '#1f2937' }}>
      📝 Todo List
    </h2>

    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
      <input
        type="text"
        value={newTodo}
        onInput={(e) => newTodo.value = e.target.value}
        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        placeholder="What needs to be done?"
        style={input}
      />
      <button onClick={addTodo} style={addBtn}>Add</button>
    </div>

    <div>
      {() => todos.value.map(todo => (
        <div key={todo.id} style={todoItem(todo.done)}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggle(todo.id)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <span style={{
            flex: 1,
            fontSize: '16px',
            textDecoration: todo.done ? 'line-through' : 'none',
            color: todo.done ? '#9ca3af' : '#1f2937'
          }}>
            {todo.text}
          </span>
          <button
            onClick={() => remove(todo.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>

    <p style={{ marginTop: '16px', color: '#9ca3af', fontSize: '14px' }}>
      {() => \`\${todos.value.filter(t => t.done).length} of \${todos.value.length} completed\`}
    </p>
  </div>
);`,
  },
  {
    id: 'form',
    title: 'Form Validation',
    description: 'Real-time validation with computed values',
    icon: 'lucide:file-text',
    category: 'components',
    code: `// Form state
const name = signal('');
const email = signal('');
const message = signal('');
const submitted = signal(false);

// Validation
const nameValid = computed(() => name.value.length >= 2);
const emailValid = computed(() => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value));
const messageValid = computed(() => message.value.length >= 10);
const formValid = computed(() => nameValid.value && emailValid.value && messageValid.value);

const handleSubmit = () => {
  if (formValid.value) submitted.value = true;
};

// Styles
const inputStyle = (valid, touched) => ({
  width: '100%',
  padding: '14px 16px',
  fontSize: '16px',
  border: '2px solid ' + (touched ? (valid ? '#10b981' : '#ef4444') : '#e5e7eb'),
  borderRadius: '10px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
});

const label = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  color: '#374151',
  fontSize: '14px'
};

const app = (
  <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', maxWidth: '420px' }}>
    <Show when={computed(() => !submitted.value)}>
      <h2 style={{ margin: '0 0 8px', fontSize: '28px', color: '#1f2937' }}>
        Contact Us
      </h2>
      <p style={{ margin: '0 0 28px', color: '#6b7280' }}>
        Fill out the form below and we'll get back to you.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <label style={label}>Name</label>
        <input
          type="text"
          value={name}
          onInput={(e) => name.value = e.target.value}
          placeholder="John Doe"
          style={inputStyle(nameValid.value, name.value.length > 0)}
        />
        <Show when={computed(() => name.value.length > 0 && !nameValid.value)}>
          <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '13px' }}>
            Name must be at least 2 characters
          </p>
        </Show>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={label}>Email</label>
        <input
          type="email"
          value={email}
          onInput={(e) => email.value = e.target.value}
          placeholder="john@example.com"
          style={inputStyle(emailValid.value, email.value.length > 0)}
        />
        <Show when={computed(() => email.value.length > 0 && !emailValid.value)}>
          <p style={{ margin: '6px 0 0', color: '#ef4444', fontSize: '13px' }}>
            Please enter a valid email address
          </p>
        </Show>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={label}>Message</label>
        <textarea
          value={message}
          onInput={(e) => message.value = e.target.value}
          placeholder="Your message here..."
          rows="4"
          style={{...inputStyle(messageValid.value, message.value.length > 0), resize: 'vertical'}}
        />
        <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: '13px' }}>
          {() => \`\${message.value.length}/10 characters minimum\`}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '600',
          backgroundColor: () => formValid.value ? '#6366f1' : '#a5b4fc',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: () => formValid.value ? 'pointer' : 'not-allowed'
        }}
      >
        {() => formValid.value ? 'Send Message ✓' : 'Complete all fields'}
      </button>
    </Show>

    <Show when={submitted}>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '32px'
        }}>✓</div>
        <h2 style={{ margin: '0 0 12px', color: '#1f2937', fontSize: '24px' }}>
          Message Sent!
        </h2>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Thanks {name}, we'll be in touch at {email}
        </p>
      </div>
    </Show>
  </div>
);`,
  },
  {
    id: 'async',
    title: 'Async Data',
    description: 'Loading states and data fetching',
    icon: 'lucide:cloud',
    category: 'async',
    code: `// State for async operation
const users = signal([]);
const loading = signal(false);
const error = signal(null);

// Fetch users from API
const fetchUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
    if (!res.ok) throw new Error('Failed to fetch');
    users.value = await res.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

// Styles
const btn = {
  padding: '14px 28px',
  fontSize: '16px',
  fontWeight: '600',
  backgroundColor: '#6366f1',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px'
};

const userCard = {
  padding: '16px 20px',
  backgroundColor: 'white',
  borderRadius: '12px',
  marginBottom: '12px',
  border: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const avatar = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: '#e0e7ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  color: '#4338ca',
  fontSize: '18px'
};

const app = (
  <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', maxWidth: '500px' }}>
    <h2 style={{ margin: '0 0 8px', fontSize: '28px', color: '#1f2937' }}>
      👥 User Directory
    </h2>
    <p style={{ margin: '0 0 24px', color: '#6b7280' }}>
      Fetch users from a remote API
    </p>

    <button
      onClick={fetchUsers}
      disabled={loading}
      style={{...btn, opacity: loading.value ? 0.7 : 1, marginBottom: '24px'}}
    >
      {() => loading.value ? '⏳ Loading...' : '🔄 Fetch Users'}
    </button>

    <Show when={error}>
      <div style={{
        padding: '16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        color: '#dc2626',
        marginBottom: '20px'
      }}>
        ⚠️ Error: {error}
      </div>
    </Show>

    <Show when={computed(() => users.value.length > 0)}>
      <div>
        {() => users.value.map(user => (
          <div key={user.id} style={userCard}>
            <div style={avatar}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {user.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Show>

    <Show when={computed(() => !loading.value && users.value.length === 0 && !error.value)}>
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#9ca3af',
        backgroundColor: '#f9fafb',
        borderRadius: '12px'
      }}>
        Click the button above to load users
      </div>
    </Show>
  </div>
);`,
  },
  {
    id: 'theme',
    title: 'Theme Toggle',
    description: 'Dynamic styling with signals',
    icon: 'lucide:palette',
    category: 'advanced',
    code: `// Theme state
const isDark = signal(false);

// Theme colors
const themes = {
  light: {
    bg: '#ffffff',
    card: '#f9fafb',
    text: '#1f2937',
    muted: '#6b7280',
    primary: '#6366f1',
    border: '#e5e7eb'
  },
  dark: {
    bg: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    muted: '#9ca3af',
    primary: '#818cf8',
    border: '#374151'
  }
};

const theme = computed(() => isDark.value ? themes.dark : themes.light);

const app = (
  <div style={() => ({
    padding: '32px',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: theme.value.bg,
    minHeight: '300px',
    borderRadius: '16px',
    transition: 'all 0.3s ease'
  })}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      <h2 style={() => ({ margin: 0, color: theme.value.text, fontSize: '24px' })}>
        {() => isDark.value ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </h2>

      <button
        onClick={() => isDark.value = !isDark.value}
        style={() => ({
          padding: '12px 24px',
          fontSize: '15px',
          fontWeight: '600',
          backgroundColor: theme.value.primary,
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer'
        })}
      >
        Toggle Theme
      </button>
    </div>

    <div style={() => ({
      padding: '24px',
      backgroundColor: theme.value.card,
      borderRadius: '12px',
      border: \`1px solid \${theme.value.border}\`
    })}>
      <h3 style={() => ({ margin: '0 0 12px', color: theme.value.text, fontSize: '18px' })}>
        Sample Card
      </h3>
      <p style={() => ({ margin: '0 0 16px', color: theme.value.muted, lineHeight: '1.6' })}>
        This card demonstrates reactive styling. The entire UI updates smoothly
        when you toggle between light and dark themes.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <span style={() => ({
          padding: '6px 12px',
          backgroundColor: theme.value.primary + '20',
          color: theme.value.primary,
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        })}>
          Reactive
        </span>
        <span style={() => ({
          padding: '6px 12px',
          backgroundColor: theme.value.border,
          color: theme.value.text,
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        })}>
          Smooth
        </span>
      </div>
    </div>
  </div>
);`,
  },
  // TUI Examples
  {
    id: 'tui-box',
    title: 'Box Component',
    description: 'Basic box with border and padding',
    icon: 'lucide:square',
    category: 'tui',
    code: `import { render, Box, Text } from '@zen/tui';

const App = () => (
  <Box
    borderStyle="round"
    borderColor="cyan"
    padding={1}
    width={40}
  >
    <Text bold color="white">
      Welcome to @zen/tui
    </Text>
    <Text color="gray">
      Build beautiful CLI apps with
      reactive components and JSX.
    </Text>
  </Box>
);

render(<App />);`,
    tuiOutput: `\x1b[36m╭──────────────────────────────────────╮\x1b[0m
\x1b[36m│\x1b[0m                                      \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[1m\x1b[37mWelcome to @zen/tui\x1b[0m                \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m                                      \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[90mBuild beautiful CLI apps with\x1b[0m       \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m  \x1b[90mreactive components and JSX.\x1b[0m        \x1b[36m│\x1b[0m
\x1b[36m│\x1b[0m                                      \x1b[36m│\x1b[0m
\x1b[36m╰──────────────────────────────────────╯\x1b[0m`,
  },
  {
    id: 'tui-spinner',
    title: 'Loading Spinner',
    description: 'Animated spinner with status text',
    icon: 'lucide:loader',
    category: 'tui',
    code: `import { render, Box, Text, Spinner } from '@zen/tui';
import { signal } from '@zen/signal';

const status = signal('Installing dependencies...');
const items = signal([
  { name: 'lodash', done: true },
  { name: 'react', done: true },
  { name: 'typescript', done: false },
  { name: 'vite', done: false },
]);

const App = () => (
  <Box flexDirection="column" padding={1}>
    <Box gap={1}>
      <Spinner type="dots" color="cyan" />
      <Text bold>{status}</Text>
    </Box>

    <Box flexDirection="column" marginTop={1}>
      {items.value.map(item => (
        <Text key={item.name}>
          <Text color={item.done ? 'green' : 'gray'}>
            {item.done ? '✓' : '○'}
          </Text>
          {' '}{item.name}
        </Text>
      ))}
    </Box>
  </Box>
);

render(<App />);`,
    tuiOutput: `\x1b[1m\x1b[37mInstalling dependencies...\x1b[0m

\x1b[32m✓\x1b[0m lodash
\x1b[32m✓\x1b[0m react
\x1b[36m⠋\x1b[0m typescript
\x1b[90m○\x1b[0m vite`,
  },
  {
    id: 'tui-select',
    title: 'Select Menu',
    description: 'Interactive selection with keyboard navigation',
    icon: 'lucide:list',
    category: 'tui',
    code: `import { render, Box, Text, Select } from '@zen/tui';
import { signal } from '@zen/signal';

const selected = signal(0);
const options = [
  { label: 'Zen', desc: 'Ultra-fast reactive framework' },
  { label: 'React', desc: 'Component-based UI library' },
  { label: 'Vue', desc: 'Progressive framework' },
  { label: 'Solid', desc: 'Fine-grained reactivity' },
  { label: 'Svelte', desc: 'Compiler-based approach' },
];

const App = () => (
  <Box flexDirection="column" padding={1}>
    <Text bold color="magenta">
      ? <Text color="white">Select a framework</Text>
    </Text>

    <Box flexDirection="column" marginTop={1}>
      {options.map((opt, i) => (
        <Text key={opt.label}>
          <Text color={i === selected.value ? 'cyan' : 'white'}>
            {i === selected.value ? '❯' : ' '}
          </Text>
          {' '}
          <Text bold={i === selected.value} color={i === selected.value ? 'cyan' : 'white'}>
            {opt.label}
          </Text>
          {'  '}
          <Text color="gray">{opt.desc}</Text>
        </Text>
      ))}
    </Box>

    <Text color="gray" marginTop={1}>
      ↑/↓ to move, Enter to select
    </Text>
  </Box>
);

render(<App />);`,
    tuiOutput: `\x1b[1m\x1b[35m?\x1b[0m \x1b[1m\x1b[37mSelect a framework\x1b[0m

\x1b[36m❯\x1b[0m \x1b[1m\x1b[36mZen\x1b[0m       \x1b[90mUltra-fast reactive framework\x1b[0m
  React     \x1b[90mComponent-based UI library\x1b[0m
  Vue       \x1b[90mProgressive framework\x1b[0m
  Solid     \x1b[90mFine-grained reactivity\x1b[0m
  Svelte    \x1b[90mCompiler-based approach\x1b[0m

\x1b[90m↑/↓ to move, Enter to select\x1b[0m`,
  },
  {
    id: 'tui-dashboard',
    title: 'Dashboard Layout',
    description: 'Multi-panel dashboard with flexbox layout',
    icon: 'lucide:layout-dashboard',
    category: 'tui',
    code: `import { render, Box, Text } from '@zen/tui';
import { signal, computed } from '@zen/signal';

const cpu = signal(42);
const ram = signal(78);
const disk = signal(34);

const ProgressBar = ({ value, color }) => {
  const filled = Math.round(value / 10);
  return (
    <Text>
      <Text color={color}>{'█'.repeat(filled)}</Text>
      <Text color="gray">{'░'.repeat(10 - filled)}</Text>
      {' '}<Text color={color}>{value}%</Text>
    </Text>
  );
};

const App = () => (
  <Box flexDirection="column">
    <Box backgroundColor="blue" padding={1} justifyContent="center">
      <Text bold color="white">ZEN DASHBOARD</Text>
    </Box>

    <Box marginTop={1} gap={2}>
      <Box borderStyle="single" borderColor="cyan" padding={1} width={24}>
        <Text bold color="cyan">System</Text>
        <Text>CPU:  <ProgressBar value={cpu.value} color="green" /></Text>
        <Text>RAM:  <ProgressBar value={ram.value} color="yellow" /></Text>
        <Text>Disk: <ProgressBar value={disk.value} color="green" /></Text>
      </Box>

      <Box borderStyle="single" borderColor="magenta" padding={1} width={24}>
        <Text bold color="magenta">Network</Text>
        <Text>↑ <Text color="green">2.4 MB/s</Text></Text>
        <Text>↓ <Text color="cyan">892 KB/s</Text></Text>
        <Text>Latency: <Text color="green">12ms</Text></Text>
      </Box>
    </Box>
  </Box>
);

render(<App />);`,
    tuiOutput: `\x1b[44m\x1b[37m\x1b[1m                 ZEN DASHBOARD                 \x1b[0m

\x1b[36m┌─ System ──────────────┐\x1b[0m \x1b[35m┌─ Network ─────────────┐\x1b[0m
\x1b[36m│\x1b[0m CPU:  \x1b[32m████\x1b[90m░░░░░░\x1b[0m \x1b[32m42%\x1b[0m  \x1b[36m│\x1b[0m \x1b[35m│\x1b[0m ↑ \x1b[32m2.4 MB/s\x1b[0m           \x1b[35m│\x1b[0m
\x1b[36m│\x1b[0m RAM:  \x1b[33m████████\x1b[90m░░\x1b[0m \x1b[33m78%\x1b[0m \x1b[36m│\x1b[0m \x1b[35m│\x1b[0m ↓ \x1b[36m892 KB/s\x1b[0m           \x1b[35m│\x1b[0m
\x1b[36m│\x1b[0m Disk: \x1b[32m███\x1b[90m░░░░░░░\x1b[0m \x1b[32m34%\x1b[0m  \x1b[36m│\x1b[0m \x1b[35m│\x1b[0m Latency: \x1b[32m12ms\x1b[0m       \x1b[35m│\x1b[0m
\x1b[36m└────────────────────────┘\x1b[0m \x1b[35m└────────────────────────┘\x1b[0m`,
  },
];

export const categories = [
  { id: 'basic', name: 'Basic', icon: 'lucide:book-open' },
  { id: 'components', name: 'Components', icon: 'lucide:layout' },
  { id: 'async', name: 'Async', icon: 'lucide:cloud' },
  { id: 'advanced', name: 'Advanced', icon: 'lucide:sparkles' },
  { id: 'tui', name: 'TUI', icon: 'lucide:terminal' },
] as const;
