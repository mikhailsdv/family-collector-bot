export const ceil1 = (value: number) => Math.ceil(value * 10) / 10;

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const trim = (str: string) => str.trim().replace(/^[ \t]+/gm, "");
