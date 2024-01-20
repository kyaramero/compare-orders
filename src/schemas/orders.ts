import { Schema } from 'yup';

const Yup = require('yup');

const patternTwoDigisAfterComma = /^\d+(\.\d{1,2})?$/;

export const validOrder: Schema = Yup.object().shape({
  número_item: Yup.number()
    .positive('Numero do item deve ser positivo')
    .integer('Numero do item deve ser inteiro')
    .required('Numero do item é obrigatório'),
  código_produto: Yup.string()
    .matches(
      /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/,
      'Código do produto deve ser alfanumérico'
    )
    .required('Código do produto é obrigatório'),
  quantidade_produto: Yup.number()
    .positive('Quantidade do produto deve ser positivo')
    .integer('Quantidade do produto deve ser inteiro')
    .required('Quantidade do produto é obrigatório'),
  valor_unitário_produto: Yup.number(
    'Valor Unitário do produto deve ser um número'
  )
    .test(
      'two-digis-after-comma',
      'Valor Unitário do produto deve ter 2 dígitos após a vírgula',
      (value: string) => {
        return patternTwoDigisAfterComma.test(value);
      }
    )
    .positive('Valor unitário do produto deve ser positivo')
    .required('Valor unitário do produto é obrigatório'),
});
