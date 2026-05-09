export const generateId = (prefix?: string): string => {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  return prefix ? `${prefix}-${id}` : id;
};
