import { Schema } from 'yup';
import { throwError } from '../utils/error';

async function validateTypes(
  lineJson: { [key: string]: number | string },
  file: string,
  isOrder: boolean,
  schema: Schema
) {
  if (isOrder && String(lineJson['valor_unitário_produto'])?.includes(',')) {
    lineJson['valor_unitário_produto'] = String(
      lineJson['valor_unitário_produto']
    ).replace(',', '.');
  }
  const validationResult = await schema
    .validate(lineJson, { abortEarly: false })
    .catch((err: any) => {
      return err;
    });
  const errors = validationResult.errors;
  if (errors) {
    throwError(errors, file);
  }
  return true;
}

export { validateTypes };
