"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const safePhotos = photos.length > 0 ? photos : [""];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary">
        <Image
          src={safePhotos[active]}
          alt={`${title} — photo ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
        />
      </div>
      {safePhotos.length > 1 && (
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {safePhotos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-opacity",
                index === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === active}
            >
              <Image src={photo} alt="" fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
