import { BancoService } from "../RegrasNegocio/BancoService";
import { GBTPResponse } from "../protocolo/GBTPResponse";

export class Index {

    private bancoService: BancoService;

    constructor() {
        this.bancoService = new BancoService();

        this.configurarEventos();
    }

    private configurarEventos(): void {

        const btnSaldo = document.getElementById('btnSaldo');
        const btnDeposito = document.getElementById('btnDeposito');
        const btnSaque = document.getElementById('btnSaque');
        const btnTransferencia = document.getElementById('btnTransferencia');

        btnSaldo?.addEventListener('click', () => this.consultarSaldo());

        btnDeposito?.addEventListener('click', () => this.depositar());

        btnSaque?.addEventListener('click', () => this.sacar());

        btnTransferencia?.addEventListener('click', () => this.transferir());
    }

    private async consultarSaldo(): Promise<void> {

        const conta = this.getValorInput('accountId');

        const resposta = await this.bancoService.consultarSaldo(conta);

        this.exibirResposta(resposta);
    }

    private async depositar(): Promise<void> {

        const conta = this.getValorInput('accountId');
        const valor = Number(this.getValorInput('value'));

        const resposta = await this.bancoService.depositar(conta, valor);

        this.exibirResposta(resposta);
    }

    private async sacar(): Promise<void> {

        const conta = this.getValorInput('accountId');
        const valor = Number(this.getValorInput('value'));

        const resposta = await this.bancoService.sacar(conta, valor);

        this.exibirResposta(resposta);
    }

    private async transferir(): Promise<void> {

        const contaOrigem = this.getValorInput('accountId');
        const contaDestino = this.getValorInput('toAccountId');
        const valor = Number(this.getValorInput('value'));

        const resposta = await this.bancoService.transferir(
            contaOrigem,
            contaDestino,
            valor
        );

        this.exibirResposta(resposta);
    }

    private getValorInput(id: string): string {

        const elemento = document.getElementById(id) as HTMLInputElement;

        return elemento.value;
    }

    private exibirResposta(resposta: GBTPResponse): void {

        const resultado = document.getElementById('resultado');

        if (!resultado) return;

        const isSucesso = String(resposta.status).toUpperCase() === 'OK';
        const icone = isSucesso ? '✅' : '⚠️';
        const titulo = isSucesso ? 'Transação Concluída' : 'Atenção';

        resultado.innerHTML = `
            <div style="border: 3px solid #031221; background: #ffffff; padding: 25px 20px; box-shadow: 6px 6px 0px #031221; color: #031221; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px; line-height: 1;">${icone}</div>
                
                <h3 style="margin-bottom: 10px; font-weight: 900; font-size: 1.4rem; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${titulo}
                </h3>
                
                <p style="font-weight: 600; font-size: 1.1rem; margin-bottom: 25px; line-height: 1.5; color: #1a3c5a;">
                    ${resposta.message}
                </p>
                
                <div style="border-top: 3px dashed #031221; padding-top: 20px;">
                    <div style="text-transform: uppercase; font-weight: 900; font-size: 0.85rem; margin-bottom: 10px;">Saldo Disponível</div>
                    <div style="font-weight: 900; font-size: 1.5rem; background: #031221; color: #ffffff; padding: 10px 20px; display: inline-block; box-shadow: 3px 3px 0px rgba(3, 18, 33, 0.2);">
                        R$ ${resposta.balance}
                    </div>
                </div>
            </div>
        `;
    }
}

new Index();