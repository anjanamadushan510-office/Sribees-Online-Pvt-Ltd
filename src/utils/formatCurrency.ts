export const formatLKR = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs. 0.00';
  }
  return `Rs. ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCurrency = (amount: number, _currency = 'LKR'): string => {
  return formatLKR(amount);
};

