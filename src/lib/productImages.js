/**
 * Returns a high-quality Unsplash image URL based on product name keywords.
 * If no keywords match, falls back to a deterministic premium image based on the name length.
 */
export function getProductImage(productName) {
    if (!productName) return getFallbackImage('');

    const name = productName.toLowerCase();

    // 1. Perfumes & Fragrances
    if (name.includes('perfume') || name.includes('parfum') || name.includes('colônia') || name.includes('fragrância')) {
        return 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400&fit=crop'; // Elegant perfume bottle
    }

    // 2. Skincare (Creams, Moisturizers, Masks)
    if (name.includes('creme') || name.includes('hidratante') || name.includes('skincare') || name.includes('máscara')) {
        return 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400&fit=crop'; // Minimalist cream jar
    }

    // 3. Serums & Oils (Droppers)
    if (name.includes('sérum') || name.includes('serum') || name.includes('óleo') || name.includes('ácido') || name.includes('gota')) {
        return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&fit=crop'; // Serum dropper bottle
    }

    // 4. Lips (Lipstick, Gloss, Balm)
    if (name.includes('batom') || name.includes('gloss') || name.includes('boca') || name.includes('lip')) {
        return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400&fit=crop'; // Lipstick smudge/product
    }

    // 5. Makeup (Foundation, Powder, Palette)
    if (name.includes('base') || name.includes('pó') || name.includes('paleta') || name.includes('maquiagem') || name.includes('corretivo')) {
        return 'https://images.unsplash.com/photo-1512496115851-a1c8e04cc998?q=80&w=400&fit=crop'; // Makeup aesthetic flatlay
    }

    // 6. Hair (Shampoo, Conditioner)
    if (name.includes('shampoo') || name.includes('condicionador') || name.includes('cabelo')) {
        return 'https://images.unsplash.com/photo-1608248593842-8021c618175b?q=80&w=400&fit=crop'; // Shampoo bottles
    }

    // 7. Digital Products (Ebook, Course, Class, PDF, Planilha)
    if (name.includes('ebook') || name.includes('curso') || name.includes('planilha') || name.includes('digital') || name.includes('pdf') || name.includes('aula') || name.includes('guia')) {
        return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&fit=crop'; // Clean tablet/book mockup
    }

    // Fallback based on name length to ensure consistency for the same product
    return getFallbackImage(productName);
}

function getFallbackImage(name) {
    const fallbacks = [
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&fit=crop', // Pink aesthetic cosmetics
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&fit=crop', // Minimalist beauty staging
        'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=400&fit=crop', // Skincare tubes
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=400&fit=crop'  // Pastel beauty background
    ];

    // Simple hash to consistently pick the same fallback for the same name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % fallbacks.length;

    return fallbacks[index];
}
