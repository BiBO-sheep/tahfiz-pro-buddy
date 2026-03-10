interface JuzProgressGridProps {
  memorizedJuz: number[];
  currentJuz?: number;
}

export function JuzProgressGrid({ memorizedJuz, currentJuz }: JuzProgressGridProps) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
        const isMemorized = memorizedJuz.includes(juz);
        const isCurrent = juz === currentJuz;

        return (
          <div
            key={juz}
            className={`
              w-7 h-7 flex items-center justify-center text-xs font-body border rounded-sm
              ${isMemorized
                ? 'bg-primary text-primary-foreground border-primary'
                : isCurrent
                  ? 'border-primary text-primary border-dashed'
                  : 'border-border text-muted-foreground'
              }
            `}
            title={`Juz ${juz}${isMemorized ? ' (Hafal)' : isCurrent ? ' (Sedang dihafal)' : ''}`}
          >
            {juz}
          </div>
        );
      })}
    </div>
  );
}
