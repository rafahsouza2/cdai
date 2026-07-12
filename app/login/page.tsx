import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="login-screen">
      <div className="login-left">
        <div className="left-text">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="14" r="6" fill="#f0e2ea" opacity="0.95" />
            <circle cx="16" cy="10" r="4.2" fill="#9fb882" opacity="0.9" />
            <circle cx="19" cy="17" r="3" fill="#cf8fae" opacity="0.9" />
          </svg>
          <div>
            <h2>CDAI</h2>
            <p>Alergia &amp; Imunologia</p>
          </div>
        </div>

        <div className="bubbles-anim">
          <div className="orbit-ring" />
          <div className="orbit-ring r2" />
          <div className="orbit-ring r3" />
          <div className="orbit-core" />
          <div className="orbit-dot d1" />
          <div className="orbit-dot d2" />
          <div className="orbit-dot d3" />
        </div>

        <div className="badge-pill">Sistema interno · uso exclusivo da equipe</div>
      </div>

      <div className="login-right">
        <div className="mini-logo">
          <svg className="mini-logo-icon" viewBox="0 0 34 34">
            <circle cx="13" cy="19" r="8.5" fill="#644054" opacity="0.95" />
            <circle cx="23" cy="14" r="6" fill="#6D8661" opacity="0.9" />
            <circle cx="26" cy="23" r="4.2" fill="#9E8797" opacity="0.9" />
          </svg>
          <div className="mini-logo-text">CDAI</div>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
