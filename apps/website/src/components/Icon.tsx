/**
 * Icon component using unplugin-icons with Iconify
 *
 * Usage:
 * - <Icon icon="lucide:sun" width="20" height="20" />
 * - <Icon icon="mdi:home" class="custom-class" />
 *
 * Icon format: "collection:name" (e.g., "lucide:sun", "mdi:home")
 */

import IconHeroiconsUser from '~icons/heroicons/user?raw';
import IconLucideFileText from '~icons/lucide/file-text?raw';
import IconLucideInfo from '~icons/lucide/info?raw';
import IconLucideMoon from '~icons/lucide/moon?raw';
import IconLucidePlay from '~icons/lucide/play?raw';
import IconLucideRotateCcw from '~icons/lucide/rotate-ccw?raw';
import IconLucideSearch from '~icons/lucide/search?raw';
import IconLucideSquare from '~icons/lucide/square?raw';
import IconLucideSun from '~icons/lucide/sun?raw';
import IconLucideX from '~icons/lucide/x?raw';
import IconLucideZap from '~icons/lucide/zap?raw';
import IconMdiHome from '~icons/mdi/home?raw';
import IconPhHeartFill from '~icons/ph/heart-fill?raw';

interface IconProps {
  icon: string;
  class?: string;
  style?: Record<string, string>;
  width?: string | number;
  height?: string | number;
}

// Map icon names to raw SVG strings
const iconMap: Record<string, string> = {
  'lucide:sun': IconLucideSun,
  'lucide:moon': IconLucideMoon,
  'lucide:zap': IconLucideZap,
  'lucide:search': IconLucideSearch,
  'lucide:file-text': IconLucideFileText,
  'lucide:search-x': IconLucideX,
  'lucide:x': IconLucideX,
  'lucide:play': IconLucidePlay,
  'lucide:square': IconLucideSquare,
  'lucide:rotate-ccw': IconLucideRotateCcw,
  'lucide:info': IconLucideInfo,
  'mdi:home': IconMdiHome,
  'heroicons:user': IconHeroiconsUser,
  'ph:heart-fill': IconPhHeartFill,
};

export function Icon(props: IconProps) {
  const { icon, class: className, style, width, height } = props;

  const svgContent = iconMap[icon];

  if (!svgContent) {
    return <span class={className}>?</span>;
  }

  // Parse SVG and inject custom width/height if provided
  let modifiedSVG = svgContent;

  // Add custom dimensions if provided
  if (width || height) {
    const widthValue = typeof width === 'number' ? `${width}px` : width || '1em';
    const heightValue = typeof height === 'number' ? `${height}px` : height || '1em';

    // Replace or add width/height attributes
    modifiedSVG = modifiedSVG
      .replace(/width="[^"]*"/, `width="${widthValue}"`)
      .replace(/height="[^"]*"/, `height="${heightValue}"`);

    // If width/height don't exist in the SVG, add them after the opening <svg tag
    if (!modifiedSVG.includes('width=')) {
      modifiedSVG = modifiedSVG.replace(
        '<svg',
        `<svg width="${widthValue}" height="${heightValue}"`,
      );
    }
  }

  // Add custom class if provided
  if (className) {
    modifiedSVG = modifiedSVG.replace('<svg', `<svg class="${className}"`);
  }

  // Render raw SVG using dangerouslySetInnerHTML equivalent
  return <span style={style} innerHTML={modifiedSVG} />;
}
