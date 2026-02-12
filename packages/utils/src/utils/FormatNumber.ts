export const formatNumber = (val: number, seporator = " ") => {
  return val >= 1000
    ? Math.round(val)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, seporator)
    : val;
};
