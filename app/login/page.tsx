import LoginForm from '@/components/LoginForm'

const PARTICULAS = [
  { left: '4%',  size: 30, duration: 9,  delay: 0   },
  { left: '12%', size: 50, duration: 12, delay: 2   },
  { left: '20%', size: 22, duration: 8,  delay: 4.5 },
  { left: '30%', size: 60, duration: 14, delay: 1   },
  { left: '40%', size: 34, duration: 10, delay: 6   },
  { left: '50%', size: 46, duration: 11, delay: 3   },
  { left: '58%', size: 26, duration: 9,  delay: 5.5 },
  { left: '66%', size: 55, duration: 13, delay: 0.5 },
  { left: '74%', size: 32, duration: 10, delay: 7   },
  { left: '82%', size: 44, duration: 12, delay: 2.5 },
  { left: '90%', size: 24, duration: 8,  delay: 4   },
  { left: '96%', size: 38, duration: 11, delay: 6.5 },
]

export default function LoginPage() {
  return (
    <div className="login-screen">
      <div className="login-left">
        <div className="bg-particles">
          {PARTICULAS.map((p, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: p.size, height: p.size, left: p.left,
                animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="pulse-ring" style={{ width: 110, height: 110, top: '32%', left: '50%', animationDuration: '3.2s' }} />
        <div className="pulse-ring" style={{ width: 200, height: 200, top: '32%', left: '50%', animationDuration: '3.2s', animationDelay: '1.1s' }} />
        <div className="pulse-ring" style={{ width: 310, height: 310, top: '32%', left: '50%', animationDuration: '3.2s', animationDelay: '2.2s' }} />

        <div className="float-icon" style={{ top: '8%', left: '10%', animationDuration: '4.5s' }}>🧬</div>
        <div className="float-icon" style={{ top: '12%', right: '12%', animationDuration: '5.5s', animationDelay: '0.8s' }}>🌿</div>
        <div className="float-icon" style={{ top: '68%', left: '8%', animationDuration: '5s', animationDelay: '1.5s' }}>🔬</div>
        <div className="float-icon" style={{ top: '75%', right: '10%', animationDuration: '4s', animationDelay: '0.3s' }}>🩺</div>
        <div className="float-icon" style={{ top: '50%', left: '4%', animationDuration: '6s', animationDelay: '2s' }}>💊</div>

        <div className="bubbles-anim">
          <svg width="140" height="160" viewBox="0 0 140 160">
            <ellipse cx="38" cy="130" rx="5" ry="18" fill="#B5C184" opacity="0.85">
              <animateTransform attributeName="transform" type="rotate" values="-5 38 148; 5 38 148; -5 38 148" dur="3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="38" cy="118" rx="10" ry="14" fill="#6D8661" opacity="0.9">
              <animateTransform attributeName="transform" type="rotate" values="6 38 132; -6 38 132; 6 38 132" dur="3s" repeatCount="indefinite" />
            </ellipse>
            <circle cx="38" cy="95" r="22" fill="#644054" opacity="0.92">
              <animate attributeName="r" values="22;23.5;22" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.92;1;0.92" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="72" cy="108" r="8" fill="#5A4551" opacity="0.85">
              <animate attributeName="cy" values="108;102;108" dur="3.2s" repeatCount="indefinite" />
              <animate attributeName="r" values="8;9;8" dur="3.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="90" cy="92" r="11" fill="#9E8797" opacity="0.8">
              <animate attributeName="cy" values="92;84;92" dur="3.8s" repeatCount="indefinite" />
              <animate attributeName="r" values="11;12.5;11" dur="3.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="112" cy="80" r="10" fill="#B4B19F" opacity="0.75">
              <animate attributeName="cy" values="80;71;80" dur="4.2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <circle cx="95" cy="60" r="12" fill="#B5C184" opacity="0.82">
              <animate attributeName="cy" values="60;50;60" dur="4.8s" repeatCount="indefinite" begin="1s" />
              <animate attributeName="r" values="12;13.5;12" dur="4.8s" repeatCount="indefinite" begin="1s" />
            </circle>
            <circle cx="118" cy="48" r="16" fill="#6D8661" opacity="0.88">
              <animate attributeName="cy" values="48;38;48" dur="5.2s" repeatCount="indefinite" begin="0.3s" />
              <animate attributeName="r" values="16;17.5;16" dur="5.2s" repeatCount="indefinite" begin="0.3s" />
            </circle>
            <text x="38" y="99" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="800" fill="white" letterSpacing="0.5" opacity="0.9">CDAI</text>
          </svg>
        </div>

        <div className="left-text">
          <h2>CDAI Intranet</h2>
          <p>Clínica de Diagnóstico em<br />Alergia e Imunologia</p>
        </div>

        <div className="badge-pill">Sistema Interno</div>

        <div className="ecg-wrap">
          <svg width="100%" height="40" viewBox="0 0 260 40" preserveAspectRatio="none">
            <path
              className="ecg-path"
              d="M0 20 L28 20 L36 20 L40 6 L44 34 L48 10 L52 20 L88 20 L96 20 L100 6 L104 34 L108 10 L112 20 L155 20 L163 20 L167 6 L171 34 L175 10 L179 20 L224 20 L232 20 L236 6 L240 34 L244 10 L248 20 L260 20"
              fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="login-right">
        <div className="mini-logo">
          <svg className="mini-logo-icon" viewBox="0 0 60 60">
            <ellipse cx="18" cy="50" rx="3" ry="9" fill="#B5C184" />
            <ellipse cx="18" cy="43" rx="6" ry="8" fill="#6B845E" />
            <circle cx="18" cy="30" r="12" fill="#644054" />
            <circle cx="33" cy="38" r="4" fill="#5A4551" opacity="0.85" />
            <circle cx="41" cy="30" r="5.5" fill="#9E8797" opacity="0.85" />
            <circle cx="50" cy="24" r="5" fill="#B4B19F" opacity="0.8" />
            <circle cx="43" cy="15" r="6" fill="#B5C184" opacity="0.85" />
            <circle cx="54" cy="11" r="8" fill="#6D8661" opacity="0.9" />
          </svg>
          <div className="mini-logo-text">CDAI</div>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
