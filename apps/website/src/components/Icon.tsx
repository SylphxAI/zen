/**
 * Icon component using Iconify
 * @see https://icon-sets.iconify.design/
 */

interface IconProps {
  icon: string;
  class?: string;
  style?: Record<string, string>;
  width?: string | number;
  height?: string | number;
}

export function Icon(props: IconProps) {
  const { icon, class: className, style, width = '1em', height = '1em' } = props;

  return (
    <span
      class={`iconify ${className || ''}`}
      data-icon={icon}
      data-width={width}
      data-height={height}
      style={style}
    />
  );
}
