const calculateQty = (dosage, duration) => {
  if (!dosage || !duration) return 0;

  const parts = dosage.split("-");
  const perDay = parts.reduce((a, b) => a + Number(b), 0);

  return perDay * Number(duration);
};

module.exports = calculateQty;