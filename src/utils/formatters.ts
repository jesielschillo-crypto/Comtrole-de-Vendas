export function formatMoney(val: number): string {
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMoneyRaw(val: number): string {
  return val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseMoney(valStr: string): number {
  if (!valStr) return 0;
  const cleaned = valStr
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) return digits;
  return '55' + digits;
}

export function generateWhatsAppUrl(phone: string, text: string): string {
  const cleaned = cleanPhone(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export function generateReceiptText(params: {
  clientName: string;
  productDescription: string;
  totalAmount: number;
  downPayment: number;
  remainingBalance: number;
  installmentCount: number;
  installmentAmount: number;
  warrantyNote: string;
  paymentMethod: string;
  dueDateNote?: string;
}): string {
  const methodLabel =
    params.paymentMethod === 'promissoria'
      ? 'Promissória'
      : params.paymentMethod === 'pix_mensal'
      ? 'PIX Mensal'
      : 'Boleto';

  const firstName = params.clientName.split(' ')[0] || params.clientName;

  let installmentLine = '';
  if (params.remainingBalance > 0 && params.installmentCount > 0) {
    installmentLine = `📅 *Restante:* ${params.installmentCount}x de ${formatMoney(
      params.installmentAmount
    )} (${params.dueDateNote || 'Todo dia 10'})\n`;
  } else {
    installmentLine = `📅 *Status:* Quitado integralmente\n`;
  }

  const downLine =
    params.downPayment > 0
      ? `✅ *Entrada:* ${formatMoney(params.downPayment)} (Pago via PIX)\n`
      : '';

  return `Fala ${firstName}! Segue o recibo do seu ${params.productDescription} montado na *VTECH*:\n\n🛠 *Item:* ${params.productDescription}\n💰 *Total:* ${formatMoney(params.totalAmount)}\n${downLine}${installmentLine}🛡 *Garantia:* ${params.warrantyNote}\n\nQualquer dúvida ou upgrade futuro, é só chamar por aqui! Valeu pela confiança! 🚀`;
}

export function generateReminderText(params: {
  clientName: string;
  productDescription: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  isOverdue?: boolean;
}): string {
  const firstName = params.clientName.split(' ')[0] || params.clientName;
  if (params.isOverdue) {
    return `Olá ${firstName}, tudo bem? Passando para lembrar que a parcela ${params.installmentNumber}/${params.totalInstallments} de ${formatMoney(params.amount)} referente ao seu ${params.productDescription} na VTECH venceu em ${params.dueDate}.\n\nSe precisar do código PIX ou boleto para acertar, é só avisar por aqui! 👍`;
  }
  return `Olá ${firstName}! Tudo bem? Passando para avisar que a parcela ${params.installmentNumber}/${params.totalInstallments} de ${formatMoney(params.amount)} do seu ${params.productDescription} na VTECH vence em ${params.dueDate}.\n\nQualquer dúvida estamos à disposição!`;
}
