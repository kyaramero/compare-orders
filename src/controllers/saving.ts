import { checkForNumItemDuplicates, checkOrderIdAndItemNumber } from './checks';
import { throwError } from '../utils/error';

function storeNotes(
  lineJson: { [key: string]: string | number },
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
  lineJson: { [key: string]: string | number },
  file: string,
  orders: Record<string, any> | undefined,
  numItems: number[]
) {
  try {
    checkForNumItemDuplicates(numItems, file);
    file = file.replace('.txt', '').replace('P', ''); // Salvar número do pedido
    if (orders) {
      if (!orders[file]) {
        orders[file] = { valor_total_pedido: 0 };
      }
      numItems.push(lineJson['número_item'] as number);
      orders[file][lineJson['número_item']] = lineJson;
      orders[file] = {
        ...orders[file],
        ['valor_total_pedido']:
          orders[file]['valor_total_pedido'] +
          parseFloat(
            String(lineJson['valor_unitário_produto']).replace(',', '.')
          ) *
            Number(lineJson['quantidade_produto']),
      };
    }
  } catch (err) {
    throwError(err, file);
  }
}

export { storeNotes, storeOrders };
