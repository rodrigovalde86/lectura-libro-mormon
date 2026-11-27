import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabase';
import {
  BookOpen, Calendar, CheckCircle2, Circle, Flame, Palette,
  LogOut, Sparkles, ChevronLeft, ChevronRight, Lock, User,
  Award, Check, Compass
} from 'lucide-react';
import { PLAN_LECTURAS } from './plan.js';
import { CITAS_LIAHONA, DIAS_POR_CITA } from './citas.js';

// ============================================================================
// 1. PLAN DE 365 LECTURAS (6.604 VERSÍCULOS, LARGO PAREJO) Y ENLACES EN LÍNEA
// ============================================================================
const FECHA_INICIO = new Date(2027, 0, 1);
const SLUGS_BIBLIOTECA = [
  '1-ne', '2-ne', 'jacob', 'enos', 'jarom', 'omni', 'w-of-m',
  'mosiah', 'alma', 'hel', '3-ne', '4-ne', 'morm', 'ether', 'moro'
];
const URL_BIBLIOTECA = 'https://www.churchofjesuschrist.org/study/scriptures/bofm';


const MESES = [
  { nombre: 'Enero', dias: 31, tema: 'El Árbol de la Vida' },
  { nombre: 'Febrero', dias: 28, tema: 'La Liahona' },
  { nombre: 'Marzo', dias: 31, tema: 'El Barco de Nefi' },
  { nombre: 'Abril', dias: 30, tema: 'La Torre del Rey Benjamín' },
  { nombre: 'Mayo', dias: 31, tema: 'Las Aguas de Mormón' },
  { nombre: 'Junio', dias: 30, tema: 'El Estandarte de la Libertad' },
  { nombre: 'Julio', dias: 31, tema: 'Los 2,000 Jóvenes Guerreros' },
  { nombre: 'Agosto', dias: 31, tema: 'Samuel el Lamanita' },
  { nombre: 'Septiembre', dias: 30, tema: 'Cristo en Abundancia' },
  { nombre: 'Octubre', dias: 31, tema: 'Las Planchas de Oro' },
  { nombre: 'Noviembre', dias: 30, tema: 'El Hermano de Jared' },
  { nombre: 'Diciembre', dias: 31, tema: 'La Promesa de Moroni' }
];

function generarPlan365() {
  const plan = [];
  let dia = 1;
  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= MESES[m].dias; d++) {
      const [lectura, cantidadVersiculos, minutos, libro, cap, vIni] = PLAN_LECTURAS[dia - 1];
      const rango = /:(\d+)[–-](\d+)$/.exec(lectura);
      const ancla = rango
        ? `&id=${vIni}-${rango[2]}#p${vIni}`
        : vIni > 1
        ? `&id=${vIni}#p${vIni}`
        : '';
      plan.push({
        dia,
        mesIdx: m,
        diaMes: d,
        fechaCorta: `${d} ${MESES[m].nombre.slice(0, 3)}`,
        lectura,
        cantidadVersiculos,
        minutos,
        enlace: `${URL_BIBLIOTECA}/${SLUGS_BIBLIOTECA[libro]}/${cap}?lang=spa${ancla}`
      });
      dia++;
    }
  }
  return plan;
}


