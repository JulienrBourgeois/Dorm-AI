export const APP_LOGO_PATH = "/inspect.png" as const;

type AppLogoMarkProps = {
  /** Sizing and layout, e.g. `h-9 w-9` or `h-20 w-20 lg:h-24 lg:w-24` */
  className: string;
  /** Classes on the clipped frame (radius, shadow). */
  wrapperClassName?: string;
  alt?: string;
};

/**
 * Product mark from `public/inspect.png` — use in Loader, nav, auth, and marketing heroes.
 */
export function AppLogoMark({
  className,
  wrapperClassName = "rounded-2xl shadow-md shadow-primary/15",
  alt = "Inspect AI",
}: AppLogoMarkProps) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden ${wrapperClassName} ${className}`.trim()}
    >
      <img
        src={APP_LOGO_PATH}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
    </span>
  );
}
