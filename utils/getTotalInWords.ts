import {numberToWords} from "../utils/numberToWords"

const getTotalInWords = (
  showTotalWords: boolean,
  totals: any
): string => {
  if (!showTotalWords) return "";

  if (!totals?.grandTotal || totals.grandTotal === 0) {
    return "Zero Rupees Only";
  }

  const grand = totals.grandTotal.toFixed(2);
  const [integerPart, decimalPart] = grand.split(".").map(Number);

  let words = numberToWords(integerPart) + " Rupees";

  if (decimalPart && decimalPart > 0) {
    words += ` and ${numberToWords(decimalPart)} Paise`;
  }

  return words + " Only";
};

export default getTotalInWords;
