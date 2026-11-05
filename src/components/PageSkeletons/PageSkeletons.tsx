import type { ReactNode } from "react";

// Each skeleton mirrors the layout of the page it replaces, so the content does not jump when it loads

interface BoneProps {
  className?: string;
}

// A single grey placeholder block; size and rounding come from the caller
function Bone({ className = "" }: BoneProps) {
  return <div className={`bg-gray-200 ${className}`} />;
}

interface SkeletonContainerProps {
  label: string;
  className?: string;
  children: ReactNode;
}

function SkeletonContainer({ label, className = "", children }: SkeletonContainerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={`animate-pulse motion-reduce:animate-none ${className}`}
    >
      {children}
    </div>
  );
}

const PRODUCT_CARD_COUNT = 12;
const CATEGORY_COUNT = 8;
const CART_ROW_COUNT = 3;

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
      <Bone className="h-52 w-full" />
      <div className="p-4 space-y-2">
        <Bone className="h-5 w-3/4 rounded-md" />
        <Bone className="h-3 w-full rounded-md" />
        <Bone className="h-3 w-2/3 rounded-md" />
        <div className="pt-4 flex items-center justify-between">
          <Bone className="h-7 w-20 rounded-md" />
          <Bone className="h-9 w-9 rounded-lg" />
        </div>
        <div className="pt-4 space-y-3">
          <Bone className="h-10 w-full rounded-xl" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: PRODUCT_CARD_COUNT }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <SkeletonContainer label="Loading products">
      <div className="flex gap-2 py-2 mb-4 overflow-hidden">
        {Array.from({ length: CATEGORY_COUNT }, (_, i) => (
          <Bone key={i} className="h-9 w-24 shrink-0 rounded-xl" />
        ))}
      </div>
      <ProductGrid />
    </SkeletonContainer>
  );
}

// The products area alone, for when the page around it (e.g. the categories bar) is already shown
export function ProductGridSkeleton() {
  return (
    <SkeletonContainer label="Loading products">
      <ProductGrid />
    </SkeletonContainer>
  );
}

export function ProductSkeleton() {
  return (
    <SkeletonContainer label="Loading product" className="max-w-6xl mx-auto px-4 py-8">
      <Bone className="h-5 w-32 mb-8 rounded-md" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <Bone className="h-96 lg:h-[500px] w-full rounded-3xl" />
        <div className="space-y-6">
          <div className="space-y-4">
            <Bone className="h-10 w-3/4 rounded-lg" />
            <Bone className="h-9 w-28 rounded-lg" />
            <div className="pt-2 space-y-2">
              <Bone className="h-4 w-full rounded-md" />
              <Bone className="h-4 w-full rounded-md" />
              <Bone className="h-4 w-5/6 rounded-md" />
              <Bone className="h-4 w-2/3 rounded-md" />
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <Bone className="h-5 w-20 rounded-md" />
              <Bone className="h-12 w-36 rounded-xl" />
            </div>
            <Bone className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </SkeletonContainer>
  );
}

export function CartSkeleton() {
  return (
    <SkeletonContainer label="Loading cart" className="py-4">
      <div className="flex items-center justify-between mb-6">
        <Bone className="h-8 w-56 rounded-lg" />
        <Bone className="h-5 w-20 rounded-md" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-6">
          <div className="flex items-center gap-4 py-4 border-b border-gray-200">
            <Bone className="h-5 w-5 rounded" />
            <Bone className="h-5 w-48 rounded-md" />
          </div>
          <div className="divide-y divide-gray-200">
            {Array.from({ length: CART_ROW_COUNT }, (_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <Bone className="h-5 w-5 shrink-0 rounded" />
                <Bone className="h-20 w-20 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-5 w-2/3 rounded-md" />
                  <Bone className="h-4 w-1/3 rounded-md" />
                  <Bone className="h-4 w-1/4 rounded-md" />
                </div>
                <Bone className="h-9 w-28 shrink-0 rounded-lg" />
                <Bone className="h-6 w-20 shrink-0 rounded-md" />
                <Bone className="h-9 w-9 shrink-0 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
          <Bone className="h-6 w-36 mb-4 rounded-md" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Bone className="h-4 w-32 rounded-md" />
              <Bone className="h-4 w-16 rounded-md" />
            </div>
            <div className="flex justify-between">
              <Bone className="h-4 w-20 rounded-md" />
              <Bone className="h-4 w-12 rounded-md" />
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <Bone className="h-5 w-16 rounded-md" />
              <Bone className="h-5 w-20 rounded-md" />
            </div>
          </div>
          <Bone className="h-12 w-full mt-6 rounded-lg" />
          <Bone className="h-4 w-32 mx-auto mt-3 rounded-md" />
        </div>
      </div>
    </SkeletonContainer>
  );
}

export function CheckoutSkeleton() {
  return (
    <SkeletonContainer label="Loading checkout" className="py-4">
      <Bone className="h-8 w-36 mb-6 rounded-lg" />
      <Bone className="h-16 w-full mb-6 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 px-6">
          <div className="py-4 border-b border-gray-200">
            <Bone className="h-6 w-32 rounded-md" />
          </div>
          <div className="divide-y divide-gray-200">
            {Array.from({ length: CART_ROW_COUNT }, (_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <Bone className="h-16 w-16 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Bone className="h-5 w-2/3 rounded-md" />
                  <Bone className="h-4 w-1/4 rounded-md" />
                </div>
                <Bone className="h-6 w-20 shrink-0 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
          <Bone className="h-6 w-36 mb-4 rounded-md" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Bone className="h-4 w-32 rounded-md" />
              <Bone className="h-4 w-16 rounded-md" />
            </div>
            <div className="flex justify-between">
              <Bone className="h-4 w-20 rounded-md" />
              <Bone className="h-4 w-12 rounded-md" />
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3">
              <Bone className="h-5 w-16 rounded-md" />
              <Bone className="h-5 w-20 rounded-md" />
            </div>
          </div>
          <Bone className="h-12 w-full mt-6 rounded-lg" />
          <Bone className="h-3 w-40 mx-auto mt-2 rounded-md" />
          <Bone className="h-4 w-24 mx-auto mt-3 rounded-md" />
        </div>
      </div>
    </SkeletonContainer>
  );
}

function FieldSkeleton() {
  return (
    <div>
      <Bone className="h-4 w-20 mb-1 rounded-md" />
      <Bone className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <SkeletonContainer
      label="Loading sign in"
      className="min-h-[80vh] flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Bone className="h-14 w-14 rounded-2xl" />
          <Bone className="h-8 w-48 rounded-lg" />
          <Bone className="h-4 w-64 rounded-md" />
        </div>
        <div className="space-y-4">
          <FieldSkeleton />
          <FieldSkeleton />
          <Bone className="h-12 w-full rounded-xl" />
        </div>
        <Bone className="h-4 w-48 mx-auto rounded-md" />
      </div>
    </SkeletonContainer>
  );
}
