import * as fs from 'fs';
const parseJson = require('json-parse-even-better-errors');
import pc from 'picocolors';

import { validOrder } from './schemas/orders';
import { validNote } from './schemas/notes';
import { validateTypes } from './controllers/validation';
import { storeNotes, storeOrders } from './controllers/saving';
import { checkNumItemSorted } from './controllers/checks';
import { generateListPending } from './controllers/generateTxt';

async function main() {
  const ordersFolder = fs.readdirSync('./Pedidos');
  const ordersPromise = typeOfFiles('./Pedidos', ordersFolder, true);

  const notesFolder = fs.readdirSync('./Notas');
  const notesPromise = typeOfFiles(
    './Notas',
    notesFolder,
    false,
    await ordersPromise
  );
  const [orders, pending] = await Promise.all([ordersPromise, notesPromise]);

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
    console.log(pc.bgBlue(`... Processando arquivo ${file}`));

    const fileContent = fs.readFileSync(`${dir}/${file}`, 'utf-8');

    orders = await readFiles(fileContent, isOrder, file, orders);
  }
  return orders;
}

async function readFiles(
  fileContent: string,
  isOrder: boolean,
  file: string,
  orders: object | undefined
) {
  const fileJson = fileContent.split('\n');
  const numItems: number[] = [];
  for (const item of fileJson) {
    const lineJson = parseJson(item);
    if (isOrder) {
      storeOrders(lineJson, file, orders, numItems);
      await validateTypes(lineJson, file, isOrder, validOrder);
    }
    if (!isOrder) {
      storeNotes(lineJson, file, orders);
      await validateTypes(lineJson, file, isOrder, validNote);
    }
  }
  checkNumItemSorted(numItems.sort(), file);
  return orders;
}

main();
