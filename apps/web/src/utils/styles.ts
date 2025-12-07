/**
 * Utility functions for dynamic styling
 */

export const setCSSVariable = (element: HTMLElement, property: string, value: string) => {
  element.style.setProperty(property, value);
};

export const setCSSVariables = (element: HTMLElement, variables: Record<string, string>) => {
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};

export const createStyleObject = (variables: Record<string, string>): React.CSSProperties => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acc[key as keyof React.CSSProperties] = value as any;
    return acc;
  }, {} as React.CSSProperties);
};
