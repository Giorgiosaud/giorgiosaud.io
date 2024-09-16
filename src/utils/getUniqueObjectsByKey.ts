export const getUniqueObjectsByKey= <T>(array: T[], key: string): T[] => {
    const uniqueKeys = new Set();
    return array.filter(item => {
        const keyValue = item[key];
        if (uniqueKeys.has(keyValue)) {
            return false;
        } else {
            uniqueKeys.add(keyValue);
            return true;
        }
    });
}
