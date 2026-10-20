import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { compressImage } from './compressImage';

// jsdom has no image decoding or canvas drawing, so both are replaced with fakes
const createBitmap = (width: number, height: number) => ({ width, height, close: vi.fn() });

const createContext = () => ({
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
});

const file = new File(['image'], 'avatar.png', { type: 'image/png' });

describe('compressImage', () => {
    let bitmap: ReturnType<typeof createBitmap>;
    let context: ReturnType<typeof createContext>;

    const setImageSize = (width: number, height: number) => {
        bitmap = createBitmap(width, height);
        vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap));
    };

    const getDrawnSize = () => {
        const [, , , width, height] = context.drawImage.mock.calls[0];
        return { width, height };
    };

    beforeEach(() => {
        setImageSize(3000, 2000);
        context = createContext();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
        vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,compressed');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('should scale a large image down so the longer side is maxSize', async () => {
        await compressImage(file);

        expect(getDrawnSize()).toEqual({ width: 150, height: 100 });
    });

    it('should keep the aspect ratio', async () => {
        setImageSize(1000, 2000);

        await compressImage(file);

        expect(getDrawnSize()).toEqual({ width: 75, height: 150 });
    });

    it('should not upscale an image smaller than maxSize', async () => {
        setImageSize(100, 50);

        await compressImage(file);

        expect(getDrawnSize()).toEqual({ width: 100, height: 50 });
    });

    it('should fill a white background before drawing (JPEG has no transparency)', async () => {
        await compressImage(file);

        expect(context.fillStyle).toBe('#ffffff');
        expect(context.fillRect).toHaveBeenCalledWith(0, 0, 150, 100);
        expect(context.fillRect.mock.invocationCallOrder[0]).toBeLessThan(
            context.drawImage.mock.invocationCallOrder[0]
        );
    });

    it('should return a JPEG data URL with the default quality (0.8)', async () => {
        const result = await compressImage(file);

        expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
        expect(result).toBe('data:image/jpeg;base64,compressed');
    });

    it('should use custom maxSize and quality options', async () => {
        await compressImage(file, { maxSize: 300, quality: 0.5 });

        expect(getDrawnSize()).toEqual({ width: 300, height: 200 });
        expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5);
    });

    it('should close the image bitmap after drawing', async () => {
        await compressImage(file);

        expect(bitmap.close).toHaveBeenCalledTimes(1);
    });

    it('should close the image bitmap even when drawing fails', async () => {
        context.drawImage.mockImplementation(() => {
            throw new Error('Draw failed');
        });

        await expect(compressImage(file)).rejects.toThrow('Draw failed');
        expect(bitmap.close).toHaveBeenCalledTimes(1);
    });

    it('should throw when the file is not an image', async () => {
        vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new DOMException('Invalid image', 'InvalidStateError')));

        await expect(compressImage(new File(['text'], 'notes.txt', { type: 'text/plain' }))).rejects.toThrow('Invalid image');
    });

    it('should throw when the canvas context is not available', async () => {
        vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);

        await expect(compressImage(file)).rejects.toThrow('Canvas is not supported');
        expect(bitmap.close).toHaveBeenCalledTimes(1);
    });
});
