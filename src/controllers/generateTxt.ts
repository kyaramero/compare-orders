import * as fs from 'fs';
import picocolors from 'picocolors';
import { Item, Order } from '../interfaces/order';

function generateListPending(orders: any) {
  const pending: Record<string, unknown> = {};
  Object.keys(orders).forEach(key => {
    Object.keys(orders[key]).forEach(item => {
      if (orders[key][item]['quantidade_produto'] > 0) {
        createPendingOrder(pending, key, orders[key][item], orders[key]);
      }
    });
  });

  writePendingFile(pending);

  console.log(
    picocolors.bgGreen(
      '✅ Pedidos pendentes gerados com sucesso. Você pode encontrar o arquivo em: pedidos_pendentes.txt'
    )
  );
}

function createPendingOrder(pending: any, key: string, item: Item, order: any) {
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

function writePendingFile(pending: Record<string, unknown>) {
  const result = Object.entries(pending).map(([numero_pedido, pedido]) => {
    const pedidoTyped = pedido as Order;
    return {
      numero_pedido,
      valor_total_do_pedido: pedidoTyped.valor_total_pedido,
      saldo_do_valor: pedidoTyped.saldo_do_valor,
      pending_orders: pedidoTyped.pendentes.map((p: object) => p),
    };
  });
  const data = result.map((item: object) => JSON.stringify(item)).join('\n');
  try {
    fs.writeFileSync('pedidos_pendentes.txt', data);
  } catch (err: any) {
    console.error(picocolors.bgRed(err));
  }
}

export { generateListPending };