// ============================================================================
// 2. COMPONENTE DE LOS 12 MURALES MENSUALES INTERACTIVOS
// ============================================================================
function MuralMensualSVG({ mesIdx, diasLeidosMes, totalDiasMes }) {
  const ratio = diasLeidosMes / totalDiasMes;
  const activo = (umbral) => ratio >= umbral;
  const cieloGrad = activo(0.85)
    ? ['#1e3a8a', '#3b82f6', '#fde68a']
    : activo(0.4)
    ? ['#172554', '#1e40af', '#60a5fa']
    : ['#0f172a', '#1e293b', '#334155'];

  const colorTierra = activo(0.15) ? '#15803d' : '#1e293b';
  const colorTierra2 = activo(0.3) ? '#166534' : '#0f172a';
  const oro = '#C9A808';
  const grisTrazo = '#475569';

  return (
    <svg viewBox="0 0 800 450" className="w-full h-auto rounded-2xl border-2 border-[#C9A808]/40 shadow-2xl bg-[#0c1626]">
      <defs>
        <linearGradient id={`cielo-${mesIdx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cieloGrad[0]} />
          <stop offset="60%" stopColor={cieloGrad[1]} />
          <stop offset="100%" stopColor={cieloGrad[2]} />
        </linearGradient>
        <radialGradient id="brillo-oro" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#C9A808" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C9A808" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill={`url(#cielo-${mesIdx})`} />

      {[
        [100, 70], [220, 45], [350, 80], [500, 50], [640, 75], [730, 40], [160, 120], [580, 115]
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={activo(0.1 + i * 0.08) ? 3.5 : 1.5}
          fill={activo(0.1 + i * 0.08) ? '#fef08a' : '#475569'}
        />
      ))}

      <circle
        cx="670"
        cy="95"
        r={activo(0.75) ? 42 : 28}
        fill={activo(0.75) ? '#fde047' : 'none'}
        stroke={activo(0.75) ? oro : grisTrazo}
        strokeWidth="2.5"
        strokeDasharray={activo(0.75) ? '0' : '6 6'}
      />

      <path d="M0,330 Q200,270 420,320 T800,300 L800,450 L0,450 Z" fill={colorTierra2} />
      <path d="M0,360 Q280,320 540,365 T800,345 L800,450 L0,450 Z" fill={colorTierra} />

      {mesIdx === 0 && (
        <g>
          <path d="M80,450 Q250,390 400,360" fill="none" stroke={activo(0.25) ? '#d97706' : grisTrazo} strokeWidth="14" strokeLinecap="round" />
          <line x1="80" y1="435" x2="395" y2="348" stroke={activo(0.45) ? oro : grisTrazo} strokeWidth="6" />
          <path d="M385,365 L385,235 Q365,190 330,175 M415,365 L415,235 Q435,190 470,175 M400,250 L400,165" fill="none" stroke={activo(0.35) ? '#78350f' : grisTrazo} strokeWidth="18" strokeLinecap="round" />
          <ellipse cx="400" cy="175" rx="145" ry="85" fill={activo(0.6) ? '#f8fafc' : '#1e293b'} stroke={activo(0.6) ? oro : grisTrazo} strokeWidth="3" />
          {[
            [330, 160], [375, 135], [425, 140], [465, 165], [355, 200], [405, 195], [445, 200]
          ].map(([fx, fy], idx) => (
            <circle key={idx} cx={fx} cy={fy} r="10" fill={activo(0.7 + idx * 0.04) ? '#fef9c3' : 'none'} stroke={activo(0.7 + idx * 0.04) ? oro : grisTrazo} strokeWidth="2" />
          ))}
        </g>
      )}

      {mesIdx === 1 && (
        <g transform="translate(400, 225)">
          <circle r="125" fill={activo(0.9) ? 'url(#brillo-oro)' : 'none'} />
          <circle r="105" fill={activo(0.3) ? '#b45309' : '#1e293b'} stroke={activo(0.3) ? oro : grisTrazo} strokeWidth="6" />
          <circle r="85" fill={activo(0.5) ? '#14233C' : '#0f172a'} stroke={activo(0.5) ? oro : grisTrazo} strokeWidth="2" />
          <line x1="0" y1="-80" x2="0" y2="80" stroke={activo(0.65) ? oro : grisTrazo} strokeWidth="4" />
          <line x1="-80" y1="0" x2="80" y2="0" stroke={activo(0.65) ? oro : grisTrazo} strokeWidth="4" />
          <polygon points="0,-70 12,0 0,70 -12,0" fill={activo(0.8) ? '#fde047' : 'none'} stroke={activo(0.8) ? oro : grisTrazo} strokeWidth="2" />
        </g>
      )}

      {mesIdx === 2 && (
        <g>
          <path d="M0,330 Q100,310 200,330 T400,330 T600,330 T800,330 L800,450 L0,450 Z" fill={activo(0.25) ? '#0369a1' : '#1e293b'} />
          <path d="M240,310 L560,310 L515,375 L285,375 Z" fill={activo(0.45) ? '#92400e' : '#1e293b'} stroke={activo(0.45) ? oro : grisTrazo} strokeWidth="3" />
          <line x1="400" y1="140" x2="400" y2="310" stroke={activo(0.55) ? '#d97706' : grisTrazo} strokeWidth="8" />
          <path d="M405,150 Q515,210 405,285 Z" fill={activo(0.75) ? '#fef3c7' : 'none'} stroke={activo(0.75) ? oro : grisTrazo} strokeWidth="3" />
          <path d="M395,165 Q305,215 395,275 Z" fill={activo(0.85) ? '#fde68a' : 'none'} stroke={activo(0.85) ? oro : grisTrazo} strokeWidth="3" />
        </g>
      )}

      {mesIdx === 3 && (
        <g>
          <polygon points="340,360 365,170 435,170 460,360" fill={activo(0.35) ? '#b45309' : '#1e293b'} stroke={activo(0.35) ? oro : grisTrazo} strokeWidth="3" />
          <rect x="330" y="155" width="140" height="22" rx="4" fill={activo(0.55) ? '#d97706' : '#1e293b'} stroke={activo(0.55) ? oro : grisTrazo} strokeWidth="2.5" />
          <circle cx="400" cy="122" r="14" fill={activo(0.75) ? '#fef3c7' : 'none'} stroke={activo(0.75) ? oro : grisTrazo} strokeWidth="2.5" />
          <path d="M380,155 L420,155 L412,136 L388,136 Z" fill={activo(0.75) ? '#f8fafc' : 'none'} stroke={activo(0.75) ? oro : grisTrazo} strokeWidth="2" />
          {[180, 240, 300, 500, 560, 620].map((tx, idx) => (
            <polygon key={idx} points={`${tx - 24},380 ${tx},335 ${tx + 24},380`} fill={activo(0.4 + idx * 0.08) ? '#fef3c7' : 'none'} stroke={activo(0.4 + idx * 0.08) ? oro : grisTrazo} strokeWidth="2" />
          ))}
        </g>
      )}

      {mesIdx === 4 && (
        <g>
          <ellipse cx="430" cy="375" rx="260" ry="50" fill={activo(0.3) ? '#0284c7' : '#1e293b'} stroke={activo(0.3) ? '#38bdf8' : grisTrazo} strokeWidth="3" />
          <path d="M120,340 Q150,210 210,190 Q260,215 280,340 Z" fill={activo(0.5) ? '#15803d' : '#1e293b'} stroke={activo(0.5) ? '#4ade80' : grisTrazo} strokeWidth="2.5" />
          <rect x="190" y="330" width="20" height="45" fill={activo(0.5) ? '#78350f' : grisTrazo} />
          <circle cx="415" cy="310" r="12" fill={activo(0.75) ? '#fef3c7' : 'none'} stroke={activo(0.75) ? oro : grisTrazo} strokeWidth="2" />
          <circle cx="450" cy="322" r="11" fill={activo(0.85) ? '#fef3c7' : 'none'} stroke={activo(0.85) ? oro : grisTrazo} strokeWidth="2" />
        </g>
      )}

      {mesIdx === 5 && (
        <g>
          <line x1="330" y1="380" x2="330" y2="110" stroke={activo(0.3) ? '#d97706' : grisTrazo} strokeWidth="10" strokeLinecap="round" />
          <path d="M335,120 Q445,105 555,130 L535,235 Q435,210 335,225 Z" fill={activo(0.65) ? '#f8fafc' : '#1e293b'} stroke={activo(0.65) ? oro : grisTrazo} strokeWidth="4" />
          <line x1="365" y1="155" x2="510" y2="155" stroke={activo(0.8) ? oro : grisTrazo} strokeWidth="5" />
          <line x1="365" y1="185" x2="490" y2="185" stroke={activo(0.85) ? '#14233C' : grisTrazo} strokeWidth="5" />
        </g>
      )}

      {mesIdx === 6 && (
        <g>
          {[220, 290, 360, 430, 500, 570].map((sx, idx) => (
            <g key={idx} transform={`translate(${sx}, ${idx % 2 === 0 ? 275 : 290})`}>
              <path d="M-24,-45 L24,-45 L24,15 Q0,45 -24,15 Z" fill={activo(0.35 + idx * 0.1) ? '#14233C' : '#1e293b'} stroke={activo(0.35 + idx * 0.1) ? oro : grisTrazo} strokeWidth="3.5" />
              <circle cx="0" cy="-10" r="10" fill={activo(0.5 + idx * 0.08) ? oro : 'none'} />
            </g>
          ))}
        </g>
      )}

      {mesIdx === 7 && (
        <g>
          <rect x="240" y="210" width="320" height="175" fill={activo(0.35) ? '#78350f' : '#1e293b'} stroke={activo(0.35) ? oro : grisTrazo} strokeWidth="3" />
          {[240, 285, 330, 375, 420, 465, 510].map((bx, i) => (
            <rect key={i} x={bx} y="190" width="32" height="20" fill={activo(0.45) ? '#92400e' : '#1e293b'} stroke={activo(0.45) ? oro : grisTrazo} strokeWidth="2" />
          ))}
          <circle cx="400" cy="145" r="14" fill={activo(0.7) ? '#fef3c7' : 'none'} stroke={activo(0.7) ? oro : grisTrazo} strokeWidth="2.5" />
          <path d="M380,190 L420,190 L414,160 L386,160 Z" fill={activo(0.7) ? '#f8fafc' : 'none'} stroke={activo(0.7) ? oro : grisTrazo} strokeWidth="2.5" />
          <line x1="210" y1="160" x2="345" y2="145" stroke={activo(0.85) ? '#ef4444' : grisTrazo} strokeWidth="3" strokeDasharray="6 4" />
          <line x1="590" y1="175" x2="455" y2="155" stroke={activo(0.9) ? '#ef4444' : grisTrazo} strokeWidth="3" strokeDasharray="6 4" />
        </g>
      )}

      {mesIdx === 8 && (
        <g>
          <polygon points="400,25 270,220 530,220" fill={activo(0.5) ? 'url(#brillo-oro)' : 'none'} />
          <polygon points="270,365 305,270 495,270 530,365" fill={activo(0.35) ? '#f8fafc' : '#1e293b'} stroke={activo(0.35) ? oro : grisTrazo} strokeWidth="3" />
          <rect x="335" y="235" width="130" height="35" fill={activo(0.45) ? '#f1f5f9' : '#1e293b'} stroke={activo(0.45) ? oro : grisTrazo} strokeWidth="2.5" />
          <circle cx="400" cy="115" r="24" fill={activo(0.8) ? '#fef9c3' : 'none'} stroke={activo(0.8) ? oro : grisTrazo} strokeWidth="3" />
          <path d="M350,155 Q400,135 450,155 L425,215 L375,215 Z" fill={activo(0.85) ? '#ffffff' : 'none'} stroke={activo(0.85) ? oro : grisTrazo} strokeWidth="3" />
        </g>
      )}

      {mesIdx === 9 && (
        <g transform="translate(400, 240)">
          <circle r="145" fill={activo(0.85) ? 'url(#brillo-oro)' : 'none'} />
          <rect x="-110" y="-75" width="220" height="150" rx="10" fill={activo(0.35) ? '#b45309' : '#1e293b'} stroke={activo(0.35) ? oro : grisTrazo} strokeWidth="4" />
          <rect x="-102" y="-83" width="220" height="150" rx="10" fill={activo(0.55) ? '#d97706' : '#1e293b'} stroke={activo(0.55) ? oro : grisTrazo} strokeWidth="4" />
          <rect x="-94" y="-91" width="220" height="150" rx="10" fill={activo(0.75) ? '#eab308' : '#0f172a'} stroke={activo(0.75) ? '#fef08a' : grisTrazo} strokeWidth="4" />
          {[-115, -108, -101].map((rx, idx) => (
            <g key={idx}>
              <circle cx={rx} cy="-45" r="12" fill="none" stroke={activo(0.6) ? '#fef08a' : grisTrazo} strokeWidth="4" />
              <circle cx={rx} cy="25" r="12" fill="none" stroke={activo(0.6) ? '#fef08a' : grisTrazo} strokeWidth="4" />
            </g>
          ))}
        </g>
      )}

      {mesIdx === 10 && (
        <g>
          {[
            [240, 180], [300, 165], [360, 175], [420, 165], [480, 175], [540, 180],
            [265, 225], [325, 215], [385, 220], [445, 215], [505, 225],
            [295, 270], [355, 265], [415, 265], [475, 270], [385, 310]
          ].map(([px, py], idx) => {
            const encendida = activo(0.2 + idx * 0.05);
            return (
              <g key={idx}>
                {encendida && <circle cx={px} cy={py} r="22" fill="url(#brillo-oro)" />}
                <circle cx={px} cy={py} r="10" fill={encendida ? '#fef9c3' : '#1e293b'} stroke={encendida ? oro : grisTrazo} strokeWidth="2.5" />
              </g>
            );
          })}
        </g>
      )}

      {mesIdx === 11 && (
        <g>
          <polygon points="400,75 290,365 510,365" fill={activo(0.35) ? '#15803d' : '#1e293b'} stroke={activo(0.35) ? oro : grisTrazo} strokeWidth="3" />
          <rect x="365" y="305" width="70" height="45" rx="6" fill={activo(0.55) ? '#78350f' : '#0f172a'} stroke={activo(0.55) ? oro : grisTrazo} strokeWidth="3" />
          <line x1="400" y1="68" x2="400" y2="25" stroke={activo(0.85) ? oro : grisTrazo} strokeWidth="5" />
          <polygon points="400,25 426,35 400,45" fill={activo(0.85) ? '#fde047' : 'none'} stroke={activo(0.85) ? oro : grisTrazo} strokeWidth="2" />
          <circle cx="400" cy="145" r="45" fill={activo(0.95) ? 'url(#brillo-oro)' : 'none'} />
        </g>
      )}
    </svg>
  );
}

function Liahona({ diasLeidos }) {
  const [verAnteriores, setVerAnteriores] = useState(false);
  const total = CITAS_LIAHONA.length;
  const nivel = Math.floor(diasLeidos / DIAS_POR_CITA);
  const cita = CITAS_LIAHONA[nivel % total];
  const faltan = DIAS_POR_CITA - (diasLeidos % DIAS_POR_CITA);
  const avance = DIAS_POR_CITA - faltan;
  const anteriores = Array.from(
    { length: Math.min(nivel, total - 1) },
    (_, i) => CITAS_LIAHONA[(nivel - 1 - i) % total]
  );

  return (
    <div className="bg-[#14233C] border border-[#C9A808]/60 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center gap-2 text-[#C9A808] text-xs font-bold uppercase tracking-widest mb-4">
        <Compass className="w-4 h-4" /> Liahona
      </div>

      <blockquote className="font-serif text-xl sm:text-2xl text-white leading-snug">
        “{cita.texto}”
      </blockquote>
      <p className="mt-3 text-sm text-slate-300">
        <span className="text-[#C9A808] font-semibold">{cita.autor}</span> • {cita.fuente}
      </p>

      <div className="mt-5 pt-4 border-t border-[#C9A808]/20 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed">
          Como la Liahona de Lehi, este mensaje cambia “de cuando en cuando, según la fe y diligencia” que le damos
          {' '}(<a
            href="https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/16?lang=spa&id=28-29#p28"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C9A808] hover:underline"
          >1 Nefi 16:28–29</a>).
        </p>

        <div className="w-full h-2 bg-[#0c1626] rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-[#C9A808] to-amber-300 transition-all duration-500"
            style={{ width: `${(avance / DIAS_POR_CITA) * 100}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-[#C9A808]">
          Sigue leyendo {faltan} {faltan === 1 ? 'día' : 'días'} para que cambie tu cita.
        </p>

        {anteriores.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setVerAnteriores((v) => !v)}
              className="text-xs text-slate-300 hover:text-[#C9A808] underline underline-offset-2"
            >
              {verAnteriores ? 'Ocultar' : 'Ver'} mensajes anteriores ({anteriores.length})
            </button>
            {verAnteriores && (
              <ul className="mt-3 space-y-3">
                {anteriores.map((c, i) => (
                  <li key={i} className="text-sm text-slate-200 border-l-2 border-[#C9A808]/50 pl-3">
                    “{c.texto}”
                    <span className="block text-xs text-slate-400 mt-0.5">{c.autor} • {c.fuente}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. APLICACIÓN PRINCIPAL CONECTADA A SUPABASE
// ============================================================================
export default function App() {
  const plan365 = useMemo(() => generarPlan365(), []);

  const [session, setSession] = useState(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [modoAuth, setModoAuth] = useState('login');
  const [nombreForm, setNombreForm] = useState('');
  const [emailForm, setEmailForm] = useState('');
  const [passForm, setPassForm] = useState('');
  const [errorAuth, setErrorAuth] = useState('');
  const [procesandoAuth, setProcesandoAuth] = useState(false);

  const [nombreFamilia, setNombreFamilia] = useState('');
  const [diasCompletados, setDiasCompletados] = useState([]);
  const [guardandoNube, setGuardandoNube] = useState(false);
  const [errorNube, setErrorNube] = useState('');
  const [progresoListo, setProgresoListo] = useState(false);
  const usuarioCargado = useRef(null);

  const diasParaInicio = useMemo(() => {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    return Math.round((FECHA_INICIO - hoy) / 86400000);
  }, []);

  const diaHoyNumero = useMemo(
    () => Math.min(Math.max(1 - diasParaInicio, 1), 365),
    [diasParaInicio]
  );

  const mesHoyIdx = plan365[diaHoyNumero - 1]?.mesIdx ?? 0;

  const [vistaActiva, setVistaActiva] = useState('hoy');
  const [mesFiltroAnual, setMesFiltroAnual] = useState(mesHoyIdx);
  const [mesMural, setMesMural] = useState(mesHoyIdx);

  const irAHoy = () => {
    setMesFiltroAnual(mesHoyIdx);
    setMesMural(mesHoyIdx);
    setVistaActiva('hoy');
  };

  const cargarProgresoNube = async (user) => {
    const nombreGoogle =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.nombre ||
      user.email.split('@')[0];

    const fallo = (msg) => {
      setErrorNube(msg);
      setProgresoListo(false);
      usuarioCargado.current = null;
    };

    const { data, error } = await supabase
      .from('progreso_lectura')
      .select('nombre_familia, dias_completados')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      fallo('No pudimos cargar tu progreso. Revisa tu conexión y recarga la página.');
      return;
    }

    if (data) {
      setNombreFamilia(data.nombre_familia || nombreGoogle);
      setDiasCompletados(data.dias_completados || []);
    } else {
      setNombreFamilia(nombreGoogle);
      setDiasCompletados([]);
      const { error: errCrear } = await supabase.from('progreso_lectura').upsert({
        user_id: user.id,
        nombre_familia: nombreGoogle,
        dias_completados: []
      });
      if (errCrear) {
        fallo('No pudimos crear tu progreso. Recarga la página e inténtalo de nuevo.');
        return;
      }
    }
    setErrorNube('');
    setProgresoListo(true);
  };

  // Carga el progreso una sola vez por usuario (evita recargas repetidas al volver a la pestaña)
  const cargarSiHaceFalta = (user) => {
    if (usuarioCargado.current === user.id) return Promise.resolve();
    usuarioCargado.current = user.id;
    return cargarProgresoNube(user);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        cargarSiHaceFalta(s.user).finally(() => setCargandoInicial(false));
      } else {
        setCargandoInicial(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        cargarSiHaceFalta(s.user);
      } else {
        usuarioCargado.current = null;
        setProgresoListo(false);
        setErrorNube('');
        setDiasCompletados([]);
        setNombreFamilia('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const iniciarConGoogle = async () => {
    setErrorAuth('');
    setProcesandoAuth(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setErrorAuth('No se pudo conectar con Google. Verifica que esté activado en Supabase.');
      setProcesandoAuth(false);
    }
  };

  const manejarAuth = async (e) => {
    e.preventDefault();
    setErrorAuth('');
    if (!emailForm.trim() || !passForm.trim()) {
      setErrorAuth('Ingresa tu correo y contraseña.');
      return;
    }
    if (passForm.length < 6) {
      setErrorAuth('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setProcesandoAuth(true);
    try {
      if (modoAuth === 'register') {
        const nombreFinal = nombreForm.trim() || emailForm.split('@')[0];
        const { data, error } = await supabase.auth.signUp({
          email: emailForm.trim(),
          password: passForm,
          options: { data: { nombre: nombreFinal } }
        });
        if (error) throw error;
        if (data?.user) {
          await supabase.from('progreso_lectura').upsert({
            user_id: data.user.id,
            nombre_familia: nombreFinal,
            dias_completados: []
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailForm.trim(),
          password: passForm
        });
        if (error) throw error;
      }
    } catch (err) {
      setErrorAuth(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : err.message || 'Ocurrió un error al conectar.'
      );
    } finally {
      setProcesandoAuth(false);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  const toggleDia = async (numDia) => {
    if (!session?.user) return;
    if (!progresoListo) {
      setErrorNube('Tu progreso todavía no se cargó. Espera un momento o recarga la página.');
      return;
    }
    const anteriores = diasCompletados;
    const nuevosDias = diasCompletados.includes(numDia)
      ? diasCompletados.filter((d) => d !== numDia)
      : [...diasCompletados, numDia].sort((a, b) => a - b);

    setDiasCompletados(nuevosDias);
    setGuardandoNube(true);
    setErrorNube('');

    const { error } = await supabase
      .from('progreso_lectura')
      .upsert({
        user_id: session.user.id,
        nombre_familia: nombreFamilia,
        dias_completados: nuevosDias,
        actualizado_en: new Date().toISOString()
      });

    setGuardandoNube(false);
    if (error) {
      setDiasCompletados(anteriores);
      setErrorNube('No se pudo guardar tu lectura. Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  const rachaActual = useMemo(() => {
    const setDias = new Set(diasCompletados);
    let racha = 0;
    let cursor = setDias.has(diaHoyNumero) ? diaHoyNumero : diaHoyNumero - 1;
    while (cursor >= 1 && setDias.has(cursor)) {
      racha++;
      cursor--;
    }
    return racha;
  }, [diasCompletados, diaHoyNumero]);

  const porcentajeAnual = Math.round((diasCompletados.length / 365) * 100);
  const lecturaHoy = plan365[diaHoyNumero - 1];

  const diasSemanaActual = useMemo(() => {
    const inicioSem = Math.max(1, diaHoyNumero - ((diaHoyNumero - 1) % 7));
    return plan365.slice(inicioSem - 1, Math.min(365, inicioSem + 6));
  }, [plan365, diaHoyNumero]);

  const progresoPorMes = useMemo(() => {
    return MESES.map((m, idx) => {
      const diasDeEsteMes = plan365.filter((p) => p.mesIdx === idx);
      const leidos = diasDeEsteMes.filter((p) => diasCompletados.includes(p.dia)).length;
      return { ...m, idx, total: diasDeEsteMes.length, leidos };
    });
  }, [plan365, diasCompletados]);

  if (cargandoInicial) {
    return (
      <div className="min-h-screen bg-[#0c1626] flex items-center justify-center text-[#C9A808]">
        <div className="flex flex-col items-center gap-3">
          <BookOpen className="w-10 h-10 animate-pulse" />
          <p className="text-sm tracking-widest uppercase">Cargando lectura...</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // PANTALLA DE ACCESO (GOOGLE + EMAIL/CONTRASEÑA)
  // ==========================================================================
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0c1626] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#14233C] border-2 border-[#C9A808] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-2 border border-[#C9A808]/30 rounded-2xl pointer-events-none" />

          <div className="text-center mb-6 relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0c1626] border-2 border-[#C9A808] flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-[#C9A808]" />
            </div>
            <p className="text-xs tracking-[0.25em] text-[#C9A808] uppercase font-semibold mb-1">
              Otro Testamento de Jesucristo
            </p>
            <h1 className="text-2xl font-serif font-bold text-white">
              Lectura del Libro de Mormón
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Plan anual de lectura
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <button
              type="button"
              onClick={iniciarConGoogle}
              disabled={procesandoAuth}
              className="w-full bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px bg-slate-700 flex-1" />
              <span>o con tu correo</span>
              <div className="h-px bg-slate-700 flex-1" />
            </div>

            <div className="grid grid-cols-2 bg-[#0c1626] p-1 rounded-xl border border-[#C9A808]/30">
              <button
                type="button"
                onClick={() => { setModoAuth('login'); setErrorAuth(''); }}
                className={`py-2 text-sm font-semibold rounded-lg transition ${
                  modoAuth === 'login' ? 'bg-[#C9A808] text-[#14233C]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setModoAuth('register'); setErrorAuth(''); }}
                className={`py-2 text-sm font-semibold rounded-lg transition ${
                  modoAuth === 'register' ? 'bg-[#C9A808] text-[#14233C]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Registro Rápido
              </button>
            </div>

            <form onSubmit={manejarAuth} className="space-y-3.5">
              {modoAuth === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#C9A808] uppercase tracking-wider mb-1">
                    Nombre o Familia
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Ej. Familia Valdebenito"
                      value={nombreForm}
                      onChange={(e) => setNombreForm(e.target.value)}
                      className="w-full bg-[#0c1626] border border-slate-600 focus:border-[#C9A808] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#C9A808] uppercase tracking-wider mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={emailForm}
                  onChange={(e) => setEmailForm(e.target.value)}
                  className="w-full bg-[#0c1626] border border-slate-600 focus:border-[#C9A808] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C9A808] uppercase tracking-wider mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={passForm}
                    onChange={(e) => setPassForm(e.target.value)}
                    className="w-full bg-[#0c1626] border border-slate-600 focus:border-[#C9A808] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {errorAuth && (
                <p className="text-xs text-red-400 bg-red-950/50 border border-red-500/40 rounded-lg p-2.5">
                  {errorAuth}
                </p>
              )}

              <button
                type="submit"
                disabled={procesandoAuth}
                className="w-full bg-[#C9A808] hover:bg-[#b59607] disabled:opacity-50 text-[#14233C] font-bold py-3 rounded-xl shadow-lg transition transform active:scale-[0.99]"
              >
                {procesandoAuth
                  ? 'Conectando...'
                  : modoAuth === 'login'
                  ? 'Entrar a mi Cronograma'
                  : 'Crear Cuenta y Empezar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // PANEL PRINCIPAL
  // ==========================================================================
  const infoMesMural = progresoPorMes[mesMural];
  const diasAnualFiltrados = plan365.filter((d) => d.mesIdx === mesFiltroAnual);

  return (
    <div className="min-h-screen bg-[#0c1626] text-white pb-16">
      <header className="bg-[#14233C] border-b-2 border-[#C9A808] sticky top-0 z-30 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c1626] border border-[#C9A808] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#C9A808]" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                El Libro de Mormón
              </h1>
              <p className="text-xs text-[#C9A808] flex items-center gap-2">
                <span>{nombreFamilia}</span>
                {guardandoNube && <span className="text-[10px] text-slate-400">• Guardando...</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {vistaActiva !== 'hoy' && (
              <button
                onClick={irAHoy}
                className="flex items-center gap-1.5 text-xs font-bold text-[#14233C] bg-[#C9A808] hover:bg-[#b59607] px-3 py-2 rounded-xl shadow transition"
              >
                <Compass className="w-4 h-4" />
                <span>Ir a Hoy</span>
              </button>
            )}

            <button
              onClick={cerrarSesion}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#C9A808] bg-[#0c1626] px-3 py-2 rounded-xl border border-slate-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {errorNube && (
          <p className="text-sm text-red-300 bg-red-950/50 border border-red-500/40 rounded-xl p-3">
            {errorNube}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#14233C] border border-[#C9A808]/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#C9A808] text-xs font-semibold uppercase mb-1">
              <Flame className="w-4 h-4" /> Racha
            </div>
            <p className="text-2xl font-bold">{rachaActual} <span className="text-xs font-normal text-slate-300">días</span></p>
          </div>

          <div className="bg-[#14233C] border border-[#C9A808]/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#C9A808] text-xs font-semibold uppercase mb-1">
              <CheckCircle2 className="w-4 h-4" /> Leídos
            </div>
            <p className="text-2xl font-bold">{diasCompletados.length} <span className="text-xs font-normal text-slate-300">/ 365</span></p>
          </div>

          <div className="bg-[#14233C] border border-[#C9A808]/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#C9A808] text-xs font-semibold uppercase mb-1">
              <Award className="w-4 h-4" /> Meta Anual
            </div>
            <p className="text-2xl font-bold">{porcentajeAnual}%</p>
          </div>

          <div className="bg-[#14233C] border border-[#C9A808]/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[#C9A808] text-xs font-semibold uppercase mb-1">
              <Palette className="w-4 h-4" /> Mural {infoMesMural.nombre.slice(0, 3)}
            </div>
            <p className="text-2xl font-bold">
              {Math.round((infoMesMural.leidos / infoMesMural.total) * 100)}%
            </p>
          </div>
        </div>

        <nav className="grid grid-cols-4 bg-[#14233C] p-1.5 rounded-2xl border border-[#C9A808]/40 gap-1">
          {[
            { id: 'hoy', label: 'Hoy', icon: BookOpen },
            { id: 'semana', label: 'Semana', icon: Calendar },
            { id: 'anual', label: 'Plan Anual', icon: Check },
            { id: 'mural', label: 'Mural Niños', icon: Palette }
          ].map((tab) => {
            const Icono = tab.icon;
            const activa = vistaActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setVistaActiva(tab.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activa
                    ? 'bg-[#C9A808] text-[#14233C] shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-[#0c1626]/50'
                }`}
              >
                <Icono className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* VISTA 1: LECTURA DE HOY */}
        {vistaActiva === 'hoy' && (
          <div className="bg-[#14233C] border-2 border-[#C9A808] rounded-3xl p-6 sm:p-8 shadow-2xl">
            {diasParaInicio > 0 && (
              <p className="text-sm bg-[#0c1626] border border-[#C9A808]/50 text-[#C9A808] rounded-xl p-3 mb-4">
                El plan empieza el 1 de enero de 2027 (faltan {diasParaInicio} {diasParaInicio === 1 ? 'día' : 'días'}).
                Mientras tanto puedes ver cómo es la primera lectura.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest bg-[#0c1626] text-[#C9A808] px-3 py-1.5 rounded-full border border-[#C9A808]/40">
                Día {lecturaHoy.dia} de 365 • {lecturaHoy.fechaCorta}
              </span>
              <span className="text-xs text-slate-300">
                {lecturaHoy.cantidadVersiculos} versículos • unos {lecturaHoy.minutos} min
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
              <a
                href={lecturaHoy.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit no-underline cursor-pointer"
              >
                {lecturaHoy.lectura}
              </a>
            </h2>
            <p className="text-sm text-slate-300 mb-8">
              Al marcar tu lectura de hoy, se pintará automáticamente una nueva sección del mural de <strong className="text-[#C9A808]">{MESES[lecturaHoy.mesIdx].nombre}</strong>.
            </p>

            <button
              onClick={() => toggleDia(lecturaHoy.dia)}
              className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition shadow-lg ${
                diasCompletados.includes(lecturaHoy.dia)
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-[#C9A808] hover:bg-[#b59607] text-[#14233C]'
              }`}
            >
              {diasCompletados.includes(lecturaHoy.dia) ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span>¡Lectura de Hoy Completada!</span>
                </>
              ) : (
                <>
                  <Circle className="w-6 h-6" />
                  <span>Marcar Lectura de Hoy como Leída</span>
                </>
              )}
            </button>

            <p className="mt-5 text-xs text-slate-400">
              Toca el nombre de la lectura para abrirla en la Biblioteca del Evangelio.
            </p>
          </div>
        )}

        {/* VISTA 2: CRONOGRAMA SEMANAL */}
        {vistaActiva === 'hoy' && <Liahona diasLeidos={diasCompletados.length} />}

        {vistaActiva === 'semana' && (
          <div className="bg-[#14233C] border border-[#C9A808]/50 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-white">Semana Actual</h2>
              <span className="text-xs text-[#C9A808] font-semibold">
                {diasSemanaActual.filter((d) => diasCompletados.includes(d.dia)).length} de {diasSemanaActual.length} días
              </span>
            </div>

            <div className="space-y-2.5">
              {diasSemanaActual.map((item) => {
                const hecho = diasCompletados.includes(item.dia);
                const esHoy = item.dia === diaHoyNumero;
                return (
                  <div
                    key={item.dia}
                    onClick={() => toggleDia(item.dia)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      hecho
                        ? 'bg-[#0c1626]/90 border-emerald-500/50'
                        : esHoy
                        ? 'bg-[#0c1626] border-[#C9A808]'
                        : 'bg-[#0c1626]/50 border-slate-700 hover:border-[#C9A808]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {hecho ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#C9A808]">
                            Día {item.dia} ({item.fechaCorta})
                          </span>
                          {esHoy && (
                            <span className="text-[10px] bg-[#C9A808] text-[#14233C] font-bold px-2 py-0.5 rounded-full">
                              HOY
                            </span>
                          )}
                        </div>
                        <a
                          href={item.enlace}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`block no-underline font-semibold text-sm sm:text-base ${hecho ? 'line-through text-slate-400' : 'text-white'}`}
                        >
                          {item.lectura}
                        </a>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {item.cantidadVersiculos} vers.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA 3: PLAN ANUAL DE 365 DÍAS */}
        {vistaActiva === 'anual' && (
          <div className="bg-[#14233C] border border-[#C9A808]/50 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Plan Anual (365 Días)</h2>
                <p className="text-xs text-slate-300">
                  1 Nefi 1:1 hasta Moroni 10:34 • Toca cualquier día para marcar o desmarcar
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {mesFiltroAnual !== mesHoyIdx && (
                  <button
                    onClick={() => setMesFiltroAnual(mesHoyIdx)}
                    className="text-xs font-bold text-[#14233C] bg-[#C9A808] hover:bg-[#b59607] px-3 py-2 rounded-xl transition"
                  >
                    Mes Actual
                  </button>
                )}

                <div className="flex items-center gap-2 bg-[#0c1626] p-1.5 rounded-xl border border-[#C9A808]/40">
                  <button
                    onClick={() => setMesFiltroAnual((prev) => (prev === 0 ? 11 : prev - 1))}
                    className="p-1.5 hover:text-[#C9A808]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold text-[#C9A808] min-w-[110px] text-center">
                    {MESES[mesFiltroAnual].nombre}
                  </span>
                  <button
                    onClick={() => setMesFiltroAnual((prev) => (prev === 11 ? 0 : prev + 1))}
                    className="p-1.5 hover:text-[#C9A808]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {diasAnualFiltrados.map((item) => {
                const hecho = diasCompletados.includes(item.dia);
                const esHoy = item.dia === diaHoyNumero;
                return (
                  <button
                    key={item.dia}
                    onClick={() => toggleDia(item.dia)}
                    className={`text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                      hecho
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : esHoy
                        ? 'bg-[#0c1626] border-[#C9A808]'
                        : 'bg-[#0c1626] border-slate-700/80 hover:border-[#C9A808]'
                    }`}
                  >
                    {hecho ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-bold text-[#C9A808]">
                          {item.fechaCorta} • Día {item.dia}
                        </p>
                        {esHoy && (
                          <span className="text-[9px] bg-[#C9A808] text-[#14233C] font-bold px-1.5 py-0.2 rounded-full">
                            HOY
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-semibold mt-0.5 ${hecho ? 'text-emerald-200' : 'text-white'}`}>
                        {item.lectura}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA 4: MURAL INTERACTIVO PARA NIÑOS (12 MURALES MENSUALES) */}
        {vistaActiva === 'mural' && (
          <div className="bg-[#14233C] border-2 border-[#C9A808] rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#C9A808] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Mural Mensual • {infoMesMural.nombre}
                </div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  {infoMesMural.tema}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {mesMural !== mesHoyIdx && (
                  <button
                    onClick={() => setMesMural(mesHoyIdx)}
                    className="text-xs font-bold text-[#14233C] bg-[#C9A808] hover:bg-[#b59607] px-3 py-2 rounded-xl transition"
                  >
                    Mes Actual
                  </button>
                )}

                <div className="flex items-center gap-2 bg-[#0c1626] p-1.5 rounded-xl border border-[#C9A808]/50">
                  <button
                    onClick={() => setMesMural((prev) => (prev === 0 ? 11 : prev - 1))}
                    className="p-2 hover:text-[#C9A808] transition"
                    title="Mes anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <select
                    value={mesMural}
                    onChange={(e) => setMesMural(Number(e.target.value))}
                    className="bg-transparent text-sm font-bold text-[#C9A808] outline-none cursor-pointer px-2"
                  >
                    {progresoPorMes.map((m) => (
                      <option key={m.idx} value={m.idx} className="bg-[#14233C] text-white">
                        {m.nombre} ({m.leidos}/{m.total})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setMesMural((prev) => (prev === 11 ? 0 : prev + 1))}
                    className="p-2 hover:text-[#C9A808] transition"
                    title="Mes siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">
                  Días pintados en {infoMesMural.nombre}: <strong className="text-white">{infoMesMural.leidos} de {infoMesMural.total}</strong>
                </span>
                <span className="text-[#C9A808]">
                  {Math.round((infoMesMural.leidos / infoMesMural.total) * 100)}% completado
                </span>
              </div>
              <div className="w-full h-3 bg-[#0c1626] rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-[#C9A808] to-amber-300 transition-all duration-500"
                  style={{ width: `${(infoMesMural.leidos / infoMesMural.total) * 100}%` }}
                />
              </div>
            </div>

            <MuralMensualSVG
              mesIdx={mesMural}
              diasLeidosMes={infoMesMural.leidos}
              totalDiasMes={infoMesMural.total}
            />
          </div>
        )}
      </main>
    </div>
  );
}
