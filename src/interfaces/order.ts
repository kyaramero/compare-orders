export interface Order {
  valor_total_pedido: number;
  saldo_do_valor: number;
  pendentes: object[];
}

export interface Item {
  número_item: number;
  código_produto: string;
  quantidade_produto: number;
  valor_unitário_produto: string | any;
}
