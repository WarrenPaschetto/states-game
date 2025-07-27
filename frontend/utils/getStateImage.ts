export function getStateImageFilename(stateName: string): string {
    return `/states/${stateName.toLowerCase().replace(/\s/g, '_')}.png`;
}