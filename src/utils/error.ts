import picocolors from 'picocolors';

function throwError(message: string | unknown, file: string) {
  throw new Error(
    picocolors.bgRed(`🚨 Erro ao processar o arquivo ${file}: ${message}.`)
  );
}

export { throwError };
