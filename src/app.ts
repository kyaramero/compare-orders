import * as fs from 'fs';
const parseJson = require('json-parse-even-better-errors');
import pc from 'picocolors';

import { validOrder } from './schemas/orders';
import { validNote } from './schemas/notes';
import { Schema } from 'yup';

async function main() {
  const ordersFolder = fs.readdirSync('./Pedidos');
  const orders = typeOfFiles('./Pedidos', ordersFolder, true);

  const notesFolder = fs.readdirSync('./Notas');
  const pending = await typeOfFiles('./Notas', notesFolder, false, orders);
  console.log('aqui começa', pending);
  generateListPending(pending);
}

async function typeOfFiles(
  dir: string,
  files: string[],
  isOrder: boolean,
  orders?: object
) {
  if (!orders) orders = {};

  for (const file of files) {
    const fileContent = fs.readFileSync(`${dir}/${file}`, 'utf-8');
    orders = await readFiles(fileContent, isOrder, file, orders);
  }
  return orders;
}

function readFiles(
  fileContent: string,
  isOrder: boolean,
  file: string,
  orders: any
) {
  const fileJson = fileContent.split('\n');
  const numItems: number[] = [];
  fileJson.forEach(async (item: string) => {
    const lineJson = parseJson(item);
    if (isOrder) {
      storeOrders(lineJson, file, orders, numItems);
      await validateTypes(lineJson, file, isOrder, validOrder);
    }
    if (!isOrder) {
      storeNotes(lineJson, file, orders);
      await validateTypes(lineJson, file, isOrder, validNote);
    }
  });

  return orders;
}

function storeNotes(
  lineJson: { [key: string]: any },
  file: string,
  orders: any
) {
  checkOrderIdAndItemNumber(lineJson, file, orders);
  orders[lineJson['id_pedido']][lineJson['número_item']][
    'quantidade_produto'
  ] += -lineJson['quantidade_produto'];

  return orders;
}

function storeOrders(
  lineJson: { [key: string]: any },
  file: string,
  orders: Record<string, any> | undefined,
  numItems: number[]
) {
  checkForNumItemDuplicates(numItems, file);
  file = file.replace('.txt', '').replace('P', ''); // Salvar número do pedido
  if (orders) {
    if (!orders[file]) {
      orders[file] = { valor_total_pedido: 0 };
    }
    numItems.push(lineJson['número_item']);
    orders[file][lineJson['número_item']] = lineJson;
    orders[file] = {
      ...orders[file],
      ['valor_total_pedido']:
        orders[file]['valor_total_pedido'] +
        parseFloat(lineJson['valor_unitário_produto'].replace(',', '.')) *
          lineJson['quantidade_produto'],
    };
    // checkNumItemSorted(orders, file);
  }
}

async function validateTypes(
  lineJson: { [key: string]: any },
  file: string,
  isOrder: boolean,
  schema: Schema
) {
  if (isOrder && lineJson['valor_unitário_produto']?.includes(',')) {
    lineJson['valor_unitário_produto'] = lineJson[
      'valor_unitário_produto'
    ].replace(',', '.');
  }
  const validationResult = await schema
    .validate(lineJson, { abortEarly: false })
    .catch((err: any) => {
      return err;
    });
  const errors = validationResult.errors;
  if (errors) {
    throw new Error(pc.red(`Erro no arquivo ${file}: ${errors}`));
  }
  return true;
}

function checkForNumItemDuplicates(numItems: number[], file: string) {
  const withoutDuplicates = numItems.length === new Set(numItems).size;
  if (!withoutDuplicates) {
    throw new Error(pc.bgRed(`Há itens duplicados no arquivo ${file}`));
  }
  return true;
}

// TODO: Está dando erro
function checkOrderIdAndItemNumber(lineJson: any, file: string, orders: any) {
  if (
    !orders[lineJson['id_pedido']] ||
    orders[lineJson['id_pedido']][lineJson['número_item']] === undefined
  ) {
    console.log(
      pc.bgRed(
        `Erro ao processar o arquivo ${file}: Pedido não encontrado ou item não encontrado`
      )
    );
  }
  return true;
}

// TODO: Preciso entender como checar se o número é sequência
// function checkNumItemSorted(orders: object | undefined, file: string) {
// }

function generateListPending(orders: any) {
  const pending: any = {};
  Object.keys(orders).forEach(key => {
    Object.keys(orders[key]).forEach(item => {
      if (orders[key][item]['quantidade_produto'] > 0) {
        createPendingOrder(pending, key, orders[key][item], orders[key]);
      }
    });
  });

  writePendingFile(pending);

  console.log(
    pc.bgCyan(
      'Pedidos pendentes gerados com sucesso. Você pode encontrar o arquivo em: pedidos_pendentes.txt'
    )
  );
}

function createPendingOrder(pending: any, key: string, item: any, order: any) {
  if (!pending[`P${key}`]) pending[`P${key}`] = {};

  if (!pending[`P${key}`]['pendentes']) pending[`P${key}`]['pendentes'] = [];

  if (!pending[`P${key}`]['saldo_do_valor'])
    pending[`P${key}`]['saldo_do_valor'] = 0;

  pending[`P${key}`] = {
    ...pending[`P${key}`],
    valor_total_pedido: order['valor_total_pedido'],
    saldo_do_valor:
      pending[`P${key}`]['saldo_do_valor'] +
      item['valor_unitário_produto'] * item['quantidade_produto'],
    pendentes: [
      ...pending[`P${key}`]['pendentes'],
      {
        número_item: item['número_item'],
        quantidade_faltante: item['quantidade_produto'],
      },
    ],
  };
}

interface Pedido {
  valor_total_pedido: number;
  saldo_do_valor: number;
  pendentes: object[];
}

function writePendingFile(pending: Record<string, unknown>) {
  console.log(pending);
  const result = Object.entries(pending).map(([numero_pedido, pedido]) => {
    const pedidoTyped = pedido as Pedido;
    return {
      numero_pedido,
      valor_total_do_pedido: pedidoTyped.valor_total_pedido,
      saldo_do_valor: pedidoTyped.saldo_do_valor,
      pending_orders: pedidoTyped.pendentes.map((p: any) => p),
    };
  });
  const data = result.map((item: any) => JSON.stringify(item)).join('\n');
  try {
    fs.writeFileSync('pedidos_pendentes.txt', data);
  } catch (err: string | any) {
    console.error(pc.bgRed(err));
  }
}

main();
