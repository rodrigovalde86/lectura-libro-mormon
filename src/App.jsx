import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import {
  BookOpen, Calendar, CheckCircle2, Circle, Flame, Palette,
  LogOut, Sparkles, ChevronLeft, ChevronRight, Lock, User,
  Award, Check
} from 'lucide-react';

// ============================================================================
// 1. DATOS EXACTOS DEL LIBRO DE MORMÓN (239 CAPÍTULOS / 6,604 VERSÍCULOS)
// ============================================================================
const LIBROS_BOM = [
  { nombre: '1 Nefi', caps: [22, 24, 31, 38, 22, 6, 22, 38, 6, 22, 36, 23, 42, 30, 36, 39, 55, 25, 24, 22, 26, 31] },
  { nombre: '2 Nefi', caps: [32, 30, 25, 35, 34, 18, 11, 25, 54, 25, 8, 22, 26, 11, 30, 13, 25, 22, 21, 34, 16, 6, 22, 32, 30, 33, 35, 32, 14, 18, 21, 9, 15] },
  { nombre: 'Jacob', caps: [19, 35, 14, 18, 77, 13, 27] },
  { nombre: 'Enós', caps: [27] },
  { nombre: 'Jarom', caps: [15] },
  { nombre: 'Omni', caps: [30] },
  { nombre: 'Palabras de Mormón', caps: [18] },
  { nombre: 'Mosíah', caps: [18, 41, 27, 30, 15, 7, 33, 21, 19, 22, 29, 37, 35, 12, 31, 15, 20, 35, 29, 26, 36, 16, 39, 25, 24, 39, 37, 20, 47] },
  { nombre: 'Alma', caps: [33, 38, 27, 20, 62, 8, 27, 32, 34, 32, 46, 37, 31, 29, 19, 21, 39, 43, 36, 30, 26, 35, 18, 30, 17, 37, 30, 14, 17, 60, 38, 43, 23, 41, 16, 30, 47, 15, 19, 26, 15, 31, 54, 24, 24, 41, 36, 25, 30, 40, 37, 40, 23, 24, 35, 57, 36, 41, 13, 36, 21, 52, 17] },
  { nombre: 'Helamán', caps: [34, 14, 37, 26, 52, 41, 29, 28, 41, 19, 38, 26, 39, 31, 17, 25] },
  { nombre: '3 Nefi', caps: [30, 19, 26, 33, 26, 30, 26, 25, 22, 19, 41, 48, 34, 27, 24, 20, 25, 39, 36, 46, 29, 17, 14, 18, 6, 21, 33, 40, 9, 2] },
  { nombre: '4 Nefi', caps: [49] },
  { nombre: 'Mormón', caps: [19, 29, 22, 23, 24, 22, 10, 41, 37] },
  { nombre: 'Éter', caps: [43, 25, 28, 19, 6, 30, 27, 26, 35, 34, 22, 41, 31, 31, 34] },
  { nombre: 'Moroni', caps: [4, 3, 4, 3, 2, 9, 48, 30, 26, 34] }
];

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
  const versiculos = [];
  LIBROS_BOM.forEach((libro) => {
    libro.caps.forEach((totalVers, idxCap) => {
      for (let v = 1; v <= totalVers; v++) {
        versiculos.push({ libro: libro.nombre, cap: idxCap + 1, ver: v });
      }
    });
  });

  const totalV = versiculos.length;
  const plan = [];
  let diaGlobal = 1;

  for (let m = 0; m < 12; m++) {
    for (let d = 1; d <= MESES[m].dias; d++) {
      const inicioIdx = Math.floor(((diaGlobal - 1) * totalV) / 365);
      const finIdx = Math.floor((diaGlobal * totalV) / 365) - 1;
      const vIni = versiculos[inicioIdx];
      const vFin = versiculos[finIdx];

      let lecturaTexto = '';
      if (vIni.libro === vFin.libro) {
        if (vIni.cap === vFin.cap) {
          lecturaTexto = `${vIni.libro} ${vIni.cap}:${vIni.ver}–${vFin.ver}`;
        } else {
          lecturaTexto = `${vIni.libro} ${vIni.cap}:${vIni.ver} – ${vFin.cap}:${vFin.ver}`;
        }
      } else {
        lecturaTexto = `${vIni.libro} ${vIni.cap}:${vIni.ver} – ${vFin.libro} ${vFin.cap}:${vFin.ver}`;
      }

      plan.push({
        dia: diaGlobal,
        mesIdx: m,
        diaMes: d,
        fechaCorta: `${d} ${MESES[m].nombre.slice(0, 3)}`,
        lectura: lecturaTexto,
        cantidadVersiculos: finIdx - inicioIdx + 1
      });
      diaGlobal++;
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

  const [vistaActiva, setVistaActiva] = useState('hoy');
  const [mesFiltroAnual, setMesFiltroAnual] = useState(0);
  const [mesMural, setMesMural] = useState(0);

  const diaHoyNumero = useMemo(() => {
    const ahora = new Date();
    const inicioAnio = new Date(ahora.getFullYear(), 0, 0);
    const diff = ahora - inicioAnio;
    const unDia = 1000 * 60 * 60 * 24;
    const dia = Math.floor(diff / unDia);
    return Math.min(Math.max(dia, 1), 365);
  }, []);

  const cargarProgresoNube = async (user) => {
    const { data, error } = await supabase
      .from('progreso_lectura')
      .select('nombre_familia, dias_completados')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setNombreFamilia(data.nombre_familia || user.user_metadata?.nombre || user.email.split('@')[0]);
      setDiasCompletados(data.dias_completados || []);
    } else {
      const nombreInicial = user.user_metadata?.nombre || user.email.split('@')[0];
      setNombreFamilia(nombreInicial);
      setDiasCompletados([]);
      await supabase.from('progreso_lectura').upsert({
        user_id: user.id,
        nombre_familia: nombreInicial,
        dias_completados: []
      });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        cargarProgresoNube(s.user).finally(() => setCargandoInicial(false));
      } else {
        setCargandoInicial(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        cargarProgresoNube(s.user);
      } else {
        setDiasCompletados([]);
        setNombreFamilia('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    const nuevosDias = diasCompletados.includes(numDia)
      ? diasCompletados.filter((d) => d !== numDia)
      : [...diasCompletados, numDia].sort((a, b) => a - b);

    setDiasCompletados(nuevosDias);
    setGuardandoNube(true);

    await supabase
      .from('progreso_lectura')
      .upsert({
        user_id: session.user.id,
        nombre_familia: nombreFamilia,
        dias_completados: nuevosDias,
        actualizado_en: new Date().toISOString()
      });

    setGuardandoNube(false);
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

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0c1626] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#14233C] border-2 border-[#C9A808] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-2 border border-[#C9A808]/30 rounded-2xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0c1626] border-2 border-[#C9A808] flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-[#C9A808]" />
            </div>
            <p className="text-xs tracking-[0.25em] text-[#C9A808] uppercase font-semibold mb-1">
              Otro Testamento de Jesucristo
            </p>
            <h1 className="text-2xl font-serif font-bold text-white">
              Lectura del Libro de Mormón
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              Plan anual de lectura
            </p>
          </div>

          <div className="grid grid-cols-2 bg-[#0c1626] p-1 rounded-xl mb-6 border border-[#C9A808]/30 relative z-10">
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

          <form onSubmit={manejarAuth} className="space-y-4 relative z-10">
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
    );
  }

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

          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#C9A808] bg-[#0c1626] px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
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

        {vistaActiva === 'hoy' && (
          <div className="bg-[#14233C] border-2 border-[#C9A808] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest bg-[#0c1626] text-[#C9A808] px-3 py-1.5 rounded-full border border-[#C9A808]/40">
                Día {lecturaHoy.dia} de 365 • {lecturaHoy.fechaCorta}
              </span>
              <span className="text-xs text-slate-300">
                {lecturaHoy.cantidadVersiculos} versículos asignados hoy
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
              {lecturaHoy.lectura}
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
          </div>
        )}

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
                        <p className={`font-semibold text-sm sm:text-base ${hecho ? 'line-through text-slate-400' : 'text-white'}`}>
                          {item.lectura}
                        </p>
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

        {vistaActiva === 'anual' && (
          <div className="bg-[#14233C] border border-[#C9A808]/50 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Plan Anual (365 Días)</h2>
                <p className="text-xs text-slate-300">
                  1 Nefi 1:1 hasta Moroni 10:34 • Toca cualquier día para marcar o desmarcar
                </p>
              </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {diasAnualFiltrados.map((item) => {
                const hecho = diasCompletados.includes(item.dia);
                return (
                  <button
                    key={item.dia}
                    onClick={() => toggleDia(item.dia)}
                    className={`text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                      hecho
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-[#0c1626] border-slate-700/80 hover:border-[#C9A808]'
                    }`}
                  >
                    {hecho ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-[#C9A808]">
                        {item.fechaCorta} • Día {item.dia}
                      </p>
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

              <div className="flex items-center gap-2 bg-[#0c1626] p-1.5 rounded-xl border border-[#C9A808]/50 self-start sm:self-auto">
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