import { throwError } from '../utils/error';

function checkForNumItemDuplicates(numItems: number[], file: string) {
  const withoutDuplicates = numItems.length === new Set(numItems).size;
  if (!withoutDuplicates) {
    throwError('Há números_item duplicados', file);
  }
  return true;
}

function checkOrderIdAndItemNumber(
  lineJson: { [key: string]: number | string },
  file: string,
  orders: any
) {
  if (
    !orders[lineJson['id_pedido']] ||
    orders[lineJson['id_pedido']][lineJson['número_item']] === undefined
  ) {
    throwError('Pedido ou item não encontrado', file);
  }
  return true;
}

function checkNumItemSorted(numItems: number[], file: string) {
  for (let i = 0; i < numItems.length; i++) {
    if (numItems[i] !== i + 1) {
      console.log(
        `🚨 Erro ao processar o arquivo ${file}. Os números do item não respeitam a sequência`
      );

      throwError('Há números_item fora da sequência', file);
    }
  }
}

export {
  checkForNumItemDuplicates,
  checkOrderIdAndItemNumber,
  checkNumItemSorted,
};
