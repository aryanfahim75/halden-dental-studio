"use client";

import { useEffect, useRef, useState } from "react";

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

function GalleryGridInner({ images, activeFilter }: { images: GalleryImage[]; activeFilter: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply filter via data attribute on container - CSS handles show/hide
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dataset.filter = activeFilter;
    }
  }, [activeFilter]);

  return (
    <div className="gallery-grid" ref={containerRef} role="list" data-filter={activeFilter}>
      {images.map((img, i) => (
        <article
          key={i}
          className="gallery-item"
          data-category={img.category.toLowerCase()}
          role="listitem"
          style={{ "--delay": `${i * 50}ms` } as React.CSSProperties}
        >
          <div className="gallery-item__img">
            <img src={img.src} alt={img.alt} loading="lazy" width={600} height={400} />
          </div>
          <div className="gallery-item__meta">
            <span className="gallery-item__category">{img.category}</span>
            <h3>{img.alt}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}

function GalleryFiltersInner({ activeFilter, onFilterChange }: { activeFilter: string; onFilterChange: (filter: string) => void }) {
  const categories = ["All", "Clinic", "Team", "Treatments", "Smiles", "Technology"];

  return (
    <div className="gallery-filters" role="group" aria-label="Filter gallery by category">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`gallery-filter${cat.toLowerCase() === activeFilter ? " is-active" : ""}`}
          onClick={() => onFilterChange(cat.toLowerCase())}
          aria-pressed={cat.toLowerCase() === activeFilter}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export function GallerySection({ images }: { images: GalleryImage[] }) {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <>
      <GalleryFiltersInner activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <GalleryGridInner images={images} activeFilter={activeFilter} />
    </>
  );
}