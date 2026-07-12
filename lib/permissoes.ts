/** Envio e exclusão de arquivos ficam restritos a este e-mail especificamente,
 *  independente do papel (faturista/admin) do usuário logado. */
const EMAIL_UPLOAD_PERMITIDO = 'rafah.souza2@gmail.com'

export function podeGerenciarUploads(email?: string | null): boolean {
  return email === EMAIL_UPLOAD_PERMITIDO
}
