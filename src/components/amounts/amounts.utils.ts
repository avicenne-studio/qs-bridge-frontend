function formatDecimalPart(decimal: string) {
  return decimal.length === 0 ? "00" : decimal.length === 1 ? `${decimal}0` : decimal;
}

function formatAmount(value: string, separator: "." | ",") {
  if (value.includes(separator)) {
    const [integer, decimal] = value.split(separator);

    const decimalPart = formatDecimalPart(decimal);

    return { integer: integer || "0", decimal: `${separator}${decimalPart}` };
  }

  return { integer: value, decimal: `${separator}00` };
}

export function formatAmountParts(value: string) {
  if (value === "0" || value === "") {
    return { integer: "0", decimal: ".00" };
  }

  const separator = value.includes(".") ? "." : ",";

  return formatAmount(value, separator);
}
