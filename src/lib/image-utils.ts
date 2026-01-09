/**
 * Compresses an image file and converts it to WebP format.
 * @param file The original image file
 * @param quality Quality from 0 to 1 (default 0.7)
 * @param maxWidth Maximum width in pixels (default 1200)
 * @returns A promise that resolves to a base64 string of the compressed WebP image
 */
export async function compressImageToWebP(file: File, quality: number = 0.7, maxWidth: number = 1200): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if necessary
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to WebP base64
                const compressedBase64 = canvas.toDataURL('image/webp', quality);
                resolve(compressedBase64);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
