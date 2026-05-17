import { GBTPRequest } from "./GBTPRequest.js";
import { GBTPResponse } from "./GBTPResponse";

export class ParserGBTP {

    public static montarMensagem(req: GBTPRequest): string {
        return `OPERATION:${req.operation}
ACCOUNT_ID:${req.accountId}
TO_ACCOUNT_ID:${req.toAccountId}
VALUE:${req.value}
        `.trim();
    }

    public static parseResposta(msg: string): GBTPResponse {

        const linhas = msg.split('\n');

        const dados: any = {};

        linhas.forEach(linha => {
            const index = linha.indexOf(':');
            console.log(linha)

            if (index !== -1) {
                const chave = linha.substring(0, index).trim();
                const valor = linha.substring(index + 1).trim();
                dados[chave] = valor;
            }
        });

        return {
            status: dados.STATUS,
            message: dados.MESSAGE,
            balance: Number(dados.BALANCE)
        };
    }
}