import { Schema } from 'yup';

const Yup = require('yup');

export const validNote: Schema = Yup.object().shape({
  id_pedido: Yup.string().required('Id do pedido é obrigatório'),
  número_item: Yup.number()
    .positive('Numero do item deve ser positivo')
    .integer('Numero do item deve ser inteiro')
    .required('Numero do item é obrigatório'),
  quantidade_produto: Yup.number()
    .positive('Quantidade do produto deve ser positivo')
    .integer('Quantidade do produto deve ser inteiro')
    .required('Quantidade do produto é obrigatório'),
});
