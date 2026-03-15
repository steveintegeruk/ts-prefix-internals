// object-literal-mismatch.ts — verifies that object literal keys are renamed
// when the contextual parameter type's properties are renamed.

// This class has private 'width' and 'height' which will be prefixed.
class Box {
    private width: number;
    private height: number;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    getArea(): number {
        return this.width * this.height;
    }
}

// This function takes an anonymous object type with 'width' and 'height'.
// The prefixer should rename these in the parameter type AND in object
// literal keys at call sites.
function applySize(
    target: Box,
    fields: { width?: number; height?: number },
): string {
    const parts: string[] = [];
    if (fields.width !== undefined) parts.push(`w=${fields.width}`);
    if (fields.height !== undefined) parts.push(`h=${fields.height}`);
    return parts.join(',');
}

// Object literal keys should be renamed to match the parameter type.
const result1 = applySize(new Box(10, 20), { width: 100 });
const result2 = applySize(new Box(10, 20), { height: 200 });
const result3 = applySize(new Box(10, 20), { width: 100, height: 200 });

// Suppress unused warnings
void result1;
void result2;
void result3;
