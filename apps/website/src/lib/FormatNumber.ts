export const formatNumber = (val: number, seporator = " ") => {
  const abs = Math.abs(val);

  return abs >= 1000
    ? (val < 0 ? "-" : "") +
        Math.round(abs)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, seporator)
    : val;
};
