import { theme, toggleTheme } from '../theme';
import { Icon } from './Icon';

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      class="p-2 rounded-zen hover:bg-bg-lighter dark:hover:bg-bg-light transition-colors"
      aria-label="Toggle theme"
    >
      {theme.value === 'dark' ? (
        <Icon icon="lucide:sun" width="20" height="20" class="text-text" />
      ) : (
        <Icon icon="lucide:moon" width="20" height="20" class="text-text" />
      )}
    </button>
  );
}
