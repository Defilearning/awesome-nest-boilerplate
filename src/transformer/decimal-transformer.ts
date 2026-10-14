import Decimal from 'decimal.js';
import { type ValueTransformer } from 'typeorm';

export class DecimalTransformer implements ValueTransformer {
  // To database: convert Decimal to string
  to(value?: Decimal | null | string | number): string | null | undefined {
    if (value === null) {
      return null;
    }

    if (value === undefined) {
      return undefined;
    }

    if (!Decimal.isDecimal(value)) {
      throw new Error('Invalid Decimal value');
    }

    const convertedValue = new Decimal(value);

    if (!convertedValue.isFinite()) {
      throw new Error('Invalid Decimal value');
    }

    return convertedValue.toFixed();
  }

  // From database: convert string to Decimal
  from(value: string | null): Decimal | null {
    if (value === null) {
      return null;
    }

    const convertedValue = new Decimal(value);

    if (!convertedValue.isFinite()) {
      throw new Error('Invalid Decimal value');
    }

    return convertedValue;
  }
}
