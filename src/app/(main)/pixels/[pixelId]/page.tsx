import type { Metadata } from 'next';
import { PixelPage } from './PixelPage';

export default async function ({ params }: { params: Promise<{ pixelId: string }> }) {
  const { pixelId } = await params;

  return <PixelPage pixelId={pixelId} />;
}

export const metadata: Metadata = {
  title: 'Pixel',
};
