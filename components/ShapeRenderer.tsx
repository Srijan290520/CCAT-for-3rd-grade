import React from 'react';

// A robust component to render shape descriptions for non-verbal questions
const ShapeRenderer: React.FC<{ description: string }> = ({ description }) => {
    const lowerDesc = description.toLowerCase();
    const shapeKeywords = ['square', 'circle', 'triangle', 'star'];
    const hasShapeKeyword = shapeKeywords.some(keyword => lowerDesc.includes(keyword));

    // Fallback for descriptions that are likely just text (e.g., "a happy face")
    if (!hasShapeKeyword) {
        return <p className="text-lg text-center px-2">{description}</p>;
    }

    const parts = lowerDesc.split(' ').map(p => p.replace(/[^a-z0-9]/gi, ''));

    // --- PARSING LOGIC ---
    let shape = 'square';
    let color = 'bg-blue-400';
    let size: 'small' | 'medium' | 'big' = 'medium';
    let innerShape = null;
    let quantity = 1;

    const quantityMap: { [key: string]: number } = {
        'one': 1, 'single': 1, 'a': 1, '1': 1,
        'two': 2, '2': 2,
        'three': 3, '3': 3,
        'four': 4, '4': 4,
    };

    for (const part of parts) {
        if (quantityMap[part]) {
            quantity = quantityMap[part];
        }
    }

    if (parts.includes('circle')) shape = 'circle';
    if (parts.includes('triangle')) shape = 'triangle';
    if (parts.includes('star')) shape = 'star';

    if (parts.includes('red')) color = 'bg-red-400';
    if (parts.includes('green')) color = 'bg-green-400';
    if (parts.includes('yellow')) color = 'bg-yellow-400';
    
    if (parts.includes('small')) size = 'small';
    if (parts.includes('big') || parts.includes('large')) size = 'big';

    if (parts.includes('dot')) innerShape = <div className="w-2 h-2 bg-gray-800 rounded-full"></div>;
    
    const isFilled = parts.includes('filled');
    const isEmpty = parts.includes('empty');

    // --- RENDERING LOGIC ---
    const sizeClasses: Record<typeof size, Record<string, string>> = {
        small: {
            square: 'w-6 h-6',
            circle: 'w-6 h-6 rounded-full',
            triangle: 'w-0 h-0 border-l-[12px] border-l-transparent border-b-[21px] border-r-[12px] border-r-transparent',
            star: 'w-6 h-6 clip-star'
        },
        medium: {
            square: 'w-10 h-10',
            circle: 'w-10 h-10 rounded-full',
            triangle: 'w-0 h-0 border-l-[20px] border-l-transparent border-b-[35px] border-r-[20px] border-r-transparent',
            star: 'w-10 h-10 clip-star'
        },
        big: {
            square: 'w-14 h-14',
            circle: 'w-14 h-14 rounded-full',
            triangle: 'w-0 h-0 border-l-[28px] border-l-transparent border-b-[49px] border-r-[28px] border-r-transparent',
            star: 'w-14 h-14 clip-star'
        }
    };

    const triangleColor = color.replace('bg-', 'border-b-');
    
    let singleShapeStyle = `${sizeClasses[size][shape]}`;
    
    // Handle filled/empty for non-triangles
    if (shape !== 'triangle') {
        if (isEmpty) {
            singleShapeStyle += ` bg-transparent border-4 ${color.replace('bg-', 'border-')}`;
        } else { // Default to filled if not specified
            singleShapeStyle += ` ${color}`;
        }
    } else {
        singleShapeStyle += ` ${triangleColor}`;
    }

    const renderedShapes = Array.from({ length: quantity }, (_, i) => (
        <div key={i} className={`flex items-center justify-center ${singleShapeStyle}`}>
            {innerShape}
        </div>
    ));

    return (
        <div className="flex items-center justify-center gap-2 flex-wrap min-h-[50px]">
            {renderedShapes}
        </div>
    );
};


export default ShapeRenderer;