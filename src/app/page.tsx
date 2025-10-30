"use client";

import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const PdfExtractor = dynamic(() => import('@/components/pdf-extractor'), {
  ssr: false,
  loading: () => <PdfExtractorSkeleton />,
});

function PdfExtractorSkeleton() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
      </header>

      <div className="p-6 border rounded-lg">
        <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-5 w-3/4 mt-4" />
        </div>
      </div>
      
      <div className="border rounded-lg opacity-50">
          <div className="p-6">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </div>
          <div className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Skeleton className="h-4 w-1/2 mb-1.5" />
                <Skeleton className="h-7 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/2 mb-1.5" />
                <Skeleton className="h-7 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/2 mb-1.5" />
                <Skeleton className="h-7 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/2 mb-1.5" />
                <Skeleton className="h-7 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-1/2 mb-1.5" />
                <Skeleton className="h-7 w-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end border-t p-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
    </div>
  );
}


export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <PdfExtractor />
      </div>
    </main>
  );
}