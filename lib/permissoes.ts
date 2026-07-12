/** Envio e exclusão de arquivos ficam restritos a este e-mail especificamente,
 *  independente do papel (faturista/admin) do usuário logado. Esta mesma conta
 *  também fica oculta da tela de gestão de usuários, para qualquer admin. */
const EMAIL_UPLOAD_PERMITIDO = 'rafah.souza2@gmail.com'

export function podeGerenciarUploads(email?: string | null): boolean {
  return email === EMAIL_UPLOAD_PERMITIDO
}

export function usuarioEhOculto(email?: string | null): boolean {
  return email === EMAIL_UPLOAD_PERMITIDO
}
