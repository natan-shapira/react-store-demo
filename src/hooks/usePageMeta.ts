import { useEffect, useRef } from "react";

export function usePageMeta(title: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${title} | ReactShop`;

    // A modal can open before a lazy page finishes loading; taking focus then would pull it out of the dialog
    const isModalOpen = document.querySelector('[aria-modal="true"]') !== null;
    if (!isModalOpen) {
      headingRef.current?.focus();
    }
  }, [title]);

  return headingRef;
}
