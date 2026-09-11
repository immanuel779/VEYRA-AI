interface Props {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function BrandLogo({ size = 96, className = '', showWordmark = false }: Props) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="/veyra-ai.jpeg"
        alt="VEYRA AI"
        width={size}
        height={size}
        className="select-none pointer-events-none"
        draggable={false}
      />
      {showWordmark && (
        <span className="mt-3 text-xl font-semibold tracking-tight text-ink">
          VEYRA<span className="text-muted font-normal"> AI</span>
        </span>
      )}
    </div>
  );
}